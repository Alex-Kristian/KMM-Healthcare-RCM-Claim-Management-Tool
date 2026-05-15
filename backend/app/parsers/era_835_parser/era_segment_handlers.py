from .era_parser_utils import safe_get, safe_float, finalize_claim


def handle_bpr(elements, era):
    """
    Parses BPR section of an ERA file
    Param: elements: list[str], list of BPR segment elements
    Param: era: dict, current ERA being created
    """
    era['payment_amount'] = safe_float(elements, 2)
    era['payment_method'] = safe_get(elements, 4)
    era['payment_date'] = safe_get(elements, 16)


def handle_trn(elements, era):
    """
    Parses TRN section of an ERA file
    Param: elements: list[str], list of TRN segment elements
    Param: era: dict, current ERA being created
    """
    era['trace_number'] = safe_get(elements, 2)
    era['originating_company_id'] = safe_get(elements, 3)


def handle_n1(elements, era):
    """
    Parses N1 section of an ERA file
    Param: elements: list[str], list of N1 segment elements
    Param: era: dict, current ERA being created
    """
    qualifier = safe_get(elements, 1)

    if qualifier == 'PR':
        era['payer_name'] = safe_get(elements, 2)
        era['payer_id'] = safe_get(elements, 4)

    elif qualifier == 'PE':
        era['payee_name'] = safe_get(elements, 2)
        era['payee_npi'] = safe_get(elements, 4)


def handle_clp(elements, era, current_claim, current_service_line):
    """
    Parses SVC section of an ERA file and finalizes the current claim
    Param: elements: list[str], list of SVC segment elements
    Param: current_claim: dict, current claim being created
    Param: current_service_line: dict, current service being created
    """
    finalize_claim(era, current_claim, current_service_line)

    return {
        'patient_control_number': safe_get(elements, 1),
        'status_code': safe_get(elements, 2),
        'charged_amount': safe_float(elements, 3),
        'paid_amount': safe_float(elements, 4),
        'patient_responsibility': safe_float(elements, 5),
        'patient_last_name': '',
        'patient_first_name': '',
        'patient_member_id': '',
        'rendering_provider_npi': '',
        'service_date_start': '',
        'service_date_end': '',
        'claim_adjustments': [],
        'service_lines': []
    }


def handle_cas(elements, claim, service_line):
    """
    Parses CAS section of an ERA file
    Param: elements: list[str], list of CAS segment elements
    Param: claim: dict, current claim being created
    Param: service_line: dict, current service being created
    """
    group_code = safe_get(elements, 1)

    for i in [2, 5, 8]:
        reason = safe_get(elements, i)
        amount = safe_float(elements, i + 1)

        if reason:
            adj = {
                'group_code': group_code,
                'reason_code': reason,
                'amount': amount
            }

            if service_line:
                service_line.setdefault('adjustments', []).append(adj)
            elif claim:
                claim.setdefault('claim_adjustments', []).append(adj)


def handle_nm1(elements, claim):
    """
    Parses NM1 section of an ERA file
    Param: elements: list[str], list of NM1 segment elements
    Param: claim: dict, current claim being created
    """
    qualifier = safe_get(elements, 1)

    if qualifier == 'QC':
        claim['patient_last_name'] = safe_get(elements, 3)
        claim['patient_first_name'] = safe_get(elements, 4)
        claim['patient_member_id'] = safe_get(elements, 9)

    elif qualifier == '82':
        claim['rendering_provider_npi'] = safe_get(elements, 9)


def handle_svc(elements, claim, current_service_line):
    """
    Parses SVC section of an ERA file
    Param: elements: list[str], list of SVC segment elements
    Param: claim: dict, current claim being created
    Param: current_service_line: dict, current service being created
    """
    if not claim:
        return None
    
    if current_service_line:
        claim.setdefault('service_lines', []).append(current_service_line.copy())

    composite = safe_get(elements, 1).split(':')
    cpt_code = composite[1] if len(composite) > 1 else composite[0]
    modifier = composite[2] if len(composite) > 2 else ''

    return {
        'cpt_code': cpt_code,
        'modifier': modifier,
        'billed_amount': safe_float(elements, 2),
        'paid_amount': safe_float(elements, 3),
        'revenue_code': safe_get(elements, 4),
        'units': safe_get(elements, 5),
        'allowed_amount': 0.0,
        'adjustments': [],
        'service_date': ''
    }


def handle_dtm(elements, claim, service_line):
    """
    Parses DTM section of an ERA file
    Param: elements: list[str], list of DTM segment elements
    Param: claim: dict, current claim being created
    Param: service_line: dict, current service being created
    """
    qualifier = safe_get(elements, 1)
    date_val = safe_get(elements, 2)

    if qualifier == '232':
        claim['service_date_start'] = date_val
    elif qualifier == '233':
        claim['service_date_end'] = date_val
    elif qualifier == '472' and service_line:
        service_line['service_date'] = date_val


def handle_amt(elements, service_line):
    """
    Parses AMT section of an ERA file
    Param: elements: list[str], list of AMT segment elements
    Param: service_line: dict, current service being created
    """
    if safe_get(elements, 1) == 'B6':
        service_line['allowed_amount'] = safe_float(elements, 2)


def handle_plb(elements, era):
    """
    Parses PLB section of an ERA file
    Param: elements: list[str], list of PLB segment elements
    Param: era: dict, current era being created
    Param: current_service_line: dict, current service being created
    """
    npi = safe_get(elements, 1)
    fiscal_date = safe_get(elements, 2)

    idx = 3
    while idx + 1 < len(elements):
        reason = safe_get(elements, idx)
        amount = safe_float(elements, idx + 1)

        if reason:
            era['plb_adjustments'].append({
                'provider_npi': npi,
                'fiscal_date': fiscal_date,
                'reason_code': reason,
                'amount': amount
            })

        idx += 2