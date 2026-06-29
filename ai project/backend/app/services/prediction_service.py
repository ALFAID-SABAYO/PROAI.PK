from app.ml.inference import compute_risk_score, predict_price
from app.schemas.prediction import PredictionRequest, PredictionResponse


def run_prediction(data: PredictionRequest, listed_price: float | None = None) -> PredictionResponse:
    features = {
        "property_type": data.property_type,
        "location": data.location,
        "city": data.city,
        "baths": data.baths,
        "bedrooms": data.bedrooms,
        "area_type": data.area_type,
        "area_size": data.area_size,
        "area_category": data.area_category or "",
        "purpose": data.purpose,
    }
    predicted = predict_price(features)
    risk_score, risk_level = compute_risk_score(data.city, data.location)

    price_diff = None
    price_diff_pct = None
    if listed_price is not None and listed_price > 0:
        price_diff = predicted - listed_price
        price_diff_pct = (price_diff / listed_price) * 100

    return PredictionResponse(
        predicted_price=round(predicted, 2),
        risk_score=risk_score,
        risk_level=risk_level,
        listed_price=listed_price,
        price_difference=round(price_diff, 2) if price_diff is not None else None,
        price_difference_pct=round(price_diff_pct, 2) if price_diff_pct is not None else None,
    )
