from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen", nullable=False) # citizen, organization, admin
    language = Column(String(10), default="en") # en, hi, kn, ta, te, ml, mr
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="members")
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("ThreatReport", back_populates="reporter", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    password_resets = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return self.name

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    verified_domain = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=True)
    api_key = Column(String(100), unique=True, nullable=True)
    status = Column(String(50), default="verified", nullable=False) # pending, verified, suspended
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    members = relationship("User", back_populates="organization")
    authorized_domains = relationship("OrgDomain", back_populates="organization", cascade="all, delete-orphan")
    incidents = relationship("OrgIncident", back_populates="organization", cascade="all, delete-orphan")

class OrgDomain(Base):
    __tablename__ = "org_domains"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    domain = Column(String(255), nullable=False)
    status = Column(String(50), default="verified", nullable=False) # pending, verified
    verification_token = Column(String(100), nullable=True)
    risk_score = Column(Float, default=15.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="authorized_domains")

class OrgIncident(Base):
    __tablename__ = "org_incidents"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(20), default="HIGH", nullable=False) # LOW, MODERATE, HIGH, CRITICAL
    status = Column(String(50), default="OPEN", nullable=False) # OPEN, INVESTIGATING, CONTAINED, RESOLVED, CLOSED
    investigation_notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="incidents")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    user_agent = Column(String(255), default="Unknown Browser / Device")
    ip_hash = Column(String(64), nullable=True)

    user = relationship("User", back_populates="refresh_tokens")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)

    user = relationship("User", back_populates="password_resets")
