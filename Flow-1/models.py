# models.py
from pydantic import BaseModel
from typing import Optional, Dict, List

class ProviderInput(BaseModel):
    name: str
    npi: str
    mobile_no: str
    address: str
    speciality: str
    member_impact: int  # 1–5

class DataValidationResult(BaseModel):
    """
    Raw result from DataValidationAgent for one provider.
    We'll refine this later into final ProviderOutput with confidence scores.
    """
    provider_input: ProviderInput
    npi_raw: Optional[Dict] = None  # full JSON from NPI for now
    website_data: Optional[Dict[str, str]] = None  # NEW: scraped practice site info

class FieldWithConfidence(BaseModel):
    value: str
    confidence: float  # 0.0 to 1.0
    note: Optional[str] = None   # <-- add this


class ProviderOutput(BaseModel):
    name: FieldWithConfidence
    npi: FieldWithConfidence
    mobile_no: FieldWithConfidence
    address: FieldWithConfidence
    speciality: FieldWithConfidence
    
class ProviderReport(BaseModel):
    provider_input: ProviderInput
    provider_output: ProviderOutput
    status: str              # "confirmed", "updated", "needs_review"
    reasons: List[str]       # why this status was chosen
    priority_score: float    # NEW
    priority_level: str      # "HIGH" | "MEDIUM" | "LOW"