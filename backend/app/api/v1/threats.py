import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.models.user import User
from app.models.threat import ThreatReport, ThreatCluster
from app.schemas.threat import ThreatReportCreate, ThreatReportResponse
from app.services.pii_sanitizer import pii_sanitizer
from app.security.rbac import get_current_user_optional, get_current_user
from app.core.security import compute_sha256
from app.ml.clustering_engine import clustering_engine

router = APIRouter(prefix="/threats", tags=["Community Threat Intelligence"])

@router.post("/reports", response_model=ThreatReportResponse)
async def submit_threat_report(
    report_in: ThreatReportCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # 1. PII Sanitization Engine: Mask sensitive data before saving
    sanitized_text, pii_detected = pii_sanitizer.sanitize(report_in.content)
    raw_hash = compute_sha256(report_in.content)

    # 2. Check if it matches existing clusters
    clusters_res = await db.execute(select(ThreatCluster).where(ThreatCluster.status == "active"))
    active_clusters = clusters_res.scalars().all()
    clusters_dicts = [
        {
            "id": c.id,
            "cluster_code": c.cluster_code,
            "cluster_type": c.cluster_type,
            "target_brands": c.target_brands or [],
            "common_indicators": c.common_indicators or [],
            "campaign_title": c.campaign_title
        }
        for c in active_clusters
    ]

    matched = clustering_engine.match_cluster(
        new_text=sanitized_text,
        new_brand=report_in.target_brand,
        new_threat_type=report_in.threat_type,
        existing_clusters=clusters_dicts
    )

    cluster_id = None
    if matched:
        cluster_id = matched["id"]
        # Increment report count on the cluster
        for c in active_clusters:
            if c.id == cluster_id:
                c.report_count += 1
                if report_in.state and report_in.state not in (c.affected_states or []):
                    c.affected_states = (c.affected_states or []) + [report_in.state]
                break

    report = ThreatReport(
        reporter_id=current_user.id if current_user else None,
        threat_type=report_in.threat_type,
        severity=report_in.severity,
        target_brand=report_in.target_brand,
        sanitized_content=sanitized_text,
        raw_content_hash=raw_hash,
        state=report_in.state,
        status="verified" if current_user and current_user.role == "admin" else "pending",
        cluster_id=cluster_id,
        upvotes=1
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

@router.get("/my-reports", response_model=List[ThreatReportResponse])
async def list_my_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns only reports submitted by the logged-in citizen.
    """
    query = select(ThreatReport).where(ThreatReport.reporter_id == current_user.id).order_by(ThreatReport.created_at.desc())
    result = await db.execute(query)
    reports = result.scalars().all()
    return reports

@router.get("/reports", response_model=List[ThreatReportResponse])
async def list_threat_reports(
    limit: int = 50,
    state: Optional[str] = None,
    threat_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(ThreatReport).order_by(ThreatReport.created_at.desc()).limit(limit)
    if state:
        query = query.where(ThreatReport.state == state)
    if threat_type:
        query = query.where(ThreatReport.threat_type == threat_type)

    result = await db.execute(query)
    reports = result.scalars().all()
    return reports

@router.post("/reports/{report_id}/upvote")
async def upvote_report(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThreatReport).where(ThreatReport.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Threat report not found")
    report.upvotes += 1
    await db.commit()
    return {"success": True, "upvotes": report.upvotes}
