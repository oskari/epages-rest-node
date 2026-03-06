# ePages REST SDK (Node.js)

TypeScript/Node.js SDK (ESM) for the [ePages Now REST API](https://developer.epages.com/apps/). Supports **products**, **orders**, and **customers**. Requires Node.js 22+.

This project is not affiliated with, endorsed by, or connected to ePages GmbH.

## Installation

```bash
npm install epages-rest-node
```

## Configuration

```ts
import { EpagesClient } from "epages-rest-node";

const client = new EpagesClient({
  host: "www.meinshop.de",
  shop: "DemoShop",
  token: "your-bearer-token",
  // Optional: default locale and currency for products and orders (per-call params override these)
  locale: "de_DE",
  currency: "EUR",
});
```

## Running the examples

From the repo root after `npm install` and `npm run build`:

```bash
EPAGES_HOST=www.yourshop.de EPAGES_SHOP=YourShop EPAGES_TOKEN=your-token node examples/usage.mjs
```

See [examples/usage.mjs](examples/usage.mjs) for a full runnable script (products list/get, orders list, customers list, and low-level `request("GET", "locales")`).

## Usage

### Products

```ts
// List products (with optional locale, currency, pagination, sort, filters)
const list = await client.products.list({
  locale: "de_DE",
  currency: "EUR",
  page: 1,
  resultsPerPage: 10,
  sort: "name",
  direction: "asc",
});

// Get single product
const product = await client.products.get("52F221E0-36F6-DC4E-384A-AC1504050C04", {
  locale: "de_DE",
  currency: "EUR",
});

// Create product
const created = await client.products.create(
  { productNumber: "SKU-001", name: "My Product", price: 9.99 },
  { locale: "de_DE", currency: "EUR" }
);

// Update product (JSON Patch)
await client.products.patch(
  productId,
  [{ op: "replace", path: "/name", value: "New Name" }],
  { locale: "de_DE", currency: "EUR" }
);

// Delete product
await client.products.delete(productId);
```

### Orders

```ts
// List orders
const orders = await client.orders.list({
  locale: "de_DE",
  page: 1,
  resultsPerPage: 20,
  paidOn: true,
});

// Get single order
const order = await client.orders.get(orderId, { locale: "de_DE" });
```

### Customers

```ts
// List customers
const customers = await client.customers.list({ page: 1, resultsPerPage: 20 });

// Get single customer
const customer = await client.customers.get(customerId);

// Create customer
const created = await client.customers.create({ email: "customer@example.com", ... });

// Update customer (JSON Patch)
await client.customers.patch(customerId, [
  { op: "replace", path: "/billingAddress", value: { ... } },
]);
```

### Low-level request (unimplemented endpoints)

For endpoints not covered by the method-based API (e.g. carts, categories, locales):

```ts
const data = await client.request("GET", "locales");
const shop = await client.request("GET", "");
```

## Errors

- `ConfigurationError` — missing or invalid `host`, `shop`, or `token`.
- `TooManyRequestsError` — API returned 429 (rate limit exceeded).
- `ApiError` — other non-2xx response; has `status` and `body`.

## Attribution

This SDK was developed using the [ePages developer documentation](https://developer.epages.com/apps/) (source: [epages-docs](https://github.com/ePages-de/epages-docs)). A subset of the API reference (REST only, trimmed for SDK use) is included in this repo under [docs/](docs/):

- **REST API docs** (`docs/rest/`) — editorial content under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **RAML API definitions and schemas** (`docs/raml/`) — under [MIT](https://opensource.org/licenses/MIT) (per epages-docs: “all other content”).

This project is not affiliated with ePages GmbH.

## License

MIT
