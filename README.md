# retrozetrocomics.com

Website and supporting API for `retrozetrocomics.com`.

## Repo Layout

- `front-end/` - Vite SSG application
- `back-end/` - Express + MongoDB API
- `HEALTHCHECKS.md` - monitor endpoints and expected `200`/`503` behavior

## Common Commands

```bash
npm install
npm run dev
npm run server
npm run serve
npm run build
npm run up
```

## Operational Notes

- The root `package-lock.json` is the authoritative lockfile for monorepo installs from the repo root.
- `back-end/package-lock.json` is the authoritative lockfile for standalone installs and deploys that run from inside `back-end/`.
- Use `npm run server` and `npm run serve` when you want the API and front-end started separately.
- Use [`HEALTHCHECKS.md`](./HEALTHCHECKS.md) for deployment monitor targets instead of `/`.
- The backend runtime user must have write access to `back-end/uploads` and `back-end/uploads/content`. Uploads are written under `back-end/uploads/content/YYYY-MM`, so deploys should provision those directories before the API starts.
