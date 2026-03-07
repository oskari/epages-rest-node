import type { components } from "../generated/api.js";
import type { RestClient } from "../rest.js";
import type {
  ClientDefaults,
  PagedResponse,
  ProductsGetParams,
  ProductsGetWithVariationsParams,
  ProductsListParams,
  ProductsVariationsParams,
} from "../types.js";

type Product = components["schemas"]["GetProductProductid"];
type ProductVariations = components["schemas"]["GetProductProductidVariations"];

const PATH = "products";

function mergeLocaleCurrency(
  defaults: ClientDefaults | undefined,
  params: ProductsGetParams | ProductsListParams | undefined,
) {
  const locale = params?.locale ?? defaults?.locale;
  const currency = params?.currency ?? defaults?.currency;
  return { locale, currency };
}

function mergeVariationsParams(
  defaults: ClientDefaults | undefined,
  params: ProductsVariationsParams | undefined,
) {
  const locale = params?.locale ?? defaults?.locale;
  return {
    ...(locale && { locale }),
    ...(params?.page !== undefined && { page: params.page }),
    ...(params?.resultsPerPage !== undefined && {
      resultsPerPage: params.resultsPerPage,
    }),
  };
}

export function createProductsResource(
  rest: RestClient,
  defaults?: ClientDefaults,
) {
  return {
    /** GET /products — list products (RAML: locale, currency, paged, direction, sort, q, categoryId, id[], includeInvisible). */
    list<T = Product>(params?: ProductsListParams): Promise<PagedResponse<T>> {
      const { locale, currency } = mergeLocaleCurrency(defaults, params);
      const q =
        params || locale || currency
          ? {
              ...(locale && { locale }),
              ...(currency && { currency }),
              ...(params?.page !== undefined && { page: params.page }),
              ...(params?.resultsPerPage !== undefined && {
                resultsPerPage: params.resultsPerPage,
              }),
              ...(params?.sort && { sort: params.sort }),
              ...(params?.direction && { direction: params.direction }),
              ...(params?.q && { q: params.q }),
              ...(params?.categoryId && { categoryId: params.categoryId }),
              ...(params?.id?.length && { id: params.id }),
              ...(params?.includeInvisible !== undefined && {
                includeInvisible: params.includeInvisible,
              }),
            }
          : undefined;
      return rest.get<PagedResponse<T>>(PATH, q);
    },

    /** GET /products/{productId} */
    get<T = Product>(
      productId: string,
      params?: ProductsGetParams,
    ): Promise<T> {
      const { locale, currency } = mergeLocaleCurrency(defaults, params);
      const q =
        locale || currency
          ? { ...(locale && { locale }), ...(currency && { currency }) }
          : undefined;
      return rest.get<T>(`${PATH}/${productId}`, q);
    },

    /** POST /products — create product (body + locale, currency). */
    create<T = Product>(body: unknown, params?: ProductsGetParams): Promise<T> {
      const { locale, currency } = mergeLocaleCurrency(defaults, params);
      const q =
        locale || currency
          ? { ...(locale && { locale }), ...(currency && { currency }) }
          : undefined;
      return rest.post<T>(PATH, body, q);
    },

    /** PATCH /products/{productId} — JSON Patch array (RFC 6902). */
    patch<T = Product>(
      productId: string,
      operations: unknown[],
      params?: ProductsGetParams,
    ): Promise<T> {
      const { locale, currency } = mergeLocaleCurrency(defaults, params);
      const q =
        locale || currency
          ? { ...(locale && { locale }), ...(currency && { currency }) }
          : undefined;
      return rest.patch<T>(`${PATH}/${productId}`, operations, q);
    },

    /** DELETE /products/{productId} */
    delete(productId: string): Promise<void> {
      return rest.delete(`${PATH}/${productId}`);
    },

    /** GET /products/{productId}/variations — list product variations. */
    variations<T = ProductVariations>(
      productId: string,
      params?: ProductsVariationsParams,
    ): Promise<T> {
      const q = mergeVariationsParams(defaults, params);
      const query = Object.keys(q).length ? q : undefined;
      return rest.get<T>(`${PATH}/${productId}/variations`, query);
    },

    /** POST /products/{productId}/variations — create product variations. */
    createVariations(
      productId: string,
      body: unknown,
      _params?: ProductsGetParams,
    ): Promise<void> {
      return rest.post<void>(`${PATH}/${productId}/variations`, body);
    },

    /** Fetches the product and its variations in one call (GET product + GET variations in parallel). */
    getWithVariations<T = Product>(
      productId: string,
      params?: ProductsGetWithVariationsParams,
    ): Promise<{ product: T; variations: ProductVariations }> {
      const { locale, currency } = mergeLocaleCurrency(defaults, params);
      const productQ =
        locale || currency
          ? { ...(locale && { locale }), ...(currency && { currency }) }
          : undefined;
      const variationsQ = mergeVariationsParams(defaults, params);
      const variationsQuery = Object.keys(variationsQ).length
        ? variationsQ
        : undefined;
      return Promise.all([
        rest.get<T>(`${PATH}/${productId}`, productQ),
        rest.get<ProductVariations>(
          `${PATH}/${productId}/variations`,
          variationsQuery,
        ),
      ]).then(([product, variations]) => ({ product, variations }));
    },
  };
}
