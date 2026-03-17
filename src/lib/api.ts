import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Token refresh state
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export const apiClient = {
  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    const username = localStorage.getItem('username');
    
    if (!refreshToken || !username) {
      console.error('❌ No refresh token or username available - redirecting to login');
      
      // Clear all tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      
      // Redirect directly to login without showing alert
      window.location.href = '/auth/login';
      throw new Error('No refresh token or username available');
    }

    console.log('🔄 Attempting to refresh access token for user:', username);

    const response = await fetch(`${API_BASE_URL}/api/Auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken, username }),
    });

    if (!response.ok) {
      console.error('❌ Refresh token failed:', response.status, response.statusText);
      
      // Get error details from server response
      let errorMessage = 'Your session has expired. Please login again.';
      let errorTitle = 'Session Expired';
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Use more specific title based on status code
        if (response.status === 400) {
          errorTitle = 'Refresh Token Failed';
          errorMessage = errorData.message || 'Invalid or expired refresh token. Please login again.';
        }
      } catch (e) {
        // If parsing fails, use default message
        console.error('Failed to parse error response:', e);
      }
      
      // Refresh failed, clear tokens and show error message
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      
      // Show error alert with actual message from server
      await Swal.fire({
        icon: 'warning',
        title: errorTitle,
        text: errorMessage,
        confirmButtonText: 'Login',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      
      window.location.href = '/auth/login';
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.tokens) {
      console.log('✅ Access token refreshed successfully');
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('idToken', data.tokens.idToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
    } else {
      console.error('❌ No tokens in refresh response');
      throw new Error('No tokens in refresh response');
    }
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("accessToken");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired
    // Only auto-refresh for protected endpoints, not auth endpoints
    const authEndpointsToExclude = [
      '/api/Auth/signup',
      '/api/Auth/resend-confirmation',
      '/api/Auth/confirm',
      '/api/Auth/signin',
      '/api/Auth/signout',
      '/api/Auth/refresh',
      '/api/Auth/forgot-password',
      '/api/Auth/reset-password',
      '/api/Auth/verify-totp',
      '/api/Auth/mfa/verify',
      '/api/Auth/mfa/disable-with-backup',
      '/api/Auth/google/url',
      '/api/Auth/google/callback',
    ];
    
    const shouldRefresh = response.status === 401 && 
      !authEndpointsToExclude.includes(endpoint);

    if (shouldRefresh) {
      console.log('⚠️ 401 Unauthorized detected, attempting token refresh for:', endpoint);
      
      // If already refreshing, wait for it to complete
      if (isRefreshing && refreshPromise) {
        console.log('⏳ Already refreshing, waiting...');
        await refreshPromise;
        // Retry the original request with the new token
        console.log('🔁 Retrying request after refresh completed');
        return this.request<T>(endpoint, options);
      }

      // Start the refresh process
      isRefreshing = true;
      refreshPromise = this.refreshToken()
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });

      try {
        await refreshPromise;
        // Retry the original request with the new token
        console.log('🔁 Retrying original request with new token');
        return this.request<T>(endpoint, options);
      } catch (error) {
        // Refresh failed, error already handled in refreshToken()
        console.error('❌ Refresh failed, user will be redirected to login');
        throw error;
      }
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));

      throw new ApiError(
        response.status,
        error.message || `HTTP ${response.status}`
      );
    }

  // Handle empty responses (204 No Content, etc.)
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T
  }

  const text = await response.text()
  return text ? JSON.parse(text) : ({} as T)
},

  get<T>(endpoint: string, params?: Record<string, any>) {
    let url = endpoint
    
    if (params) {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle nested objects (e.g., pagination)
          if (typeof value === 'object' && !Array.isArray(value)) {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== undefined && nestedValue !== null) {
                queryParams.append(`${key}.${nestedKey}`, String(nestedValue))
              }
            })
          } else {
            queryParams.append(key, String(value))
          }
        }
      })
      const queryString = queryParams.toString()
      if (queryString) {
        url = `${endpoint}?${queryString}`
      }
    }
    
    return this.request<T>(url, { method: 'GET' })
  },

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  },
}
