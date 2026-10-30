# Section label

## When to use

- For a small grey label over a group of rows. Real uses: the project rail (the left column of a project's screens,
  with its phases) labels its groups "Timeline" and "Spotlight"; an Insights card says "Who is voting"; the Create
  report checklist says "Project context".
- As a real heading when the group is a section someone using a screen reader would want to jump to; a developer sets
  the level (`headingLevel`), and the look stays the same. Real uses: each kind of automated email in Messaging (the
  page's email settings), and "Who can participate" in Access rights (with a 16px icon).

## When not to use

- For the title of a page or a panel: use **Page header**, or the title a **Panel** has built in.
- For words in a bigger or bolder style than this one small grey: use **Text**, which offers every type style and can
  be a heading. Section label has one look on purpose, so every group label matches.
- For the names of a list's columns ("Statement", "Likes"), over values lined up under them: use **List header**.
  Section label names a group of rows, not columns.
- For a section of a side panel that has a bold title, its own padding and a body under it: use **Panel section**. A
  Section label is only a line of words; the rows under it are placed by the page.

## Anatomy

1. **Icon** (optional): a 16px icon before the words, in the tertiary icon grey. It only decorates: screen readers
   skip it.
2. **Label**: the words in Small type (12px on a 16px line), in the grey of `--gv-text-disabled`, 8px above and below,
   so the row is 32px tall. The icon and words are 8px apart.

It has no hover, pressed, selected or disabled state, and no stronger version: one look everywhere. It takes the full
width and sits left-aligned with the rows under it (right-aligned in right-to-left languages).

## Behaviour

Not interactive: you can't Tab to it or press it. As a heading, screen reader users can jump to it from a list of the
page's headings; otherwise it is plain text.

## Content

- Sentence case, always: "Who is voting", never "WHO IS VOTING" or all capitals with wide letter-spacing.
- One to three words naming the group: "Timeline", "Project context". It wraps onto a second line if a translation is
  longer than the space; plan for that rather than shortening.
- No colon, no full stop, no count, no link and no bold.
- Add an icon only where the group's neighbours have one too (Access rights' choices); never make the icon carry
  meaning the words don't.

## Accessibility

**The label gives you:** a heading at the level set (the look doesn't change), or plain text; its icon hidden from
screen readers.

**You still own** (the screen's designer marks it in the design, the developer sets the level):
- Whether it is a heading: yes when someone would want to jump straight to the group; no when the group already has
  its own name that screen readers hear. The rail's phase list, for instance, is itself named "Timeline", so its label
  stays plain text.
- The heading level, from the page's outline: the page's title is level 1, so a label is 2 to 6, one below the
  heading of the section it sits in (an email kind in Messaging sits under a level 3, so it is a 4).

## Related

- **Text**: words in any type style, a heading or a paragraph.
- **Panel section**: a side panel's titled section.
- **Phase timeline**: the list of phases under the rail's "Timeline" label.
- **Access rights**: its "Who can participate" choices start with a Section label with an icon.

## Provenance

- Built by AI agents from Figma's Rail section label and the prototype; it became a Component (a part any screen can
  use) once a second screen needed it.
- Reviewed by a person: not yet.
- Known limits: one look. In Figma it is still called "Rail section label" (search for that), and it draws the plain
  label only; the icon is code's. The designer will rename it Text/Section label (docs/DECISIONS.md). Its grey is
  reported for low contrast and left as drawn, the designer's call (docs/OPEN-DECISIONS.md, "Contrast findings").

## Changes

- 30 Oct 2026: the page reworded after a fresh-eyes read; the heading story uses the rail's own words.
- 30 Oct 2026: this page written.
- 29 Oct 2026: moved to Components/Text (docs/DECISIONS.md, "Structure: one place for each part").
- 29 Oct 2026: it can no longer be a page's main title (level 1); levels 2 to 6 only (docs/DECISIONS.md, "Public API
  and prop names").
- 29 Oct 2026: promoted from the rail's label to Section label, with an optional heading level and a 16 icon; sentence
  case, never uppercase tracked (docs/DECISIONS.md, "Building from the prototype review").
