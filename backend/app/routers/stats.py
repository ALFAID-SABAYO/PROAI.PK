from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.rate_limit import limiter
from app.schemas.stats import (
    AreaOption,
    AreaPriceStats,
    CityAreaBreakdown,
    CityPropertyCount,
    PlatformStats,
)
from app.services import stats_service as svc

router = APIRouter(prefix="/stats", tags=["stats"])


_FORM_ROLES = (UserRole.INVESTOR, UserRole.AGENT, UserRole.ADMIN)


@router.get("/platform", response_model=PlatformStats)
@limiter.limit("60/minute")
def platform_stats(request: Request, db: Session = Depends(get_db)):
    """Public platform aggregates for landing page — no authentication required."""
    return svc.get_platform_stats(db)


@router.get("/areas", response_model=list[AreaOption])
def list_areas(
    city: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=500, ge=1, le=1000),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*_FORM_ROLES)),
):
    """Distinct areas (properties.location) for Browse by Area dropdown."""
    return svc.list_areas(db, city=city, limit=limit)


@router.get("/areas/prices", response_model=AreaPriceStats)
def area_price_stats(
    location: str = Query(..., min_length=1, max_length=255, description="Area name (properties.location)"),
    city: str = Query(..., min_length=1, max_length=100, description="City (properties.city)"),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.INVESTOR, UserRole.ADMIN)),
):
    """Min/max/avg price and bedroom breakdown for one area — statistics only, no ML."""
    stats = svc.get_area_price_stats(db, location=location, city=city)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No listings found for area '{location}' in {city}",
        )
    return stats


@router.get("/cities", response_model=list[CityPropertyCount])
def city_property_counts(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.INVESTOR, UserRole.ADMIN)),
):
    """Total active properties per city (Section 3 top-level chart)."""
    return svc.get_city_property_counts(db)


@router.get("/cities/{city}/areas", response_model=list[CityAreaBreakdown])
def city_area_breakdown(
    city: str = Path(..., min_length=1, max_length=100),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.INVESTOR, UserRole.ADMIN)),
):
    """Listings count and avg price per area within a city (Section 3 drill-down)."""
    data = svc.get_city_area_breakdown(db, city=city, limit=limit)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No area data found for city '{city}'",
        )
    return data


@router.get("/property-types", response_model=list[str])
def property_types(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*_FORM_ROLES)),
):
    return svc.list_property_types(db)


@router.get("/area-types", response_model=list[str])
def area_types(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*_FORM_ROLES)),
):
    """Size units used in dataset (e.g. Marla, Kanal)."""
    return svc.list_area_types(db)


@router.get("/area-categories", response_model=list[str])
def area_categories(
    area_type: str | None = Query(default=None, max_length=50),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*_FORM_ROLES)),
):
    """Area category bands (e.g. 5-10 Marla), optionally filtered by Marla/Kanal."""
    return svc.list_area_categories(db, area_type=area_type)


@router.get("/area-sizes", response_model=list[float])
def area_sizes(
    area_type: str | None = Query(default=None, max_length=50),
    limit: int = Query(default=40, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*_FORM_ROLES)),
):
    """Common area sizes from listings, optionally filtered by Marla/Kanal."""
    return svc.list_area_sizes(db, area_type=area_type, limit=limit)
