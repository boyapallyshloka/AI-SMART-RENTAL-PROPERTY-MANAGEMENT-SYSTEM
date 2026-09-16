from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from predict import predict_rent


app = FastAPI(
    title="Avenue360 M1 Rent Prediction API",
    description="AI service for rental price prediction",
    version="1.0.0"
)

MODEL_VERSION = "v1.0"


class PropertyInput(BaseModel):
    city: str
    area_locality: str
    area_type: str

    size_sqft: float = Field(gt=0)
    bedrooms_bhk: int = Field(gt=0)
    bathrooms: int = Field(gt=0)

    floor: int = Field(ge=0)
    total_floors: int = Field(gt=0)

    furnishing_status: str
    parking_available: bool

    property_age_years: int = Field(ge=0)

    amenity_count: int = Field(ge=0)
    amenity_parking: int = Field(ge=0)
    amenity_lift: int = Field(ge=0)
    amenity_gym: int = Field(ge=0)
    amenity_security: int = Field(ge=0)
    amenity_power_backup: int = Field(ge=0)
    amenity_air_conditioning: int = Field(ge=0)
    amenity_wifi: int = Field(ge=0)
    amenity_garden: int = Field(ge=0)

    latitude: float
    longitude: float

    property_type: str


class RentPredictionResponse(BaseModel):
    success: bool
    prediction: float
    modelVersion: str


class ErrorResponse(BaseModel):
    success: bool
    errorCode: str
    message: str

def error_response(status_code: int, error_code: str, message: str):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "errorCode": error_code,
            "message": message
        }
    )
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    first_error = exc.errors()[0]

    location = " -> ".join(str(item) for item in first_error["loc"])
    message = first_error["msg"]

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "errorCode": "INVALID_INPUT",
            "message": f"{location}: {message}"
        }
    )
@app.get("/")
def root():
    return {
        "message": "Avenue360 M1 Rent Prediction API is running",
        "model_version": MODEL_VERSION
    }


@app.post(
    "/predict-rent",
    response_model=RentPredictionResponse
)
def predict_rent_endpoint(property_data: PropertyInput):

    data = property_data.model_dump()

    if data["floor"] > data["total_floors"]:
        return error_response(
            400,
            "INVALID_INPUT",
            "floor cannot be greater than total_floors"
        )

    try:
        predicted_rent = predict_rent(data)

        return {
            "success": True,
            "prediction": predicted_rent,
            "modelVersion": MODEL_VERSION
        }

    except ValueError as exc:
        return error_response(
            400,
            "INVALID_INPUT",
            str(exc)
        )

    except Exception:
        return error_response(
            500,
            "PREDICTION_ERROR",
            "Unable to generate rent prediction"
        )