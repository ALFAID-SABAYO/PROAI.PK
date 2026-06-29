from io import BytesIO
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import require_roles
from app.ml.preprocessing import DatasetValidationError, format_inspection_report, inspect_dataset, validate_dataset
from app.models.user import User, UserRole
from app.rate_limit import limiter
from app.schemas.analytics import AgentAnalytics, LocationStats, ModelMetricsResponse, SystemAnalytics
from app.services.analytics_service import (
    get_agent_analytics,
    get_location_stats,
    get_system_analytics,
    load_metrics_payload,
    load_model_metrics,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])
settings = get_settings()


@router.get("/system", response_model=SystemAnalytics)
def system_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    return get_system_analytics(db)


@router.get("/model", response_model=ModelMetricsResponse)
def model_metrics(_: User = Depends(require_roles(UserRole.ADMIN, UserRole.INVESTOR))):
    payload = load_metrics_payload()
    metrics = load_model_metrics()
    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics not found. Run ML training first.",
        )
    return ModelMetricsResponse(
        best_model=payload.get("best_model"),
        training_rows=payload.get("training_rows"),
        models=metrics,
    )


@router.get("/locations", response_model=list[LocationStats])
def location_analytics(
    city: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.INVESTOR)),
):
    return get_location_stats(db, city=city, limit=limit)


@router.get("/agent", response_model=AgentAnalytics)
def agent_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT)),
):
    return get_agent_analytics(db, current_user.id)


@router.post("/dataset/upload", status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def upload_dataset(
    request: Request,
    file: UploadFile = File(...),
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are accepted")

    contents = await file.read()
    if len(contents) > settings.MAX_CSV_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="CSV file exceeds maximum allowed size",
        )
    if not contents.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded CSV file is empty")

    try:
        df = pd.read_csv(BytesIO(contents))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not parse CSV. Ensure the file is valid UTF-8 CSV.",
        ) from exc

    try:
        report = validate_dataset(df, path=file.filename)
    except DatasetValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": str(exc),
                "inspection": exc.report or inspect_dataset(df, path=file.filename).to_dict(),
            },
        ) from exc

    dest = Path(settings.DATASET_PATH)
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        dest.write_bytes(contents)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save dataset. If using Docker, ensure the dataset volume is writable.",
        ) from exc

    return {
        "message": "Dataset validated and uploaded. Run ML training and seed_db.py to refresh data.",
        "inspection": report.to_dict(),
        "inspection_text": format_inspection_report(report),
    }
