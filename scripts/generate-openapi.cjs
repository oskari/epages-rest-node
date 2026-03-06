/**
 * Converts docs/raml/api.raml to OpenAPI 3.x and writes openapi/api.yaml.
 * Run from project root: npm run generate:openapi
 */
const Converter = require("api-spec-converter");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const ramlPath = path.join(projectRoot, "docs", "raml", "api.raml");
const outDir = path.join(projectRoot, "openapi");
const outPath = path.join(outDir, "api.yaml");

Converter.convert({
  from: "raml",
  to: "openapi_3",
  source: ramlPath,
})
  .then((converted) => {
    const yaml = converted.stringify({ syntax: "yaml", order: "openapi" });
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, yaml);
    console.log("Written", outPath);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
