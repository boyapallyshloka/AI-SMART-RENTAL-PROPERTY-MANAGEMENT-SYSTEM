"""
M6 Property Profitability Prediction API

FastAPI router for property profitability prediction.

The central ai-service/main.py owns the FastAPI application.
This module exposes only an APIRouter.
"""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from .inference import predict


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(
    prefix="/m6",
    tags=["M6"],
)


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class ProfitabilityPredictionRequest(BaseModel):
    """
    Request schema for M6 property profitability prediction.

    The fields below correspond exactly to the 26 features selected
    during M6 model training.
    """

    model_config = ConfigDict(extra="forbid")

    city: str = Field(..., min_length=1)

    size_sqft: float = Field(..., ge=0)
    bedrooms_bhk: float = Field(..., ge=0)
    property_age_years: float = Field(..., ge=0)

    monthly_rent: float = Field(..., ge=0)
    collected_rent: float = Field(..., ge=0)
    expense_amount: float = Field(..., ge=0)
    current_month_profit: float

    occupancy_rate: float = Field(..., ge=0, le=1)
    estimated_vacancy_loss: float = Field(..., ge=0)
    revenue_after_estimated_vacancy_loss: float

    collected_rent_3m_avg: float = Field(..., ge=0)
    expense_amount_3m_avg: float = Field(..., ge=0)
    current_month_profit_3m_avg: float

    occupancy_rate_3m_avg: float = Field(..., ge=0, le=1)
    estimated_vacancy_loss_3m_avg: float = Field(..., ge=0)

    collected_rent_6m_avg: float = Field(..., ge=0)
    expense_amount_6m_avg: float = Field(..., ge=0)
    current_month_profit_6m_avg: float

    occupancy_rate_6m_avg: float = Field(..., ge=0, le=1)
    estimated_vacancy_loss_6m_avg: float = Field(..., ge=0)

    collected_rent_trend: float = Field(..., ge=-1, le=1)
    expense_amount_trend: float = Field(..., ge=-1, le=1)
    current_month_profit_trend: float = Field(..., ge=-1, le=1)
    occupancy_rate_trend: float = Field(..., ge=-1, le=1)
    estimated_vacancy_loss_trend: float = Field(..., ge=-1, le=1)


# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------

class ProfitabilityPredictionResponse(BaseModel):
    """
    Successful M6 prediction response.
    """

    success: bool
    predicted_next_month_profit: float
    profitability_label: int
    profitability_probability: float | None


# ---------------------------------------------------------------------------
# Error response schema
# ---------------------------------------------------------------------------

class ErrorResponse(BaseModel):
    """
    Avenue360 standard error response.
    """

    success: bool = False
    errorCode: str
    message: str


# ---------------------------------------------------------------------------
# Prediction endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/predict",
    response_model=ProfitabilityPredictionResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def predict_profitability(
    request: ProfitabilityPredictionRequest,
) -> ProfitabilityPredictionResponse:
    """
    Predict next-month property profitability.

    Returns:
        - predicted_next_month_profit
        - profitability_label
        - profitability_probability
    """

    try:
        # Convert validated Pydantic request into a dictionary.
        input_data: Dict[str, Any] = request.model_dump()

        # Call the M6 inference layer.
        result = predict(input_data)

        return ProfitabilityPredictionResponse(
            success=True,
            predicted_next_month_profit=result[
                "predicted_next_month_profit"
            ],
            profitability_label=result[
                "profitability_label"
            ],
            profitability_probability=result[
                "profitability_probability"
            ],
        )

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "errorCode": "MODEL_NOT_FOUND",
                "message": "M6 model artifacts could not be found.",
            },
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "errorCode": "INVALID_INPUT",
                "message": str(exc),
            },
        )

    except RuntimeError:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "errorCode": "PREDICTION_ERROR",
                "message": "M6 prediction could not be completed.",
            },
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "errorCode": "INTERNAL_ERROR",
                "message": "An internal error occurred while processing the prediction.",
            },
        )