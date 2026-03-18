export interface FetchOptions extends Omit<RequestInit, "body"> {
  timeout?: number;
  body?: unknown;
}

export interface FetchResponse<T = unknown> {
  status: number;
  data: T;
  ok: boolean;
  headers: Headers;
}

export class FetchError<T = unknown> extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data?: T;

  constructor(params: { status: number; statusText: string; message: string; data?: T }) {
    super(params.message);
    this.name = "FetchError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.data = params.data;
  }
}

const DEFAULT_TIMEOUT = 30_000;

function createTimeoutSignal(timeout: number, externalSignal?: AbortSignal): AbortSignal {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException("Request timeout", "AbortError"));
  }, timeout);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason), { once: true });
    }
  }

  controller.signal.addEventListener("abort", () => clearTimeout(timeoutId), { once: true });

  return controller.signal;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as T;
}

async function request<T = unknown>(url: string, options: FetchOptions = {}): Promise<FetchResponse<T>> {
  const { timeout = DEFAULT_TIMEOUT, headers, body, signal: externalSignal, ...restOptions } = options;

  const mergedHeaders = new Headers(headers);

  const isJsonBody = body !== undefined && !(body instanceof FormData);

  if (isJsonBody && !mergedHeaders.has("Content-Type")) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: mergedHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    signal: createTimeoutSignal(timeout, externalSignal ?? undefined),
  });

  const data = await parseResponse<T>(response);

  if (!response.ok) {
    throw new FetchError<T>({
      status: response.status,
      statusText: response.statusText,
      message: `HTTP ${response.status} ${response.statusText}`,
      data,
    });
  }

  return {
    status: response.status,
    data,
    ok: response.ok,
    headers: response.headers,
  };
}

export const fetchService = {
  request,
  get: <T = unknown>(url: string, options: FetchOptions = {}) => request<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, body?: unknown, options: FetchOptions = {}) =>
    request<T>(url, { ...options, method: "POST", body }),

  put: <T = unknown>(url: string, body?: unknown, options: FetchOptions = {}) =>
    request<T>(url, { ...options, method: "PUT", body }),

  patch: <T = unknown>(url: string, body?: unknown, options: FetchOptions = {}) =>
    request<T>(url, { ...options, method: "PATCH", body }),

  delete: <T = unknown>(url: string, options: FetchOptions = {}) => request<T>(url, { ...options, method: "DELETE" }),
};
