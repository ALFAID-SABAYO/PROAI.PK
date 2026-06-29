from pydantic import BaseModel, Field


class AreaOption(BaseModel):
    """Area = properties.location in Postgres (neighborhood/sector name)."""

    location: str
    city: str
    listing_count: int


class BedroomPriceStat(BaseModel):
    bedrooms: int
    listing_count: int
    avg_price: float
    min_price: float
    max_price: float


class AreaPriceStats(BaseModel):
    location: str
    city: str
    listing_count: int
    min_price: float
    max_price: float
    avg_price: float
    bedroom_breakdown: list[BedroomPriceStat]


class CityPropertyCount(BaseModel):
    city: str
    property_count: int


class CityAreaBreakdown(BaseModel):
    location: str
    listing_count: int
    avg_price: float


class PlatformStats(BaseModel):
    """Public aggregate stats for landing page and platform overview."""

    total_listings: int
    total_cities: int
    total_property_types: int
    cities: list[CityPropertyCount]
    property_types: list[str]
    best_model_name: str | None = None
    best_model_r2: float | None = None
    training_rows: int | None = None
    avg_listing_price: float = 0.0
