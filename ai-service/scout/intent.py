from enum import Enum

from pydantic import BaseModel, Field


# ============================================================
# 1. SCOUT OPERATIONS
# ============================================================

class ScoutOperation(str, Enum):
    # Backend operations
    RENT_STATUS = "RENT_STATUS"
    PAYMENT_HISTORY = "PAYMENT_HISTORY"
    APPLICATION_STATUS = "APPLICATION_STATUS"
    MAINTENANCE_REQUESTS = "MAINTENANCE_REQUESTS"
    AGREEMENT_DETAILS = "AGREEMENT_DETAILS"

    # M2
    PROPERTY_SEARCH = "PROPERTY_SEARCH"
    PROPERTY_RECOMMENDATION = "PROPERTY_RECOMMENDATION"

    # AI modules
    RENT_PREDICTION = "RENT_PREDICTION"                 # M1
    RENTAL_DEMAND = "RENTAL_DEMAND"                     # M3
    PAYMENT_RISK = "PAYMENT_RISK"                       # M4
    PREDICTIVE_MAINTENANCE = "PREDICTIVE_MAINTENANCE"  # M5
    PROFITABILITY = "PROFITABILITY"                     # M6

    # General
    GENERAL = "GENERAL"


# ============================================================
# 2. SCOUT SOURCES
# ============================================================

class ScoutSource(str, Enum):
    BACKEND = "BACKEND"
    M1 = "M1"
    M2 = "M2"
    M3 = "M3"
    M4 = "M4"
    M5 = "M5"
    M6 = "M6"
    GENERAL = "GENERAL"


# ============================================================
# 3. OPERATION DEFINITION
# ============================================================

class OperationDefinition(BaseModel):
    operation: ScoutOperation
    source: ScoutSource
    required_parameters: list[str] = Field(default_factory=list)
    optional_parameters: list[str] = Field(default_factory=list)
    description: str


# ============================================================
# 4. OPERATION DEFINITIONS
# ============================================================

