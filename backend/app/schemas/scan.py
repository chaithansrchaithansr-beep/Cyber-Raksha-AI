from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class UrlScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)

class EmailScanRequest(BaseModel):
    subject: str = Field(..., max_length=500)
    sender: Optional[str] = Field("", max_length=255)
    body: str = Field(..., min_length=5, max_length=50000)

class MessageScanRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=20000)
    source_channel: Optional[str] = Field("SMS", max_length=50)

class WebsiteScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)
    simulated_brand: Optional[str] = None

class QrScanRequest(BaseModel):
    image_base64: Optional[str] = None
    extracted_data: Optional[str] = None

class ScanResponse(BaseModel):
    id: int
    scan_type: str
    input_preview: Optional[str] = None
    classification: str
    risk_score: float
    confidence: float
    detected_indicators: List[str]
    ai_explanation: str
    recommendations: List[str]
    details: Dict[str, Any] = {}
    analysis_method: Optional[str] = "Rule-Based Defensive Security Analysis"
    report_integrity_hash: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentReportExport(BaseModel):
    report_id: str
    date_and_time: str
    scan_type: str
    threat_classification: str
    risk_score: float
    confidence: float
    detected_indicators: List[str]
    ai_explanation: str
    recommended_actions: List[str]
    report_integrity_hash: str
    technical_metadata: Dict[str, Any]
