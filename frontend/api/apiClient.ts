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
  
  // VERIFICA SE ESTAMOS ENVIANDO ARQUIVOS (FormData)
  const isFormData = data instanceof FormData;
  
  const headers: Record<string, string> = {};

  // Copia os headers customizados (como o Token de Autenticação)
  if (customConfig.headers) {
    Object.assign(headers, customConfig.headers);
  }

  // A MÁGICA: Se NÃO for FormData, colocamos a etiqueta de JSON. 
  // Se for FormData, o navegador coloca o Content-Type automaticamente!
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (data) {
    // Se for FormData envia direto, senão transforma em texto (JSON)
    config.body = isFormData ? data : JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  const result = await response.json();

  if (response.ok) {
    return result;
  }

  throw new Error(result.error || result.message || 'Erro na requisição');
}

export const api = {
  get: <T>(endpoint: string, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'GET' }),
  post: <T>(endpoint: string, data?: any, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'POST', data }),
  put: <T>(endpoint: string, data?: any, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'PUT', data }),
  patch: <T>(endpoint: string, data?: any, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'PATCH', data }),
  delete: <T>(endpoint: string, config?: FetchOptions) => apiFetch<T>(endpoint, { ...config, method: 'DELETE' }),
};