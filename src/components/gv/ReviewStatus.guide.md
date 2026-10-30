# Review status

## When to use

- At the end of a setup card's title line, to say whether the admin has looked at it: "To review" (Figma's), "To set"
  for a decision with no value yet, "Reviewed" (green) once the admin has visited the card. A **Card** draws it from
  its `status`; pages rarely use it on its own.

## When not to use

- For where an item stands in a draft-to-live flow: use **Status badge**.
- For a required step not yet done: use **Required marker**.
- For something new or unread: use **New dot**.
- For a kind or a tag: use **Badge**.

## Anatomy

1. **Mark**: a dashed ring (to review, to set) or a green check-circle (reviewed), both 14.
2. **Word**: "To review", "To set" or "Reviewed".

One line, small.

## Behaviour

Not interactive: the status can't be reached with Tab and answers no keys.

## Content

- The words are fixed: "To review", "To set", "Reviewed"; pass `labels` in other languages (a Card hands its own
  `labels` on).
- Turn a card to reviewed when the admin has opened it, not when they've changed something.

## Accessibility

**The status gives you:** the state as a word, read in place; the mark is hidden from screen readers.

**You still own:**
- The card's title beside it, so "To review" says what is to be reviewed.
- The words in the page's language.

## Related

- **Card**: draws the review status from its `status`.
- **Required marker**: the other mark on a card's title line.
- **Setup step**: a project's setup checklist item.
- **Status badge**: draft and live.

## Provenance

- Built by AI agents from Figma's Review status ("To review"); "To set" and "Reviewed" come from the prototype (Not in
  Figma).
- Reviewed by a person: not yet.
- Known limits: three fixed states; the page decides when a card counts as reviewed.

## Changes

- 30 Oct 2026: Reviewed's check-circle is drawn at 14, the size of To review's ring, so a row doesn't shift when it
  turns Reviewed.
- 30 Oct 2026: this page written.
- 29 Oct 2026: its words come through `labels`; the status axis is one word, `status`.
- 29 Oct 2026: built from Figma and the prototype (as Review notice, renamed Review status).
