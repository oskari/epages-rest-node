import { ApiError, TooManyRequestsError } from "./errors.js";

const ACCEPT = "application/vnd.epages.v1+json";
const CONTENT_TYPE_JSON = "application/json";
const CONTENT_TYPE_JSON_PATCH = "application/json-patch+json";
const USER_AGENT = "epages-rest-node/1.0.0";

export interface RestClientOptions {
  host: string;
  shop: string;
  token: string;
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

function buildUrl(
  host: string,
  shop: string,
  path: string,
  params?: Record<string, string | number | boolean | string[] | undefined>,
): string {
  const base = `https://${host}/rs/shops/${shop}/${path.replace(/^\//, "")}`;
  if (!params || Object.keys(params).length === 0) return base;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) search.append(key, String(v));
    } else {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `${base}?${q}` : base;
}

function getHeaders(contentType: string, token: string): HeadersInit {
  return {
    Accept: ACCEPT,
    "Content-Type": contentType,
    Authorization: `Bearer ${token}`,
    "User-Agent": USER_AGENT,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 429) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new TooManyRequestsError(
      "API rate limit exceeded (429 Too Many Requests)",
      body,
    );
  }
  if (!res.ok) {
    let body: unknown;
    const ct = res.headers.get("content-type") ?? "";
    try {
      if (ct.includes("application/json")) body = await res.json();
      else body = await res.text();
    } catch {
      body = await res.text();
    }
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : res.statusText || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface RestClient {
  get<T>(
    path: string,
    params?: Record<string, string | number | boolean | string[] | undefined>,
  ): Promise<T>;
  post<T>(
    path: string,
    body: unknown,
    params?: Record<string, string | number | boolean | string[] | undefined>,
  ): Promise<T>;
  put<T>(
    path: string,
    body: unknown,
    params?: Record<string, string | number | boolean | string[] | undefined>,
  ): Promise<T>;
  patch<T>(
    path: string,
    body: unknown,
    params?: Record<string, string | number | boolean | string[] | undefined>,
  ): Promise<T>;
  delete(
    path: string,
    params?: Record<string, string | number | boolean | string[] | undefined>,
  ): Promise<void>;
}

export function createRestClient(options: RestClientOptions): RestClient {
  const { host, shop, token, fetch: fetchFn = globalThis.fetch } = options;
  const url = (
    path: string,
    params?: Record<string, string | number | boolean | string[] | undefined>,
  ) => buildUrl(host, shop, path, params);

  return {
    async get<T>(
      path: string,
      params?: Record<string, string | number | boolean | string[] | undefined>,
    ): Promise<T> {
      const res = await fetchFn(url(path, params), {
        method: "GET",
        headers: getHeaders(CONTENT_TYPE_JSON, token),
      });
      return handleResponse<T>(res);
    },

    async post<T>(
      path: string,
      body: unknown,
      params?: Record<string, string | number | boolean | string[] | undefined>,
    ): Promise<T> {
      const res = await fetchFn(url(path, params), {
        method: "POST",
        headers: getHeaders(CONTENT_TYPE_JSON, token),
        body: JSON.stringify(body),
      });
      return handleResponse<T>(res);
    },

    async put<T>(
      path: string,
      body: unknown,
      params?: Record<string, string | number | boolean | string[] | undefined>,
    ): Promise<T> {
      const res = await fetchFn(url(path, params), {
        method: "PUT",
        headers: getHeaders(CONTENT_TYPE_JSON, token),
        body: JSON.stringify(body),
      });
      return handleResponse<T>(res);
    },

    async patch<T>(
      path: string,
      body: unknown,
      params?: Record<string, string | number | boolean | string[] | undefined>,
    ): Promise<T> {
      const res = await fetchFn(url(path, params), {
        method: "PATCH",
        headers: getHeaders(CONTENT_TYPE_JSON_PATCH, token),
        body: JSON.stringify(body),
      });
      return handleResponse<T>(res);
    },

    async delete(
      path: string,
      params?: Record<string, string | number | boolean | string[] | undefined>,
    ): Promise<void> {
      const res = await fetchFn(url(path, params), {
        method: "DELETE",
        headers: getHeaders(CONTENT_TYPE_JSON, token),
      });
      await handleResponse<void>(res);
    },
  };
}
