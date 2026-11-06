import { apiClient } from "@/shared/services/api";
import type { StaffUser } from "@/shared/services/userService";

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
