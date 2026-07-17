# Branch Inventory — drmom-Admin-panel

`git fetch --all --tags --prune` found **0 tags**. No unrelated/rewritten
histories detected.

| Branch | Tip commit | Tip date | Author | Merge-base with main | Ahead of main | Behind main | Status |
|---|---|---|---|---|---|---|---|
| `main` | `ed2f362` | 2026-07-05 | Deepak Ganesh | — | — | — | Default branch, most architecturally current |
| `Updated` | `1523456` | 2026-07-17 | Guru | `ed2f362` (= main tip) | 2 | 0 | Linear descendant of main — strict superset |
| `New-Features` | `91b2ffc` | 2026-07-03 | Guru | `071dbd1` | 3 | 9 | Diverged before main's chapters/upload/pricing rewrite |

## `main`

Authored primarily by Deepak Ganesh with detailed, reasoned commit
messages that explain root cause and fix for each change — e.g.
`a259e23 "fix(chapters): file selection silently did nothing —
crypto.randomUUID() needs a secure context"`. This branch contains a full
rewrite of chapter/upload/pricing functionality that happened *after*
`New-Features` was merged once already (see below) — Bunny Stream TUS
video upload with progress tracking, multi-file video/PDF upload boxes,
existing-file preview on edit, and retirement of the old
`ProductMaster.jsx` lesson-picker in favor of a Class→Subject→Course→
Chapter hierarchy.

## `Updated`

Strict superset of main (0 behind). 2 additional commits, both messaged
"updated code" with no rationale. Net diff vs. main: `App.jsx`,
`Sidebar.jsx`, `Chapters.jsx`, and 4 new page files — 118 insertions, 36
deletions across 7 files.

## `New-Features`

**Graph reconstruction** (via `git log --graph --oneline
origin/main origin/New-Features`) shows main already merged an earlier
state of this branch once, via PR #1 (`09f30df`), before continuing with
7 more commits that substantially rewrote what New-Features had built
(upload, chapters, pricing). Meanwhile New-Features itself kept going
with 3 more commits after that merge point — but those 3 commits
(`fc41ef3`, `af4c82e`, `91b2ffc`) only ever touch one file
(`src/pages/Prices.jsx`), toggling the same 1-line diff back and forth
three times in a row. `git cherry origin/main origin/New-Features`
confirms they're not hash-renamed duplicates of anything on main — but
comparing content shows their net effect is to leave `Prices.jsx` in an
older state (with class/subject/lesson pricing controls) that main's
later commit `ed2f362` deliberately removed, calling those controls
"dead ... no checkout path downstream." See
rejected-or-obsolete-features.md.
