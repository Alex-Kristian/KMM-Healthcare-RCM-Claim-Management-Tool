from app.repositories.claims_repository import ClaimsRepository
from app.schema.denial_line_schema import DenialLineSchema
from app.constants.carc_codes import CARC_CODE_DESCRIPTIONS
from app.utils.claims_utils import calc_days_in_ar

class ClaimsService:
    def __init__(self, db):
        self.repo = ClaimsRepository(db)


    async def list_claims(self):
        claims = await self.repo.get_all_claims()

        return [
            {
                "id": c.id,
                "patient_name": f"{c.patient_first_name or ''} {c.patient_last_name or ''}".strip(),
                "payer": c.payer.payer_name if c.payer else "Unknown",
                "claim_number": c.patient_control_number,
                "total_charge": c.total_charge_amount,
                "paid_amount": c.paid_amount,
                "patient_responsibility": c.patient_responsibility,
                "status": c.claim_status_code,
                "is_first_pass": c.is_first_pass,
                "statement_from_date": c.statement_from_date,
                "statement_to_date": c.statement_to_date,
                "payment_date": c.era_file.payment_date if c.is_denied and c.era_file  else c.final_payment_date, 
                "days_in_ar": calc_days_in_ar(
                    c.statement_from_date, 
                    c.final_payment_date
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
            "payer": claim.payer.payer_name if claim.payer else None,
            "patient_responsibility": claim.patient_responsibility,
            "status": claim.claim_status_code,
            "total_charge": claim.total_charge_amount,
            "paid_amount": claim.paid_amount,
            "statement_from_date": claim.statement_from_date,
            "statement_to_date": claim.statement_to_date,
            "payment_date": claim.era_file.payment_date if claim.is_denied and claim.era_file  else claim.final_payment_date, 
            "days_in_ar": calc_days_in_ar(
                    claim.statement_from_date, 
                    claim.final_payment_date 
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
    
    async def get_denial_lines(self):
        rows = await self.repo.get_denial_line_rows()

        return [
            DenialLineSchema(
                service_line_id=row.service_line_id,
                claim_id=row.claim_id,
                claim_number=row.patient_control_number,
                patient_name=f"{row.patient_first_name or ''} {row.patient_last_name or ''}".strip(),
                payer=row.payer_name,
                service_date=row.service_date,
                procedure_code=row.procedure_code,
                carc_code=row.reason_code,
                carc_group=row.group_code,
                carc_description=CARC_CODE_DESCRIPTIONS.get(row.reason_code),
                denied_amount=row.amount,
            )
            for row in rows
        ]
