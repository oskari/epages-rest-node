import { ConfigurationError } from "./errors.js";
import { createCustomersResource } from "./resources/customers.js";
import { createOrdersResource } from "./resources/orders.js";
import { createProductsResource } from "./resources/products.js";
import { type RestClient, createRestClient } from "./rest.js";
import type { ClientOptions } from "./types.js";

export type RequestMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestOptions {
  params?: Record<string, string | number | boolean | string[] | undefined>;
  body?: unknown;
}

/**
 * Low-level request for unimplemented endpoints or power users.
 * Forwards method, path, and options to the REST layer.
 */
function createRequest(rest: RestClient) {
  return async <T = unknown>(
    method: RequestMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<T> => {
    const params = options?.params;
    const body = options?.body;
    switch (method) {
      case "GET":
        return rest.get<T>(path, params);
      case "POST":
        return rest.post<T>(path, body ?? {}, params);
      case "PATCH":
        return rest.patch<T>(path, Array.isArray(body) ? body : [], params);
      case "PUT":
        return rest.put<T>(path, body ?? {}, params);
      case "DELETE":
        await rest.delete(path, params);
        return undefined as T;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };
}

export class EpagesClient {
  readonly #rest: RestClient;

  readonly products: ReturnType<typeof createProductsResource>;
  readonly orders: ReturnType<typeof createOrdersResource>;
  readonly customers: ReturnType<typeof createCustomersResource>;
  readonly request: ReturnType<typeof createRequest>;

  constructor(options: ClientOptions) {
    const { host, shop, token, locale, currency, fetch: fetchFn } = options;
    if (!host?.trim())
      throw new ConfigurationError("Missing or empty option: host");
    if (!shop?.trim())
      throw new ConfigurationError("Missing or empty option: shop");
    if (!token?.trim())
      throw new ConfigurationError("Missing or empty option: token");

    this.#rest = createRestClient({
      host: host.trim(),
      shop: shop.trim(),
      token: token.trim(),
      ...(fetchFn && { fetch: fetchFn }),
    });
    const defaults =
      locale !== undefined || currency !== undefined
        ? { ...(locale && { locale }), ...(currency && { currency }) }
        : undefined;
    this.products = createProductsResource(this.#rest, defaults);
    this.orders = createOrdersResource(this.#rest, defaults);
    this.customers = createCustomersResource(this.#rest);
    this.request = createRequest(this.#rest);
  }
}
