import { beforeEach, describe, expect, it, vi } from "vitest";
import { EpagesClient } from "../client.js";

/**
 * Products resource tests — paths and params per ePages API RAML (products)
 * GET /products (locale, currency, page, resultsPerPage, sort, direction, q, categoryId, id[], includeInvisible)
 * GET /products/{productId} (locale, currency)
 * POST /products (body + locale, currency)
 * PATCH /products/{productId} (JSON Patch array + locale, currency)
 * DELETE /products/{productId}
 */

describe("client.products", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it("list() GET products with no params", async () => {
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
    await client.products.list();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://shop.de/rs/shops/S/products",
      expect.any(Object),
    );
  });

  it("list() GET products with locale, currency, page, resultsPerPage, sort, direction (RAML traits)", async () => {
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
    await client.products.list({
      locale: "de_DE",
      currency: "EUR",
      page: 2,
      resultsPerPage: 20,
      sort: "price",
      direction: "desc",
    });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("locale=de_DE");
    expect(url).toContain("currency=EUR");
    expect(url).toContain("page=2");
    expect(url).toContain("resultsPerPage=20");
    expect(url).toContain("sort=price");
    expect(url).toContain("direction=desc");
  });

  it("list() GET products with q, categoryId, id (repeatable), includeInvisible (RAML queryParameters)", async () => {
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
    await client.products.list({
      q: "jacket",
      categoryId: "cat-1",
      id: ["id-a", "id-b"],
      includeInvisible: true,
    });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("q=jacket");
    expect(url).toContain("categoryId=cat-1");
    expect(url).toContain("id=id-a");
    expect(url).toContain("id=id-b");
    expect(url).toContain("includeInvisible=true");
  });

  it("get(productId) GET products/{productId} with locale, currency", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ productId: "P1", name: "Product" }), {
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
    await client.products.get("P1", { locale: "de_DE", currency: "EUR" });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://shop.de/rs/shops/S/products/P1?locale=de_DE&currency=EUR",
    );
  });

  it("create(body) POST products with locale, currency", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ productId: "new-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EpagesClient({
      host: "shop.de",
      shop: "S",
      token: "t",
      fetch: mockFetch,
    });
    await client.products.create(
      { productNumber: "SKU1", name: "New" },
      { locale: "de_DE", currency: "EUR" },
    );
    expect(mockFetch.mock.calls[0][0]).toContain("/products");
    expect(mockFetch.mock.calls[0][0]).toContain("locale=de_DE");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    expect(mockFetch.mock.calls[0][1].body).toBe(
      JSON.stringify({ productNumber: "SKU1", name: "New" }),
    );
  });

  it("patch(productId, operations) PATCH products/{productId} with JSON Patch array", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ productId: "P1" }), {
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
    const ops = [{ op: "replace" as const, path: "/name", value: "New Name" }];
    await client.products.patch("P1", ops, {
      locale: "de_DE",
      currency: "EUR",
    });
    expect(mockFetch.mock.calls[0][0]).toContain("/products/P1");
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
    expect(mockFetch.mock.calls[0][1].headers["Content-Type"]).toBe(
      "application/json-patch+json",
    );
    expect(mockFetch.mock.calls[0][1].body).toBe(JSON.stringify(ops));
  });

  it("delete(productId) DELETE products/{productId}", async () => {
    mockFetch.mockResolvedValueOnce(new Response(undefined, { status: 204 }));
    const client = new EpagesClient({
      host: "shop.de",
      shop: "S",
      token: "t",
      fetch: mockFetch,
    });
    await client.products.delete("P1");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://shop.de/rs/shops/S/products/P1",
    );
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
  });
});
