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
