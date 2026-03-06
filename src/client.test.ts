import { beforeEach, describe, expect, it, vi } from "vitest";
import { EpagesClient } from "./client.js";
import { ConfigurationError } from "./errors.js";

describe("EpagesClient", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it("throws ConfigurationError when host is missing", () => {
    expect(() => new EpagesClient({ host: "", shop: "S", token: "t" })).toThrow(
      ConfigurationError,
    );
    expect(
      () => new EpagesClient({ host: "  ", shop: "S", token: "t" }),
    ).toThrow(ConfigurationError);
  });

  it("throws ConfigurationError when shop is missing", () => {
    expect(() => new EpagesClient({ host: "h", shop: "", token: "t" })).toThrow(
      ConfigurationError,
    );
  });

  it("throws ConfigurationError when token is missing", () => {
    expect(() => new EpagesClient({ host: "h", shop: "s", token: "" })).toThrow(
      ConfigurationError,
    );
  });

  it("exposes products, orders, customers and request", () => {
    const client = new EpagesClient({ host: "h", shop: "s", token: "t" });
    expect(client.products).toBeDefined();
    expect(client.orders).toBeDefined();
    expect(client.customers).toBeDefined();
    expect(client.request).toBeDefined();
    expect(typeof client.products.list).toBe("function");
    expect(typeof client.products.get).toBe("function");
    expect(typeof client.orders.list).toBe("function");
    expect(typeof client.orders.get).toBe("function");
    expect(typeof client.customers.list).toBe("function");
    expect(typeof client.customers.get).toBe("function");
    expect(typeof client.request).toBe("function");
  });

  it("uses default locale and currency when set on client", async () => {
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
      locale: "de_DE",
      currency: "EUR",
      fetch: mockFetch,
    });
    await client.products.list();
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("locale=de_DE");
    expect(url).toContain("currency=EUR");
  });

  it("request('GET', path) forwards to REST layer with correct URL", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ default: "en_GB", items: ["en_GB"] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EpagesClient({
      host: "api.example.com",
      shop: "MyShop",
      token: "secret",
      fetch: mockFetch,
    });
    const out = await client.request("GET", "locales");
    expect(out).toEqual({ default: "en_GB", items: ["en_GB"] });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0];
    expect(url).toBe("https://api.example.com/rs/shops/MyShop/locales");
  });

  it("request('POST', path, { body }) forwards body to REST layer", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "cart-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EpagesClient({
      host: "h",
      shop: "s",
      token: "t",
      fetch: mockFetch,
    });
    await client.request("POST", "carts", { body: { currency: "EUR" } });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/carts"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ currency: "EUR" }),
      }),
    );
  });
});
