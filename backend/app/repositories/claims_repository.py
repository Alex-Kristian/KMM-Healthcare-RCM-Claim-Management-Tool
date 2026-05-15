from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.era import Claim, ServiceLine, Adjustment, Payer
from sqlalchemy.ext.asyncio import AsyncSession


class ClaimsRepository:
    """
    Repository for Claims functionalities
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_claims(self, date_from, date_to):
        """
        Retrieves all Claims from and to process date
        Param: date_from: date, from processed date
        Param: date_to: date, to processed date
        Return: Claim[list]: List of claims processed from date_from to date_to
        """
        
        filters = [Claim.is_current == True]

        if date_from:
            filters.append(Claim.created_at >= date_from)

        if date_to:
            filters.append(Claim.created_at <= date_to)
        
        result = await self.db.execute(
            select(Claim)
            .where(*filters)
            .options(
                selectinload(Claim.payer),
                selectinload(Claim.era_file)    
            )       
        )
        return result.scalars().all()


    async def get_claim_with_details(self, claim_id: int):
        """
        Retrieves extended Claim details from claim id 
        Param: date_to: date, to processed date
        Return: Claim, Claim retrieved
        """
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
        """
        Retrieves all denial information fro denial summary
        Return: dict, denial lines information for denial summary
        """
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
    

    async def delete_claim(self, claim_id: int):
        """
        Deletes a claim given the claim's id
        Param: claim_int: int, ID of claim to be deleted
        Return: Claim, Deleted Claim
        """
        result = await self.db.execute(
            select(Claim)
            .where(Claim.id == claim_id)
            .options(
                selectinload(Claim.service_lines)
                .selectinload(ServiceLine.adjustments)
            )
        )
        claim = result.scalar_one_or_none()

        if not claim:
            return None

        await self.db.delete(claim)
        await self.db.commit()

        return claim