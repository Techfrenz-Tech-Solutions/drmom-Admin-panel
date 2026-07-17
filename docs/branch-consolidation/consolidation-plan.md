# Consolidation Plan — drmom-Admin-panel

Written before implementation. Base: `main` (`ed2f362`), on branch
`consolidation/all-features`.

| # | Item | Decision | Source | Destination file(s) | Risk | Test method |
|---|---|---|---|---|---|---|
| 1 | Newsletter / Payment Tracker / Storage / Student Progress stub pages | Adopt as-is | Updated `1523456` | `src/pages/{Newsletter,PaymentTracker,Storage,StudentProgress}.jsx` | Low — self-contained, no backend calls | build |
| 2 | Routes + nav titles for the 4 new pages | Adopt | Updated `1523456` | `src/App.jsx` | Low | build |
| 3 | Sidebar nav entries + reorder (Classes/Subjects ahead of Courses) | Adopt | Updated `bcf143b`/`1523456` | `src/components/Sidebar.jsx` | Low | build |
| 4 | Sidebar admin-profile footer widget removal | Adopt removal (verified redundant with Topbar) | Updated `bcf143b` | `src/components/Sidebar.jsx` | Low — confirmed not a feature loss | build + source check against Topbar.jsx |
| 5 | Chapters.jsx Assessment/Quiz builder removal | **Reject** — no rationale, functional code, submit payload still references it | Updated `bcf143b` | n/a | — | — |
| 6 | Prices.jsx class/subject/lesson pricing UI (New-Features' stale form) | **Reject** — main already made this exact call deliberately, with a documented reason | New-Features (`fc41ef3` et al.) | n/a | — | — |
| 7 | `ProductMaster.jsx` legacy lesson-picker | **Reject/no action** — main already retired it with a documented reason; New-Features never caught up to that decision | New-Features (stale) | n/a | — | — |

Implementation order: routes/nav infrastructure (items 1–4) as one
reviewable unit, since they're a single coherent Sidebar+App.jsx change
with no independent sub-parts. Items 5–7 required no code changes (they
are "do nothing" decisions) but are documented in
[rejected-or-obsolete-features.md](rejected-or-obsolete-features.md) so
the decision and its evidence survive even though no diff represents it.
