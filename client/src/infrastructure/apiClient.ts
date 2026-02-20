const getBaseUrl = (): string => {
  const env = import.meta.env?.VITE_API_URL;
  if (typeof env === "string" && env) return env.replace(/\/$/, "");
  return "";
};

export const apiBaseUrl = getBaseUrl();

export const getAuthHeaders = (): HeadersInit => {
  const raw = localStorage.getItem("auth-token");
  const token = typeof raw === "string" ? raw : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = path.startsWith("http") ? path : `${apiBaseUrl}${path}`;
  const headers = new Headers(options.headers ?? getAuthHeaders());
  if (options.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  return fetch(url, { ...options, headers });
};
