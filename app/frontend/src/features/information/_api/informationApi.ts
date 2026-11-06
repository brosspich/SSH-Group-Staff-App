import { apiClient } from "@/shared/services/api";
import type { StaffUser } from "@/shared/services/userService";

export async function fetchUserByIdApi(
  userId: string,
): Promise<StaffUser | null> {
  try {
    const data = await apiClient.get<StaffUser>(`/users-query/${userId}`);
    return data || null;
  } catch {
    return null;
  }
}

export async function checkUsernameConflictApi(
  username: string,
  currentUserId: string,
): Promise<boolean> {
  try {
    const matches = await apiClient
      .get<any[]>("/users-query", {
        params: { username: username.trim().toLowerCase() },
      })
      .catch(() => []);

    const existing = matches.find((m: any) => m.id !== currentUserId);
    return !!existing;
  } catch {
    return false;
  }
}

export async function updateUserFieldApi(
  userId: string,
  fieldKey: string,
  value: any,
): Promise<StaffUser> {
  return await apiClient.put<StaffUser>(`/users-query/${userId}`, {
    [fieldKey]: value,
  });
}
