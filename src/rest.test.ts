import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, TooManyRequestsError } from "./errors.js";
import { createRestClient } from "./rest.js";

/**
 * REST layer tests derived from API docs:
 * - Base URL: https://{host}/rs/shops/{shop}/
 * - Headers: Accept application/vnd.epages.v1+json, Content-Type, Authorization Bearer, User-Agent
 * - 429 -> TooManyRequestsError, other non-2xx -> ApiError
 */

describe("createRestClient", () => {
  const host = "www.example.com";
  const shop = "TestShop";
  const token = "test-token";

  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it("builds correct base URL for GET (docs: base path /rs/shops/{shopId}/)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], results: 0, page: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });
    await rest.get("products");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://www.example.com/rs/shops/TestShop/products",
    );
  });

  it("appends query params correctly", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], results: 0, page: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });
    await rest.get("products", { locale: "de_DE", currency: "EUR", page: 2 });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("locale=de_DE");
    expect(url).toContain("currency=EUR");
    expect(url).toContain("page=2");
  });

  it("sends required headers (docs: Accept, Authorization Bearer, User-Agent)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });
    await rest.get("products");

    const init = mockFetch.mock.calls[0][1];
    expect(init.headers.Accept).toBe("application/vnd.epages.v1+json");
    expect(init.headers.Authorization).toBe("Bearer test-token");
    expect(init.headers["User-Agent"]).toBe("epages-rest-node/1.0.0");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("POST sends Content-Type application/json and JSON body", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });
    await rest.post("products", { name: "Foo" });

    const init = mockFetch.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ name: "Foo" }));
  });

  it("PATCH sends Content-Type application/json-patch+json (docs/RAML)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });
    await rest.patch("products/id-1", [
      { op: "replace", path: "/name", value: "New" },
    ]);

    const init = mockFetch.mock.calls[0][1];
    expect(init.method).toBe("PATCH");
    expect(init.headers["Content-Type"]).toBe("application/json-patch+json");
    expect(init.body).toBe(
      JSON.stringify([{ op: "replace", path: "/name", value: "New" }]),
    );
  });

  it("DELETE returns void on 204 No Content (docs: response codes)", async () => {
    mockFetch.mockResolvedValueOnce(new Response(undefined, { status: 204 }));
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });
    const result = await rest.delete("products/id-1");
    expect(result).toBeUndefined();
  });

  it("throws TooManyRequestsError on 429 (docs: API call limit)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });

    try {
      await rest.get("products");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(TooManyRequestsError);
      expect((e as TooManyRequestsError).status).toBe(429);
    }
  });

  it("throws ApiError on other non-2xx (docs: response codes 4xx, 5xx)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });

    try {
      await rest.get("products/bad-id");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(404);
    }
  });

  it("repeatable query param id (RAML: id repeatable for products)", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [], results: 0, page: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const rest = createRestClient({ host, shop, token, fetch: mockFetch });
    await rest.get("products", { id: ["id1", "id2"] });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("id=id1");
    expect(url).toContain("id=id2");
  });
});
