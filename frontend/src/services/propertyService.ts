import { apiClient } from '../api/client';
import type { Property, PropertyListResponse } from '../types';

export interface PropertyFilters {
  city?: string;
  location?: string;
  location_exact?: boolean;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  page?: number;
  page_size?: number;
}

export async function searchProperties(filters: PropertyFilters = {}): Promise<PropertyListResponse> {
  const { data } = await apiClient.get<PropertyListResponse>('/properties', { params: filters });
  return data;
}

export async function getProperty(id: number): Promise<Property> {
  const { data } = await apiClient.get<Property>(`/properties/${id}`);
  return data;
}

export async function getFavorites(): Promise<Property[]> {
  const { data } = await apiClient.get<Property[]>('/properties/favorites');
  return data;
}

export async function addFavorite(propertyId: number): Promise<void> {
  await apiClient.post(`/properties/favorites/${propertyId}`);
}

export async function removeFavorite(propertyId: number): Promise<void> {
  await apiClient.delete(`/properties/favorites/${propertyId}`);
}

export async function getMyListings(): Promise<Property[]> {
  const { data } = await apiClient.get<Property[]>('/properties/agent/mine');
  return data;
}

export async function createProperty(payload: Partial<Property>): Promise<Property> {
  const { data } = await apiClient.post<Property>('/properties', payload);
  return data;
}

export async function updateProperty(id: number, payload: Partial<Property>): Promise<Property> {
  const { data } = await apiClient.patch<Property>(`/properties/${id}`, payload);
  return data;
}

export async function deleteProperty(id: number): Promise<void> {
  await apiClient.delete(`/properties/${id}`);
}
