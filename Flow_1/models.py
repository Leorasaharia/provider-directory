# models.py
from typing import Optional, Dict, List
from pydantic import BaseModel


class ProviderInput(BaseModel):
    name: str
    npi: str
    mobile_no: str
    address: str
    speciality: str
    # 1–5, where 5 = high member impact
    member_impact: int = 3


class DataValidationResult(BaseModel):
    provider_input: ProviderInput
    npi_raw: Optional[Dict] = None             # full JSON from NPI Registry
    website_data: Optional[Dict[str, str]] = None  # scraped practice site info


class FieldWithConfidence(BaseModel):
    value: str
    confidence: float              # 0.0 – 1.0
    note: Optional[str] = None     # explanation, mismatch, NPI not found, etc.


class ProviderOutput(BaseModel):
    name: FieldWithConfidence
    npi: FieldWithConfidence
    mobile_no: FieldWithConfidence
    address: FieldWithConfidence
    speciality: FieldWithConfidence


class ProviderReport(BaseModel):
    provider_input: ProviderInput
    provider_output: ProviderOutput
    status: str                    # "confirmed" | "updated" | "needs_review"
    reasons: List[str]
    priority_score: float
    priority_level: str            # "HIGH" | "MEDIUM" | "LOW" | "NONE"
    llm_explanation: Optional[str] = None  # LLM-generated human-friendly explanation
