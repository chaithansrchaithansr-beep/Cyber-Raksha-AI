from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.db import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # can be anonymous
    scan_type = Column(String(50), nullable=False) # url, email, message, website, screenshot, qr, fusion
    input_preview = Column(String(255), nullable=True)
    input_hash = Column(String(64), nullable=False, index=True)
    classification = Column(String(50), nullable=False) # LOW RISK, MODERATE RISK, HIGH RISK, CRITICAL RISK
    risk_score = Column(Float, nullable=False) # 0 to 100
    confidence = Column(Float, nullable=False) # 0 to 100
    detected_indicators = Column(JSON, default=list) # list of str
    ai_explanation = Column(Text, nullable=True)
    recommendations = Column(JSON, default=list) # list of str
    details = Column(JSON, default=dict) # detailed diagnostic info
    analysis_method = Column(String(100), default="Rule-Based Defensive Security Analysis")
    report_integrity_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="scans")
