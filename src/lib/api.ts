const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiClient = {
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

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) {
    let url = endpoint
    
    if (params) {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
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
