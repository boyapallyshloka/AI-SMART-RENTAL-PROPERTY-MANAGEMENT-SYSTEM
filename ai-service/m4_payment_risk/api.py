"""
M4 Payment Risk API

FastAPI service for tenant payment-risk prediction.
"""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .inference import predict_payment_risk


# ============================================================
# FASTAPI ROUTER
# ============================================================

router = APIRouter(
    prefix="/m4",
    tags=["M4"],
)


# ============================================================
# STANDARD VALIDATION ERROR HANDLER
# ============================================================

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

class PaymentRiskRequest(BaseModel):
    """Request schema for M4 payment-risk prediction."""

    monthly_income: float = Field(..., ge=0)
    historical_invoice_count: float = Field(..., ge=0)
    late_payment_count: float = Field(..., ge=0)
    missed_payment_count: int = Field(..., ge=0)
    avg_days_late: float = Field(..., ge=0)
    max_days_late: int = Field(..., ge=0)
    historical_outstanding: float = Field(..., ge=0)
    rent_to_income_ratio: float = Field(..., ge=0)
    payment_completion_ratio: float = Field(..., ge=0, le=1)

    recent_late_payment_count_3m: float = Field(..., ge=0)
    recent_missed_payment_count_3m: float = Field(..., ge=0)
    recent_avg_days_late_3m: float = Field(..., ge=0)
    recent_payment_completion_ratio_3m: float = Field(
        ...,
        ge=0,
        le=1
    )

    recent_late_payment_count_6m: float = Field(..., ge=0)
    recent_missed_payment_count_6m: float = Field(..., ge=0)
    recent_avg_days_late_6m: float = Field(..., ge=0)
    recent_payment_completion_ratio_6m: float = Field(
        ...,
        ge=0,
        le=1
    )

    late_payment_trend: float
    missed_payment_trend: float
    payment_completion_trend: float


# ============================================================
# RESPONSE SCHEMA
# ============================================================

class PaymentRiskResponse(BaseModel):
    """Response schema for M4 prediction."""

    success: bool
    module: str
    risk_label: int
    risk_probability: float | None
    risk_status: str
    model: str
    model_version: str


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/health")
def health() -> Dict[str, Any]:

    return {
        "success": True,
        "module": "M4_PAYMENT_RISK",
        "status": "UP",
    }


# ============================================================
# PREDICT PAYMENT RISK
# ============================================================

@router.post(
    "/predict-payment-risk",
    response_model=PaymentRiskResponse,
)
def predict_payment_risk_endpoint(
    request: PaymentRiskRequest,
) -> PaymentRiskResponse:

    try:

        result = predict_payment_risk(
            request.model_dump()
        )

        return PaymentRiskResponse(
            success=True,
            module="M4_PAYMENT_RISK",
            **result,
        )

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