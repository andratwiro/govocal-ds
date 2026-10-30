# Rail header

## When to use

- At the top of the project's Participation rail: the title ("Participation"), hide panel and + (add a phase), on the
  overview and on a phase screen.
- With only `onAdd` for Figma's row, or no buttons for a title alone.

## When not to use

- For a label over a group inside the rail ("Spotlight"): use **Section label**.
- For the head of a page: use **Page header**, or **Project header** on a project.
- For the head of a panel: use **Panel**'s head.

## Anatomy

1. **Title**: the rail's name, a heading (h2 unless `headingLevel` says otherwise).
2. **Hide panel** (optional, Not in Figma): an icon button before the +.
3. **Add** (optional): the strong + icon button.

The row is 18 tall; its 28 buttons hang 5 above and below and 6 past the end so their icons line up with the rail.

## Behaviour

Two icon buttons, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to hide panel, then to +. | `play: Keyboard` |
| Enter, Space | Presses the button. | `play: Keyboard` |

## Content

- The title is one word or two: "Participation".
- The buttons' names default to "Add a phase" and "Hide the participation rail"; pass the page's own through
  `labels` in its language.

## Accessibility

**The header gives you:** named icon buttons with focus rings and decorative icons.

**You still own:**
- Specific button names in the page's language (`labels`).
- A way back once the rail is hidden (the overview shows a "Show the participation rail" button).
- The title's `headingLevel` fitting the page's outline (an h2 by default).

## Related

- **Phase timeline**: the phases under it.
- **Rail phase**: a phase row.
- **Icon button**: its buttons.
- **Section label**: labels further down the rail.

## Provenance

- Built by AI agents from Figma ("Rail header", the title and +) and the designer's prototype (hide panel).
- Reviewed by a person: not yet.
- Known limits: none known.

## Changes

- 30 Oct 2026: the title is a heading (`headingLevel`, h2 by default); the buttons' default names say what they do
  ("Add a phase", "Hide the participation rail").
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`; the + is the strong icon button (`emphasis`).
- 29 Oct 2026: one rail head on the overview and the phase screen (docs/DECISIONS.md, "Project overview").
- 29 Oct 2026: built from Figma and the prototype.
