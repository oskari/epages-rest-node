import type { components } from "./generated/api.js";

/** All API response/request body schemas (from docs/raml examples). Use for any endpoint, e.g. ApiSchemas["GetCategoryCategoryid"]. */
export type ApiSchemas = components["schemas"];

export type Product = ApiSchemas["GetProductProductid"];
export type Order = ApiSchemas["GetOrderOrderid"];
export type Cart = ApiSchemas["GetCartsCartid"];
export type PagedResponseProduct = ApiSchemas["GetProduct"];
export type PagedResponseOrder = ApiSchemas["GetOrder"];
export type PagedResponseCart = ApiSchemas["GetCarts"];

export type { RequestMethod, RequestOptions } from "./client.js";
export { EpagesClient } from "./client.js";
export {
  ApiError,
  ConfigurationError,
  TooManyRequestsError,
} from "./errors.js";
export {
  createRestClient,
  type RestClient,
  type RestClientOptions,
} from "./rest.js";
export type {
  ClientDefaults,
  ClientOptions,
  CustomersListParams,
  JsonPatchOperation,
  OrdersGetParams,
  OrdersListParams,
  PagedResponse,
  ProductsGetParams,
  ProductsListParams,
} from "./types.js";
