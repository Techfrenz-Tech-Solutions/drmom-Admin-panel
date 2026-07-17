# Branch Consolidation — drmom-Admin-panel

This folder documents the consolidation of all reachable branches
(`main`, `New-Features`, `Updated`) of `drmom-Admin-panel` into the
`consolidation/all-features` branch.

Read in this order:

1. [branch-inventory.md](branch-inventory.md)
2. [commit-history-analysis.md](commit-history-analysis.md)
3. [route-catalogue.md](route-catalogue.md)
4. [feature-matrix.md](feature-matrix.md)
5. [compatibility-analysis.md](compatibility-analysis.md)
6. [consolidation-plan.md](consolidation-plan.md)
7. [implementation-decisions.md](implementation-decisions.md)
8. [testing-report.md](testing-report.md)
9. [security-findings.md](security-findings.md)
10. [rejected-or-obsolete-features.md](rejected-or-obsolete-features.md)
11. [rollback-plan.md](rollback-plan.md)

## Scope actually found

Same shape as the companion website repo: **3 branches, 0 tags**,
identical `package.json`/`package-lock.json` on every branch, no
committed secrets.

## Bottom line

- `Updated` is a linear descendant of `main` (0 commits behind), so most
  of it was safe to adopt: four new admin nav destinations
  (Newsletter, Payment Tracker, Storage, Student Progress) and a nav
  re-order to match the Class→Subject→Course→Chapter hierarchy used
  elsewhere in the app.
- `Updated` also **silently disables two working features** with no
  explanation: the Chapters page's entire Assessment/Quiz builder, and
  (functionally redundant, so kept removed) the Sidebar's admin-profile
  shortcut. The quiz builder removal was **rejected** — see
  [rejected-or-obsolete-features.md](rejected-or-obsolete-features.md).
- `New-Features`'s 3 unique commits turned out to be non-substantive:
  three sequential single-line toggles of the same line in `Prices.jsx`,
  authored after main had already merged an earlier state of this branch
  and then substantially rewritten pricing, chapters, and upload
  functionality on top of it. `git cherry` confirms these 3 commits are
  not duplicates of anything on main, but comparing their actual content
  shows they're reverting toward a since-**intentionally-removed**
  class/subject/lesson pricing UI (main's commit `ed2f362` explicitly
  calls this "dead ... no checkout path downstream"). Not restored — see
  rejected-or-obsolete-features.md.
