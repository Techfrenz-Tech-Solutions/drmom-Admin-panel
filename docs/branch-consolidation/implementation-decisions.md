# Implementation Decisions — drmom-Admin-panel

One commit landed on `consolidation/all-features` (base: `main`
`ed2f362`):

**`cca91d6`** — `feat: add Newsletter, Payment Tracker, Storage, Student Progress nav destinations`

- Copied `Newsletter.jsx`, `PaymentTracker.jsx`, `Storage.jsx`,
  `StudentProgress.jsx` byte-for-byte from `origin/Updated` — all four
  are self-contained "coming soon" stub pages with no shared-file
  dependencies.
- Hand-edited `App.jsx`: added imports, `PAGE_TITLES` entries, and
  `<Route>` entries for all four, onto main's existing route table
  (no conflicts — Updated's `App.jsx` diff vs. main only ever *adds*
  these four blocks, doesn't touch anything main built afterward).
- Hand-edited `Sidebar.jsx`: added the 4 new nav icons/entries, reordered
  Classes/Subjects ahead of Courses (matching the hierarchy used
  elsewhere in Chapters/Prices), and removed the Sidebar's
  admin-profile footer widget along with its now-unused `AdminProfile`
  import and `showProfile` state.
  **Verification before removing:** grepped the codebase for
  `AdminProfile`/`setShowProfile` usage and found `Topbar.jsx` already
  renders the identical `AdminProfile` modal via a topbar-avatar click
  (`src/components/Topbar.jsx:23-27`). This is genuine de-duplication,
  not a feature loss — confirmed, not assumed.

## Deliberately not implemented

- **Chapters.jsx quiz builder removal** (`Updated`) — rejected, see
  rejected-or-obsolete-features.md. Main's `Chapters.jsx` is untouched by
  this consolidation.
- **Prices.jsx richer form** (`New-Features`, stale) — rejected, no
  action taken; main's `Prices.jsx` (post-`ed2f362`) is untouched.

## Attribution

The single commit carries a `Source: origin/Updated (bcf143b, 1523456)`
line and explicitly calls out, in its own body, the two things from the
same source branch that were evaluated and *not* included — so the
decision trail is visible directly in `git log`, not only in this docs
folder.
