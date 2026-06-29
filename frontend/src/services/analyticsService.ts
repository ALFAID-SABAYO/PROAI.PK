import { apiClient } from '../api/client';
import type {
  AgentAnalytics,
  LocationStats,
  ModelMetricsResponse,
  SystemAnalytics,
} from '../types';

export async function getSystemAnalytics(): Promise<SystemAnalytics> {
  const { data } = await apiClient.get<SystemAnalytics>('/analytics/system');
  return data;
}

export async function getModelMetrics(): Promise<ModelMetricsResponse> {
  const { data } = await apiClient.get<ModelMetricsResponse>('/analytics/model');
  return data;
}

export async function getLocationStats(city?: string, limit = 15): Promise<LocationStats[]> {
  const { data } = await apiClient.get<LocationStats[]>('/analytics/locations', {
    params: { city, limit },
  });
  return data;
}

export async function getAgentAnalytics(): Promise<AgentAnalytics> {
  const { data } = await apiClient.get<AgentAnalytics>('/analytics/agent');
  return data;
}

export async function uploadDataset(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/analytics/dataset/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
