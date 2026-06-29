from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.rate_limit import limiter
from app.schemas.property import (
    PropertyCreate,
    PropertyListResponse,
    PropertyOut,
    PropertySearchParams,
    PropertyUpdate,
)
from app.security import ALLOWED_AGENT_CITIES
from app.services import property_service as svc

router = APIRouter(prefix="/properties", tags=["properties"])


def _validate_agent_city(city: str) -> None:
    if city.lower() not in ALLOWED_AGENT_CITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agents can only list properties in Karachi or Islamabad",
        )


@router.get("", response_model=PropertyListResponse)
@limiter.limit("60/minute")
def search_properties(
    request: Request,
    city: str | None = Query(default=None, max_length=100),
    location: str | None = Query(default=None, max_length=255),
    location_exact: bool = Query(default=False),
    property_type: str | None = Query(default=None, max_length=100),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    min_bedrooms: int | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    params = PropertySearchParams(
        city=city,
        location=location,
        location_exact=location_exact,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        min_bedrooms=min_bedrooms,
        page=page,
        page_size=page_size,
    )
    items, total = svc.search_properties(db, params)
    return PropertyListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=svc.paginate(total, page, page_size),
    )


@router.get("/favorites", response_model=list[PropertyOut])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.INVESTOR)),
):
    return svc.get_user_favorites(db, current_user.id)


@router.post("/favorites/{property_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.INVESTOR)),
):
    prop = svc.get_property(db, property_id)
    if not prop or not prop.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    svc.add_favorite(db, current_user.id, property_id)
    return {"message": "Added to favorites"}


@router.delete("/favorites/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.INVESTOR)),
):
    removed = svc.remove_favorite(db, current_user.id, property_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")


@router.get("/agent/mine", response_model=list[PropertyOut])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT)),
):
    return svc.get_agent_properties(db, current_user.id)


@router.get("/{property_id}", response_model=PropertyOut)
def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    prop = svc.get_property(db, property_id)
    if not prop or not prop.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return prop


@router.post("", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN)),
):
    if current_user.role == UserRole.AGENT and payload.city.lower() not in ALLOWED_AGENT_CITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agents can only list properties in Karachi or Islamabad",
        )
    agent_id = current_user.id if current_user.role == UserRole.AGENT else None
    return svc.create_property(db, payload, agent_id=agent_id)


@router.patch("/{property_id}", response_model=PropertyOut)
def update_property(
    property_id: int,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN)),
):
    prop = svc.get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    if current_user.role == UserRole.AGENT and prop.agent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")
    if current_user.role == UserRole.AGENT and payload.city is not None:
        _validate_agent_city(payload.city)
    return svc.update_property(
        db,
        prop,
        payload,
        allow_is_active=current_user.role == UserRole.ADMIN,
    )


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.AGENT, UserRole.ADMIN)),
):
    prop = svc.get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    if current_user.role == UserRole.AGENT and prop.agent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")
    svc.delete_property(db, prop)
