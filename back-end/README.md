# RetroZetro Back-end

Express and MongoDB API for `retrozetrocomics.com`.

## Upload Storage

- Uploaded files are written to `back-end/uploads/content/YYYY-MM`.
- The backend runtime user must have write access to:
  - `back-end/uploads`
  - `back-end/uploads/content`
- If those directories are missing or not writable, the API now logs the real filesystem error server-side and returns a sanitized upload failure message to clients instead of leaking internal paths.

## Deployment Note

If infrastructure or provisioning automation exists outside this repo, keep the upload directory ownership and ACLs aligned with the backend runtime user so deploys do not drift back into permission failures.
