import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor

from app.config import get_settings
from app.ml.preprocessing import (
    build_feature_frame,
    clean_dataset,
    format_inspection_report,
    inspect_dataset,
    load_and_validate_dataset,
    load_raw_dataset,
    validate_dataset,
)

settings = get_settings()
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"


def _build_preprocessor() -> ColumnTransformer:
    categorical = ["property_type", "location", "city", "area_type", "area_category", "purpose"]
    numeric = ["baths", "bedrooms", "area_size"]
    return ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
            ("num", "passthrough", numeric),
        ]
    )


def train_and_save(dataset_path: str | None = None) -> dict:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    path = dataset_path or settings.DATASET_PATH
    raw = load_raw_dataset(path)
    report = validate_dataset(raw, path=path)
    print(format_inspection_report(report))

    cleaned = clean_dataset(raw, validate=False)
    X, y = build_feature_frame(cleaned)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    models = {
        "linear_regression": LinearRegression(),
        "random_forest": RandomForestRegressor(
            n_estimators=100, max_depth=20, random_state=42, n_jobs=-1
        ),
        "xgboost": XGBRegressor(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1,
        ),
    }

    metrics_list = []
    best_name = None
    best_r2 = -np.inf
    best_pipeline = None

    for name, estimator in models.items():
        pipeline = Pipeline([("prep", _build_preprocessor()), ("model", estimator)])
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        r2 = float(r2_score(y_test, preds))
        mae = float(mean_absolute_error(y_test, preds))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        metrics_list.append({"model_name": name, "r2": r2, "mae": mae, "rmse": rmse})
        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            best_pipeline = pipeline

    model_path = ARTIFACTS_DIR / "model.joblib"
    joblib.dump(best_pipeline, model_path)

    location_stats = (
        cleaned.groupby(["city", "location"])["price_numeric"]
        .agg(["mean", "std", "count"])
        .reset_index()
    )
    location_stats["volatility"] = location_stats["std"] / location_stats["mean"].replace(0, np.nan)
    location_stats["volatility"] = location_stats["volatility"].fillna(0)
    location_stats.to_csv(ARTIFACTS_DIR / "location_volatility.csv", index=False)

    metrics_payload = {
        "best_model": best_name,
        "models": metrics_list,
        "training_rows": len(cleaned),
        "test_rows": len(X_test),
        "inspection": report.to_dict(),
    }
    with open(ARTIFACTS_DIR / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    return metrics_payload


if __name__ == "__main__":
    result = train_and_save()
    print(json.dumps(result, indent=2))
