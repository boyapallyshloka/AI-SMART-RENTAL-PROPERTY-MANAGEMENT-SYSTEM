def detect_intent(message: str) -> str:
    message = message.lower().strip()

    if any(word in message for word in ["paid", "payment", "pay", "rent payment"]):
        return "PAYMENT_STATUS"

    if any(word in message for word in ["rent", "monthly rent"]):
        return "RENT_INFORMATION"

    if any(word in message for word in ["house", "property", "flat", "apartment", "available"]):
        return "PROPERTY_SEARCH"

    if any(word in message for word in ["application", "applied", "application status"]):
        return "APPLICATION_STATUS"

    if any(word in message for word in ["repair", "maintenance", "leak", "broken"]):
        return "MAINTENANCE"

    if any(word in message for word in ["agreement", "lease", "contract", "expiry", "expire"]):
        return "AGREEMENT"

    return "GENERAL"