# Phone phase card

## When to use

- First on every phase's phone preview (a phase's Build tab): the phase's number and name in the phase colour, its
  dates, and its description or skeleton lines while it has none.

## When not to use

- For the project page's preview (the overview): use **Phone preview** with its header and the project's title.
- For the other blocks of a phase's page in the phone: use **Phone preview** (`PhoneCard`).
- For a phase in the back office's rail: use **Rail phase**.

## Anatomy

1. **Title**: the number, a full stop and the phase's name, Title size, in the phase colour.
2. **Dates** (optional): Body, tertiary grey.
3. **Body** (optional): the description, or Skeleton lines, 16 below.

A white card, radius 10, padding 16, on the phone's `grey` screen.

## Behaviour

Not interactive: the preview is a picture of the resident's page and takes no focus.

## Content

- The phase's name as residents read it, sentence case: "Shortlist proposals".
- Dates as the platform formats them for residents, a range with an en dash: "28 Sep 2026 – 18 Oct 2026".
- Its one word of its own is how the number is written ("3."), through `labels.number`; the number follows the
  locale.

## Accessibility

**The card gives you:** a real heading (level 2 by default, `headingLevel` to change it) so the preview's outline reads
like the resident's page.

**You still own:**
- The heading level fitting the phone's page.
- The phase colour is decoration: the number and the name say which phase it is.

## Related

- **Phone preview**: the phone, its header, cards and countdown footer.
- **Rail phase**: the same phase in the back office's rail.
- **Skeleton**: the lines that hold a missing description's place.

## Changes

- 30 Oct 2026: built from the back office's deep dive (project §3): every phase showed the same project card where the
  prototype shows the phase's own heading (docs/DECISIONS.md, "Project screens").
