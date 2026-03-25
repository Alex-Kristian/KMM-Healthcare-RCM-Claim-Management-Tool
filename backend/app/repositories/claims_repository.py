from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.era import Claim, ServiceLine
from sqlalchemy.ext.asyncio import AsyncSession


class ClaimsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_claims(self):
        result = await self.db.execute(
            select(Claim)
            .options(selectinload(Claim.era_file))
            )
        return result.scalars().all()


    async def get_claim_with_details(self, claim_id: int):
        result = await self.db.execute(
            select(Claim)
            .where(Claim.id == claim_id)
            .options(
                selectinload(Claim.era_file),
                selectinload(Claim.service_lines)
                .selectinload(ServiceLine.adjustments)
            )
        )
        return result.scalar_one_or_none()