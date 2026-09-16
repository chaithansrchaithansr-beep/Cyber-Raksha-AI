from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class FusionRequest(BaseModel):
    url: Optional[str] = None
    message: Optional[str] = None
    email_body: Optional[str] = None
    screenshot_text: Optional[str] = None
    qr_destination: Optional[str] = None
    brand_context: Optional[str] = None

class ThreatSignal(BaseModel):
    source: str # URL, Message, Email, Screenshot, QR
    preview: str
    risk_score: float
    indicators: List[str]

class FusionResponse(BaseModel):
    campaign_detected: bool
    campaign_name: str
    campaign_risk: str # LOW, MODERATE, HIGH, CRITICAL
    combined_risk_score: float
    confidence: float
    signals_correlated: int
    signals: List[ThreatSignal]
    shared_patterns: List[str]
    brand_impersonated: Optional[str]
    suggested_cluster_code: str
    fusion_explanation: str
    recommended_containment: List[str]
    integrity_hash: str
