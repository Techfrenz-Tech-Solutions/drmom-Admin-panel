# Security Findings — drmom-Admin-panel

## Secrets scan

Same methodology as the website repo — scanned **full reachable history**
(`git rev-list --all`) across all three branches for:

- `API_KEY|SECRET|PASSWORD|PRIVATE_KEY|BEARER|sk_live|sk_test|AIza…|-----BEGIN|TOKEN`
- Any committed `.env*` file
- Any committed certificate/key file (`.pem`, `.key`, `.crt`, `.p12`)

**Result: zero matches.** No secrets, no `.env` file, no private
key/cert ever committed on any branch.

`.gitignore` correctly excludes `.env` and its variants (`.env.local`,
`.env.development.local`, `.env.test.local`, `.env.production.local`),
plus `dist/`, `dist-ssr/`, `node_modules/`.

## Configuration review

- `API_BASE_URL` from `import.meta.env.VITE_API_BASE_URL` — same
  browser-exposed public pattern as the website, appropriate.
- Bunny Stream/TUS upload code (`src/pages/Chapters.jsx`) sends uploads
  through the app's own backend proxy rather than embedding a Bunny API
  key client-side — no direct-to-Bunny credential exposure found.
- `authToken` in `localStorage` (see compatibility-analysis.md) is a
  client-only UI flag, not a real credential — its presence in
  localStorage is not a secrets-exposure finding, since it carries no
  actual authorization power (the real session is the httpOnly cookie).

## Recommendation

No remediation required for this repository. As with the website repo,
`gitleaks`/`trufflehog` were unavailable in this environment; findings
rest on a manual `git grep` sweep across full history.
