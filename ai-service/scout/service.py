from scout.intent import detect_intent


def process_message(message: str) -> str:
    intent = detect_intent(message)

    if intent == "PAYMENT_STATUS":
        return "You are asking about your rent payment status."

    if intent == "RENT_INFORMATION":
        return "You are asking for information about rent."

    if intent == "PROPERTY_SEARCH":
        return "You are looking for available properties."

    if intent == "APPLICATION_STATUS":
        return "You are asking about your application status."

    if intent == "MAINTENANCE":
        return "You are reporting or asking about a maintenance issue."

    if intent == "AGREEMENT":
        return "You are asking about your rental agreement or lease."

    return "I can help you with rental and property-related questions."