from scout.intent import ScoutOperation, ScoutIntent, detect_intent


def process_message(message: str) -> tuple[str, ScoutIntent]:
    intent = detect_intent(message)

    if intent.operation == ScoutOperation.RENT_STATUS:
        response = "You are asking about your rent payment status."

    elif intent.operation == ScoutOperation.PAYMENT_HISTORY:
        response = "You are asking about your payment history."

    elif intent.operation == ScoutOperation.APPLICATION_STATUS:
        response = "You are asking about your application status."

    elif intent.operation == ScoutOperation.MAINTENANCE_REQUESTS:
        response = "You are asking about maintenance requests."

    elif intent.operation == ScoutOperation.AGREEMENT_DETAILS:
        response = "You are asking about your rental agreement or lease."

    elif intent.operation == ScoutOperation.PROPERTY_SEARCH:
        response = "You are looking for available properties."

    elif intent.operation == ScoutOperation.PROPERTY_RECOMMENDATION:
        response = "You are looking for property recommendations."

    elif intent.operation == ScoutOperation.RENT_PREDICTION:
        response = "You are asking for a rent prediction."

    elif intent.operation == ScoutOperation.RENTAL_DEMAND:
        response = "You are asking about rental demand."

    elif intent.operation == ScoutOperation.PAYMENT_RISK:
        response = "You are asking about payment risk."

    elif intent.operation == ScoutOperation.PREDICTIVE_MAINTENANCE:
        response = "You are asking about predictive maintenance."

    elif intent.operation == ScoutOperation.PROFITABILITY:
        response = "You are asking about property profitability."

    else:
        response = "I can help you with rental and property-related questions."

    return response, intent