from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database.db import get_db
from app.models.user import User
from app.models.scan import Scan
from app.models.threat import ThreatReport
from app.models.alert import Alert
from app.schemas.scan import ScanResponse
from app.schemas.threat import ThreatReportResponse
from app.security.rbac import get_current_user

router = APIRouter(prefix="/citizen", tags=["Citizen Defense Portal"])

@router.get("/dashboard-stats")
async def get_citizen_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns personal cybersecurity posture metrics for the logged-in citizen.
    All data strictly scoped to current_user.id.
    """
    # 1. Total personal scans
    total_scans_res = await db.execute(
        select(func.count(Scan.id)).where(Scan.user_id == current_user.id)
    )
    total_scans = total_scans_res.scalar() or 0

    # 2. High risk scans detected
    high_risk_res = await db.execute(
        select(func.count(Scan.id)).where(
            Scan.user_id == current_user.id,
            Scan.risk_score >= 50.0
        )
    )
    high_risk_scans = high_risk_res.scalar() or 0

    # 3. Recent 5 scans
    recent_scans_res = await db.execute(
        select(Scan).where(Scan.user_id == current_user.id).order_by(Scan.created_at.desc()).limit(5)
    )
    recent_scans = recent_scans_res.scalars().all()

    # 4. Total personal reports submitted
    reports_res = await db.execute(
        select(func.count(ThreatReport.id)).where(ThreatReport.reporter_id == current_user.id)
    )
    total_reports = reports_res.scalar() or 0

    # 5. Recent 5 reports
    recent_reports_res = await db.execute(
        select(ThreatReport).where(ThreatReport.reporter_id == current_user.id).order_by(ThreatReport.created_at.desc()).limit(5)
    )
    recent_reports = recent_reports_res.scalars().all()

    # 6. Active verified public alerts
    alerts_res = await db.execute(
        select(Alert).where(Alert.active == True).order_by(Alert.created_at.desc()).limit(3)
    )
    active_alerts = alerts_res.scalars().all()

    # 7. Personal Cyber Safety Score
    # Base 85, minus points for high-risk unresolved incidents, plus points for running scans & vigilance
    if total_scans == 0:
        safety_score = 82.0
    else:
        avg_risk = sum(s.risk_score for s in recent_scans) / len(recent_scans) if recent_scans else 20.0
        safety_score = round(max(25.0, min(98.0, 100.0 - (avg_risk * 0.7))), 1)

    return {
        "user_name": current_user.name,
        "email": current_user.email,
        "total_scans": total_scans,
        "high_risk_scans": high_risk_scans,
        "total_reports": total_reports,
        "safety_score": safety_score,
        "safety_status": "EXCELLENT (SECURE)" if safety_score >= 80 else ("MODERATE EXPOSURE" if safety_score >= 50 else "CRITICAL ATTENTION NEEDED"),
        "recent_scans": [ScanResponse.model_validate(s) for s in recent_scans],
        "recent_reports": [ThreatReportResponse.model_validate(r) for r in recent_reports],
        "active_alerts": [
            {
                "id": a.id,
                "title": a.title,
                "message": a.message,
                "severity": a.severity,
                "created_at": a.created_at.isoformat()
            }
            for a in active_alerts
        ]
    }
