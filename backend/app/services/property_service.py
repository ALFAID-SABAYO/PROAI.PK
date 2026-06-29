import math

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertySearchParams, PropertyUpdate
from app.security import escape_ilike


def search_properties(db: Session, params: PropertySearchParams) -> tuple[list[Property], int]:
    query = db.query(Property).filter(Property.is_active.is_(True))

    if params.city:
        query = query.filter(Property.city.ilike(f"%{escape_ilike(params.city)}%", escape="\\"))
    if params.location:
        if params.location_exact:
            query = query.filter(Property.location == params.location)
        else:
            query = query.filter(
                Property.location.ilike(f"%{escape_ilike(params.location)}%", escape="\\")
            )
    if params.property_type:
        query = query.filter(
            Property.property_type.ilike(f"%{escape_ilike(params.property_type)}%", escape="\\")
        )
    if params.min_price is not None:
        query = query.filter(Property.price >= params.min_price)
    if params.max_price is not None:
        query = query.filter(Property.price <= params.max_price)
    if params.min_bedrooms is not None:
        query = query.filter(Property.bedrooms >= params.min_bedrooms)

    total = query.count()
    offset = (params.page - 1) * params.page_size
    items = query.order_by(Property.id.desc()).offset(offset).limit(params.page_size).all()
    return items, total


def get_property(db: Session, property_id: int) -> Property | None:
    return db.query(Property).filter(Property.id == property_id).first()


def create_property(db: Session, data: PropertyCreate, agent_id: int | None = None) -> Property:
    prop = Property(**data.model_dump(), agent_id=agent_id)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


def update_property(
    db: Session,
    prop: Property,
    data: PropertyUpdate,
    *,
    allow_is_active: bool = False,
) -> Property:
    updates = data.model_dump(exclude_unset=True)
    if not allow_is_active:
        updates.pop("is_active", None)
    for field, value in updates.items():
        setattr(prop, field, value)
    db.commit()
    db.refresh(prop)
    return prop


def delete_property(db: Session, prop: Property) -> None:
    prop.is_active = False
    db.commit()


def get_agent_properties(db: Session, agent_id: int) -> list[Property]:
    return db.query(Property).filter(Property.agent_id == agent_id).order_by(Property.id.desc()).all()


def add_favorite(db: Session, user_id: int, property_id: int) -> Favorite:
    existing = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id, Favorite.property_id == property_id)
        .first()
    )
    if existing:
        return existing
    fav = Favorite(user_id=user_id, property_id=property_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


def remove_favorite(db: Session, user_id: int, property_id: int) -> bool:
    fav = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id, Favorite.property_id == property_id)
        .first()
    )
    if not fav:
        return False
    db.delete(fav)
    db.commit()
    return True


def get_user_favorites(db: Session, user_id: int) -> list[Property]:
    return (
        db.query(Property)
        .join(Favorite, Favorite.property_id == Property.id)
        .filter(Favorite.user_id == user_id, Property.is_active.is_(True))
        .order_by(Favorite.created_at.desc())
        .all()
    )


def paginate(total: int, page: int, page_size: int) -> int:
    return max(1, math.ceil(total / page_size)) if total else 0
