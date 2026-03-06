import type { components } from "../generated/api.js";
import type { RestClient } from "../rest.js";
import type {
  ClientDefaults,
  OrdersGetParams,
  OrdersListParams,
  PagedResponse,
} from "../types.js";

type Order = components["schemas"]["GetOrderOrderid"];

const PATH = "orders";

export function createOrdersResource(
  rest: RestClient,
  defaults?: ClientDefaults,
) {
  return {
    /** GET /orders — list orders (RAML: locale, paged, status filters, customerId, productId, updatedFrom, createdBefore, createdAfter, currency). */
    list<T = Order>(params?: OrdersListParams): Promise<PagedResponse<T>> {
      const merged = {
        ...(defaults && {
          ...(defaults.locale && { locale: defaults.locale }),
          ...(defaults.currency && { currency: defaults.currency }),
        }),
        ...params,
      };
      const q =
        Object.keys(merged).length > 0 ? toOrdersQuery(merged) : undefined;
      return rest.get<PagedResponse<T>>(PATH, q);
    },

    /** GET /orders/{orderId} */
    get<T = Order>(orderId: string, params?: OrdersGetParams): Promise<T> {
      const locale = params?.locale ?? defaults?.locale;
      const q = locale !== undefined ? { locale } : undefined;
      return rest.get<T>(`${PATH}/${orderId}`, q);
    },
  };
}

function toOrdersQuery(
  p: OrdersListParams,
): Record<string, string | number | boolean> {
  const q: Record<string, string | number | boolean> = {};
  if (p.locale !== undefined) q.locale = p.locale;
  if (p.page !== undefined) q.page = p.page;
  if (p.resultsPerPage !== undefined) q.resultsPerPage = p.resultsPerPage;
  if (p.viewedOn !== undefined) q.viewedOn = p.viewedOn;
  if (p.pendingOn !== undefined) q.pendingOn = p.pendingOn;
  if (p.archivedOn !== undefined) q.archivedOn = p.archivedOn;
  if (p.rejectedOn !== undefined) q.rejectedOn = p.rejectedOn;
  if (p.closedOn !== undefined) q.closedOn = p.closedOn;
  if (p.dispatchedOn !== undefined) q.dispatchedOn = p.dispatchedOn;
  if (p.paidOn !== undefined) q.paidOn = p.paidOn;
  if (p.returnedOn !== undefined) q.returnedOn = p.returnedOn;
  if (p.deliveredOn !== undefined) q.deliveredOn = p.deliveredOn;
  if (p.invoicedOn !== undefined) q.invoicedOn = p.invoicedOn;
  if (p.lastUpdated !== undefined) q.lastUpdated = p.lastUpdated;
  if (p.customerId !== undefined) q.customerId = p.customerId;
  if (p.productId !== undefined) q.productId = p.productId;
  if (p.updatedFrom !== undefined) q.updatedFrom = p.updatedFrom;
  if (p.createdBefore !== undefined) q.createdBefore = p.createdBefore;
  if (p.createdAfter !== undefined) q.createdAfter = p.createdAfter;
  if (p.currency !== undefined) q.currency = p.currency;
  return q;
}
