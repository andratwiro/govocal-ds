# Section label

## When to use

- For a quiet label over a group of rows: the project rail's "Timeline", "Spotlight" and "Events", an Insights card's
  "Who is voting", the Create report checklist's "Project context".
- As a real heading (`headingLevel`) when people should be able to jump to the group: each kind of automated email in
  Messaging (an h4), Access rights' "Who can participate" (with a 16 icon).

## When not to use

- For a page's or a panel's title: use **Page header** or the title of **Panel**.
- For a heading or a line in a type style of your choosing: use **Text** with `elementType`.
- For the column heads of a list: use **List header**.
- For a titled section of a side panel with a body under it: use **Panel section**.

## Anatomy

1. **Icon** (optional): a 16 icon before the words.
2. **Label**: the words, Small, quiet grey, on a 32 row.

## Behaviour

Not interactive: the label can't be reached with Tab and answers no keys. With `headingLevel` it is a heading a screen reader can jump
to; without it, plain text.

## Content

- Sentence case, always: "Who is voting", never "WHO IS VOTING" or uppercase tracked letters.
- One to three words naming the group: "Timeline", "Project context".
- No colon, no full stop.

## Accessibility

**The label gives you:** a heading at the level you set (the look doesn't change), or plain text; its icon hidden from
screen readers.

**You still own:**
- `headingLevel` when the group is a section someone would look for, at the right level for the page's outline (a
  page owns its h1, so 2 to 6).
- No heading level when the group already has its own name (the rail's "Timeline" names a list that is named).

## Related

- **Text**: words in any type style, a heading or a paragraph.
- **Panel section**: a side panel's titled section.
- **Phase timeline**: the rail's timeline it labels.
- **Access rights**: opens its choices with an icon label.

## Provenance

- Built by AI agents from Figma's Rail section label and the prototype; moved up from the rail as a Component on its
  second use.
- Reviewed by a person: not yet.
- Known limits: one look; Figma's rename to Text/Section label is the designer's pending pass (docs/DECISIONS.md).

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: moved to Components/Text (docs/DECISIONS.md, "Structure: one place for each part").
- 29 Oct 2026: `level` 1–6 became `headingLevel` 2–6 (docs/DECISIONS.md, "Public API and prop names").
- 29 Oct 2026: promoted from the rail's label to Section label, with an optional heading level and a 16 icon; sentence
  case, never uppercase tracked (docs/DECISIONS.md, "Building from the prototype review").
