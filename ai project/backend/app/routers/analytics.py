from io import BytesIO
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import require_roles
from app.ml.preprocessing import DatasetValidationError, format_inspection_report, inspect_dataset, validate_dataset
from app.models.user import User, UserRole
from app.schemas.analytics import AgentAnalytics, LocationStats, ModelMetrics, SystemAnalytics
from app.services.analytics_service import (
    get_agent_analytics,
    get_location_stats,
    get_system_analytics,
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


@router.get("/model", response_model=list[ModelMetrics])
def model_metrics(_: User = Depends(require_roles(UserRole.ADMIN, UserRole.INVESTOR))):
    metrics = load_model_metrics()
    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics not found. Run ML training first.",
        )
    return metrics


@router.get("/locations", response_model=list[LocationStats])
def location_analytics(
    city: str | None = None,
    limit: int = 20,
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
async def upload_dataset(
    file: UploadFile = File(...),
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are accepted")

    contents = await file.read()
    if not contents.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded CSV file is empty")

    try:
        df = pd.read_csv(BytesIO(contents))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not parse CSV: {exc}",
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
    dest.write_bytes(contents)

    return {
        "message": "Dataset validated and uploaded. Run ML training and seed_db.py to refresh data.",
        "path": str(dest),
        "inspection": report.to_dict(),
        "inspection_text": format_inspection_report(report),
    }
