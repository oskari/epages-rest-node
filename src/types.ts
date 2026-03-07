/**
 * Minimal types for API request/response shapes.
 * Can be refined from ePages API RAML/schema if needed.
 */

/** Common paged list response (products, orders, customers). */
export interface PagedResponse<T> {
  items: T[];
  results: number;
  page: number;
}

/** JSON Patch operation (RFC 6902) for PATCH requests. */
export interface JsonPatchOperation {
  op: "add" | "remove" | "replace";
  path: string;
  value?: unknown;
}

export interface ClientOptions {
  host: string;
  shop: string;
  token: string;
  /** Default locale for product/order requests (e.g. "de_DE"). Passed when params omit locale. */
  locale?: string;
  /** Default currency for product/order requests (e.g. "EUR"). Passed when params omit currency. */
  currency?: string;
  /** Optional fetch implementation (e.g. for tests). */
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

/** Default request params applied to product/order calls when not specified per call. Extend with more keys as needed. */
export interface ClientDefaults {
  locale?: string;
  currency?: string;
}

/** Query params for products list (from products.raml). */
export interface ProductsListParams {
  locale?: string;
  currency?: string;
  page?: number;
  resultsPerPage?: number;
  sort?: "name" | "price";
  direction?: "asc" | "desc";
  q?: string;
  categoryId?: string;
  id?: string[];
  includeInvisible?: boolean;
}

/** Query params for products get/create/patch. */
export interface ProductsGetParams {
  locale?: string;
  currency?: string;
}

/** Query params for GET /products/{productId}/variations (list variations). */
export interface ProductsVariationsParams {
  locale?: string;
  page?: number;
  resultsPerPage?: number;
}

/** Query params for getWithVariations (product get + variations list). */
export interface ProductsGetWithVariationsParams {
  locale?: string;
  currency?: string;
  page?: number;
  resultsPerPage?: number;
}

/** Query params for orders list (from orders.raml). */
export interface OrdersListParams {
  locale?: string;
  page?: number;
  resultsPerPage?: number;
  viewedOn?: boolean;
  pendingOn?: boolean;
  archivedOn?: boolean;
  rejectedOn?: boolean;
  closedOn?: boolean;
  dispatchedOn?: boolean;
  paidOn?: boolean;
  returnedOn?: boolean;
  deliveredOn?: boolean;
  invoicedOn?: boolean;
  lastUpdated?: boolean;
  customerId?: string;
  productId?: string;
  updatedFrom?: string;
  createdBefore?: string;
  createdAfter?: string;
  currency?: string;
}

/** Query params for orders get. */
export interface OrdersGetParams {
  locale?: string;
}

/** Query params for customers list (paged only). */
export interface CustomersListParams {
  page?: number;
  resultsPerPage?: number;
}
