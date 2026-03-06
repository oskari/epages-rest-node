import { beforeEach, describe, expect, it, vi } from "vitest";
import { EpagesClient } from "../client.js";

/**
 * Orders resource tests — paths and params per ePages API RAML (orders)
 * GET /orders (locale, paged, viewedOn, pendingOn, archivedOn, rejectedOn, closedOn, dispatchedOn,
 *   paidOn, returnedOn, deliveredOn, invoicedOn, lastUpdated, customerId, productId,
 *   updatedFrom, createdBefore, createdAfter, currency)
 * GET /orders/{orderId} (locale)
 */

describe("client.orders", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it("list() GET orders with no params", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], results: 0, page: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EpagesClient({
      host: "shop.de",
      shop: "S",
      token: "t",
      fetch: mockFetch,
    });
    await client.orders.list();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://shop.de/rs/shops/S/orders",
      expect.any(Object),
    );
  });

  it("list() GET orders with locale, page, resultsPerPage (RAML: is [locale, paged])", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], results: 0, page: 2 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EpagesClient({
      host: "shop.de",
      shop: "S",
      token: "t",
      fetch: mockFetch,
    });
    await client.orders.list({
      locale: "de_DE",
      page: 2,
      resultsPerPage: 50,
    });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("locale=de_DE");
    expect(url).toContain("page=2");
    expect(url).toContain("resultsPerPage=50");
  });

  it("list() GET orders with status filters (RAML queryParameters)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], results: 0, page: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EpagesClient({
      host: "shop.de",
      shop: "S",
      token: "t",
      fetch: mockFetch,
    });
    await client.orders.list({
      paidOn: true,
      dispatchedOn: true,
      customerId: "cust-1",
      productId: "prod-1",
      currency: "EUR",
      createdAfter: "2024-01-01T00:00:00Z",
      createdBefore: "2024-12-31T23:59:59Z",
      updatedFrom: "2024-06-01T00:00:00Z",
      lastUpdated: true,
    });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("paidOn=true");
    expect(url).toContain("dispatchedOn=true");
    expect(url).toContain("customerId=cust-1");
    expect(url).toContain("productId=prod-1");
    expect(url).toContain("currency=EUR");
    expect(url).toContain("createdAfter=");
    expect(url).toContain("createdBefore=");
    expect(url).toContain("updatedFrom=");
    expect(url).toContain("lastUpdated=true");
  });

  it("get(orderId) GET orders/{orderId} with locale", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ orderId: "O1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EpagesClient({
      host: "shop.de",
      shop: "S",
      token: "t",
      fetch: mockFetch,
    });
    await client.orders.get("O1", { locale: "de_DE" });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://shop.de/rs/shops/S/orders/O1?locale=de_DE",
    );
  });
});
