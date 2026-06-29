import { apiClient } from '../api/client';

export interface AreaOption {
  location: string;
  city: string;
  listing_count: number;
}

export interface BedroomPriceStat {
  bedrooms: number;
  listing_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
}

export interface AreaPriceStats {
  location: string;
  city: string;
  listing_count: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  bedroom_breakdown: BedroomPriceStat[];
}

export interface CityPropertyCount {
  city: string;
  property_count: number;
}

export interface CityAreaBreakdown {
  location: string;
  listing_count: number;
  avg_price: number;
}

export async function getAreas(city?: string): Promise<AreaOption[]> {
  const { data } = await apiClient.get<AreaOption[]>('/stats/areas', { params: { city } });
  return data;
}

export async function getAreaPriceStats(location: string, city: string): Promise<AreaPriceStats> {
  const { data } = await apiClient.get<AreaPriceStats>('/stats/areas/prices', {
    params: { location, city },
  });
  return data;
}

export async function getCityPropertyCounts(): Promise<CityPropertyCount[]> {
  const { data } = await apiClient.get<CityPropertyCount[]>('/stats/cities');
  return data;
}

export async function getCityAreaBreakdown(city: string, limit = 20): Promise<CityAreaBreakdown[]> {
  const { data } = await apiClient.get<CityAreaBreakdown[]>(`/stats/cities/${encodeURIComponent(city)}/areas`, {
    params: { limit },
  });
  return data;
}

export async function getPropertyTypes(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/stats/property-types');
  return data;
}

export async function getAreaTypes(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/stats/area-types');
  return data;
}
