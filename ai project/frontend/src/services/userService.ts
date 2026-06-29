import { apiClient } from '../api/client';
import type { User, UserRole } from '../types';

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/users');
  return data;
}

export async function updateUser(
  id: number,
  payload: { full_name?: string; is_active?: boolean; role?: UserRole },
): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${id}`, payload);
  return data;
}

export async function deactivateUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
