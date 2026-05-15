
from .era_segment_handlers import *
from .era_parser_utils import init_era, finalize_claim

def parse_era(content: str):
    """
    Parses an ERA file and returns a dict of the parsed ERA
    Param: content: str, the content of the ERA
    """
    current_era = init_era()
    current_claim = {}
    current_service_line = {}

    segments = [s.strip() for s in content.split('~') if s.strip()]

    for segment in segments:
        elements = segment.split('*')
        seg_id = elements[0]

        if seg_id == 'BPR':
            handle_bpr(elements, current_era)

        elif seg_id == 'TRN':
            handle_trn(elements, current_era)

        elif seg_id == 'N1':
            handle_n1(elements, current_era)

        elif seg_id == 'CLP':
            current_claim = handle_clp(elements, current_era, current_claim, current_service_line)

        elif seg_id == 'CAS':
            handle_cas(elements, current_claim, current_service_line)

        elif seg_id == 'NM1':
            handle_nm1(elements, current_claim)

        elif seg_id == 'SVC':
            current_service_line = handle_svc(elements, current_claim, current_service_line)

        elif seg_id == 'DTM':
            handle_dtm(elements, current_claim, current_service_line)

        elif seg_id == 'AMT':
            handle_amt(elements, current_service_line)

        elif seg_id == 'PLB':
            handle_plb(elements, current_era)

        elif seg_id == 'SE':
            finalize_claim(current_era, current_claim, current_service_line)

    return current_era