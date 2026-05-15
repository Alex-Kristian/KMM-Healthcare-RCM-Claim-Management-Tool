from sqlalchemy.ext.asyncio import AsyncSession
from app.models.pre_submission_claim import PreSubmissionClaim
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload


class PreSubmissionClaimRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    

    async def create_pre_submission_claim(self, pre_submission_claim :PreSubmissionClaim):
        """
        Saves a PreSubmissionClaim to the database
        Param: pre_submission_claim: PreSubmissionClaim, claim to be saved
        Return PreSubmissionClaim: PreSubmissionClaim, claim saved
        """
        self.db.add(pre_submission_claim)
        await self.db.flush()
        return pre_submission_claim


    async def list_pre_submission_claims(self):
        """
        Retrieves all PreSubmissionClaims
        Return: list[PreSubmissionClaim]
        """
        result = await self.db.execute(
            select(PreSubmissionClaim)
            .options(
                selectinload(
                    PreSubmissionClaim.pre_submission_services
                )
            )
            )
        return result.scalars().all()   


    async def delete_by_id(self, pre_submission_claim_id: int) -> bool:
        """
        Deletes a PresubmissionClaim by ID
        Param: pre_submission_claim_id: int, PresubmissionClaim ID to be deleted
        Return: Boolean, True if deleted, false if unable to delete
        """
        result = await self.db.execute(
            delete(PreSubmissionClaim)
            .where(
                PreSubmissionClaim.id == pre_submission_claim_id
            )
        )
        return result.rowcount > 0