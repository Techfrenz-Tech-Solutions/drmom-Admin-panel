# Commit History Analysis — drmom-Admin-panel

Full reachable history walked with `git log --all --diff-filter=D
--summary` for deletions across all three branches.

## Deletions found (all reachable history)

| File | Deleted in | Reason (from commit evidence) | Disposition |
|---|---|---|---|
| `src/pages/ProductMaster.jsx` | `1ac8766` (main) | Commit message: `"feat(hierarchy): retire ProductMaster (old Lesson-name picker), add per-video preview flag"`. Superseded by the Class→Subject→Course→Chapter hierarchy built out across the surrounding commits. | **Confirmed intentional supersession** — not restored. |

No other files were ever deleted on any reachable branch.

## Key feature-introduction / regression commits

| Commit | Branch | What it did |
|---|---|---|
| `09f30df` (merge) | main | Merged an earlier `New-Features` state via PR #1 |
| `f58c823` | main | Added nginx API proxy config for backend communication |
| `e9fbaca` | main | Integrated TUS protocol for chunked video upload to Bunny Stream with progress tracking |
| `64213ab` | main | Fixed PDF/notes upload — was pointing at a nonexistent `/admin/upload` route, moved to the real Bunny Storage-backed route |
| `389ffc7` | main | Fixed Chapters edit flow to show existing video/PDF and support independent keep/replace/remove |
| `d392947` | main | Added multi-file video/PDF upload boxes with per-item play/view/replace/delete |
| `a259e23` | main | Fixed silent file-selection failure — `crypto.randomUUID()` requires a secure context |
| `1ac8766` | main | Retired `ProductMaster.jsx`, added per-video preview flag |
| `ed2f362` | main | Simplified `Prices.jsx` to only course/chapter pricing, explicitly removing class/subject/lesson pricing controls as "dead ... no checkout path downstream" |
| `fc41ef3`,`af4c82e`,`91b2ffc` | New-Features | Three sequential 1-line toggles of the same `Prices.jsx` line — net effect reverts toward the pre-`ed2f362` richer pricing form. No commit message explains intent. |
| `bcf143b`,`1523456` | Updated | Adds 4 stub nav pages + routes; reorders Sidebar nav; **comments out the entire Assessment/Quiz builder** in `Chapters.jsx` and the Sidebar's admin-profile footer widget — no commit message explains either. |

## Regression check

`ed2f362`'s removal of class/subject/lesson pricing is main's own
deliberate, documented decision — not something this consolidation needs
to fix. `Updated`'s removal of the Assessment/Quiz builder is a different
case: it has **no supporting evidence or rationale anywhere** (unlike
main's `ed2f362`), and the removed code is fully wired to real component
state and the chapter-save payload (`assessments` field is still read at
submit time in `Updated`'s own version of the file — only the *UI* to
edit it was hidden). This is treated as an accidental/exploratory
regression, not a deliberate product decision, and was **not** adopted.
See rejected-or-obsolete-features.md.
