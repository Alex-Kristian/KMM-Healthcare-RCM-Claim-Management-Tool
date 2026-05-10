from app.parsers.edi_837_parser.edi_837_parser import parse_edi_837_file
from app.repositories.pre_submission_claim_repository import PreSubmissionClaimRepository
from app.models.pre_submission_claim import PreSubmissionClaim
from app.schema.pre_submission_claim_schema import PreSubmissionClaimResponse
import pickle
import pandas as pd

class PreSubmissionClaimService:
    def __init__(self, db):
        self.repo = PreSubmissionClaimRepository(db)



    async def process_edi_837(self, raw_text: str):

        try:
            pre_submission_claims = parse_edi_837_file(raw_text)
            
            self._predict_claim_denials(pre_submission_claims)

            return await self._create_pre_submission_claims(pre_submission_claims)


        except Exception:
            await self.repo.db.rollback()
            raise


    async def list_pre_submission_claims(self):
        claims = await self.repo.list_pre_submission_claims()
        return [
            PreSubmissionClaimResponse.model_validate(claim)

            for claim in claims
        ]
    

    def _predict_claim_denials(self, claims: list[PreSubmissionClaim]):
        with open("app/prediction_models/claim_denial_model/claim_denial_model.pkl", "rb") as f:
            model = pickle.load(f)


        with open("app/prediction_models/claim_denial_code_model/claim_denial_code_model.pkl", "rb") as f:
            denial_code_model = pickle.load(f)


        with open("app/prediction_models/claim_denial_code_model/claim_denial_code_encoder.pkl", "rb") as f:
            denial_code_label_encoder = pickle.load(f)

        categorical_cols = [
            "payer_type",
            "provider_specialty",
            "cpt_code",
            "modifier",
            "primary_icd10_dx",
            "prior_auth_required",
            "prior_auth_obtained"
        ]

        for claim in claims:
            input_df = pd.DataFrame([{
                "payer_type": claim.payer_type,
                "provider_specialty": claim.provider_specialty,
                "claim_amount_usd": float(claim.claim_amount_usd),
                "cpt_code": claim.pre_submission_services[0].cpt_code if claim.pre_submission_services else None,
                "modifier": claim.pre_submission_services[0].modifier if claim.pre_submission_services else None,
                "primary_icd10_dx": claim.primary_icd10_dx,
                "secondary_dx_count": claim.secondary_dx_count,
               # "documentation_completeness": float(claim.documentation_completeness),
                "prior_auth_required": claim.prior_auth_required,
                "prior_auth_obtained": claim.prior_auth_obtained
            }])

            for col in categorical_cols:
                input_df[col] = input_df[col].astype("category")

            claim.denial_prediction = model.predict(input_df)[0]
            claim.denial_probability = float(model.predict_proba(input_df)[0][1])

            if claim.denial_probability >= 0.40:
                category_prediction = denial_code_model.predict(input_df)[0]
                claim.denial_category = denial_code_label_encoder.inverse_transform([category_prediction])[0]

        return claims



    async def _create_pre_submission_claims(self, claims: PreSubmissionClaim):
        for claim in claims:
            await self.repo.create_pre_submission_claim(claim)

        await self.repo.db.commit() 
        return claims
    
    async def delete_pre_submission_claim(self, pre_submission_claim_id: int) -> bool:
        deleted = await self.repo.delete_by_id(pre_submission_claim_id)
        await self.repo.db.commit()
        return deleted