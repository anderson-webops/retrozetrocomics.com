# Health Checks

Use these endpoints for monitoring. They do not require auth and do not redirect.

## Back-end (Express API)
- `GET /api/healthz` (with `/healthz` retained as a monitor alias)
  - returns `200` with `ok`, normalized release version, full source revision, and exact deployment timestamp
- `GET /api/readyz` (with `/readyz` retained as a monitor alias)
  - returns `200 {"ready":true,"components":{"db":{"ok":true,"state":1}}}` when Mongo is connected and pingable
  - returns `503 {"ready":false,...}` when Mongo is unavailable
- `GET /api/internal/dbinfo`
  - internal diagnostics only
  - requires the 32+ character `INTERNAL_DIAGNOSTICS_KEY` header in production
  - returns `403` when configured but unauthorized and `404` when disabled
  - the public Nginx route always returns `404`; operators may query the loopback service with the diagnostics key

Use `/api/healthz` and `/api/readyz` for monitors. Do not use `/`, login pages, or diagnostics.
