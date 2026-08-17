import { API_CONFIG } from '@/config/api';
import { secureStore } from '@/lib/storage/secureStore';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Perform token refresh via POST /api/auth/token/refresh/
 */
async function performTokenRefresh(): Promise<string> {
  const refreshToken = await secureStore.getRefreshToken();
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token available');
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    await secureStore.clearTokens();
    throw new ApiError(response.status, 'Session expired. Please log in again.');
  }

  const data = await response.json();
  const newAccessToken = data.access;

  if (!newAccessToken) {
    await secureStore.clearTokens();
    throw new ApiError(401, 'Invalid refresh token response');
  }

  await secureStore.saveTokens({
    access: newAccessToken,
    refresh: refreshToken,
  });

  return newAccessToken;
}

/**
 * Main API request client supporting auto-bearer token injection,
 * query params, and auto 401 refresh token retry.
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth, headers: customHeaders, ...restOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth) {
    const accessToken = await secureStore.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers,
    });
  } catch (netError: any) {
    throw new ApiError(0, 'Network request failed. Please check your connection.', netError);
  }

  // Handle 401 Unauthorized token refresh retry logic
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/token/refresh')) {
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(url, { ...restOptions, headers }).then((res) => res.json());
        });
    }

    isRefreshing = true;

    try {
      const newToken = await performTokenRefresh();
      processQueue(null, newToken);
      isRefreshing = false;

      // Retry original request with new access token
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(url, {
        ...restOptions,
        headers,
      });

      if (!retryResponse.ok) {
        const errData = await retryResponse.json().catch(() => ({}));
        throw new ApiError(retryResponse.status, errData.detail || 'Request failed after refresh', errData);
      }

      return await retryResponse.json();
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;
      throw refreshErr;
    }
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.detail || errData.message || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errData);
  }

  // If status is 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}
