# Health Checks

Use these endpoints for monitoring. They do not require auth and do not redirect.

## Back-end (Express API)
- `GET /api/healthz` (with `/healthz` retained as a monitor alias)
  - returns `200` with `ok`, release version, and full source revision
- `GET /api/readyz` (with `/readyz` retained as a monitor alias)
  - returns `200 {"ready":true,"components":{"db":{"ok":true,"state":1}}}` when Mongo is connected and pingable
  - returns `503 {"ready":false,...}` when Mongo is unavailable
- `GET /api/internal/dbinfo`
  - internal diagnostics only
  - requires the 32+ character `INTERNAL_DIAGNOSTICS_KEY` header in production
  - returns `403` when configured but unauthorized and `404` when disabled

Use `/api/healthz` and `/api/readyz` for monitors. Do not use `/`, login pages, or diagnostics.
