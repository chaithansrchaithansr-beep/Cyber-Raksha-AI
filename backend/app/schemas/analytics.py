from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class TrendDataPoint(BaseModel):
    date: str
    total_scans: int
    phishing: int
    scam_messages: int
    upi_frauds: int

class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float

class SeverityDistribution(BaseModel):
    severity: str
    count: int

class HeatmapStateData(BaseModel):
    state_code: str
    state_name: str
    report_count: int
    severity: str # LOW, MODERATE, HIGH, CRITICAL
    top_threat_category: str
    trend: str # increasing, stable, decreasing

class NationalAnalyticsResponse(BaseModel):
    total_scans: int
    high_risk_threats: int
    verified_campaigns: int
    active_alerts: int
    citizens_protected: int
    average_risk_score: float
    threat_trends: List[TrendDataPoint]
    category_distribution: List[CategoryDistribution]
    severity_distribution: List[SeverityDistribution]
    state_heatmaps: List[HeatmapStateData]
