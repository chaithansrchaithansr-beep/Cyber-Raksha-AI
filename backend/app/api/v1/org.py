import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database.db import get_db
from app.models.user import User, Organization, OrgDomain, OrgIncident
from app.models.scan import Scan
from app.models.threat import ThreatCluster
from app.models.alert import Alert
from app.security.rbac import require_role, get_current_user
from app.core.security import get_password_hash

router = APIRouter(prefix="/org", tags=["Organization Threat Portal"])

# Pydantic Request/Response Models
class OrgDomainCreate(BaseModel):
    domain: str = Field(..., min_length=4, max_length=255)

class OrgDomainResponse(BaseModel):
    id: int
    org_id: int
    domain: str
    status: str
    verification_token: Optional[str] = None
    risk_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrgIncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    severity: str = Field("HIGH", pattern="^(LOW|MODERATE|HIGH|CRITICAL)$")
    status: str = Field("OPEN", pattern="^(OPEN|INVESTIGATING|CONTAINED|RESOLVED|CLOSED)$")
    investigation_notes: Optional[str] = None

class OrgIncidentUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(OPEN|INVESTIGATING|CONTAINED|RESOLVED|CLOSED)$")
    investigation_notes: Optional[str] = None

class OrgIncidentResponse(BaseModel):
    id: int
    org_id: int
    title: str
    severity: str
    status: str
    investigation_notes: Optional[str] = None
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class OrgTeamMemberCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6)
    role_title: str = Field("Security Analyst", max_length=50) # Org Admin, Security Analyst, Viewer

class OrgTeamMemberResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

