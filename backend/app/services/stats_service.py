from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.property import Property
from app.schemas.stats import AreaOption, AreaPriceStats, BedroomPriceStat, CityAreaBreakdown, CityPropertyCount, PlatformStats
from app.security import escape_ilike


def _active_properties(db: Session):
    return db.query(Property).filter(Property.is_active.is_(True))


def list_areas(db: Session, city: str | None = None, limit: int = 500) -> list[AreaOption]:
    """Distinct area options from properties.location (+ city for disambiguation)."""
    query = (
        db.query(
            Property.location,
            Property.city,
            func.count(Property.id).label("cnt"),
        )
        .filter(Property.is_active.is_(True))
        .group_by(Property.location, Property.city)
        .order_by(func.count(Property.id).desc())
    )
    if city:
        query = query.filter(Property.city.ilike(f"%{escape_ilike(city.strip())}%", escape="\\"))

    rows = query.limit(limit).all()
    return [
        AreaOption(location=row[0], city=row[1], listing_count=row[2])
        for row in rows
    ]


def get_area_price_stats(db: Session, location: str, city: str) -> AreaPriceStats | None:
    """Aggregate price stats for one area (location + city)."""
    base = _active_properties(db).filter(
        Property.location == location.strip(),
        Property.city.ilike(city.strip()),
    )

    agg = base.with_entities(
        func.count(Property.id),
        func.min(Property.price),
        func.max(Property.price),
        func.avg(Property.price),
    ).one()

    count, min_p, max_p, avg_p = agg
    if not count or min_p is None:
        return None

    bedroom_rows = (
        base.with_entities(
            Property.bedrooms,
            func.count(Property.id),
            func.avg(Property.price),
            func.min(Property.price),
            func.max(Property.price),
        )
        .group_by(Property.bedrooms)
        .order_by(Property.bedrooms)
        .all()
    )

    bedroom_breakdown = [
        BedroomPriceStat(
            bedrooms=int(row[0] or 0),
            listing_count=row[1],
            avg_price=float(row[2] or 0),
            min_price=float(row[3] or 0),
            max_price=float(row[4] or 0),
        )
        for row in bedroom_rows
    ]

    return AreaPriceStats(
        location=location,
        city=city,
        listing_count=count,
        min_price=float(min_p),
        max_price=float(max_p),
        avg_price=float(avg_p),
        bedroom_breakdown=bedroom_breakdown,
    )


def get_city_property_counts(db: Session) -> list[CityPropertyCount]:
    rows = (
        _active_properties(db)
        .with_entities(Property.city, func.count(Property.id))
        .group_by(Property.city)
        .order_by(func.count(Property.id).desc())
        .all()
    )
    return [CityPropertyCount(city=row[0], property_count=row[1]) for row in rows]


def get_city_area_breakdown(db: Session, city: str, limit: int = 20) -> list[CityAreaBreakdown]:
    rows = (
        _active_properties(db)
        .filter(Property.city.ilike(escape_ilike(city.strip()), escape="\\"))
        .with_entities(
            Property.location,
            func.count(Property.id),
            func.avg(Property.price),
        )
        .group_by(Property.location)
        .order_by(func.count(Property.id).desc())
        .limit(limit)
        .all()
    )
    return [
        CityAreaBreakdown(
            location=row[0],
            listing_count=row[1],
            avg_price=float(row[2] or 0),
        )
        for row in rows
    ]


def list_property_types(db: Session) -> list[str]:
    rows = (
        _active_properties(db)
        .with_entities(Property.property_type)
        .distinct()
        .order_by(Property.property_type)
        .all()
    )
    return [row[0] for row in rows if row[0]]


def list_area_types(db: Session) -> list[str]:
    rows = (
        _active_properties(db)
        .with_entities(Property.area_type)
        .filter(Property.area_type.isnot(None))
        .distinct()
        .order_by(Property.area_type)
        .all()
    )
    return [row[0] for row in rows if row[0]]


def list_area_categories(db: Session, area_type: str | None = None) -> list[str]:
    query = (
        _active_properties(db)
        .with_entities(Property.area_category)
        .filter(Property.area_category.isnot(None), Property.area_category != "")
    )
    if area_type:
        query = query.filter(Property.area_type.ilike(escape_ilike(area_type.strip()), escape="\\"))
    rows = query.distinct().order_by(Property.area_category).all()
    return [row[0] for row in rows if row[0]]


def list_area_sizes(db: Session, area_type: str | None = None, limit: int = 40) -> list[float]:
    query = (
        _active_properties(db)
        .with_entities(Property.area_size)
        .filter(Property.area_size.isnot(None), Property.area_size > 0)
    )
    if area_type:
        query = query.filter(Property.area_type.ilike(escape_ilike(area_type.strip()), escape="\\"))
    rows = (
        query.distinct()
        .order_by(Property.area_size)
        .limit(limit)
        .all()
    )
    return sorted({float(row[0]) for row in rows if row[0] is not None})


def get_platform_stats(db: Session) -> PlatformStats:
    """Public-facing aggregates for landing page — no hardcoded marketing numbers."""
    from app.services.analytics_service import get_deployed_model_metrics, load_metrics_payload

    cities = get_city_property_counts(db)
    property_types = list_property_types(db)
    total_listings = sum(c.property_count for c in cities)

    avg_price_row = (
        _active_properties(db)
        .with_entities(func.avg(Property.price))
        .scalar()
    )

    payload = load_metrics_payload()
    deployed = get_deployed_model_metrics()

    return PlatformStats(
        total_listings=total_listings,
        total_cities=len(cities),
        total_property_types=len(property_types),
        cities=cities,
        property_types=property_types,
        best_model_name=deployed.model_name if deployed else None,
        best_model_r2=deployed.r2 if deployed else None,
        training_rows=payload.get("training_rows"),
        avg_listing_price=float(avg_price_row or 0),
    )
