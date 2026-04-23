from pydantic import BaseModel
from datetime import date
from typing import Optional

class DenialLineSchema(BaseModel):
    service_line_id:int
    claim_id: int
    claim_number: str
    patient_name: str
    payer: Optional[str]
    service_date: Optional[date]
    procedure_code: Optional[str]
    carc_code: Optional[str]
    carc_group: Optional[str]
    carc_description: Optional[str] = None
    denied_amount: Optional[float]