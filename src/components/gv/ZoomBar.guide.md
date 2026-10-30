# Zoom bar

## When to use

- To zoom a stage of pages and say where you are: the report builder's floating pill, − 83% + · Fit · Page 3 of 12, in
  a Page stage's `zoomBar` slot.
- Zoom only (no `fitZoom`, no page) on any preview stage that scales.

## When not to use

- To zoom a map: use **Map view** (it has its own zoom buttons).
- To move between pages of a list or table: use **Pagination**.
- To switch between two or three views: use **Segmented control**.

## Anatomy

1. **Zoom out** and **Zoom in**: 24 Icon buttons (− and +).
2. **Value**: the zoom as a percentage in the locale, primary, 44 wide.
3. **Fit** (with `fitZoom`): a quiet text button; off when the zoom already fits.
4. **Page line** (with `page` and `pageCount`): "Page 3 of 12", after a hairline.

A pill on the panel surface with a hairline and the overlay shadow; Small type.

## Behaviour

A labelled toolbar after the WAI-ARIA [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/): one Tab
stop, the arrow keys move between its buttons. − and + move between `steps` (50 to 200 by default) and stop at the
ends; the new zoom is announced.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves into the bar, onto its first button. | `play: Keyboard` |
| Right arrow | Moves to the next button (skipping one that is off). | `play: Keyboard` |
| Enter | Presses the button: zooms out, zooms in, or fits. | `play: Keyboard` |

## Content

- The words come from `labels`: the toolbar's name ("Zoom and pages"), "Zoom out", "Zoom in", "Fit", and the page line
  as a function of the page and the count ("Page 3 of 12").
- The percentage and the numbers are in the locale ("83 %" in German); never write them yourself.

## Accessibility

**The part gives you:** a named toolbar with one Tab stop, named icon buttons, ends that turn off rather than do
nothing, and a live value that screen readers hear as it changes ("Zoom 100%").

**You still own:**
- Where focus lands if the bar disappears (it stays put while the stage exists).
- A disabled bar while the content can't be zoomed (`isDisabled`, while generating).

## Related

- **Page stage**: the stage it floats on; it reports the fit zoom and the page in view.
- **Pagination**: moving between pages of a list.
- **Icon button**: the − and + buttons.

## Changes

- 30 Oct 2026: built (− value +, Fit, the page line, steps, disabled), with this page.
