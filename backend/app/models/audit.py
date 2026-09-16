from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database.db import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False) # e.g. SCAN_URL, MERGE_CLUSTER, USER_LOGIN
    resource = Column(String(150), nullable=False)
    ip_hash = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
