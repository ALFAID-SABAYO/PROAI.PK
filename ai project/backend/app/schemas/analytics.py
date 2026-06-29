from pydantic import BaseModel


class ModelMetrics(BaseModel):
    model_name: str
    r2: float
    mae: float
    rmse: float


class LocationStats(BaseModel):
    location: str
    city: str
    count: int
    avg_price: float
    median_price: float
    min_price: float
    max_price: float
    avg_risk_score: float | None = None


class CityComparison(BaseModel):
    city: str
    property_count: int
    avg_price: float
    median_price: float


class SystemAnalytics(BaseModel):
    total_users: int
    total_properties: int
    total_listings_by_agents: int
    properties_by_city: list[CityComparison]
    model_metrics: list[ModelMetrics] | None = None


class AgentAnalytics(BaseModel):
    total_listings: int
    active_listings: int
    avg_listed_price: float
    total_views_placeholder: int = 0
