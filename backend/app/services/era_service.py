from app.parsers.era_parser import parse_era
from app.repositories.era_repository import EraRepository
from app.models.era import Claim

class EraService:
    def __init__(self, db):
        self.repo = EraRepository(db)


    async def process_era(self, raw_text: str):
        try:
            era_data = parse_era(raw_text)

            if not era_data:
                raise Exception("Failed to parse ERA")

            new_claims = await self._create_claims_from_era(era_data)
            if not new_claims:
                raise Exception("ERA file has already been uploaded")

            await self.repo.db.commit() 

            return new_claims

        except Exception:
            await self.repo.db.rollback()
            raise
    

    async def _create_claims_from_era(self, era_data: dict):
        new_claims: list[Claim] = []
        
        # If era file has already been processed skip creation
        duplicate_era_file = await self.repo.get_era(era_data.get("trace_number"))
        if duplicate_era_file:
            return None

        era_file = await self.repo.create_era(era_data=era_data)

        payment_date = era_data.get("payment_date")
     
        payer = await self.repo.get_existing_payer(era_data.get("payer_id"))

        if not payer:
            payer = await self.repo.create_payer(era_data)
        
        for claim_data in era_data.get("claims", []):

            #Check if previous state of claim exists. If so, create an updated version of claim
            previous_claim = await self.repo.get_duplicate_previous_claim(
                patient_control_number=claim_data.get("patient_control_number"),
                payer_id=payer.id,
                )
            
            if previous_claim:
                claim = await self.repo.create_updated_claim(
                    claim_data=claim_data, 
                    existing_claim=previous_claim, 
                    era_file_id=era_file.id, 
                    payment_date_string=payment_date
                    )
            #If no previous state of claim create a new claim
            else:
                claim = await self.repo.create_new_claim(
                    claim_data=claim_data, 
                    payer_id=payer.id,
                    era_file_id=era_file.id,
                    payment_date_string=payment_date
                    )

            for service_line_data in claim_data.get("service_lines", []):
                service_line = await self.repo.create_service_line(service_line_data=service_line_data, claim_id=claim.id)

                for adjustment_data in service_line_data.get("adjustments", []):
                    await self.repo.create_adjustment(adjustment_data=adjustment_data, service_line_id=service_line.id)
                
            new_claims.append(claim)
            
        return new_claims
    