OPERATION_DEFINITIONS = {

    # -------------------------
    # BACKEND
    # -------------------------

    ScoutOperation.RENT_STATUS: OperationDefinition(
        operation=ScoutOperation.RENT_STATUS,
        source=ScoutSource.BACKEND,
        required_parameters=["tenant_id"],
        optional_parameters=["property_id"],
        description="Get the current rent or payment status of a tenant.",
    ),

    ScoutOperation.PAYMENT_HISTORY: OperationDefinition(
        operation=ScoutOperation.PAYMENT_HISTORY,
        source=ScoutSource.BACKEND,
        required_parameters=["tenant_id"],
        optional_parameters=["property_id"],
        description="Retrieve payment history for a tenant.",
    ),

    ScoutOperation.APPLICATION_STATUS: OperationDefinition(
        operation=ScoutOperation.APPLICATION_STATUS,
        source=ScoutSource.BACKEND,
        required_parameters=["tenant_id"],
        optional_parameters=["property_id"],
        description="Get the status of a tenant property application.",
    ),

    ScoutOperation.MAINTENANCE_REQUESTS: OperationDefinition(
        operation=ScoutOperation.MAINTENANCE_REQUESTS,
        source=ScoutSource.BACKEND,
        required_parameters=["tenant_id"],
        optional_parameters=["property_id"],
        description="Retrieve maintenance requests for a tenant.",
    ),

    ScoutOperation.AGREEMENT_DETAILS: OperationDefinition(
        operation=ScoutOperation.AGREEMENT_DETAILS,
        source=ScoutSource.BACKEND,
        required_parameters=["tenant_id"],
        optional_parameters=["property_id"],
        description="Retrieve rental agreement details.",
    ),

    # -------------------------
    # M2
    # -------------------------

    ScoutOperation.PROPERTY_SEARCH: OperationDefinition(
        operation=ScoutOperation.PROPERTY_SEARCH,
        source=ScoutSource.M2,
        required_parameters=[],
        optional_parameters=[
            "tenant_id",
            "preferred_city",
            "max_budget",
            "min_bedrooms",
            "property_type",
            "furnishing",
            "parking",
            "amenities",
            "max_distance",
        ],
        description="Search for properties matching user criteria.",
    ),

    ScoutOperation.PROPERTY_RECOMMENDATION: OperationDefinition(
        operation=ScoutOperation.PROPERTY_RECOMMENDATION,
        source=ScoutSource.M2,
        required_parameters=["tenant_id"],
        optional_parameters=[
            "preferred_city",
            "max_budget",
            "min_bedrooms",
            "property_type",
            "furnishing",
            "parking",
            "amenities",
            "max_distance",
            "top_n",
        ],
        description="Recommend properties based on tenant preferences.",
    ),

    # -------------------------
    # M1
    # -------------------------

    ScoutOperation.RENT_PREDICTION: OperationDefinition(
        operation=ScoutOperation.RENT_PREDICTION,
        source=ScoutSource.M1,
        required_parameters=[],
        optional_parameters=[
            "city",
            "area",
            "area_type",
            "property_type",
            "bedrooms",
            "bathrooms",
            "furnishing",
        ],
        description="Predict the expected rent for a property.",
    ),

    # -------------------------
    # M3
    # -------------------------

    ScoutOperation.RENTAL_DEMAND: OperationDefinition(
        operation=ScoutOperation.RENTAL_DEMAND,
        source=ScoutSource.M3,
        required_parameters=[],
        optional_parameters=[
            "city",
            "property_type",
            "time_period",
        ],
        description="Predict rental demand.",
    ),

    # -------------------------
    # M4
    # -------------------------

    ScoutOperation.PAYMENT_RISK: OperationDefinition(
        operation=ScoutOperation.PAYMENT_RISK,
        source=ScoutSource.M4,
        required_parameters=[],
        optional_parameters=[
            "tenant_id",
            "payment_history",
        ],
        description="Assess payment risk.",
    ),

    # -------------------------
    # M5
    # -------------------------

    ScoutOperation.PREDICTIVE_MAINTENANCE: OperationDefinition(
        operation=ScoutOperation.PREDICTIVE_MAINTENANCE,
        source=ScoutSource.M5,
        required_parameters=[],
        optional_parameters=[
            "property_id",
            "property_age",
            "maintenance_type",
        ],
        description="Predict maintenance requirements.",
    ),

    # -------------------------
    # M6
    # -------------------------

    ScoutOperation.PROFITABILITY: OperationDefinition(
        operation=ScoutOperation.PROFITABILITY,
        source=ScoutSource.M6,
        required_parameters=[],
        optional_parameters=[
            "property_id",
            "monthly_rent",
            "operating_cost",
            "occupancy_rate",
        ],
        description="Estimate property profitability.",
    ),

    # -------------------------
    # GENERAL
    # -------------------------

    ScoutOperation.GENERAL: OperationDefinition(
        operation=ScoutOperation.GENERAL,
        source=ScoutSource.GENERAL,
        required_parameters=[],
        optional_parameters=[],
        description="Handle general questions.",
    ),
}


# ============================================================
# 5. SCOUT INTENT RESULT
# ============================================================

class ScoutIntent(BaseModel):
    operation: ScoutOperation
    source: ScoutSource
    parameters: dict = Field(default_factory=dict)
    confidence: float = 0.0


# ============================================================
# 6. KEYWORD GROUPS
# ============================================================

