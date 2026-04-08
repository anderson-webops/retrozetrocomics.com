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
- Static front-end builds now prerender published post pages and archive excerpts from the public API. If the build environment cannot reach the live site, set `VITE_SSG_API_BASE_URL` to an accessible API base URL such as `https://retrozetrocomics.com/api` before running `npm run -w front-end build`.
- If you override the public site hostname during builds, also set `VITE_PUBLIC_SITE_ORIGIN` so canonical URLs and SSG API resolution stay correct.
- Use [`HEALTHCHECKS.md`](./HEALTHCHECKS.md) for deployment monitor targets instead of `/`.
- The backend runtime user must have write access to `back-end/uploads` and `back-end/uploads/content`. Uploads are written under `back-end/uploads/content/YYYY-MM`, so deploys should provision those directories before the API starts.
