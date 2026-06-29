from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    property_type: str = Field(min_length=1)
    location: str = Field(min_length=1)
    city: str = Field(min_length=1)
    baths: int = Field(ge=0, default=0)
    bedrooms: int = Field(ge=0, default=0)
    area_type: str = Field(min_length=1)
    area_size: float = Field(gt=0)
    area_category: str | None = None
    purpose: str = "For Sale"


class PredictionResponse(BaseModel):
    predicted_price: float
    risk_score: float
    risk_level: str
    listed_price: float | None = None
    price_difference: float | None = None
    price_difference_pct: float | None = None
