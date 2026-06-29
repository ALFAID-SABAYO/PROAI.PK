import json
from pathlib import Path

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.property import Property
from app.models.user import User, UserRole
from app.schemas.analytics import AgentAnalytics, CityComparison, LocationStats, ModelMetrics, SystemAnalytics

settings = get_settings()


def load_model_metrics() -> list[ModelMetrics]:
    metrics_path = Path(settings.ML_METRICS_PATH)
    if not metrics_path.exists():
        return []
    with open(metrics_path, encoding="utf-8") as f:
        data = json.load(f)
    return [ModelMetrics(**m) for m in data.get("models", [])]


def get_system_analytics(db: Session) -> SystemAnalytics:
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_properties = db.query(func.count(Property.id)).filter(Property.is_active.is_(True)).scalar() or 0
    total_agent_listings = (
        db.query(func.count(Property.id)).filter(Property.agent_id.isnot(None)).scalar() or 0
    )

    city_rows = (
        db.query(
            Property.city,
            func.count(Property.id),
            func.avg(Property.price),
            func.percentile_cont(0.5).within_group(Property.price),
        )
        .filter(Property.is_active.is_(True))
        .group_by(Property.city)
        .all()
    )

    properties_by_city = [
        CityComparison(
            city=row[0],
            property_count=row[1],
            avg_price=float(row[2] or 0),
            median_price=float(row[3] or 0),
        )
        for row in city_rows
    ]

    return SystemAnalytics(
        total_users=total_users,
        total_properties=total_properties,
        total_listings_by_agents=total_agent_listings,
        properties_by_city=properties_by_city,
        model_metrics=load_model_metrics(),
    )


def get_location_stats(db: Session, city: str | None = None, limit: int = 20) -> list[LocationStats]:
    query = (
        db.query(
            Property.location,
            Property.city,
            func.count(Property.id),
            func.avg(Property.price),
            func.percentile_cont(0.5).within_group(Property.price),
            func.min(Property.price),
            func.max(Property.price),
            func.stddev_pop(Property.price),
        )
        .filter(Property.is_active.is_(True))
        .group_by(Property.location, Property.city)
    )
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))

    rows = query.order_by(func.count(Property.id).desc()).limit(limit).all()
    results = []
    for row in rows:
        stddev = float(row[7] or 0)
        avg_price = float(row[3] or 1)
        volatility = (stddev / avg_price) if avg_price > 0 else 0
        risk_score = min(100.0, volatility * 100)
        results.append(
            LocationStats(
                location=row[0],
                city=row[1],
                count=row[2],
                avg_price=avg_price,
                median_price=float(row[4] or 0),
                min_price=float(row[5] or 0),
                max_price=float(row[6] or 0),
                avg_risk_score=round(risk_score, 2),
            )
        )
    return results


def get_agent_analytics(db: Session, agent_id: int) -> AgentAnalytics:
    listings = db.query(Property).filter(Property.agent_id == agent_id).all()
    active = [p for p in listings if p.is_active]
    avg_price = sum(p.price for p in active) / len(active) if active else 0.0
    return AgentAnalytics(
        total_listings=len(listings),
        active_listings=len(active),
        avg_listed_price=avg_price,
    )
