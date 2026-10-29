# Property list

## When to use

- For the facts about one record, a label beside each value: an input's Status, Assignee, Tags and Phase in the Side
  panel; a person's email, role and groups in Users; a project's dates, folder, visibility and managers on its
  overview.
- When the values are a mix: plain text, a number, a **Select** to change it at once, removable tags, a link.
- For "About this report" or "About this project" lists in a panel (Report view, Inspiration hub).

## When not to use

- For many records with the same fields side by side: use **Data table**.
- For a form people fill in and save: use the fields (**Text field**, **Select**, **Date range field**), stacked with
  their own labels.
- For a few big numbers on a dashboard: use **Stat tile** or **Stat row**.
- For the facts of one participation method's row in a list: use that method's row, such as **Voting row**.

## Anatomy

1. **List**: one `PropertyList`, a description list.
2. **Item** (`PropertyListItem`): one row.
3. **Label**: the property's name, in one column 64 wide (or as wide as the longest label).
4. **Value**: starts 8 after the label column, on the label's line, and wraps. An empty value shows "–".

## Behaviour

Not interactive: the list itself takes no focus and no keys. A value that is a control (a Select, tags, a link) keeps
its own keyboard; see that part's page.

## Content

- Labels: a noun, one or two words, sentence case, no colon: "Status", "Assignee", "Last active".
- Values: as short as they can be; a long one wraps under itself, never under the label.
- No value: leave the item's children out. The eye sees "–", a screen reader hears "Not set"; pass `emptyLabel` when
  something else is true ("No folder", "Nobody yet").
- Changes made in a value apply at once (with an Undo toast), as everywhere in a side panel; there is no Save.
- Name the list with `aria-label` when no heading above it does: "Input details", "About this report".
- "Not set" comes through `labels` in other languages.

## Accessibility

**The list gives you:** a real description list, so a screen reader reads each label with its value and can say how
many there are; a named empty value instead of a bare dash.

**You still own:**
- A heading above the list, or an `aria-label`.
- Names on controls inside values that repeat their label ("Status" on the Status Select), since the label isn't wired
  to the control.
- Words for empty values that say what's true.

## Related

- **Side panel**: where most property lists live, under the record's head.
- **Panel section**: a titled section of a side panel around the list.
- **Select**: a value people change in place (the pill trigger).
- **Tag picker**: removable tags as a value.
- **Badge**: a value as a pill (a person's groups).

## Provenance

- Built by agents from the prototype's side-panel properties and Figma's idea panel; Not in Figma as a component.
- Reviewed by a person: not yet.
- Known limits: one layout, label beside value (no stacked layout for narrow places); labels don't name the controls
  inside values.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: "Not set" comes through `labels`.
- 29 Oct 2026: a person's profile uses a Property list in a Panel instead of a hand-built list (docs/DECISIONS.md,
  "Back office redesign on the current components").
- 29 Oct 2026: built as label and value rows in a description list, one 64 label column, "–" read as "Not set".
