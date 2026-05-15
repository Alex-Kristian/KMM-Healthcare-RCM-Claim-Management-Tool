from app.models.pre_submission_claim import PreSubmissionClaim, PreSubmissionService
from datetime import datetime
from decimal import Decimal


#==================================
# Claim Context Segment Handlers
#==================================

def extract_edi_context(segments: list[str]):
    """
    Extract shared context values from an 837 file. These values apply to multiple claims
    """

    context = {
        # File level
        "sender_id": None,
        "receiver_id": None,
        "transaction_set_control": None,

        # Provider level
        "billing_provider_npi": None,
        "billing_provider_name": None,
        "provider_specialty": None,

        # Subscriber (Name insurance is under) 
        "subscriber_id": None,
        "subscriber_last_name": None,
        "subscriber_first_name": None,

        # Payer
        "payer_id": None,
        "payer_name": None,
        "payer_type": None,

        # Prior auth
        "prior_auth_obtained": False,
        "prior_auth_number": None,
    }

    for segment in segments:

        elements = segment.split("*")

        if not elements:
            continue

        seg_id = elements[0]

        # ISA
        if seg_id == "ISA":
            handle_isa(elements, context)
        # ST
        elif seg_id == "ST":
            handle_st(elements, context)

        # Provider Specialty
        elif seg_id == "PRV":
            handle_prv(elements, context)

        # Entity Segments
        elif seg_id == "NM1":
            handle_nm1(elements, context)

    return context


def handle_isa(elements, context):
    """
    Parses ISA section of an EDI file
    Param: elements: list[str], list of ISA segment elements
    Param: context: dict, pre submission claim context
    """
    if len(elements) > 6:
        context["sender_id"] = elements[6].strip()

    if len(elements) > 8:
        context["receiver_id"] = elements[8].strip()


def handle_st(elements, context):
    """
    Parses ST section of an EDI file
    Param: elements: list[str], list of ST segment elements
    Param: context: dict, pre submission claim context
    """
    if len(elements) > 2:
        context["transaction_set_control"] = elements[2]


def handle_prv(elements, context):
    """
    Parses PRV section of an EDI file
    Param: elements: list[str], list of PRV segement elements
    Param: context: dict, pre submission claim context
    """
    if len(elements) > 3:
        context["provider_specialty"] = elements[3]


def handle_nm1(elements, context):
    """
    Parses NM1 section of an EDI file
    Param: elements: list[str], list of NM1 segment elements
    Param: context: dict, pre submission claim context
    """
    if len(elements) <= 1:
        return

    entity = elements[1]

    # Billing Provider
    if entity == "85":

        if len(elements) > 3:
            context["billing_provider_name"] = elements[3]

        if len(elements) > 9:
            context["billing_provider_npi"] = elements[9]


    # Subscriber
    elif entity == "IL":

        if len(elements) > 3:
            context["subscriber_last_name"] = elements[3]

        if len(elements) > 4:
            context["subscriber_first_name"] = elements[4]

        if len(elements) > 9:
            context["subscriber_id"] = elements[9]

    # Payer
    elif entity == "PR":

        if len(elements) > 3:
            context["payer_name"] = elements[3]

            # crude payer type derivation
            payer_upper = elements[3].upper()

            if "MEDICARE" in payer_upper:
                context["payer_type"] = "Medicare"

            elif "MEDICAID" in payer_upper:
                context["payer_type"] = "Medicaid"

            else:
                context["payer_type"] = "Commercial"

        if len(elements) > 9:
            context["payer_id"] = elements[9]


#=============================================
# CLAIM SEGMENT HANDLERS
#=============================================

def handle_clm(elements, current_claim: PreSubmissionClaim):
    """
    Parses CLM section of an EDI file
    Param: elements: list[str], list of CLM segment elements
    Param: current_claim: PreSubmissionClaim, current claim being created
    """
    if len(elements) > 1:
        current_claim.claim_identifier = elements[1]

    if len(elements) > 2:
        try:
            current_claim.claim_amount_usd = Decimal(elements[2])

        except:
            pass

def handle_ref(elements, current_claim: PreSubmissionClaim):
    """
    Parses REF section of an EDI file
    Param: elements: list[str], list of REF segment elements
    Param: current_claim: PreSubmissionClaim, current claim being created
    """
    if len(elements) > 2:

        qualifier = elements[1]

        # Prior authorization
        if qualifier == "G1":
            current_claim.prior_auth_obtained = True
            current_claim.prior_auth_number = elements[2]


def handle_dtp(elements, current_claim: PreSubmissionClaim):
    """
    Parses DTP section of an EDI file
    Param: elements: list[str], list of CTP segment elements
    Param: current_claim: PreSubmissionClaim, current claim being created
    """
    if len(elements) > 3 and elements[1] == "434":

        date_str = elements[3]

        try:

            service_date = datetime.strptime(
                date_str,
                "%Y%m%d"
            ).date()

            current_claim.service_date = service_date

        except:
            pass

def handle_hi(elements, current_claim: PreSubmissionClaim, diagnosis_codes:list[str]):
    """
    Parses HI section of an EDI file
    Param: elements: list[str], list of HI segment elements
    Param: current_claim: PreSubmissionClaim, current claim being created
    Param: diagnosis_codes: list[str], list of diagnosis codes in the claim
    """
    for value in elements[1:]:

        if ":" not in value:
            continue

        code = value.split(":")[1]

        # Primary diagnosis
        if not current_claim.primary_icd10_dx:

            current_claim.primary_icd10_dx = code

        # Secondary diagnoses
        else:
            diagnosis_codes.append(code)


def handle_sv1_and_sv2(seg_id, elements, current_claim: PreSubmissionClaim):
    """
    Parses SV!or SV2 section of an EDI file
    Param: elements: list[str], list of SV! or SV2 segment elements
    Param: current_claim: PreSubmissionClaim, current claim being created
    """
    if (seg_id == "SV1"):
        current_claim.claim_type = "837P"
    elif(seg_id == "SV2"):
        current_claim.claim_type = "837I"

    if len(elements) > 1:
        procedure = PreSubmissionService()

        procedure.pre_submission_claim = current_claim

        procedure_info = elements[1]

        proc_parts = procedure_info.split(":")

        if len(proc_parts) >= 2:

            procedure.cpt_code = proc_parts[1]

            # First modifier only
            if len(proc_parts) > 2:
                procedure.modifier = proc_parts[2]


    current_claim.pre_submission_services.append(procedure)