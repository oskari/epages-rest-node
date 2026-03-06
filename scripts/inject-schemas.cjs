/**
 * Injects components.schemas into openapi/api.yaml.
 * All schemas are loaded from openapi/schemas/*.json, which are generated from
 * docs/raml example JSON by generate-schemas-from-examples.cjs (entities and paged responses).
 * Run after generate:openapi and generate-schemas-from-examples: node scripts/inject-schemas.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const projectRoot = path.resolve(__dirname, "..");
const apiPath = path.join(projectRoot, "openapi", "api.yaml");
const schemasDir = path.join(projectRoot, "openapi", "schemas");

const doc = yaml.load(fs.readFileSync(apiPath, "utf8"));

const schemas = {};
const files = fs.readdirSync(schemasDir, { withFileTypes: true });
for (const dirent of files) {
  if (dirent.isFile() && dirent.name.endsWith(".json")) {
    const name = path.basename(dirent.name, ".json");
    schemas[name] = JSON.parse(
      fs.readFileSync(path.join(schemasDir, dirent.name), "utf8"),
    );
  }
}

doc.components = doc.components || {};
doc.components.schemas = schemas;

fs.writeFileSync(apiPath, yaml.dump(doc, { lineWidth: -1 }));
console.log("Injected components.schemas into", apiPath);
