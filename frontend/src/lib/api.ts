const API_BASE_URL = "http://localhost:5230/api";

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers);

  /*
   * Automatically add JSON content type
   * when a request contains a body,
   * except for FormData uploads.
   */
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  return fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });
}