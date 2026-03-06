# Changelog

## 1.0.0

- Initial release.
- ESM-only TypeScript SDK for ePages Now REST API.
- Resources: products (list, get, create, patch, delete), orders (list, get), customers (list, get, create, patch).
- Low-level `client.request(method, path, options)` for unimplemented endpoints.
- Errors: `ApiError`, `TooManyRequestsError`, `ConfigurationError`.
