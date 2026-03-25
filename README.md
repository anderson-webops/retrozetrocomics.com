# RetroZetro Comics

## Workspace

```bash
npm install
```

```bash
npm run server
```

```bash
npm run serve
```

```bash
npm run build
```

```bash
npm run lint-fix
```

## Media Storage

Uploads still land on the application server today, but the media contract is
now designed around `provider + storageKey` instead of hardcoded local URLs.
That means a future S3 rollout does not need a schema rewrite or frontend API
change.

Current local behavior:

- files are written under `back-end/uploads/<storage-key>`
- public URLs are resolved from `LOCAL_UPLOAD_PUBLIC_BASE_URL`
- responses always rebuild asset URLs from `provider` and `storageKey`

Prepared AWS settings:

- `STORAGE_KEY_PREFIX`
- `LOCAL_UPLOAD_PUBLIC_BASE_URL`
- `AWS_S3_BUCKET`
- `AWS_S3_REGION`
- `AWS_S3_PUBLIC_BASE_URL`

Future S3 switch path:

1. Point the AWS variables at the target bucket or CloudFront URL.
2. Replace the local write driver in `back-end/src/services/storage.ts` with an
   S3 write driver.
3. Keep the same `storageKey` pattern so existing frontend contracts keep
   working.

Once that write driver is added, the rest of the app is already prepared to
serve S3-backed asset URLs.
