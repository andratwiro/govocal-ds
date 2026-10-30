# Skeleton

## When to use

- In place of content that is still loading, in the shape it will take, so the page doesn't jump when it arrives: a
  report's page while it is being generated (Report view), a phone's list of rows (the prototype's).
- `line` for a line of text, `block` for a picture or a chart, `pill` for a chip, `circle` for an avatar.

## When not to use

- For a place that has nothing in it: use **Empty state**.
- For an action that is running (saving, sending): use the button's pending state (**Button** `isPending`).
- For a long wait people should know about: add words in a **Banner** or beside the skeleton ("Generating your
  report, this takes a minute"); a skeleton says nothing.
- For a single value that hasn't loaded in a **Property list** row, a short line is enough; never a block.

## Anatomy

1. **Placeholder**: a light grey shape with a calm pulse: a 12 line, a 56 block, a 24 pill or a 32 circle, unless
   you give a width and height.

## Behaviour

Not interactive: a skeleton can't be reached with Tab and answers no keys, and is hidden from screen readers.

## Content

- No words. Match the shapes to what will load: a title line wider and taller than the lines under it, a block for a
  chart.
- Vary line widths (100%, 90%, 60%) so it reads as text, not as a table.
- Name the loading area for screen readers on its container: the back office's report sheet is
  `aria-label="Generating the report"` with `aria-busy`.

## Accessibility

**The skeleton gives you:** placeholders hidden from screen readers, never focusable, with a calm pulse (never a shimmer) that stops under reduced motion.

**You still own:**
- Saying that something is loading: `aria-busy` and a name on the container, or a status line.
- Moving focus or announcing when the content arrives, if people were waiting for it.
- Turning the skeleton off when loading fails, and saying why.

## Related

- **Empty state**: when nothing came back.
- **Button**: its pending spinner, for an action that runs.
- **Avatar**: what the circle stands in for.
- **Data table**: its own loading row for long lists.

## Provenance

- Built by AI agents from the prototype's skeleton rows (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: no ready-made groups (a text block, a card, a row) beyond the stories; each page lays its shapes out.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: `shape` became `variant` (docs/DECISIONS.md, "Public API and prop names"); a gentle pulse where the
  prototype's is static.
- 29 Oct 2026: closer to the prototype: its lighter grey, 12 lines, a pill shape, the skeleton-row story.
- 29 Oct 2026: built from the prototype.
