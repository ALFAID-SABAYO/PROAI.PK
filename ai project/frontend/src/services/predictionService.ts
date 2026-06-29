import { apiClient } from '../api/client';
import type { Prediction } from '../types';

export async function getPropertyPrediction(propertyId: number): Promise<Prediction> {
  const { data } = await apiClient.get<Prediction>(`/predictions/property/${propertyId}`);
  return data;
}

export async function predictPrice(payload: {
  property_type: string;
  location: string;
  city: string;
  baths: number;
  bedrooms: number;
  area_type: string;
  area_size: number;
  area_category?: string;
  purpose?: string;
}): Promise<Prediction> {
  const { data } = await apiClient.post<Prediction>('/predictions', payload);
  return data;
}
