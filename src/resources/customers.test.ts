import { beforeEach, describe, expect, it, vi } from "vitest";
import { EpagesClient } from "../client.js";

/**
 * Customers resource tests — paths and params per ePages API RAML (customers)
 * GET /customers (paged: page, resultsPerPage)
 * POST /customers (body)
 * GET /customers/{customerId}
 * PATCH /customers/{customerId} (JSON Patch array)
 */

describe("client.customers", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it("list() GET customers with no params", async () => {
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
    await client.customers.list();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://shop.de/rs/shops/S/customers",
      expect.any(Object),
    );
  });

  it("list() GET customers with page, resultsPerPage (RAML: is [paged])", async () => {
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
    await client.customers.list({ page: 2, resultsPerPage: 25 });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("page=2");
    expect(url).toContain("resultsPerPage=25");
  });

  it("get(customerId) GET customers/{customerId}", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ customerId: "C1", email: "a@b.com" }), {
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
    await client.customers.get("C1");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://shop.de/rs/shops/S/customers/C1",
    );
  });

  it("create(body) POST customers", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ customerId: "new-1" }), {
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
    await client.customers.create({
      email: "new@example.com",
      firstName: "John",
    });
    expect(mockFetch.mock.calls[0][0]).toContain("/customers");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    expect(mockFetch.mock.calls[0][1].body).toBe(
      JSON.stringify({ email: "new@example.com", firstName: "John" }),
    );
  });

  it("patch(customerId, operations) PATCH customers/{customerId} with JSON Patch array", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ customerId: "C1" }), {
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
    const ops = [
      { op: "replace" as const, path: "/billingAddress", value: {} },
    ];
    await client.customers.patch("C1", ops);
    expect(mockFetch.mock.calls[0][0]).toContain("/customers/C1");
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
    expect(mockFetch.mock.calls[0][1].headers["Content-Type"]).toBe(
      "application/json-patch+json",
    );
    expect(mockFetch.mock.calls[0][1].body).toBe(JSON.stringify(ops));
  });
});
