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

            if len(elements) > 6:
                context["sender_id"] = elements[6].strip()

            if len(elements) > 8:
                context["receiver_id"] = elements[8].strip()

        # ST
        elif seg_id == "ST":

            if len(elements) > 2:
                context["transaction_set_control"] = elements[2]


        # Provider Specialty
        elif seg_id == "PRV":

            if len(elements) > 3:
                context["provider_specialty"] = elements[3]


        # Entity Segments
        elif seg_id == "NM1":

            if len(elements) <= 1:
                continue

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


    return context