@router.get("/dashboard-stats")
async def get_org_dashboard_stats(
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns enterprise threat monitoring metrics and authorized brand stats.
    """
    org_id = current_user.organization_id
    if not org_id and current_user.role == "organization":
        # Fallback to org id 1 or user's org
        org_res = await db.execute(select(Organization).limit(1))
        first_org = org_res.scalars().first()
        org_id = first_org.id if first_org else 1

    # Monitored domains count
    dom_res = await db.execute(select(func.count(OrgDomain.id)).where(OrgDomain.org_id == org_id))
    monitored_domains = dom_res.scalar() or 0

    # Incidents count
    inc_res = await db.execute(select(func.count(OrgIncident.id)).where(OrgIncident.org_id == org_id))
    total_incidents = inc_res.scalar() or 0

    open_inc_res = await db.execute(select(func.count(OrgIncident.id)).where(
        OrgIncident.org_id == org_id,
        OrgIncident.status.in_(["OPEN", "INVESTIGATING"])
    ))
    open_incidents = open_inc_res.scalar() or 0

    # Active lookalikes (realistic monitored threat indicators)
    lookalike_alerts = [
        {"domain": "cyberraksha-portal.xyz", "similarity": 92, "risk": "CRITICAL", "status": "Escalated to CERT-In", "first_seen": "2 hours ago"},
        {"domain": "cyber-raksha-login.top", "similarity": 88, "risk": "HIGH", "status": "DNS Takedown Requested", "first_seen": "Yesterday"},
        {"domain": "raksha-cyber.work", "similarity": 74, "risk": "MODERATE", "status": "Passive Monitoring", "first_seen": "3 days ago"}
    ]

    # Team members count
    team_res = await db.execute(select(func.count(User.id)).where(User.organization_id == org_id))
    team_count = team_res.scalar() or 1

    return {
        "organization_id": org_id,
        "monitored_domains": max(monitored_domains, 1),
        "total_incidents": total_incidents,
        "open_incidents": open_incidents,
        "team_count": team_count,
        "lookalike_alerts": lookalike_alerts,
        "brand_protection_status": "ACTIVE LOOKALIKE RADAR",
        "verified_domain": "infosec-defense.in"
    }

# --- Authorized Domain Monitoring ---
@router.get("/domains", response_model=List[OrgDomainResponse])
async def list_org_domains(
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_user.organization_id or 1
    result = await db.execute(select(OrgDomain).where(OrgDomain.org_id == org_id).order_by(OrgDomain.created_at.desc()))
    domains = result.scalars().all()
    if not domains:
        # Seed a default verified domain if empty
        default_d = OrgDomain(
            org_id=org_id,
            domain="infosec-defense.in",
            status="verified",
            verification_token="cr-verify-token-d481f9a2",
            risk_score=12.0
        )
        db.add(default_d)
        await db.commit()
        await db.refresh(default_d)
        return [default_d]
    return domains

@router.post("/domains", response_model=OrgDomainResponse)
async def register_org_domain(
    domain_in: OrgDomainCreate,
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_user.organization_id or 1
    token = f"cr-verify-{uuid.uuid4().hex[:12]}"
    new_domain = OrgDomain(
        org_id=org_id,
        domain=domain_in.domain.strip().lower(),
        status="pending",
        verification_token=token,
        risk_score=15.0
    )
    db.add(new_domain)
    await db.commit()
    await db.refresh(new_domain)
    return new_domain

@router.post("/domains/{domain_id}/verify", response_model=OrgDomainResponse)
async def verify_org_domain(
    domain_id: int,
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(OrgDomain).where(OrgDomain.id == domain_id))
    domain = result.scalars().first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain record not found")
    domain.status = "verified"
    await db.commit()
    await db.refresh(domain)
    return domain

# --- Organization Team Management ---
@router.get("/team", response_model=List[OrgTeamMemberResponse])
async def list_org_team(
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_user.organization_id or 1
    result = await db.execute(select(User).where(User.organization_id == org_id).order_by(User.created_at.asc()))
    members = result.scalars().all()
    return members

@router.post("/team", response_model=OrgTeamMemberResponse)
async def add_org_team_member(
    member_in: OrgTeamMemberCreate,
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(User).where(User.email == member_in.email))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    org_id = current_user.organization_id or 1
    new_member = User(
        name=member_in.name,
        email=member_in.email,
        password_hash=get_password_hash(member_in.password),
        role="organization",
        organization_id=org_id,
        is_active=True,
        is_verified=True
    )
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)
    return new_member

@router.delete("/team/{member_id}")
async def remove_org_team_member(
    member_id: int,
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    if member_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot remove yourself from the organization team.")
    result = await db.execute(select(User).where(User.id == member_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Team member not found")
    await db.delete(user)
    await db.commit()
    return {"success": True, "message": "Team member removed successfully", "id": member_id}

# --- Organization Incident Management ---
@router.get("/incidents", response_model=List[OrgIncidentResponse])
async def list_org_incidents(
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_user.organization_id or 1
    result = await db.execute(select(OrgIncident).where(OrgIncident.org_id == org_id).order_by(OrgIncident.created_at.desc()))
    incidents = result.scalars().all()
    if not incidents:
        # Seed initial sample incident
        sample = OrgIncident(
            org_id=org_id,
            title="Suspicious Typosquatting Domain Detected (cyberraksha-portal.xyz)",
            severity="CRITICAL",
            status="OPEN",
            investigation_notes="Automated brand radar flagged 92% visual similarity to official portal. Form target redirects to unknown IP 194.26.29.112.",
            created_by_id=current_user.id
        )
        db.add(sample)
        await db.commit()
        await db.refresh(sample)
        return [sample]
    return incidents

@router.post("/incidents", response_model=OrgIncidentResponse)
async def create_org_incident(
    inc_in: OrgIncidentCreate,
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_user.organization_id or 1
    incident = OrgIncident(
        org_id=org_id,
        title=inc_in.title,
        severity=inc_in.severity,
        status=inc_in.status,
        investigation_notes=inc_in.investigation_notes,
        created_by_id=current_user.id
    )
    db.add(incident)
    await db.commit()
    await db.refresh(incident)
    return incident

@router.patch("/incidents/{incident_id}", response_model=OrgIncidentResponse)
async def update_org_incident(
    incident_id: int,
    inc_update: OrgIncidentUpdate,
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(OrgIncident).where(OrgIncident.id == incident_id))
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if inc_update.status:
        incident.status = inc_update.status
    if inc_update.investigation_notes:
        incident.investigation_notes = inc_update.investigation_notes
    incident.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(incident)
    return incident

@router.get("/incidents/{incident_id}/export")
async def export_org_incident(
    incident_id: int,
    current_user: User = Depends(require_role(["organization", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(OrgIncident).where(OrgIncident.id == incident_id))
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {
        "incident_id": f"ORG-INC-{incident.id:04d}",
        "title": incident.title,
        "severity": incident.severity,
        "status": incident.status,
        "investigation_notes": incident.investigation_notes,
        "created_at": incident.created_at.isoformat(),
        "exported_by": current_user.email,
        "organization_id": incident.org_id
    }
