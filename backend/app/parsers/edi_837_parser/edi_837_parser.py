from app.parsers.edi_837_parser.edi_837_segment_handlers import *

from app.parsers.edi_837_parser.edi_837_segment_handlers import extract_edi_context
from app.models.pre_submission_claim import (
    PreSubmissionClaim
)


def finalize_claim(claim: PreSubmissionClaim, diagnosis_codes: list, claims: list, context: dict
):
    """
    Finalize context claim fields before saving.
    """

    claim.payer = context["payer_name"]
    claim.provider_specialty = context["provider_specialty"]
    claim.billing_provider = context["billing_provider_name"]
    claim.payer_type = context["payer_type"]

    claim.secondary_dx_count = len(diagnosis_codes)

    claims.append(claim)


def parse_edi_837_file(file_content: str):
    """ 
    Parses an EDI file and returns a list of PreSubmission Claims
    Param: file_content:str EDI file contnents
    """

    segments = [
        s.strip()
        for s in file_content.split("~")
        if s.strip()
    ]

    claims: list[PreSubmissionClaim] = []

    current_claim: PreSubmissionClaim | None = None

    diagnosis_codes = []

    # Extract context values that are common for all claims
    context = extract_edi_context(segments)

    for segment in segments:

        elements = segment.split("*")

        if not elements:
            continue

        seg_id = elements[0]

        # Start New Claim
        if seg_id == "CLM":

            # Save previous claim first
            if current_claim:

                finalize_claim(
                    current_claim,
                    diagnosis_codes,
                    claims,
                    context
                )
            # Create new claim
            current_claim = PreSubmissionClaim()

            diagnosis_codes = []
            handle_clm(elements, current_claim)

        # Ignore remaining segments until claim exists
        elif current_claim is None:
            continue

        # UM segment shows that auth is required
        elif seg_id == "UM":
            current_claim.prior_auth_required = True
        

        elif seg_id == "REF":
            handle_ref(elements, current_claim)
  
        # Service Date
        elif seg_id == "DTP":
            handle_dtp(elements, current_claim)

        # Diagnosis Codes
        elif seg_id == "HI":
            handle_hi(elements, current_claim, diagnosis_codes)

        # Service Line
        elif (seg_id == "SV1" or seg_id == "SV2"):
            handle_sv1_and_sv2(seg_id, elements, current_claim)


    # =========================================================
    # FINAL CLAIM
    # =========================================================
    if current_claim:

        finalize_claim(
            current_claim,
            diagnosis_codes,
            claims,
            context
        )

    return claims