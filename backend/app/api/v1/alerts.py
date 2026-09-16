import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.models.alert import Alert
from app.models.threat import ThreatCluster
from app.schemas.alert import AlertCreate, AlertResponse
from app.core.events import manager
from app.security.rbac import require_role
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["Threat Alerts & Real-time Feeds"])

@router.get("", response_model=List[AlertResponse])
async def list_active_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.active == True).order_by(Alert.created_at.desc()).limit(20))
    alerts = result.scalars().all()
    return alerts

@router.post("", response_model=AlertResponse)
async def create_alert(
    alert_in: AlertCreate,
    admin_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    alert = Alert(
        title=alert_in.title,
        message=alert_in.message,
        severity=alert_in.severity,
        category=alert_in.category,
        active=True
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)

    # Broadcast via WebSocket
    await manager.broadcast({
        "event_type": "NEW_ALERT",
        "alert": {
            "id": alert.id,
            "title": alert.title,
            "message": alert.message,
            "severity": alert.severity,
            "category": alert.category,
            "created_at": alert.created_at.isoformat()
        }
    })

    return alert

@router.post("/simulate")
async def simulate_threat_event(db: AsyncSession = Depends(get_db)):
    """
    SecOps Threat Defense Drill Trigger.
    Triggers: Incident Detection -> Fusion Engine -> Threat Cluster Aggregation -> WebSocket Broadcast -> Live Dashboard Update.
    """
    timestamp_str = time.strftime("%H:%M:%S")
    simulated_alert = Alert(
        title=f"🚨 [INCIDENT DETECTED] Emerging Multi-Channel UPI Impersonation Wave ({timestamp_str})",
        message="Real-time multi-channel campaign detected linking flagged APK 'sbi-fastpay.apk', WhatsApp phishing SMS, and forged banking transaction receipts.",
        severity="critical",
        category="upi_fraud",
        active=True
    )
    db.add(simulated_alert)
    
    # Also update or add a threat cluster
    c_code = f"CR-2026-INC{int(time.time()) % 1000:03d}"
    new_cluster = ThreatCluster(
        cluster_code=c_code,
        campaign_title=f"FastPay UPI Credential Harvesting Campaign ({timestamp_str})",
        cluster_type="UPI Fraud & Phishing APK",
        severity="CRITICAL",
        confidence=95.5,
        report_count=19,
        status="active",
        target_brands=["SBI", "NPCI", "UPI"],
        common_indicators=["Flagged UPI update APK", "SMS urgency trigger", "Credential harvesting vector"],
        affected_states=["Maharashtra", "Karnataka", "Delhi"]
    )
    db.add(new_cluster)
    await db.commit()
    await db.refresh(simulated_alert)

    # Broadcast real-time live event to all connected dashboards
    payload = {
        "event_type": "THREAT_SIMULATION",
        "message": "Real-time threat event successfully injected via Cyber Threat Fusion Engine.",
        "alert": {
            "id": simulated_alert.id,
            "title": simulated_alert.title,
            "message": simulated_alert.message,
            "severity": simulated_alert.severity,
            "category": simulated_alert.category,
            "created_at": simulated_alert.created_at.isoformat()
        },
        "cluster": {
            "cluster_code": new_cluster.cluster_code,
            "campaign_title": new_cluster.campaign_title,
            "severity": new_cluster.severity,
            "report_count": new_cluster.report_count
        }
    }
    await manager.broadcast(payload)

    return {
        "success": True,
        "detail": "Live threat simulation broadcasted to all connected WebSockets.",
        "cluster_code": c_code,
        "alert_id": simulated_alert.id
    }
