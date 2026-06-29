export type UserRole = 'admin' | 'investor' | 'agent';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Property {
  id: number;
  external_id?: number | null;
  property_type: string;
  price: number;
  location: string;
  city: string;
  province_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  baths?: number | null;
  bedrooms?: number | null;
  area_type?: string | null;
  area_size?: number | null;
  area_category?: string | null;
  purpose?: string | null;
  page_url?: string | null;
  agency?: string | null;
  agent_name?: string | null;
  date_added?: string | null;
  agent_id?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyListResponse {
  items: Property[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Prediction {
  predicted_price: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  listed_price?: number | null;
  price_difference?: number | null;
  price_difference_pct?: number | null;
}

export interface ModelMetrics {
  model_name: string;
  r2: number;
  mae: number;
  rmse: number;
}

export interface ModelMetricsResponse {
  best_model: string | null;
  training_rows: number | null;
  models: ModelMetrics[];
}

export interface LocationStats {
  location: string;
  city: string;
  count: number;
  avg_price: number;
  median_price: number;
  min_price: number;
  max_price: number;
  avg_risk_score?: number | null;
}

export interface SystemAnalytics {
  total_users: number;
  total_properties: number;
  total_listings_by_agents: number;
  properties_by_city: {
    city: string;
    property_count: number;
    avg_price: number;
    median_price: number;
  }[];
  model_metrics?: ModelMetrics[] | null;
}

export interface AgentAnalytics {
  total_listings: number;
  active_listings: number;
  avg_listed_price: number;
}
