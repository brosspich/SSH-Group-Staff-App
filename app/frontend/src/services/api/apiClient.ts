import { secureStorage } from '../storage/secureStore.service';
import { userService } from '../userService';
import { ApiError } from './apiError';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.3:4000') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async getAuthToken(): Promise<string | null> {
    return await secureStorage.getItem('auth_token');
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
    let fullUrl = path;

    if (!isAbsolute) {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      fullUrl = `${this.baseUrl}${cleanPath}`;
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
    const url = this.buildUrl(path, params);

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
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(user ? {
        'x-staff-id': user.id || user.staff_id || '',
        'x-staff-username': user.username || '',
        'x-staff-role': roleStr,
      } : {}),
      ...(headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        headers: finalHeaders,
        ...rest,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          data?.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      // Automatically unwrap { success: true, data: T } responses from API
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return (data as any).data as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError((error as Error)?.message || 'Network request failed', 0, error);
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
