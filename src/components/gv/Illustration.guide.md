# Illustration

## When to use

- To give an empty place something to look at and a hint of what goes there: the drawing in an **Empty state**.
- To picture a participation method: the method scenes on the method picker's cards, the cover band at rest
  (`size={320} height={168}`) and the story on hover.
- Where a picture says something the words beside it don't, with `alt` (a proposal's progress toward its threshold).

## When not to use

- For a small symbol on a control or in a row: use an icon inside the part, such as a **Button**'s leading icon or an
  **Icon button**.
- For a person: use **Avatar**.
- For numbers: use a **Chart**, a **Bar row** or a **Stat tile**; never a drawing of a chart.
- For a whole empty page or panel with its words and an action: use **Empty state**, which holds the illustration.

## Anatomy

1. **Drawing**: one self-contained SVG file from `src/illustrations/`, drawn inline so it paints with the page's
   tokens.
2. **Motion** (optional): the drawing's own short story, timed by the loop motion token.

Sizes: each drawing lists its intended widths (the Sizes story); the height follows the drawing, or `height` crops it
around its middle.

## Behaviour

Not interactive: an illustration takes no focus and no keys. How it moves (`motion`):

- `auto` (the default) plays once it is on screen and rests on its still within 5 seconds; a longer story rests until
  hovered.
- `once` plays its story one time; `hover` plays while the pointer is over it, or over the card around it
  (`data-illustration-host`), or focus is inside that card.
- `loop` plays until paused: only beside a pause control, or where the person started it.
- `still` never moves. Reduced motion always shows the still.

## Content

- Pick from the drawings that exist (Foundations › Illustrations); a new one is the designer's to draw.
- Decoration needs no words: leave out `alt` and it is hidden from screen readers.
- When it carries meaning, `alt` says that meaning in one sentence: "A proposal with 128 of 300 votes and 34 days left
  to reach its threshold", not "Illustration of a proposal".
- Never put words a person must read inside the drawing; they don't translate and can't be resized.

## Accessibility

**The illustration gives you:** decoration hidden from assistive tech, an image named by `alt` when it says
something, nothing moving unbidden for more than 5 seconds (WCAG 2.2.2), and a still under reduced motion.

**You still own:**
- `alt` only when the picture adds meaning; never repeat the heading beside it.
- A pause control beside any `loop`.
- Hover drawings inside something focusable (a card that is a button), so keyboard users see the story too.

## Related

- **Empty state**: where most illustrations sit.
- **Choice card**: a card to pick from; it holds an icon today, an illustration later (its doc comment).
- **Avatar**: the picture for a person.

## Provenance

- Built by agents from the prototype's drawings, one SVG file each (Not in Figma); the designer owns the drawings.
- Reviewed by a person: not yet.
- Known limits: a fixed set of drawings (adding one means drawing an SVG by the file's rules); `hover` motion needs a
  host element with `data-illustration-host`.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: built as one self-contained SVG per drawing in `src/illustrations/`, drawn inline, with five motions
  and the 5-second limit.
