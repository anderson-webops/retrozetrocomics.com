# Health Checks

Use these endpoints for monitoring. They do not require auth and do not redirect.

## Back-end (Express API)
- `GET` or `HEAD /api/healthz` (with `/healthz` retained as a monitor alias)
  - returns `200` with exactly `{"ok":true}` for `GET` and an empty body for `HEAD`
- `GET` or `HEAD /api/readyz` (with `/readyz` retained as a monitor alias)
  - returns `200` with exactly `{"ok":true}` when required dependencies are ready
  - returns `503` with exactly `{"ok":false}` when they are unavailable
  - `HEAD` returns the same status with an empty body
- `GET /api/internal/dbinfo`
  - internal diagnostics only
  - requires the 32+ character `INTERNAL_DIAGNOSTICS_KEY` header in production
  - returns `403` when configured but unauthorized and `404` when disabled
  - the public Nginx route always returns `404`; operators may query the loopback service with the diagnostics key

Every probe sets `Cache-Control: no-store` and returns no cookies, redirects,
authentication challenges, secrets, dependency names, database names, host
details, process metrics, release metadata, or environment information. Use
`/release.json` for release identity. Use `/api/healthz` and `/api/readyz` for
monitors. Do not use `/`, login pages, or diagnostics.
