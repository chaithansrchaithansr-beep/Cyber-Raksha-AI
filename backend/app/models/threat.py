from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.db import Base

class ThreatReport(Base):
    __tablename__ = "threat_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    threat_type = Column(String(50), nullable=False) # phishing_url, scam_message, fake_site, upi_fraud, kyc_scam
    severity = Column(String(20), default="HIGH") # LOW, MODERATE, HIGH, CRITICAL
    target_brand = Column(String(100), nullable=True)
    sanitized_content = Column(Text, nullable=False) # PII-masked content
    raw_content_hash = Column(String(64), nullable=False)
    state = Column(String(50), default="Delhi", index=True) # Indian state for Heatmap
    status = Column(String(50), default="pending") # pending, under_review, verified, false_positive, closed
    admin_notes = Column(Text, nullable=True)
    cluster_id = Column(Integer, ForeignKey("threat_clusters.id"), nullable=True)
    upvotes = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    reporter = relationship("User", back_populates="reports")
    cluster = relationship("ThreatCluster", back_populates="reports")

class ThreatCluster(Base):
    __tablename__ = "threat_clusters"

    id = Column(Integer, primary_key=True, index=True)
    cluster_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. CR-2026-00124
    campaign_title = Column(String(200), nullable=False)
    cluster_type = Column(String(50), nullable=False) # e.g. KYC Scam Campaign, SBI Impersonation
    severity = Column(String(20), default="HIGH")
    confidence = Column(Float, default=85.0)
    report_count = Column(Integer, default=1)
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    status = Column(String(20), default="active") # active, verified, resolved, merged
    target_brands = Column(JSON, default=list)
    common_indicators = Column(JSON, default=list)
    affected_states = Column(JSON, default=list)

    reports = relationship("ThreatReport", back_populates="cluster")
