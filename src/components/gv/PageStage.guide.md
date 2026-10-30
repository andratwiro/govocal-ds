# Page stage

## When to use

- To show a document that will be printed or exported page by page while people edit or preview it: the report
  builder's pages, each a white A4 sheet on a grey stage.
- With a **Zoom bar** in its `zoomBar` slot, so people can zoom, fit the width and see which page they are on.
- With `format="slide"` for a 16:9 export; with an **Empty state** inside the first sheet when the document has nothing
  yet; with **Skeleton** lines in a busy sheet while the assistant writes a first version.

## When not to use

- For a page of settings or a form: use **Panel**.
- For a phone-sized preview of what participants see: use **Phone preview**.
- For a grid of cards or charts on a dashboard: use **Tile grid**.

## Anatomy

1. **Stage**: the tertiary grey, scrolling both ways; a region people can Tab to.
2. **Sheets** (Page stage sheet): the document's paper (`--gv-surface-document`) with the raised shadow and a hairline,
   centred 24 apart. A4: 794 × 1123 at 100%, margins 64. Slide: 1123 × 632, margins 48.
3. **Footer** (optional): the document's title at the start, the page number at the end, Small secondary. A cover
   (`isCover`) has none.
4. **Zoom bar** slot: floating at the bottom centre.

## Behaviour

The stage is a scrolling region with a name ("Pages"), so keyboard users reach it with Tab and scroll it with the
arrow keys; the Zoom bar is a toolbar after it, after the WAI-ARIA
[Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). `zoom` scales the sheets only;
`onFitZoomChange` reports the zoom that fills the width and `onPageChange` the page in view.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the stage, then to the Zoom bar. | `play: Keyboard` |
| Enter (on Zoom out) | Zooms out one step; the sheets shrink. | `play: Keyboard` |
| Scroll (wheel or arrow keys on the stage) | Moves through the pages; the Zoom bar's page line follows. | `e2e/report-parts.spec.ts` |

## Content

- A sheet's name is "Page n" (`labels.page`), with the number in the locale; name a busy sheet for what is happening
  ("Generating the report").
- The footer's start is the document's title as the document shows it; leave it off the cover.
- Inside a sheet, use the document kinds of **Text** (`document-display`, `-heading`, `-lead`, `-body`), so a
  platform's theme can give its documents their own face.

## Accessibility

**The part gives you:** a named, focusable scrolling region; each sheet an `article` named by its page; `aria-busy` on a
busy sheet; numbers in the locale.

**You still own:**
- Headings inside the sheets in a sensible order (the document's title as the first heading).
- A height for the stage from its place in the page (it fills its parent).
- Telling people when a generated page arrives (a Toast or the assistant's thread).

## Related

- **Zoom bar**: the floating pill in the `zoomBar` slot.
- **Empty state**: the first sheet of an empty document.

## Changes

- 30 Oct 2026: built (A4 and slide sheets, footer, cover, busy sheet, zoom, fit and page reporting), with this page.
