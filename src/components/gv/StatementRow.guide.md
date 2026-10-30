# Statement row

## When to use

- To show where people stand on one Common Ground statement: the statement, its agree / disagree / pass bar and a
  caption ("81% agree"). Stacked 14 apart, ranked by agreement, in the Insights Statements card
  (`DashboardStatements`).
- As the bar alone (no `statement`) with `unseenPercent` for the four shares of the Manage panel's "Where people
  stand", with Legend rows and their counts under it.
- With `counts` when a reader needs the people behind each share; the hover card gives them.

## When not to use

- For a statement as a row of the Common Ground list, with its assignee, likes and reactions in columns: use **Common ground row**.
- For shares of unrelated categories: use **Bar row**.
- For a breakdown with more than four parts (age groups, commute): use a **Dashboard card**'s demographic bar.

## Anatomy

1. **Statement** (optional): the text, wrapping onto more lines rather than cut off.
2. **Bar**: agree (green), disagree (red) and pass (grey) side by side; with four shares the three answers sit 2
   apart and the rest of the track is "Not seen yet".
3. **Caption** (optional): the `summary` at the end, never wrapping.
4. **Hover card** (Not in Figma): every share, with its count when `counts` is given.

The columns are 430 | 200 | 72; under 480 wide the row stacks statement, bar and caption.

## Behaviour

Not interactive: the row can't be reached with Tab and answers no keys. Hovering it darkens the bar a step and shows the card; screen
readers get every share in the bar's name instead ("21 agree (3%), 88 disagree (14%), …"), so nothing is lost to
the keyboard (docs/DECISIONS.md, "Built in the dashboards package").

## Content

- The statement is the participant's sentence as written, with its full stop.
- Pass percentages, 0–100; the three (or four) should add up to 100. The row writes them in the page's locale
  ("3 %" in French).
- `summary` gives one share and says which: "81% agree". The Dashboard card's statements write it for you.
- The shares' names come in through `labels`: "Agree", "Disagree", "Pass" by default; the Manage panel says "Unsure"
  for the third.
- Keep counts honest: a statement seen by very few people should say so rather than show a confident 100%.

## Accessibility

**The row gives you:** the bar as an image named with every share (and counts, with `counts`), the caption hidden
from screen readers since the name already says it, and colours that are never the only signal.

**You still own:**
- A heading or a card title over the stack, so the rows read as one list.
- The shares' names in the page's language (`labels`).
- A legend (Chart legend's square swatches, or Legend rows) wherever the colours appear without their names.

## Related

- **Dashboard card**: `DashboardStatements` stacks statement rows with the "% agree" caption.
- **Common ground row**: the statement as a row of the Common Ground list, with its review columns.
- **Legend row**: the counted key under the four-share bar.
- **Chart**: the square-swatch legend for agree, disagree and pass.

## Provenance

- Built by AI agents from Figma ("Statement row", three shares) and the designer's prototype; the four-share bar, the
  bar-only row, the narrow stacking and the hover card come from the prototype.
- Reviewed by a person: not yet.
- Known limits: `summary` is text the caller writes and formats; gaps between segments only appear with four shares,
  so Figma's three-share bar stays as drawn (docs/DECISIONS.md, "Built in the dashboards package").

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its words come in through `labels`; percentages follow the locale.
- 29 Oct 2026: four shares, a bar-only row, and a hover card with every share and its count.
- 29 Oct 2026: closer to Figma and the prototype: a 430 | 200 | 72 grid, statements wrap, the row stacks when narrow.
- 29 Oct 2026: built from Figma and the prototype.
