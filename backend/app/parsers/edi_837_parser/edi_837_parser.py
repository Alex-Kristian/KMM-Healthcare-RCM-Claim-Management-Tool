from decimal import Decimal
from datetime import datetime

from app.parsers.edi_837_parser.edi_837_segment_handlers import extract_edi_context
from app.models.pre_submission_claim import (
    PreSubmissionClaim,
    PreSubmissionService
)


def finalize_claim(claim: PreSubmissionClaim, required_fields: dict, diagnosis_codes: list, claims: list, context: dict
):
    """
    Finalize calculated claim fields before saving.
    """

    claim.payer = context["payer_name"]
    claim.provider_specialty = context["provider_specialty"]
    claim.billing_provider = context["billing_provider_name"]
    claim.payer_type = context["payer_type"]

    completed = sum(required_fields.values())
    total = len(required_fields)

    claim.secondary_dx_count = len(diagnosis_codes)

    claim.documentation_completeness = round(
        completed / total,
        2
    )

    claims.append(claim)


def parse_edi_837_file(file_content: str):

    segments = [
        s.strip()
        for s in file_content.split("~")
        if s.strip()
    ]

    claims: list[PreSubmissionClaim] = []

    current_claim: PreSubmissionClaim | None = None

    diagnosis_codes = []

    required_fields = {}


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
                    required_fields,
                    diagnosis_codes,
                    claims,
                    context
                )
            # Create new claim
            current_claim = PreSubmissionClaim()

            diagnosis_codes = []

            required_fields = {
              #  "billing_provider":
              #      context["billing_provider_seen"],

              #  "subscriber":
              #      context["subscriber_seen"],

              #  "payer":
               #     context["payer_seen"],

                "claim_amount": False,
                "primary_dx": False,
                "procedure_code": False,
                "service_date": False,
            }

            if len(elements) > 1:
                current_claim.claim_identifier = elements[1]

            if len(elements) > 2:
                try:
                    current_claim.claim_amount_usd = Decimal(elements[2])

                    required_fields["claim_amount"] = True

                except:
                    pass


        # Ignore remaining segments until claim exists
        elif current_claim is None:
            continue

        # UM segment shows that auth is required
        elif seg_id == "UM":
            current_claim.prior_auth_required = True
        

        elif seg_id == "REF":

            if len(elements) > 2:

                qualifier = elements[1]

                # Prior authorization
                if qualifier == "G1":
                    current_claim.prior_auth_obtained = True
                    current_claim.prior_auth_number = elements[2]

        # Service Date
        elif seg_id == "DTP":

            if len(elements) > 3 and elements[1] == "434":

                date_str = elements[3]

                try:

                    service_date = datetime.strptime(
                        date_str,
                        "%Y%m%d"
                    ).date()

                    current_claim.service_date = service_date

                    required_fields["service_date"] = True

                except:
                    pass


        # Diagnosis Codes
        elif seg_id == "HI":

            for value in elements[1:]:

                if ":" not in value:
                    continue

                code = value.split(":")[1]

                # Primary diagnosis
                if not current_claim.primary_icd10_dx:

                    current_claim.primary_icd10_dx = code

                    required_fields["primary_dx"] = True

                # Secondary diagnoses
                else:
                    diagnosis_codes.append(code)

        # Service Line
        elif (seg_id == "SV1" or seg_id == "SV2"):
            if (seg_id == "SV1"):
                current_claim.claim_type = "837P"
            elif(seg_id == "SV2"):
                current_claim.claim_type = "837I"

            procedure = PreSubmissionService()

            procedure.pre_submission_claim = current_claim

            if len(elements) > 1:

                procedure_info = elements[1]

                proc_parts = procedure_info.split(":")

                # HC:99213:25
                if len(proc_parts) >= 2:

                    procedure.cpt_code = proc_parts[1]

                    # First modifier only
                    if len(proc_parts) > 2:
                        procedure.modifier = proc_parts[2]

                    required_fields["procedure_code"] = True

            current_claim.pre_submission_services.append(procedure)


    # =========================================================
    # FINAL CLAIM
    # =========================================================
    if current_claim:

        finalize_claim(
            current_claim,
            required_fields,
            diagnosis_codes,
            claims,
            context
        )

    return claims