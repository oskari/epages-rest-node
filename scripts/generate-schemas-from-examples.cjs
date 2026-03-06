/**
 * Infers OpenAPI/JSON Schema from all response example JSON files in docs/raml (RAML/docs-based).
 * Discovers examples/*_response.json under each resource in docs/raml, derives schema names from filenames.
 * Run before inject-schemas: node scripts/generate-schemas-from-examples.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const docsRoot = path.join(projectRoot, "docs", "raml");
const outDir = path.join(projectRoot, "openapi", "schemas");

/**
 * Infer a JSON Schema (OpenAPI-compatible) from a JSON value.
 * All types inlined (no $ref) so each file is self-contained.
 */
function inferSchema(value) {
  if (value === null) {
    return { type: "string", nullable: true };
  }
  if (Array.isArray(value)) {
    const itemSchema =
      value.length > 0 ? inferSchema(value[0]) : { type: "object" };
    return { type: "array", items: itemSchema };
  }
  if (typeof value === "object") {
    const properties = {};
    for (const [k, v] of Object.entries(value)) {
      properties[k] = inferSchema(v);
    }
    return { type: "object", properties };
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  }
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "string") return { type: "string" };
  return { type: "string" };
}

/** "get_product_productid_response" -> "GetProductProductid" */
function toPascalCase(s) {
  return s
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Recursively find all *response*.json (or *_response.json) under dir.
 * Returns list of { absolutePath, relativePath } where relativePath is from docsRoot.
 */
function discoverResponseExamples(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full);
    if (e.isDirectory()) {
      results.push(...discoverResponseExamples(full, baseDir));
    } else if (
      e.isFile() &&
      e.name.endsWith(".json") &&
      e.name.includes("_response")
    ) {
      results.push({ absolutePath: full, relativePath: rel });
    }
  }
  return results;
}

/**
 * Derive OpenAPI schema name from relative path.
 * "products/examples/get_product_productid_response.json" -> "GetProductProductid".
 * Duplicates (same filename in different folders) are made unique by prefixing folder in PascalCase.
 */
function schemaNameFromFilePath(relativePath, seenNames) {
  const parsed = path.parse(relativePath);
  const base = parsed.name.replace(/_response$/, "");
  const rawName = toPascalCase(base);
  const folder = path.dirname(relativePath).split(path.sep)[0] || "";
  const folderPascal = toPascalCase(folder.replace(/-/g, "_"));
  let name = rawName;
  if (seenNames.has(name)) {
    name = folderPascal + name;
  }
  if (seenNames.has(name)) {
    name = `${folderPascal}_${rawName}`;
  }
  seenNames.add(name);
  return name;
}

fs.mkdirSync(outDir, { recursive: true });

const files = discoverResponseExamples(docsRoot);
const seenNames = new Set();

for (const { absolutePath, relativePath } of files) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (err) {
    console.warn("Skip (invalid JSON):", relativePath, err.message);
    continue;
  }
  if (typeof json !== "object" || json === null) {
    console.warn("Skip (root not object):", relativePath);
    continue;
  }
  const schema = {
    type: "object",
    description: `ePages response (inferred from docs/raml ${relativePath})`,
    ...inferSchema(json),
  };
  const name = schemaNameFromFilePath(relativePath, seenNames);
  const outPath = path.join(outDir, `${name}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(schema, null, 2)}\n`);
  console.log("Wrote", outPath);
}

console.log("Generated", files.length, "schemas from docs/raml examples.");
