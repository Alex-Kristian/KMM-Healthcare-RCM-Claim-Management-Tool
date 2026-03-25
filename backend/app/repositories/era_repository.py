from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.era import EraFile, Claim, ServiceLine, Adjustment


def parse_date(val):
    try:
        return datetime.strptime(val, "%Y%m%d").date()
    except:
        return None


class EraRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_full_era(self, era_data: dict, filename: str = "upload.835"):
        # ERA
        era_file = EraFile(
            filename=filename,
            payer_name=era_data.get("payer_name"),
            payer_id=era_data.get("payer_id"),
            payee_name=era_data.get("payee_name"),
            payee_npi=era_data.get("payee_npi"),
            total_actual_provider_payment=Decimal(
                era_data.get("payment_amount", 0)
            ),
            payment_method=era_data.get("payment_method"),
            payment_date=parse_date(era_data.get("payment_date")),
            trace_number=era_data.get("trace_number"),
        )

        self.db.add(era_file)
        await self.db.flush()

        # CLAIMS
        for c in era_data.get("claims", []):
            claim = Claim(
                era_file_id=era_file.id,
                patient_control_number=c.get("patient_control_number"),
                claim_status_code=c.get("status_code"),
                is_denied=c.get("is_denied"),

                total_charge_amount=Decimal(c.get("charged_amount", 0)),
                paid_amount=Decimal(c.get("paid_amount", 0)),
                patient_responsibility=Decimal(c.get("patient_responsibility", 0)),

                patient_first_name=c.get("patient_first_name"),
                patient_last_name=c.get("patient_last_name"),
                patient_member_id=c.get("patient_member_id"),

                rendering_provider_npi=c.get("rendering_provider_npi"),

                statement_from_date=parse_date(c.get("service_date_start")),
                statement_to_date=parse_date(c.get("service_date_end")),
            )

            self.db.add(claim)
            await self.db.flush()

            # SERVICE LINES
            for s in c.get("service_lines", []):
                svc = ServiceLine(
                    claim_id=claim.id,
                    procedure_code=s.get("cpt_code"),
                    modifier=s.get("modifier"),

                    charge_amount=Decimal(s.get("billed_amount", 0)),
                    paid_amount=Decimal(s.get("paid_amount", 0)),

                    revenue_code=s.get("revenue_code"),
                    units=s.get("units"),

                    allowed_amount=Decimal(s.get("allowed_amount", 0)),
                    service_date=parse_date(s.get("service_date")),
                )

                self.db.add(svc)
                await self.db.flush()

                # ADJUSTMENTS
                for adj in s.get("adjustments", []):
                    self.db.add(
                        Adjustment(
                            service_line_id=svc.id,
                            group_code=adj.get("group_code"),
                            reason_code=adj.get("reason_code"),
                            amount=Decimal(adj.get("amount", 0)),
                        )
                    )

        await self.db.commit()

        return era_file