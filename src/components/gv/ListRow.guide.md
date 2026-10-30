# List row

## When to use

- For one idea in an Ideation method's list under a **List header**: its title (with a thumbnail and a warning mark
  when needed) and its status.
- With `select` when people tick ideas to act on several at once (the prototype's Manage table); pass the header's
  `selectAll` too, so the columns line up.

## When not to use

- For a list of ideas people open, sort, filter and page through: use **Data table**, as the Manage tab and the Input
  manager do. No back-office page uses List row today.
- For a Common ground statement: use **Common ground row**; for a vote's option or a proposal: **Voting row** or
  **Proposals row**.
- For a short row that leads somewhere ("Waiting for a reply · 40"): use **Stat row**.
- For a row of label and value about one record: use **Property list**.

## Anatomy

1. **Lead slot** (28 wide): the row's **Checkbox** with `select`, shown on hover, on focus and once ticked; else empty.
2. **Title cell**: an optional thumbnail, the title (up to three lines) and an optional warning mark at its end.
3. **Status cell**: the status word, "Under consideration".
4. **Trail slot** (28 wide): empty, under the header's "Add column".

A ticked row is tinted.

## Behaviour

Behaviour from React Aria's Checkbox. The row itself takes no focus; its checkbox does, after the WAI-ARIA
[Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus to the row's checkbox (which shows), then to the next row's. | `play: Keyboard` |
| Space | Ticks or unticks the row. | `play: Keyboard` |

A row with no `select` is not interactive. To make rows open on a press or move with the arrow keys, use **Data
table**.

## Content

- The title is the idea's own title, as written; it wraps to three lines and is cut after that.
- The status is the idea's status word, sentence case: "Proposed", "Under consideration", "Implemented".
- Name each checkbox for its row: `'aria-label': 'Select: Bike lanes on the ring road'`. The default, "Select", is the
  same on every row.
- "Select" and the warning mark's name, "Needs attention", come through `labels` in other languages.

## Accessibility

**The row gives you:** a checkbox that shows when focused even before the row is hovered, a warning mark named "Needs
attention", and a decorative thumbnail hidden from assistive tech.

**You still own:**
- A checkbox name that says which row it ticks.
- The list around the rows (a `role="list"` or a table) and the header's select-all, so people know how many there are.
- Saying what the warning means elsewhere on the page; the mark only says it needs attention.

## Related

- **List header**: the column heads above it, with select-all.
- **Common ground row**: the same slots for a statement.
- **Data table**: the full list of ideas, with opening and paging.
- **Status badge**: a status as a pill, where a list shows it that way.

## Provenance

- Built by agents from Figma's List row (Ideation: `Marks` and `Image`) and the prototype's Manage table (the
  checkbox, Not in Figma).
- Reviewed by a person: not yet.
- Known limits: two columns only (title and status); the row can't be opened or focused; no back-office page uses it
  yet, since the Manage tab moved to Data table.

## Changes

- 30 Oct 2026: the stories' thumbnail is a local picture (`src/stories/images`), not a photo from the web.
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: "Select" and "Needs attention" come through `labels`.
- 29 Oct 2026: closer to Figma and the prototype: a 28 | cells | 28 grid, a three-line title, the warning at the
  cell's end; the checkbox added (docs/DECISIONS.md, "Built, not in Figma").
- 29 Oct 2026: built from Figma and the prototype.
