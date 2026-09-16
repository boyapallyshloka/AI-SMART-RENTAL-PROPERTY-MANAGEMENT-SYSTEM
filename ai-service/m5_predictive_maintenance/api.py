from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from inference import predict_maintenance


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="M5 Predictive Maintenance API",
    description=(
        "AI/ML service for predictive maintenance in the "
        "Smart Rental System"
    ),
    version="1.0.0"
)


# ============================================================
# STANDARD VALIDATION ERROR HANDLER
# ============================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    errors = []

    for error in exc.errors():
        location = ".".join(
            str(item) for item in error["loc"]
        )

        errors.append(
            f"{location}: {error['msg']}"
        )

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "errorCode": "INVALID_INPUT",
            "message": "; ".join(errors)
        }
    )


# ============================================================
# REQUEST SCHEMA
# ============================================================

class MaintenancePredictionRequest(BaseModel):

    property_age_years: float = Field(ge=0)
    size_sqft: float = Field(gt=0)
    bedrooms_bhk: float = Field(ge=0)
    amenity_count: float = Field(ge=0)

    historical_maintenance_count: float = Field(ge=0)
    maintenance_count_last_90d: float = Field(ge=0)

    historical_maintenance_cost: float = Field(ge=0)
    historical_avg_cost: float = Field(ge=0)

    days_since_last_maintenance: float = Field(ge=0)

    dominant_issue_category: str

    inspection_count: float = Field(ge=0)
    needs_attention_count: float = Field(ge=0)

    equipment_count: float = Field(ge=0)
    avg_equipment_age_years: float = Field(ge=0)
    critical_equipment_count: float = Field(ge=0)

    snapshot_month: str


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "m5-predictive-maintenance"
    }


# ============================================================
# PREDICT MAINTENANCE
# ============================================================

@app.post("/predict-maintenance")
def predict(request: MaintenancePredictionRequest):

    try:

        result = predict_maintenance(
            request.model_dump()
        )

        return result

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "errorCode": "INVALID_INPUT",
                "message": str(e)
            }
        )

    except FileNotFoundError as e:

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "errorCode": "MODEL_NOT_FOUND",
                "message": str(e)
            }
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "errorCode": "PREDICTION_ERROR",
                "message": str(e)
            }
        )