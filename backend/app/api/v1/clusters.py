from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.models.threat import ThreatCluster, ThreatReport
from app.models.user import User
from app.schemas.threat import ThreatClusterResponse, ClusterActionRequest
from app.security.rbac import require_role

router = APIRouter(prefix="/threats/clusters", tags=["Threat Clusters"])

@router.get("", response_model=List[ThreatClusterResponse])
async def list_threat_clusters(
    status: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    query = select(ThreatCluster).order_by(ThreatCluster.report_count.desc()).limit(limit)
    if status:
        query = query.where(ThreatCluster.status == status)
    result = await db.execute(query)
    clusters = result.scalars().all()
    return clusters

@router.get("/{cluster_code}", response_model=ThreatClusterResponse)
async def get_cluster_by_code(cluster_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThreatCluster).where(ThreatCluster.cluster_code == cluster_code))
    cluster = result.scalars().first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Threat cluster not found")
    return cluster

@router.post("/{cluster_code}/action")
async def take_cluster_action(
    cluster_code: str,
    action_req: ClusterActionRequest,
    admin_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ThreatCluster).where(ThreatCluster.cluster_code == cluster_code))
    cluster = result.scalars().first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Threat cluster not found")

    action = action_req.action
    if action == "verify":
        cluster.status = "verified"
    elif action == "resolve":
        cluster.status = "resolved"
    elif action == "reject":
        cluster.status = "rejected"
    elif action == "merge":
        if not action_req.merge_target_code:
            raise HTTPException(status_code=400, detail="Must provide merge_target_code to merge clusters")
        target_res = await db.execute(select(ThreatCluster).where(ThreatCluster.cluster_code == action_req.merge_target_code))
        target_cluster = target_res.scalars().first()
        if not target_cluster:
            raise HTTPException(status_code=404, detail="Target cluster to merge into not found")
        # Merge reports
        target_cluster.report_count += cluster.report_count
        cluster.status = "merged"
    
    await db.commit()
    return {"success": True, "cluster_code": cluster_code, "new_status": cluster.status}
