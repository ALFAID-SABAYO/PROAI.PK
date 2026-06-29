from pathlib import Path

import joblib
import pandas as pd

from app.config import get_settings

settings = get_settings()
_model = None
_location_volatility: pd.DataFrame | None = None


def _load_model():
    global _model
    if _model is None:
        path = Path(settings.ML_MODEL_PATH)
        if not path.exists():
            raise FileNotFoundError(
                f"Trained model not found at {path}. Run: python -m app.ml.train"
            )
        _model = joblib.load(path)
    return _model


def _load_volatility():
    global _location_volatility
    if _location_volatility is None:
        vol_path = Path(settings.ML_MODEL_PATH).parent / "location_volatility.csv"
        if vol_path.exists():
            _location_volatility = pd.read_csv(vol_path)
        else:
            _location_volatility = pd.DataFrame(columns=["city", "location", "volatility"])
    return _location_volatility


def predict_price(features: dict) -> float:
    model = _load_model()
    df = pd.DataFrame([features])
    prediction = model.predict(df)[0]
    return float(max(0, prediction))


def compute_risk_score(city: str, location: str) -> tuple[float, str]:
    vol_df = _load_volatility()
    if vol_df.empty:
        return 50.0, "medium"

    match = vol_df[
        (vol_df["city"].str.lower() == city.lower())
        & (vol_df["location"].str.lower() == location.lower())
    ]
    if match.empty:
        city_match = vol_df[vol_df["city"].str.lower() == city.lower()]
        volatility = float(city_match["volatility"].mean()) if not city_match.empty else 0.3
    else:
        volatility = float(match.iloc[0]["volatility"])

    risk_score = min(100.0, max(0.0, volatility * 100))
    if risk_score < 33:
        level = "low"
    elif risk_score < 66:
        level = "medium"
    else:
        level = "high"
    return round(risk_score, 2), level
