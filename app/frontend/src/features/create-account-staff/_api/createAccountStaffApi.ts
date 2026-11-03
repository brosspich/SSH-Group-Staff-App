import { apiClient } from "@/services/api";
import type { CreateStaffPayload } from "../_types/createAccountStaff.types";

export async function fetchAllUsers(): Promise<any[]> {
  try {
    const data = await apiClient.get<any[]>("/users-query");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function checkUsernameAvailability(
  username: string,
): Promise<boolean> {
  try {
    const matchingUsers = await apiClient.get<any[]>("/users-query", {
      params: { username: username.trim().toLowerCase() },
    });
    return !(Array.isArray(matchingUsers) && matchingUsers.length > 0);
  } catch {
    return true;
  }
}

export async function checkStaffIdAvailability(
  staffId: string,
): Promise<boolean> {
  try {
    const user = await apiClient.get<any>(`/users-query/${staffId.trim()}`);
    return !user;
  } catch {
    return true;
  }
}

export async function createStaffAccountApi(
  payload: CreateStaffPayload,
): Promise<any> {
  return await apiClient.post("/users-query", payload);
}
