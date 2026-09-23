from fastapi import APIRouter, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .recommend import recommend_properties
from .database import (
    load_live_m2_data,
    check_database_connection,
)


router = APIRouter(
    prefix="/m2",
    tags=["Property Recommendation"]
)

MODEL_VERSION = "v1.0"


# ============================================================
# Request Models
# ============================================================

class RecommendationRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    tenant_id: str = Field(..., min_length=1)
    top_n: int = Field(..., gt=0)

    @property
    def tenantId(self) -> str:
        return self.tenant_id

    @property
    def topN(self) -> int:
        return self.top_n


# ============================================================
# Response Models
# ============================================================

class AvailableUnit(BaseModel):
    unitId: str
    monthlyRent: float
    bedrooms: int


class RecommendationItem(BaseModel):
    propertyId: str
    recommendationScore: float
    availableUnits: list[AvailableUnit]
    propertyCity: str
    cityMatch: int
    budgetMatch: int
    bedroomMatch: int
    propertyTypeMatch: int
    furnishingMatch: int
    parkingMatch: int
    amenityMatch: int
    distanceMatch: int
    approxDistanceKm: float


class RecommendationResponse(BaseModel):
    success: bool
    tenantId: str
    recommendations: list[RecommendationItem]
    count: int
    modelVersion: str


# ============================================================
# Error Response
# ============================================================

def error_response(
    status_code: int,
    error_code: str,
    message: str
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "errorCode": error_code,
            "message": message
        }
    )


# ============================================================
# Validation Error Handler
# ============================================================

async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    first_error = exc.errors()[0]

    location = " -> ".join(
        str(item)
        for item in first_error["loc"]
    )

    message = first_error["msg"]

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "errorCode": "INVALID_INPUT",
            "message": f"{location}: {message}"
        }
    )


# ============================================================
# Root / Health Endpoints
# ============================================================

@router.get("/health")
def health():
    return {
        "status": "healthy",
        "module": "M2_PROPERTY_RECOMMENDATION",
        "service": "m2-property-recommendation"
    }
@router.get("/db-health")
def db_health():
    try:
        return {
            "status": "healthy",
            "database": check_database_connection(),
        }
    except Exception:
        return {
            "status": "unhealthy",
            "database": None,
        }

@router.get("/")
def root():
    return {
        "message": "Avenue360 M2 Property Recommendation API is running",
        "model_version": MODEL_VERSION
    }


# ============================================================
# Recommendation Endpoint
# ============================================================

@router.post(
    "/recommend-properties",
    response_model=RecommendationResponse
)
def recommend_properties_endpoint(
    request: RecommendationRequest
):
    try:
        tenant_id = request.tenantId.strip()

        # ----------------------------------------------------
        # Load M2 datasets
        # ----------------------------------------------------

        # ----------------------------------------------------
        # Load LIVE M2 data from Neon
        # ----------------------------------------------------
        live_df, properties, property_amenities, preferences = (
            load_live_m2_data(int(tenant_id))
)

        # ----------------------------------------------------
        # Run recommendation pipeline
        # ----------------------------------------------------

        recommendations_df = recommend_properties(
            live_df,
            properties,
            property_amenities,
            preferences,
            request.topN
        )

        # ----------------------------------------------------
        # Convert recommendations to API response
        # ----------------------------------------------------

        recommendations = []
        for property_id, property_df in recommendations_df.groupby(
            "property_id",
            sort=False
        ):
            first_row = property_df.iloc[0]

            available_units = []

            for _, unit_row in property_df.iterrows():
                available_units.append(
                    {
                        "unitId": str(unit_row["unit_id"]),
                        "monthlyRent": float(
                            unit_row["monthly_rent"]
                        ),
                        "bedrooms": int(
                            unit_row["property_bedrooms"]
                        ),
                    }
                )

            recommendations.append(
        {
            "propertyId": str(property_id),

            # Because recommendations_df is already ranked,
            # the first row represents the best-scoring unit
            # for this property.
            "recommendationScore": float(
                first_row["recommendation_score"]
            ),

            "availableUnits": available_units,

            "propertyCity": str(
                first_row["property_city"]
            ),

            "cityMatch": int(
                first_row["city_match"]
            ),

            "budgetMatch": int(
                first_row["budget_match"]
            ),

            "bedroomMatch": int(
                first_row["bedroom_match"]
            ),

            "propertyTypeMatch": int(
                first_row["property_type_match"]
            ),

            "furnishingMatch": int(
                first_row["furnishing_match"]
            ),

            "parkingMatch": int(
                first_row["parking_match"]
            ),

            "amenityMatch": int(
                first_row["amenity_match"]
            ),

            "distanceMatch": int(
                first_row["distance_match"]
            ),

            "approxDistanceKm": float(
                first_row["approx_distance_km"]
            ),
        }
    )

        # ----------------------------------------------------
        # Return successful response
        # ----------------------------------------------------

        return {
            "success": True,
            "tenantId": tenant_id,
            "recommendations": recommendations,
            "count": len(recommendations),
            "modelVersion": MODEL_VERSION
        }

    except ValueError as exc:

        return error_response(
            400,
            "INVALID_INPUT",
            str(exc)
        )

    except FileNotFoundError:

        return error_response(
            500,
            "MODEL_NOT_FOUND",
            "Required M2 data files were not found"
        )

    except Exception:

        return error_response(
            500,
            "PREDICTION_ERROR",
            "Unable to generate property recommendations"
        )