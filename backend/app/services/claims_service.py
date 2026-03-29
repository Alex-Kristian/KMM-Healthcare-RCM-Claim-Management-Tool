from app.repositories.claims_repository import ClaimsRepository
from datetime import date

class ClaimsService:
    def __init__(self, db):
        self.repo = ClaimsRepository(db)


    async def list_claims(self):
        claims = await self.repo.get_all_claims()

        return [
            {
                "id": c.id,
                "patient_name": f"{c.patient_first_name or ''} {c.patient_last_name or ''}".strip(),
                "payer": c.era_file.payer_name if c.era_file else None,
                "claim_number": c.patient_control_number,
                "total_charge": c.total_charge_amount,
                "paid_amount": c.paid_amount,
                "patient_responsibility": c.patient_responsibility,
                "status": c.claim_status_code,
                "statement_from_date": c.statement_from_date,
                "statement_to_date": c.statement_to_date,
                "days_in_ar": calc_days_in_ar(
                    c.statement_from_date, 
                    c.era_file.payment_date if c.era_file else None
                ),
            }
            for c in claims
        ]


    async def get_claim_details(self, claim_id: int):
        claim = await self.repo.get_claim_with_details(claim_id)

        if not claim:
            return None

        return {
            "id": claim.id,
            "claim_number": claim.patient_control_number,
            "patient_name": f"{claim.patient_first_name or ''} {claim.patient_last_name or ''}".strip(),
            "payer": claim.era_file.payer_name if claim.era_file else None,
            "patient_responsibility": claim.patient_responsibility,
            "status": claim.claim_status_code,
            "total_charge": claim.total_charge_amount,
            "paid_amount": claim.paid_amount,
            "statement_from_date": claim.statement_from_date,
            "statement_to_date": claim.statement_to_date,
            "days_in_ar": calc_days_in_ar(
                    claim.statement_from_date, 
                    claim.era_file.payment_date if claim.era_file else None
                ),
            "services": [
                {
                    "id": s.id,
                    "procedure_code": s.procedure_code,
                    "charge": s.charge_amount,
                    "paid": s.paid_amount,
                    "service_date": s.service_date,
                    "adjustments": [
                        {
                            "group": a.group_code,
                            "reason": a.reason_code,
                            "amount": a.amount,
                        }
                        for a in s.adjustments
                    ],
                }
                for s in claim.service_lines
            ],
        }
    


def calc_days_in_ar(service_date, payment_date):
    if not service_date or not payment_date:
        return None
    end_date = payment_date if payment_date else date.today()
    return (end_date - service_date).days