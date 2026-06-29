from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    property_type: str = Field(min_length=1, max_length=100)
    location: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    baths: int = Field(ge=0, le=50, default=0)
    bedrooms: int = Field(ge=0, le=50, default=0)
    area_type: str = Field(min_length=1, max_length=50)
    area_size: float = Field(gt=0, le=10_000)
    area_category: str | None = Field(default=None, max_length=100)
    purpose: str = Field(default="For Sale", max_length=50)


class PredictionResponse(BaseModel):
    predicted_price: float
    risk_score: float
    risk_level: str
    listed_price: float | None = None
    price_difference: float | None = None
    price_difference_pct: float | None = None
