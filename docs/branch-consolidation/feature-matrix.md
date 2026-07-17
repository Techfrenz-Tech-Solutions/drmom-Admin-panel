# Feature Matrix — drmom-Admin-panel

| Feature | `main` | `New-Features` | `Updated` | Consolidated decision |
|---|---|---|---|---|
| Admin login | ✅ (plain email/password) | ✅ | ✅ | keep main |
| Google SSO | ❌ (not implemented on either) | ❌ | ❌ | not present anywhere — no gap to close, flagged in compatibility-analysis.md as worth a deliberate product decision |
| Dashboard | ✅ | stale | unchanged | keep main |
| User management | ✅ | stale | unchanged | keep main |
| Course management | ✅ | stale | unchanged | keep main |
| Subject/category management | ✅ | stale | unchanged | keep main |
| Chapter management (hierarchy) | ✅ Class→Subject→Course→Chapter | ❌ still old `ProductMaster` lesson-picker era | unchanged structure | keep main |
| Video upload (Bunny Stream, TUS, progress) | ✅ | ❌ | unchanged | keep main |
| Video replacement/deletion, existing-file preview | ✅ | ❌ | unchanged | keep main |
| PDF/notes upload (Bunny Storage-backed) | ✅ | ❌ (points at nonexistent `/admin/upload`) | unchanged | keep main |
| Multiple files per chapter | ✅ | ❌ | unchanged | keep main |
| Chapter quizzes / assessment editor | ✅ full builder (question/options/answer table) | n/a (predates this feature) | **UI commented out**, but submit payload still reads `form.assessments` | **kept from main** — Updated's removal rejected, no rationale given |
| Course/chapter pricing | ✅ simplified (course + chapter only, "no checkout path" for class/subject/lesson) | stale — still has class/subject/lesson pricing UI | unchanged from main | **kept main's simplified version** — main's removal is documented/reasoned; New-Features' richer form predates that reasoned removal |
| Student enrolment management | ✅ (Enrollments page) | stale | unchanged | keep main |
| Subscription/payment management | stub only | n/a | **added as stub nav destination** (Payment Tracker) | adopt Updated's stub, document as backend-pending |
| Reports | not present anywhere | — | — | no gap to close |
| Settings | not present anywhere | — | — | no gap to close |
| Role/permission controls | not present anywhere | — | — | no gap to close |
| Newsletter management | not present | — | **added as stub nav destination** | adopt Updated's stub, document as backend-pending |
| Storage/media management | not present | — | **added as stub nav destination** | adopt Updated's stub, document as backend-pending |
| Student progress tracking | not present | — | **added as stub nav destination** | adopt Updated's stub, document as backend-pending |
| Search, filters, pagination, exports | not present on any branch | — | — | no gap to close |
| Sidebar admin-profile shortcut | ✅ (in Sidebar footer) | unchanged | removed from Sidebar | **adopted removal** — verified redundant: `Topbar.jsx` already opens the identical `AdminProfile` modal via the topbar avatar |

## Features found in code but not exposed in the UI

- `/videos` (`Lesson.jsx`) — routed but deliberately unlinked from
  Sidebar nav, per main's own code comment calling it superseded legacy.
  Pre-existing on main, not something this consolidation introduced or
  needs to fix.
