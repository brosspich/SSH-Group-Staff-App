import { userService } from "../userService";
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";
import { secureStorage } from "../storage/secureStore.service";
import { ApiError } from "./apiError";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

function getDevServerIp(): string | undefined {
  // 1. React Native SourceCode.scriptURL (guaranteed in development mode)
  try {
    const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL;
    if (typeof scriptURL === "string") {
      const match = scriptURL.match(/https?:\/\/([^:/]+)/);
      if (
        match &&
        match[1] &&
        match[1] !== "localhost" &&
        match[1] !== "127.0.0.1"
      ) {
        return match[1];
      }
    }
  } catch {}

  // 2. Expo Constants hostUri (e.g. "192.168.1.182:8081")
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any)?.manifest?.debuggerHost ||
      (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
    if (typeof hostUri === "string") {
      const ip = hostUri.split(":")[0];
      if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
        return ip;
      }
    }
  } catch {}

  // 3. Expo linkingUri
  try {
    const linkingUri = Constants.linkingUri;
    if (typeof linkingUri === "string") {
      const match =
        linkingUri.match(/url=https?%3A%2F%2F([^%:]+)/i) ||
        linkingUri.match(/https?:\/\/([^:/]+)/);
      if (
        match &&
        match[1] &&
        match[1] !== "localhost" &&
        match[1] !== "127.0.0.1"
      ) {
        return match[1];
      }
    }
  } catch {}

  return undefined;
}

function resolveCandidateBaseUrls(): string[] {
  const dynamicHost = getDevServerIp();
  const autoHostUrl = dynamicHost ? `http://${dynamicHost}:4000` : undefined;
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS !== "web") {
    return [
      autoHostUrl,
      envUrl,
      "http://192.168.1.234:4000",
      "http://127.0.0.1:4000",
      "http://localhost:4000",
      "http://10.0.2.2:4000",
    ].filter(Boolean) as string[];
  }

  return [
    envUrl,
    "http://127.0.0.1:4000",
    "http://localhost:4000",
    "http://192.168.1.234:4000",
  ].filter(Boolean) as string[];
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const initialCandidates = resolveCandidateBaseUrls();
    this.baseUrl = (
      baseUrl ||
      initialCandidates[0] ||
      "http://192.168.1.234:4000"
    ).replace(/\/+$/, "");
  }

  private async getAuthToken(): Promise<string | null> {
    return await secureStorage.getItem("auth_token");
  }

  private buildUrlWithBase(
    baseUrl: string,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const isAbsolute =
      path.startsWith("http://") || path.startsWith("https://");
    let fullUrl = path;

    if (!isAbsolute) {
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      fullUrl = `${baseUrl}${cleanPath}`;
    }

    const url = new URL(fullUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...rest } = options;
    const token = await this.getAuthToken();
    const user = await userService.get().catch(() => null);

    let roleStr = "staff";
    if (user?.role) {
      if (Array.isArray(user.role)) {
        roleStr = user.role.join(",");
      } else {
        roleStr = String(user.role);
      }
    }

    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(user
        ? {
            "x-staff-id": user.id || user.staff_id || "",
            "x-staff-username": user.username || "",
            "x-staff-role": roleStr,
          }
        : {}),
      ...(headers as Record<string, string>),
    };

    const isAbsolute =
      path.startsWith("http://") || path.startsWith("https://");
    const dynamicCandidates = resolveCandidateBaseUrls();
    const targets = isAbsolute
      ? [this.baseUrl]
      : Array.from(
          new Set([
            dynamicCandidates[0] || this.baseUrl,
            this.baseUrl,
            ...dynamicCandidates,
          ]),
        );

    let lastError: any = null;

    for (const base of targets) {
      const url = this.buildUrlWithBase(base, path, params);
      const timeoutMs = options.timeout ?? 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      if (options.signal) {
        if (options.signal.aborted) {
          controller.abort();
        } else {
          options.signal.addEventListener("abort", () => controller.abort());
        }
      }

      try {
        const response = await fetch(url, {
          headers: finalHeaders,
          signal: controller.signal,
          ...rest,
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new ApiError(
            data?.message || `Request failed with status ${response.status}`,
            response.status,
            data,
          );
        }

        // Successfully reached server! Pin this working base URL
        if (!isAbsolute && this.baseUrl !== base) {
          this.baseUrl = base;
        }

        // Automatically unwrap { success: true, data: T } responses from API
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          "data" in data
        ) {
          return (data as any).data as T;
        }

        return data as T;
      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;

        // If it's a 4xx / 5xx ApiError response from the server, do not retry other hosts
        if (
          error instanceof ApiError &&
          error.statusCode &&
          error.statusCode >= 400 &&
          error.statusCode !== 408
        ) {
          throw error;
        }

        // Network or connection failure: try next candidate host
        continue;
      }
    }

    if (
      lastError?.name === "AbortError" ||
      lastError?.message?.includes("aborted")
    ) {
      throw new ApiError(
        `Connection timed out (${Math.round((options.timeout ?? 6000) / 1000)}s). Server unreachable.`,
        408,
        lastError,
      );
    }
    if (lastError instanceof ApiError) {
      throw lastError;
    }
    const rawMsg = (lastError as Error)?.message || "";
    if (
      rawMsg.includes("ConnectException") ||
      rawMsg.includes("failed to connect") ||
      rawMsg.includes("Network request failed")
    ) {
      throw new ApiError(
        "Cannot connect to server. Please check your network or server status.",
        0,
        lastError,
      );
    }
    throw new ApiError(rawMsg || "Network request failed", 0, lastError);
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
