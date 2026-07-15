const API_BASE_URL = "/api";

interface FetchOptions extends RequestInit {
  data?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, params, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    if (searchParams.toString()) url += `?${searchParams.toString()}`;
  }
  
  const isFormData = data instanceof FormData;
  const headers: Record<string, string> = {};

  const token = localStorage.getItem("fronteira_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (customConfig.headers) {
    Object.assign(headers, customConfig.headers);
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  const response = await fetch(url, config);

  const text = await response.text();
  let result: any = null;
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = text; // corpo não-JSON (ex: erro em HTML)
    }
  }

  if (response.ok) {
    return result as T;
  }

  const message = (result && (result.error || result.message)) || 'Erro na requisição';
  const error = new Error(message) as Error & { status?: number; code?: string };
  error.status = response.status;
  if (result && result.code) error.code = result.code;
  throw error;
}

export const api = {
  get: <T>(endpoint: string, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'GET' }),
  post: <T>(endpoint: string, data?: any, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'POST', data }),
  put: <T>(endpoint: string, data?: any, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'PUT', data }),
  patch: <T>(endpoint: string, data?: any, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'PATCH', data }),
  delete: <T>(endpoint: string, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'DELETE' }),
};