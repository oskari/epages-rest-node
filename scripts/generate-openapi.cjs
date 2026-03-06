/**
 * Converts docs/raml/api.raml to OpenAPI 3.x and writes openapi/api.yaml.
 * Run from project root: npm run generate:openapi
 */
const { WebApiParser } = require("webapi-parser");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const ramlPath = path.join(projectRoot, "docs", "raml", "api.raml");
const outDir = path.join(projectRoot, "openapi");
const outPath = path.join(outDir, "api.yaml");

async function main() {
  await WebApiParser.init();
  const fileUrl = `file://${ramlPath}`;
  const model = await WebApiParser.raml08.parse(fileUrl);
  const resolved = await WebApiParser.raml08.resolve(model);
  const yaml = await WebApiParser.oas30.generateYamlString(resolved);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, yaml);
  console.log("Written", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
