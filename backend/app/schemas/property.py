from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PropertyBase(BaseModel):
    property_type: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    location: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    province_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    baths: int | None = Field(default=None, ge=0)
    bedrooms: int | None = Field(default=None, ge=0)
    area_type: str | None = None
    area_size: float | None = Field(default=None, gt=0)
    area_category: str | None = None
    purpose: str | None = None
    page_url: str | None = None
    agency: str | None = None
    agent_name: str | None = None
    date_added: str | None = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    property_type: str | None = Field(default=None, min_length=1, max_length=100)
    price: float | None = Field(default=None, gt=0)
    location: str | None = Field(default=None, min_length=1, max_length=255)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    province_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    baths: int | None = Field(default=None, ge=0)
    bedrooms: int | None = Field(default=None, ge=0)
    area_type: str | None = None
    area_size: float | None = Field(default=None, gt=0)
    area_category: str | None = None
    purpose: str | None = None
    page_url: str | None = None
    agency: str | None = None
    agent_name: str | None = None
    date_added: str | None = None
    is_active: bool | None = None


class PropertyOut(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: int | None = None
    agent_id: int | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PropertySearchParams(BaseModel):
    city: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=255)
    location_exact: bool = False
    property_type: str | None = Field(default=None, max_length=100)
    min_price: float | None = Field(default=None, ge=0)
    max_price: float | None = Field(default=None, ge=0)
    min_bedrooms: int | None = Field(default=None, ge=0)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class PropertyListResponse(BaseModel):
    items: list[PropertyOut]
    total: int
    page: int
    page_size: int
    total_pages: int
