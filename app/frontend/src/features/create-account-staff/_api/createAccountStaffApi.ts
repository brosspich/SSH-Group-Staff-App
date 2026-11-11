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
  systemId?: string,
): Promise<boolean> {
  try {
    const sysMatch = systemId ? systemId.match(/^(system-\d+)/i) : null;
    const targetSys = sysMatch
      ? sysMatch[1].toLowerCase()
      : systemId?.toLowerCase();

    const params: any = { username: username.trim().toLowerCase() };
    if (targetSys) {
      params.systemId = targetSys;
    }

    const matchingUsers = await apiClient.get<any[]>("/users-query", {
      params,
    });
    if (!Array.isArray(matchingUsers) || matchingUsers.length === 0) {
      return true;
    }

    if (targetSys) {
      const matchInSystem = matchingUsers.some((u) => {
        const uSys = (
          u.systemId ||
          u.system_id ||
          u.companyId ||
          u.company_id ||
          ""
        )
          .match(/^(system-\d+)/i)?.[1]
          ?.toLowerCase();
        return uSys === targetSys;
      });
      return !matchInSystem;
    }

    return matchingUsers.length === 0;
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
