import traceback
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.rate_limit import limiter
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction_service import run_prediction
from app.services import property_service as prop_svc

router = APIRouter(prefix="/predictions", tags=["predictions"])


def _handle_prediction_errors(payload: PredictionRequest, listed_price: float | None = None):
    try:
        return run_prediction(payload, listed_price=listed_price)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction service is temporarily unavailable",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        print("=== PREDICTION ERROR TRACEBACK ===")
        print(traceback.format_exc())
        print("===================================")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DEBUG: {type(exc).__name__}: {str(exc)}",
        ) from exc


@router.post("", response_model=PredictionResponse)
@limiter.limit("30/minute")
def predict_price(
    request: Request,
    payload: PredictionRequest,
    _: User = Depends(get_current_user),
):
    if payload.city.lower() not in ("karachi", "islamabad"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Predictions are only available for Karachi and Islamabad",
        )
    return _handle_prediction_errors(payload)


@router.get("/property/{property_id}", response_model=PredictionResponse)
@limiter.limit("30/minute")
def predict_for_property(
    request: Request,
    property_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    prop = prop_svc.get_property(db, property_id)
    if not prop or not prop.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    request_payload = PredictionRequest(
        property_type=prop.property_type,
        location=prop.location,
        city=prop.city,
        baths=prop.baths or 0,
        bedrooms=prop.bedrooms or 0,
        area_type=prop.area_type or "Marla",
        area_size=prop.area_size or 5.0,
        area_category=prop.area_category,
        purpose=prop.purpose or "For Sale",
    )
    return _handle_prediction_errors(request_payload, listed_price=prop.price)