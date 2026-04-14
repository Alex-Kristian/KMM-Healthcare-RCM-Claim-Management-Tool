from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.era import Claim, ServiceLine, Adjustment, Payer, EraFile


def parse_date(val):
    try:
        return datetime.strptime(val, "%Y%m%d").date()
    except:
        return None

# EraRepository is responsible for creating and updating complete eras including Claim, ServiceLine, and Adjustment objects

class EraRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_era(self, era_data: dict):
        era_file = EraFile(
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
        return era_file
    
    async def get_era(self, trace_number):
        result = await self.db.execute(
            select(EraFile).where(EraFile.trace_number == trace_number)
        )
        return result.scalar_one_or_none()

    async def get_existing_payer(self, payer_identifier: str):
        result = await self.db.execute(
            select(Payer).where(Payer.payer_identifier == payer_identifier)
        )
        return result.scalar_one_or_none()


    async def create_payer(self, era_data: dict):
        payer = Payer(
            payer_name=era_data.get("payer_name"),
            payer_identifier=era_data.get("payer_id"),
        )
        self.db.add(payer)

        await self.db.flush()
        return payer

    
    async def create_new_claim(self, claim_data: dict, payer_id: int, era_file_id: int, payment_date_string: str):
        new_claim = Claim(
            payer_id=payer_id,
            era_file_id=era_file_id,
            previous_claim_id=None,

            patient_control_number=claim_data.get("patient_control_number"),
            claim_status_code=claim_data.get("status_code"),
            is_denied=claim_data.get("is_denied"),

            total_charge_amount=Decimal(claim_data.get("charged_amount", 0)),
            paid_amount=Decimal(claim_data.get("paid_amount", 0)),
            patient_responsibility=Decimal(claim_data.get("patient_responsibility", 0)),

            patient_first_name=claim_data.get("patient_first_name"),
            patient_last_name=claim_data.get("patient_last_name"),
            patient_member_id=claim_data.get("patient_member_id"),

            rendering_provider_npi=claim_data.get("rendering_provider_npi"),

            statement_from_date=parse_date(claim_data.get("service_date_start")),
            statement_to_date=parse_date(claim_data.get("service_date_end")),

            is_current=True
        )
        if new_claim.claim_status_code == "1":
            new_claim.final_payment_date = parse_date(payment_date_string)

        self.db.add(new_claim)
        await self.db.flush()

        return new_claim


    async def get_duplicate_previous_claim(self, patient_control_number: str, payer_id: int):
        
        #Should claim date of service be added as well?
        result = await self.db.execute(
            select(Claim)
            .options(
                selectinload(Claim.service_lines)
                .selectinload(ServiceLine.adjustments)
            )
            .where(
                Claim.patient_control_number == patient_control_number,
                Claim.payer_id == payer_id,
                Claim.is_current == True,
            )
        )
        return result.scalar_one_or_none()

    
    async def create_updated_claim(self, claim_data: dict, existing_claim: Claim, era_file_id: int, payment_date_string: str):
        """Creates new claim state and updates previous claim state as not current"""
        if existing_claim:
            existing_claim.is_current = False


        new_claim = Claim(
            payer_id=existing_claim.payer_id,
            era_file_id=era_file_id,
            previous_claim_id=existing_claim.id if existing_claim else None,

            patient_control_number=claim_data.get("patient_control_number"),
            claim_status_code=claim_data.get("status_code"),
            is_denied=claim_data.get("is_denied"),

            total_charge_amount=Decimal(claim_data.get("charged_amount", 0)),
            #Add previous claim state paid amount
            paid_amount=Decimal(claim_data.get("paid_amount", 0)),
            patient_responsibility=Decimal(claim_data.get("patient_responsibility", 0)),

            patient_first_name=claim_data.get("patient_first_name"),
            patient_last_name=claim_data.get("patient_last_name"),
            patient_member_id=claim_data.get("patient_member_id"),

            rendering_provider_npi=claim_data.get("rendering_provider_npi"),

            statement_from_date=parse_date(claim_data.get("service_date_start")),
            statement_to_date=parse_date(claim_data.get("service_date_end")),
            #Set as current state of claim
            is_current=True
        )
        if new_claim.claim_status_code == "1":
            new_claim.final_payment_date = parse_date(payment_date_string)

        self.db.add(new_claim)
        await self.db.flush()

        return new_claim

    
    async def create_service_line(self, service_line_data: dict, claim_id: int) -> ServiceLine:
        service_line = ServiceLine(
            claim_id=claim_id,
            procedure_code=service_line_data.get("cpt_code"),
            modifier=service_line_data.get("modifier"),
            charge_amount=Decimal(service_line_data.get("billed_amount", 0)),
            paid_amount=Decimal(service_line_data.get("paid_amount", 0)),
            revenue_code=service_line_data.get("revenue_code"),
            units=service_line_data.get("units"),
            allowed_amount=Decimal(service_line_data.get("allowed_amount", 0)),
            service_date=parse_date(service_line_data.get("service_date")),
        )

        self.db.add(service_line)
        await self.db.flush()
        return service_line


    async def create_adjustment(self, adjustment_data: dict, service_line_id: int) -> Adjustment:
        adjustment = Adjustment(
            service_line_id=service_line_id,
            group_code=adjustment_data.get("group_code"),
            reason_code=adjustment_data.get("reason_code"),
            amount=Decimal(adjustment_data.get("amount", 0)),
        )

        self.db.add(adjustment)
        await self.db.flush()
        return adjustment

    
    async def get_adjustments_by_service_line_id(self, service_line_id:int):
        result = await self.db.execute(
            select(Adjustment).where(Adjustment.service_line_id == service_line_id)
        )
        return result.scalars().all()