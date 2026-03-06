import type { RestClient } from "../rest.js";
import type { CustomersListParams, PagedResponse } from "../types.js";

const PATH = "customers";

export function createCustomersResource(rest: RestClient) {
  return {
    /** GET /customers — list customers (RAML: paged only). */
    list<T = unknown>(params?: CustomersListParams): Promise<PagedResponse<T>> {
      const q = params
        ? {
            ...(params.page !== undefined && { page: params.page }),
            ...(params.resultsPerPage !== undefined && {
              resultsPerPage: params.resultsPerPage,
            }),
          }
        : undefined;
      return rest.get<PagedResponse<T>>(PATH, q);
    },

    /** GET /customers/{customerId} */
    get<T = unknown>(customerId: string): Promise<T> {
      return rest.get<T>(`${PATH}/${customerId}`);
    },

    /** POST /customers — create customer. */
    create<T = unknown>(body: unknown): Promise<T> {
      return rest.post<T>(PATH, body);
    },

    /** PATCH /customers/{customerId} — JSON Patch array (RFC 6902). */
    patch<T = unknown>(customerId: string, operations: unknown[]): Promise<T> {
      return rest.patch<T>(`${PATH}/${customerId}`, operations);
    },
  };
}
