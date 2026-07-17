# Route Catalogue — drmom-Admin-panel

All routes defined centrally in `src/App.jsx`. Two top-level route trees:
`/login` (public, redirects away if already authenticated) and `/*`
(protected `Layout`, redirects to `/login` if not authenticated, gated by
presence of `localStorage.authToken`).

| Route | Component | Branches containing it | Nav entry | API dependency | Status on `consolidation/all-features` |
|---|---|---|---|---|---|
| `/login` | Login | all | — | `/admin/auth/login` (via `loginAdmin`) | present |
| `/` | Dashboard | all | Sidebar | `/admin/dashboard` | present |
| `/classes` | Classes | all | Sidebar (reordered ahead of Courses) | admin catalog | present |
| `/subjects` | Subjects | all | Sidebar (reordered ahead of Courses) | admin catalog | present |
| `/courses` | Courses | all | Sidebar | admin catalog | present |
| `/chapters` | Chapters | all (content differs — see feature-matrix) | Sidebar | Bunny Stream/Storage upload endpoints | present, **quiz builder kept from main** |
| `/videos` | Lesson (legacy "Lesson Master") | all | **not linked** — Sidebar entry deliberately commented out with a code comment: "legacy, superseded by Chapters" | — | present, intentionally unlinked (route exists as a fallback for old links, matches existing main-branch design intent) |
| `/prices` | Prices | all (content differs — see feature-matrix) | Sidebar | `/admin/courses/:id/price`, `/admin/chapters/:id/price` | present, main's version kept |
| `/users` | Users | all | Sidebar | admin catalog | present |
| `/orders` | Orders | all | Sidebar | admin catalog | present |
| `/enrollments` | Enrollments | all | Sidebar | admin catalog | present |
| `/student-progress` | StudentProgress | **Updated only** | Sidebar (now added) | none — stub "coming soon" | **restored/added** |
| `/payment-tracker` | PaymentTracker | **Updated only** | Sidebar (now added) | none — stub "coming soon" | **restored/added** |
| `/newsletter` | Newsletter | **Updated only** | Sidebar (now added) | none — stub "coming soon" | **restored/added** |
| `/storage` | Storage | **Updated only** | Sidebar (now added) | none — stub "coming soon" | **restored/added** |

No route exists without a page component. `/videos` is the one
intentional "route exists, not linked" case, and it was already that way
on `main` before this consolidation — not a regression introduced here.

## Route manifest

```json
[
  { "route": "/login",             "component": "Login",           "status": "tested" },
  { "route": "/",                  "component": "Dashboard",       "status": "tested" },
  { "route": "/classes",           "component": "Classes",         "status": "tested" },
  { "route": "/subjects",          "component": "Subjects",        "status": "tested" },
  { "route": "/courses",           "component": "Courses",         "status": "tested" },
  { "route": "/chapters",          "component": "Chapters",        "status": "tested, quiz builder retained from main" },
  { "route": "/videos",            "component": "Lesson",          "status": "tested, intentionally unlinked (legacy)" },
  { "route": "/prices",            "component": "Prices",          "status": "tested, main's simplified form retained" },
  { "route": "/users",             "component": "Users",           "status": "tested" },
  { "route": "/orders",            "component": "Orders",          "status": "tested" },
  { "route": "/enrollments",       "component": "Enrollments",     "status": "tested" },
  { "route": "/student-progress",  "component": "StudentProgress", "status": "tested, added from Updated (stub)" },
  { "route": "/payment-tracker",   "component": "PaymentTracker",  "status": "tested, added from Updated (stub)" },
  { "route": "/newsletter",        "component": "Newsletter",      "status": "tested, added from Updated (stub)" },
  { "route": "/storage",           "component": "Storage",         "status": "tested, added from Updated (stub)" }
]
```

"tested" = route registered, page builds, cross-checked source for
import correctness. See testing-report.md for what a real browser
click-through would still need to confirm.
