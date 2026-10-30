# Rail phase

## When to use

- For one phase in the project's Participation rail: its dot (upcoming, live or completed), its name, a count chip, the
  status word with its dates and method, and "N new" when inputs are unread.
- With `onDelete` for a phase that can leave the rail (every phase but the one on screen), undone from a Toast.
- One after another (siblings, or each in its own list item): the guide line joins the dots.

## When not to use

- For a whole timeline without deletes: use **Phase timeline**, which builds the rows from data.
- For a step of a setup checklist: use **Setup step**.
- For a row in a list of records: use **List row**.

## Anatomy

1. **Dot**: grey (upcoming), light green (live), green (completed).
2. **Name**: the phase's title.
3. **Chip** (optional): what it gathered, on its own line ("312 ideas").
4. **Meta line**: the status word (green when live or completed) · dates · method.
5. **New** (optional): a red dot and "N new" at the top end.
6. **Delete** (optional): an icon button at the end, shown while the row is hovered or focused, in "N new"'s place.

## Behaviour

The row is a link to the phase, after the WAI-ARIA [Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/); the delete is a separate button after it, always in the tab order and shown when it has focus.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the phase, then to its delete, which shows. | `e2e/build-tab.spec.ts` |
| Enter (on the phase) | Opens the phase. | `play: Keyboard` |
| Enter (on delete) | Deletes the phase. | `play: Keyboard` |

## Content

- The title is the admin's ("Collect ideas"). `statusLabel` is one word or two ("Upcoming", "In progress", "Done").
- `meta` is dates and method joined with " · " ("29 Jul to 30 Sep · Ideation").
- The chip is a number with its word ("312 ideas"), in the page's language; "N new" is written for you from
  `newCount`.
- After a delete, say it in a Toast with Undo that names the phase ("Feedback survey deleted").

## Accessibility

**The row gives you:** a link with the name, chip, status and "N new" in its name, `aria-current="page"` on the phase
on screen, a delete named for its phase ("Delete Collect ideas") with a tooltip, and a decorative dot.

**You still own:**
- Undo after a delete (a Toast), since the button doesn't ask first.
- Not offering delete on the phase on screen.
- The `labels` in the page's language.

## Related

- **Phase timeline**: the rows built from data.
- **Rail header**: the rail's head.
- **Toast**: the Undo after a delete.
- **Section label**: "Spotlight" between groups of phases.

## Provenance

- Built by AI agents from Figma ("Rail phase", the upcoming row) and the designer's prototype (the live and completed
  dots, the chip, "N new" and the delete).
- Reviewed by a person: not yet.
- Known limits: the live and completed greens have no tokens of their own (a colour mix and the nearest token); the
  status word's green is reported by axe for contrast (docs/OPEN-DECISIONS.md asks the designer).

## Changes

- 30 Oct 2026: this page written; a play function proves Enter on the phase and on delete.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: a delete at the row's end on hover and focus, always in the tab order (docs/DECISIONS.md, "Built in the
  project package").
- 29 Oct 2026: phases can leave the rail from their row, undone from a Toast (docs/DECISIONS.md, "Phase").
- 29 Oct 2026: built from Figma and the prototype.
