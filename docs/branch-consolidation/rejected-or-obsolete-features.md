# Rejected or Obsolete Features — drmom-Admin-panel

## 1. Chapters.jsx Assessment/Quiz builder — removal rejected

`Updated` (`bcf143b`) comments out:
- The four helper functions (`addAssessment`, `removeAssessment`,
  `setAssessmentField`, `setAssessmentOption`).
- The entire "Row 5: Assessments" UI block — the "Add Question" button and
  the question/options/answer table.

**Evidence against removal:**
- No commit message rationale ("updated code" on both `Updated` commits).
- The removed code is not decorative — it's wired to real component
  state (`form.assessments`), and critically, `Updated`'s own version of
  `Chapters.jsx` **still reads `form.assessments` when building the save
  payload** (`assessments: form.assessments` in the submit body) and
  still parses `ch.assessments` when loading a chapter for edit. In other
  words: `Updated` disabled the *only way to edit* this field while
  leaving the field itself fully live in the data model — a half-removal
  that would leave the app silently unable to author quiz content it
  still persists and reads.

**Decision:** kept main's working Assessment/Quiz builder intact. No
change made to `Chapters.jsx` in this consolidation.

**Related cross-repo note:** even with the builder intact, the website
has no UI to render or take a quiz (see compatibility-analysis.md) — so
today, admin-authored quiz content has no student-facing consumer. That's
a real product gap, but it argues for *building the website side*, not
for removing the admin editor that already works.

## 2. Prices.jsx class/subject/lesson pricing — not restored

`New-Features`'s three unique commits leave `Prices.jsx` in a state that
still supports pricing at the Class, Subject, and Lesson level (in
addition to Course/Chapter). Main's later commit `ed2f362` deliberately
removed exactly this, with a code comment explaining why: *"Only 'course'
(real checkout price) and 'chapter' (display/reference price only —
chapters are not sold separately) are supported here. Class/Subject
pricing has no checkout path downstream, so it isn't offered."*

**Decision:** main's reasoning is explicit, checkable against the
checkout flow, and directly on-point — this is the rare case where a
removal *is* backed by clear evidence. Not restored.

## 3. Sidebar admin-profile footer widget — removal accepted (not rejected)

Included here for completeness even though it *was* adopted (see
implementation-decisions.md): removing it was verified safe because
`Topbar.jsx` already provides identical functionality via the topbar
avatar. Listed here to make clear this was a checked decision, not an
assumption.

## Nothing else was rejected

`ProductMaster.jsx`'s removal (main, `1ac8766`) is main's own documented
decision and was never contested by any other branch's actual
functionality (New-Features simply never caught up to it) — not a
consolidation decision, just confirmed as correct and left alone.