KEYWORDS = {

    ScoutOperation.RENT_STATUS: [
        "rent status",
        "rent paid",
        "rent payment status",
        "did i pay rent",
        "did i pay my rent",
        "have i paid rent",
        "have i paid my rent",
        "rent due",
        "rent pending",
    ],

    ScoutOperation.PAYMENT_HISTORY: [
        "payment history",
        "rent history",
        "payment records",
        "past payments",
        "previous payments",
        "payments made",
        "show my payment history",
        "show payment history",
    ],

    ScoutOperation.APPLICATION_STATUS: [
        "application status",
        "application update",
        "my application",
        "rental application",
        "application progress",
    ],

    ScoutOperation.MAINTENANCE_REQUESTS: [
        "maintenance request",
        "maintenance requests",
        "repair request",
        "repair requests",
        "my maintenance",
        "maintenance status",
    ],

    ScoutOperation.AGREEMENT_DETAILS: [
        "rental agreement",
        "lease agreement",
        "agreement details",
        "lease details",
        "agreement expiry",
        "agreement expiration",
        "when does my lease expire",
    ],

    ScoutOperation.PROPERTY_RECOMMENDATION: [
        "recommend properties",
        "recommend a property",
        "property recommendations",
        "suggest properties",
        "suggest a property",
        "properties for me",
        "find a property for me",
    ],

    ScoutOperation.PROPERTY_SEARCH: [
        "find properties",
        "search properties",
        "find property",
        "search property",
        "properties in",
        "apartments in",
        "houses in",
        "homes in",
    ],

    ScoutOperation.RENT_PREDICTION: [
        "predict rent",
        "rent prediction",
        "expected rent",
        "estimated rent",
        "rent estimate",
        "how much rent",
    ],

    ScoutOperation.RENTAL_DEMAND: [
        "rental demand",
        "rent demand",
        "demand for rentals",
        "demand for properties",
        "property demand",
    ],

    ScoutOperation.PAYMENT_RISK: [
        "payment risk",
        "rent payment risk",
        "default risk",
        "late payment risk",
        "tenant risk",
    ],

    ScoutOperation.PREDICTIVE_MAINTENANCE: [
        "predict maintenance",
        "maintenance prediction",
        "maintenance needed",
        "maintenance needs",
        "predict repairs",
    ],

    ScoutOperation.PROFITABILITY: [
        "profitability",
        "property profit",
        "profit from property",
        "property returns",
        "rental profit",
        "return on property",
    ],
}


# ============================================================
# 7. SOURCE LOOKUP
# ============================================================

def get_source_for_operation(operation: ScoutOperation) -> ScoutSource:
    """
    Return the source associated with a Scout operation.
    """

    definition = OPERATION_DEFINITIONS.get(operation)

    if definition:
        return definition.source

    return ScoutSource.GENERAL


# ============================================================
# 8. INTENT DETECTION
# ============================================================

def detect_intent(message: str) -> ScoutIntent:
    """
    Detect the Scout operation from a user message.

    This is intentionally rule-based for Phase 1.
    Later we can add an LLM-based fallback without
    changing the ScoutOperation contract.
    """

    if not message or not message.strip():
        return ScoutIntent(
            operation=ScoutOperation.GENERAL,
            source=ScoutSource.GENERAL,
            parameters={},
            confidence=0.0,
        )

    text = message.lower().strip()

    # More specific intents are checked first.
    # Recommendation must come before generic property search.
    operation_priority = [
        ScoutOperation.PROPERTY_RECOMMENDATION,
        ScoutOperation.RENT_STATUS,
        ScoutOperation.PAYMENT_HISTORY,
        ScoutOperation.APPLICATION_STATUS,
        ScoutOperation.MAINTENANCE_REQUESTS,
        ScoutOperation.AGREEMENT_DETAILS,
        ScoutOperation.RENT_PREDICTION,
        ScoutOperation.RENTAL_DEMAND,
        ScoutOperation.PAYMENT_RISK,
        ScoutOperation.PREDICTIVE_MAINTENANCE,
        ScoutOperation.PROFITABILITY,
        ScoutOperation.PROPERTY_SEARCH,
    ]

    for operation in operation_priority:
        for keyword in KEYWORDS.get(operation, []):
            if keyword in text:
                return ScoutIntent(
                    operation=operation,
                    source=get_source_for_operation(operation),
                    parameters={},
                    confidence=0.90,
                )

    return ScoutIntent(
        operation=ScoutOperation.GENERAL,
        source=ScoutSource.GENERAL,
        parameters={},
        confidence=0.30,
    )