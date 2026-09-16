from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ThreatReportCreate(BaseModel):
    threat_type: str = Field(..., max_length=50)
    severity: str = Field("HIGH", pattern="^(LOW|MODERATE|HIGH|CRITICAL)$")
    target_brand: Optional[str] = None
    content: str = Field(..., min_length=5, max_length=20000)
    state: str = Field("Delhi", max_length=50)

class ThreatReportResponse(BaseModel):
    id: int
    threat_type: str
    severity: str
    target_brand: Optional[str]
    sanitized_content: str
    state: str
    status: str
    upvotes: int
    cluster_id: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ThreatClusterResponse(BaseModel):
    id: int
    cluster_code: str
    campaign_title: str
    cluster_type: str
    severity: str
    confidence: float
    report_count: int
    first_seen: datetime
    last_seen: datetime
    status: str
    target_brands: List[str]
    common_indicators: List[str]
    affected_states: List[str]

    model_config = ConfigDict(from_attributes=True)

class ClusterActionRequest(BaseModel):
    action: str = Field(..., pattern="^(verify|resolve|merge|reject)$")
    merge_target_code: Optional[str] = None
