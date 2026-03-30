def init_era():
    return {
        'payer_name': '',
        'payer_id': '',
        'payee_name': '',
        'payee_npi': '',
        'payment_amount': 0.0,
        'payment_method': '',
        'payment_date': '',
        'trace_number': '',
        'claims': [],
        'plb_adjustments': []
    }


def safe_get(elements, idx):
    return elements[idx] if len(elements) > idx else ''


def safe_float(elements, idx):
    try:
        return float(elements[idx]) if len(elements) > idx and elements[idx] else 0.0
    except:
        return 0.0


def finalize_claim(era, claim, service_line):
    if service_line:
        claim.setdefault('service_lines', []).append(service_line.copy())
        service_line.clear()

    if claim:
        era['claims'].append(claim.copy())
        claim.clear()