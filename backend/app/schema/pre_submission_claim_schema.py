from pydantic import BaseModel, ConfigDict
from datetime import date
from decimal import Decimal

class PreSubmissionServiceResponse(BaseModel):
    id: int

    cpt_code: str | None = None

    modifier: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class PreSubmissionClaimResponse(BaseModel):

    id: int

    claim_identifier: str | None = None

    uploadedAt: date

    claim_type: str | None = None

    # Payer Information
    payer_type: str | None = None

    payer: str | None = None

    # Provider Information
    provider_specialty: str | None = None

    billing_provider: str | None = None

    # Claim Details
    service_date: date | None = None

    claim_amount_usd: Decimal | None = None

    cpt_code: str | None = None

    modifier: str | None = None

    primary_icd10_dx: str | None = None

    secondary_dx_count: int | None = None

    documentation_completeness: Decimal | None = None

    denial_prediction: bool | None = None

    denial_probability: Decimal | None = None

    denial_category: str | None = None

    pre_submission_services: list[
        PreSubmissionServiceResponse
    ] = []

    model_config = ConfigDict(
        from_attributes=True
    )

