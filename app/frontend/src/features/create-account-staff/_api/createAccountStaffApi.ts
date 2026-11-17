import { apiClient } from "@/shared/services/api";
import type { CreateStaffPayload } from "../_types/createAccountStaff.types";

export async function fetchNextSystemIdApi(system: string): Promise<string> {
  try {
    const res = await apiClient.get<any>("/users-query/next-system-id", {
      params: { system },
    });
    return res?.nextSystemId || `${system}-0001`;
  } catch {
    return `${system}-0001`;
  }
}

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
  _systemId?: string,
): Promise<boolean> {
  try {
    const cleanUsername = username.trim().toLowerCase();
    const matchingUsers = await apiClient.get<any[]>("/users-query", {
      params: { username: cleanUsername },
    });
    if (!Array.isArray(matchingUsers) || matchingUsers.length === 0) {
      return true;
    }

    const match = matchingUsers.some(
      (u) => (u.username || "").trim().toLowerCase() === cleanUsername,
    );
    return !match;
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
