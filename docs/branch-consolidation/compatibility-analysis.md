# Cross-Repository Compatibility Analysis — admin-panel ↔ website

See the website repo's `compatibility-analysis.md` for the full write-up;
this is the admin-side half.

## Aligned

- Same `VITE_API_BASE_URL` env var, same `/api` fallback.
- Same cookie-session (`credentials: "include"`) + single-retry
  `/auth/refresh` pattern in `apiRequest`, implemented almost identically
  in both repos' `utils/api.js`.

## Divergent, flagged, not changed

1. **`authToken` in `localStorage` is a local UI-only flag, not a bearer
   token.** `ProtectedRoute`/`PublicRoute` in `App.jsx` gate on
   `!!localStorage.getItem('authToken')`, but `utils/api.js` never reads
   it or attaches it as a header — every real request relies on the
   shared httpOnly cookie, same as the website. Naming is inconsistent
   with the website's `doctor_mom_2_user` key, but there's no functional
   conflict since neither key is actually sent over the wire.

2. **No Google SSO.** Confirmed no OAuth code path anywhere in
   `src/pages/Login.jsx` on any branch. The website has a fully working
   Google SSO flow (`?mode=login|signup` redirect,
   `?google_error=` callback handling). Whether admin accounts are
   meant to support Google sign-in is a product question this
   consolidation can't answer from code alone — flagged for the team.

3. **Pricing model.** Admin panel is the authority for `priceInPaise`
   (integer, converted to/from rupees via `paiseToRupees`/
   `rupeesToPaise` in `utils/adminData.js`) on Course and Chapter
   entities only, per main's `ed2f362` decision to drop class/subject/
   lesson-level pricing as unsupported. The website reads a
   pre-formatted `course.price` string, consistent with this — the admin
   panel edits the source of truth, the website displays a derived
   value. No conflict found, but see the website's own doc for a caveat
   about `Payment.jsx`'s hardcoded price fallbacks.

4. **Quiz/assessment schema.** `Chapters.jsx`'s assessment builder
   (kept from main, see feature-matrix.md) sends
   `{ question, options: [4 strings], answer }` per question as part of
   the chapter payload. The website repo has **no quiz-rendering or
   quiz-taking UI at all** — nothing in `drmom-website/src/pages`
   consumes an `assessments` field. This means the admin panel can author
   quiz content today with no way for a student to see or take it on the
   website. This is a real, load-bearing gap: worth flagging to the
   product/backend team as the next concrete cross-repo feature to build,
   not something fixable by this consolidation task (it would require
   new website pages and a new API contract, out of scope here).
