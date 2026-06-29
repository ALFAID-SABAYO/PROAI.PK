from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.stats import AreaOption, AreaPriceStats, CityAreaBreakdown, CityPropertyCount
from app.services import stats_service as svc

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/areas", response_model=list[AreaOption])
def list_areas(
    city: str | None = None,
    limit: int = Query(default=500, ge=1, le=1000),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.INVESTOR, UserRole.ADMIN)),
):
    """Distinct areas (properties.location) for Browse by Area dropdown."""
    return svc.list_areas(db, city=city, limit=limit)


@router.get("/areas/prices", response_model=AreaPriceStats)
def area_price_stats(
    location: str = Query(..., min_length=1, description="Area name (properties.location)"),
    city: str = Query(..., min_length=1, description="City (properties.city)"),
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
    city: str,
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
    _: User = Depends(require_roles(UserRole.INVESTOR, UserRole.ADMIN)),
):
    return svc.list_property_types(db)


@router.get("/area-types", response_model=list[str])
def area_types(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.INVESTOR, UserRole.ADMIN)),
):
    """Size units used in dataset (e.g. Marla, Kanal)."""
    return svc.list_area_types(db)
