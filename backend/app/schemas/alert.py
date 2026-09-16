from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AlertCreate(BaseModel):
    title: str
    message: str
    severity: str = "high"
    category: str = "phishing"

class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    category: str
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
