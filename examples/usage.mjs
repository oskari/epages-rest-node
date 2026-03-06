/**
 * Usage examples for epages-rest-node.
 *
 * Set credentials via environment variables, then run from repo root:
 *
 *   npm run build
 *   EPAGES_HOST=www.yourshop.de EPAGES_SHOP=YourShop EPAGES_TOKEN=your-token node examples/usage.mjs
 *
 * Or with a .env file (not committed): use dotenv or export the vars in your shell.
 */

import { EpagesClient } from "epages-rest-node";

const host = process.env.EPAGES_HOST;
const shop = process.env.EPAGES_SHOP;
const token = process.env.EPAGES_TOKEN;

if (!host || !shop || !token) {
  console.error(
    "Set EPAGES_HOST, EPAGES_SHOP and EPAGES_TOKEN to run this example.\n" +
      "Example: EPAGES_HOST=www.meinshop.de EPAGES_SHOP=DemoShop EPAGES_TOKEN=xxx node examples/usage.mjs",
  );
  process.exit(1);
}

const client = new EpagesClient({ host, shop, token });

async function main() {
  try {
    // --- Products ---
    console.log("Listing products (first page)...");
    const productList = await client.products.list({
      locale: "de_DE",
      currency: "EUR",
      page: 1,
      resultsPerPage: 5,
      sort: "name",
      direction: "asc",
    });
    console.log(
      `  Found ${productList.results} total, page ${productList.page}: ${productList.items.length} items`,
    );

    if (productList.items.length > 0) {
      const firstId = productList.items[0].productId ?? productList.items[0].id;
      if (firstId) {
        console.log("Getting first product by id...");
        const product = await client.products.get(firstId, {
          locale: "de_DE",
          currency: "EUR",
        });
        console.log(
          "  Product:",
          typeof product === "object" && product?.name ? product.name : firstId,
        );
      }
    }

    // --- Orders ---
    console.log("Listing orders (first page)...");
    const orderList = await client.orders.list({
      locale: "de_DE",
      page: 1,
      resultsPerPage: 5,
    });
    console.log(
      `  Found ${orderList.results} total, page ${orderList.page}: ${orderList.items.length} items`,
    );

    // --- Customers ---
    console.log("Listing customers (first page)...");
    const customerList = await client.customers.list({
      page: 1,
      resultsPerPage: 5,
    });
    console.log(
      `  Found ${customerList.results} total, page ${customerList.page}: ${customerList.items.length} items`,
    );

    // --- Low-level request (e.g. locales not implemented as a resource) ---
    console.log("Fetching locales via client.request('GET', 'locales')...");
    const locales = await client.request("GET", "locales");
    console.log(
      "  Locales:",
      Array.isArray(locales?.items) ? locales.items : locales,
    );
  } catch (err) {
    console.error("Error:", err.message);
    if (err.status) console.error("  Status:", err.status);
    if (err.body) console.error("  Body:", err.body);
    process.exit(1);
  }
}

main();
