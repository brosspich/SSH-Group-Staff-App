import { apiClient } from "@/services/api";
import type { StaffUser } from "@/services/userService";

export async function fetchStaffDirectoryApi(): Promise<StaffUser[]> {
  const data = await apiClient.get<StaffUser[]>("/users-query").catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function updateStaffUserApi(
  id: string,
  payload: Partial<StaffUser>,
): Promise<StaffUser> {
  return await apiClient.put<StaffUser>(`/users-query/${id}`, payload);
}
