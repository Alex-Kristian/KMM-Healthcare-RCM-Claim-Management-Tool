
def parse_era(content:str):
    # ERA Object
    current_era = {
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

    current_claim = {}
    current_service_line = {}

    # Determine delimiters based on universal defaults (or extracting from ISA)
    segment_term = '~'
    element_sep = '*'
    subelement_sep = ':'
    
    # Split on segment terminator
    segments = [s.strip() for s in content.split(segment_term) if s.strip()]

    def save_service_line():
        if current_service_line:
            current_claim.setdefault('service_lines', []).append(current_service_line.copy())
            current_service_line.clear()

    def save_claim():
        if current_claim:
            # First ensure any pending service line for this claim is saved
            save_service_line()
            current_era.setdefault('claims', []).append(current_claim.copy())
            current_claim.clear()

    for segment in segments:
        elements = segment.split(element_sep)
        seg_id = elements[0]

#        if seg_id == 'ISA':
#            if len(segment) >= 106:
#                element_sep = segment[3]
#                subelement_sep = segment[104]
#                segment_term = segment[105]
#                pass
            
        if seg_id == 'BPR':
            if len(elements) > 2:
                current_era['payment_amount'] = float(elements[2]) if elements[2] else 0.0
            if len(elements) > 4:
                current_era['payment_method'] = elements[4]
            if len(elements) > 16:
                current_era['payment_date'] = elements[16]

        elif seg_id == 'TRN':
            if len(elements) > 2:
                current_era['trace_number'] = elements[2]
            if len(elements) > 3:
                current_era['payer_id'] = elements[3]
                
        elif seg_id == 'N1':
            if len(elements) > 1:
                qualifier = elements[1]
                if qualifier == 'PR':
                    if len(elements) > 2: current_era['payer_name'] = elements[2]
                    if len(elements) > 4: current_era['payer_id'] = elements[4]
                elif qualifier == 'PE':
                    if len(elements) > 2: current_era['payee_name'] = elements[2]
                    if len(elements) > 4: current_era['payee_npi'] = elements[4]

        elif seg_id == 'CLP':
            save_claim() # start of new claim
            
            # Initialize new claim
            current_claim = {
                'patient_control_number': elements[1] if len(elements) > 1 else '',
                'status_code': elements[2] if len(elements) > 2 else '',
                'is_denied': (elements[2] == '4') if len(elements) > 2 else False,
                'charged_amount': float(elements[3]) if len(elements) > 3 and elements[3] else 0.0,
                'paid_amount': float(elements[4]) if len(elements) > 4 and elements[4] else 0.0,
                'patient_responsibility': float(elements[5]) if len(elements) > 5 and elements[5] else 0.0,
                'patient_last_name': '',
                'patient_first_name': '',
                'patient_member_id': '',
                'rendering_provider_npi': '',
                'service_date_start': '',
                'service_date_end': '',
                'claim_adjustments': [],
                'service_lines': []
            }

        elif seg_id == 'CAS':
            # Handle max 3 pairs
            if len(elements) > 1:
                group_code = elements[1]
                pairs = [(2,3), (5,6), (8,9)]
                
                new_adjustments = []
                for p_code_idx, p_amt_idx in pairs:
                    if len(elements) > p_amt_idx and elements[p_code_idx].strip():
                        reason_code = elements[p_code_idx].strip()
                        amt_str = elements[p_amt_idx].strip()
                        amount = float(amt_str) if amt_str else 0.0
                        new_adjustments.append({
                            'group_code': group_code,
                            'reason_code': reason_code,
                            'amount': amount
                        })
                
                if current_service_line:
                    current_service_line.setdefault('adjustments', []).extend(new_adjustments)
                elif current_claim:
                    current_claim.setdefault('claim_adjustments', []).extend(new_adjustments)
            
        elif seg_id == 'NM1':
            qualifier = elements[1] if len(elements) > 1 else ''
            if qualifier == 'QC':
                if current_claim:
                    if len(elements) > 3: current_claim['patient_last_name'] = elements[3]
                    if len(elements) > 4: current_claim['patient_first_name'] = elements[4]
                    if len(elements) > 9: current_claim['patient_member_id'] = elements[9]
            elif qualifier == '82':
                if current_claim:
                    if len(elements) > 3: current_claim['rendering_provider_last_name'] = elements[3]
                    if len(elements) > 4: current_claim['rendering_provider_first_name'] = elements[4]
                    if len(elements) > 9: current_claim['rendering_provider_npi'] = elements[9]
        
        elif seg_id == 'SVC':
            save_service_line() # start of new service line
            
            cpt_composite = elements[1] if len(elements) > 1 else ''
            cpt_parts = cpt_composite.split(subelement_sep)
            cpt_code = cpt_parts[1] if len(cpt_parts) > 1 else cpt_composite
            modifier = cpt_parts[2] if len(cpt_parts) > 2 else ''
            
            current_service_line = {
                'cpt_code': cpt_code,
                'modifier': modifier,
                'billed_amount': float(elements[2]) if len(elements) > 2 and elements[2] else 0.0,
                'paid_amount': float(elements[3]) if len(elements) > 3 and elements[3] else 0.0,
                'revenue_code': elements[4] if len(elements) > 4 else '',
                'units': elements[5] if len(elements) > 5 else '',
                'allowed_amount': 0.0,
                'adjustments': [],
                'service_date': ''
            }
            
        elif seg_id == 'DTM':
            qualifier = elements[1] if len(elements) > 1 else ''
            date_val = elements[2] if len(elements) > 2 else ''
            
            if qualifier in ['232', '233'] and current_claim and not current_service_line:
                if qualifier == '232':
                    current_claim['service_date_start'] = date_val
                else:
                    current_claim['service_date_end'] = date_val
            elif qualifier == '472' and current_service_line:
                current_service_line['service_date'] = date_val

        elif seg_id == 'AMT':
            qualifier = elements[1] if len(elements) > 1 else ''
            if qualifier == 'B6' and current_service_line:
                amt_str = elements[2] if len(elements) > 2 else ''
                current_service_line['allowed_amount'] = float(amt_str) if amt_str else 0.0
                
        elif seg_id == 'PLB':
            if len(elements) > 4:
                npi = elements[1]
                fiscal_date = elements[2]
                
                idx = 3
                while idx + 1 < len(elements):
                    reason_code = elements[idx].strip()
                    amt_str = elements[idx+1].strip()
                    if reason_code and amt_str:
                        current_era['plb_adjustments'].append({
                            'provider_npi': npi,
                            'fiscal_date': fiscal_date,
                            'reason_code': reason_code,
                            'amount': float(amt_str)
                        })
                    idx += 2
                    
        elif seg_id == 'SE':
            save_service_line()
            save_claim()
            
    return current_era