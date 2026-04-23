from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.era import Claim, ServiceLine, Adjustment, Payer
from sqlalchemy.ext.asyncio import AsyncSession


class ClaimsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_claims(self):
        result = await self.db.execute(
            select(Claim)
            .where(Claim.is_current == True)
            .options(
                selectinload(Claim.payer),
                selectinload(Claim.era_file)    
            )       
        )
        return result.scalars().all()


    async def get_claim_with_details(self, claim_id: int):
        result = await self.db.execute(
            select(Claim)
            .where(Claim.id == claim_id)
            .options(
                selectinload(Claim.payer),
                selectinload(Claim.era_file),
                selectinload(Claim.service_lines)
                    .selectinload(ServiceLine.adjustments)
            )
        )
        return result.scalar_one_or_none()
    
    async def get_denial_line_rows(self):
        query = (
            select(
                ServiceLine.id.label("service_line_id"),
                ServiceLine.claim_id,
                Claim.patient_control_number,
                Claim.patient_first_name,
                Claim.patient_last_name,
                Payer.payer_name,
                ServiceLine.service_date,
                ServiceLine.procedure_code,
                Adjustment.reason_code,
                Adjustment.group_code,
                Adjustment.amount
            )
            .join(Claim, ServiceLine.claim_id == Claim.id)
            .outerjoin(Payer, Claim.payer_id == Payer.id)
            .outerjoin(Adjustment, Adjustment.service_line_id == ServiceLine.id)
            .where(
                Claim.is_denied == True,
                Claim.is_current == True,
                Adjustment.amount > 0,
            )
        )

        result = await self.db.execute(query)
        return result.all()