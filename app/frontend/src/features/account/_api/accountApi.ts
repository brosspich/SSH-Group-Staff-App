import { apiClient } from "@/services/api";
import type { StaffUser } from "@/services/userService";

export async function fetchAccountProfileApi(
  userId: string,
): Promise<StaffUser | null> {
  try {
    const data = await apiClient.get<StaffUser>(`/users-query/${userId}`);
    return data || null;
  } catch {
    return null;
  }
}
