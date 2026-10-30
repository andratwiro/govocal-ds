# Property list

## When to use

- For the facts about one record (one idea, person or project), a label beside each value: an idea's Status,
  Assignee, Tags and Phase in its side panel; a person's email, role and groups in Users; a project's dates, folder,
  visibility and managers on its overview.
- When the values are a mix: plain text, a number, a **Select** to change it on the spot, removable tags, a link.
  A value people may change is a control (a Select, tags); a value nobody changes here is plain text, such as a
  proposal's status, which its votes set.
- For "About this report" or "About this project" in a panel (the Report view, the Inspiration hub).

## When not to use

- For many records with the same fields side by side: use **Data table**.
- For a form people fill in and then save: use the fields (**Text field**, **Select**, **Date range field**), stacked
  with their labels above. The test is the Save button: a Property list has none, each change applies on its own.
- For a few key numbers that should stand out on a dashboard: use **Stat tile** (one number in a box) or **Stat row**
  (several in one line).
- For one record's facts as a row in a list of many: use that list's own row, such as **Voting row** (a vote's
  progress in the Manage list). Property list is for one record on its own, in a panel.

## Anatomy

1. **List**: the rows, one under the other, 10px apart; each row is at least 24px tall and grows with what its value
   holds (tags, a picker).
2. **Row**: one label and its value.
3. **Label**: the property's name in Small type (12px), in the secondary grey. All labels share one column, at least
   64px wide and as wide as the longest label; a long label (or a long translation) widens the column for every row.
4. **Value**: in Small type in the primary text colour, 8px after the label column, on the label's line; it wraps onto
   more lines under itself. An empty value shows "–" in the tertiary grey.

There is one layout, label beside value; it doesn't stack on narrow screens (Provenance).

## Behaviour

Not interactive: you can't reach the list itself with Tab, only the controls inside its values (a Select, tags, a
link), which work as on their own pages.

## Content

- Labels: one or two words, sentence case, no colon: "Status", "Assignee", "Last active", "Time left".
- Values: as short as they can be, written as the rest of the product writes them (dates and numbers in the page's
  language). A long value wraps under itself, never under the label.
- No value: leave the value empty. People see "–"; screen readers hear "Not set". When something more exact is true,
  a developer gives the words screen readers hear instead (`emptyLabel`: "No folder", "Nobody yet"); people still see
  "–".
- An empty pick-one value inside a picker (Assignee) is the picker's own first option, "Unassigned", not "–".
- Changes made in a value apply at once; in a side panel the back office confirms each with a Toast that has Undo.
  There is no Save.
- Order the rows by what people check most, the record's state first (Status, Assignee). More than about eight rows,
  split them under **Panel section** titles.
- The list's name for screen readers, when no heading above it names it: "Idea details", "About this report".
- "Not set" is a word the part says on its own; a screen passes it translated (`labels`).

## Accessibility

**The list gives you:** a real description list, so a screen reader reads each label with its value and can say how
many there are; a named empty value instead of a bare dash.

**You still own** (the screen's developer, from the design):
- A heading above the list, or a name for screen readers.
- Each control's own name, the same as its label ("Status" on the Status picker): the label beside it isn't
  connected to the control for screen readers.
- The words screen readers hear for an empty value, when "Not set" isn't the truth.

## Related

- **Side panel**: where most property lists live, under the record's title.
- **Panel section**: a titled section of a side panel around the list.
- **Select**: a value people change in place (the small rounded pill that opens a list).
- **Tag picker**: removable tags as a value ("Culture ×", "+ Add tag").
- **Badge**: a value as a pill that doesn't change (a person's groups).

## Provenance

- Built by AI agents from the prototype's side-panel properties and Figma's idea panel. Not in Figma as a component:
  draw it from the idea panel in Figma or from these stories.
- Reviewed by a person: not yet.
- Known limits: one layout, label beside value, with no stacked layout for narrow places (keep labels short there);
  labels don't name the controls inside values.

## Changes

- 30 Oct 2026: the page reworded after a fresh-eyes read; the stories say what each list shows.
- 30 Oct 2026: this page written.
- 29 Oct 2026: "Not set" comes through `labels`.
- 29 Oct 2026: a person's profile uses a Property list in a **Panel** instead of a hand-built list (docs/DECISIONS.md,
  "Back office redesign on the current components").
- 29 Oct 2026: built as label and value rows in a description list, one label column at least 64px wide, "–" read
  as "Not set".
