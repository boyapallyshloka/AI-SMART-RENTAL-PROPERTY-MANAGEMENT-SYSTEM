from fastapi import APIRouter, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .recommend import (
    load_data,
    load_tenant_preferences,
    load_properties,
    load_property_amenities,
    get_tenant_preferences,
    recommend_properties,
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

class RecommendationItem(BaseModel):
    propertyId: str
    recommendationScore: float
    monthlyRent: float
    propertyBedrooms: int
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

        df = load_data()

        tenant_preferences_df = load_tenant_preferences()

        properties = load_properties()

        property_amenities = load_property_amenities()

        # ----------------------------------------------------
        # Get tenant preferences
        # ----------------------------------------------------

        preferences = get_tenant_preferences(
            tenant_preferences_df,
            tenant_id
        )

        # ----------------------------------------------------
        # Run recommendation pipeline
        # ----------------------------------------------------

        recommendations_df = recommend_properties(
            df,
            properties,
            property_amenities,
            preferences,
            request.topN
        )

        # ----------------------------------------------------
        # Convert recommendations to API response
        # ----------------------------------------------------

        recommendations = []

        for _, row in recommendations_df.iterrows():

            recommendations.append(
                {
                    "propertyId": str(row["property_id"]),
                    "recommendationScore": float(
                        row["recommendation_score"]
                    ),
                    "monthlyRent": float(
                        row["monthly_rent"]
                    ),
                    "propertyBedrooms": int(
                        row["property_bedrooms"]
                    ),
                    "propertyCity": str(
                        row["property_city"]
                    ),
                    "cityMatch": int(
                        row["city_match"]
                    ),
                    "budgetMatch": int(
                        row["budget_match"]
                    ),
                    "bedroomMatch": int(
                        row["bedroom_match"]
                    ),
                    "propertyTypeMatch": int(
                        row["property_type_match"]
                    ),
                    "furnishingMatch": int(
                        row["furnishing_match"]
                    ),
                    "parkingMatch": int(
                        row["parking_match"]
                    ),
                    "amenityMatch": int(
                        row["amenity_match"]
                    ),
                    "distanceMatch": int(
                        row["distance_match"]
                    ),
                    "approxDistanceKm": float(
                        row["approx_distance_km"]
                    )
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