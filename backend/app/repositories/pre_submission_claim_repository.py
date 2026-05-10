from sqlalchemy.ext.asyncio import AsyncSession
from app.models.pre_submission_claim import PreSubmissionClaim
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload


class PreSubmissionClaimRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    

    async def create_pre_submission_claim(self, pre_submission_claim :PreSubmissionClaim):
        self.db.add(pre_submission_claim)
        await self.db.flush()
        return pre_submission_claim


    async def list_pre_submission_claims(self):
        result = await self.db.execute(
            select(PreSubmissionClaim)
            .options(
                selectinload(
                    PreSubmissionClaim.pre_submission_services
                )
            )
            )
        return result.scalars().all()   


    async def delete_pre_submission_claim(self, pre_submission_claim_id):
        result = await self.db.execute(
            select(PreSubmissionClaim)
            .where(PreSubmissionClaim.id == pre_submission_claim_id))
        pre_submission_claim = result.scalar_one_or_none()

        if not pre_submission_claim:
            return None

        await self.db.delete(pre_submission_claim)
        await self.db.commit()

        return pre_submission_claim
    
    async def delete_by_id(self, pre_submission_claim_id: int) -> bool:
        result = await self.db.execute(
            delete(PreSubmissionClaim)
            .where(
                PreSubmissionClaim.id == pre_submission_claim_id
            )
        )
        return result.rowcount > 0