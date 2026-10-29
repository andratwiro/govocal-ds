# Map view

## When to use

- To show where things are: the ideas with a location in a phase's Manage tab, on a map beside the list ("Ideas on
  the map"), with List / Map to switch.
- Beside a **Data table** of the same items: a row under the pointer marks its pin (`hoveredKey`), a pressed row opens
  its pin's card (`value`, the table's `openKey`), and a pressed pin opens its row.
- For an admin to add an input at a place (`onMapPress`): a click on the map, or Enter on the focused map for its
  centre.
- With overlays in its corners (`MapOverlay`): a **Banner** with a hint, a `MapChip` counting "40 ideas without a
  location", a `MapLegend` saying what each pin colour means.
- As a still picture of a map (`isInteractive={false}`), such as inside a **Phone preview**.

## When not to use

- To compare numbers by area or show a trend: use a **Chart**; the map shows places, not amounts.
- For a list people work through one record at a time: use **Data table**, with the map beside it when places matter.
- For one address in a record: show it as text in a **Property list**.

## Anatomy

1. **Map surface**: the tiles, drawn by an engine (MapLibre with OpenFreeMap's tiles by default), loaded only when a
   map first draws.
2. **Pins** (`MapPin`): a 14 dot in its tone with a white ring; 18 and near black when hot (hovered); 18 in the
   selected accent when open. With `isClustered`, crowded pins fold into a 28 disc with their count.
3. **Card** (`MapCard`): the open pin's title and status, above the overlays.
4. **Zoom buttons**: + and −, in a corner.
5. **Overlays** (`MapOverlay`, optional): top-start, top-end, bottom-start or bottom-end, mirrored right to left.
6. **Credits**: the tiles' credits, always visible at the bottom end.

The map fills the height it is given (`className` or `style` sets it).

## Behaviour

Behaviour from React Aria's Button (each pin). There is no WAI-ARIA pattern for a map. Each pin is a button, after the
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), and the pins share one Tab stop with the arrow
keys between them, as in a composite widget. Tab order: the map surface, the pins, the zoom buttons, the credits.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab (from the map surface) | Moves focus onto the pins: the last one focused, else the open one, else the first in view. | `e2e/map.spec.ts` |
| Arrow keys (on a pin) | Move focus to the nearest pin in that direction. Directions stay as on screen, right to left too. | `e2e/map.spec.ts` |
| Tab (on a pin) | Leaves the pins for the zoom buttons. | `e2e/map.spec.ts` |
| Enter (on a pin) | Opens the pin's card. | `e2e/map.spec.ts` |
| Esc | Closes the card; focus stays on the pin. | `e2e/map.spec.ts` |
| Enter (on the map surface) | Presses the map's centre: with `onMapPress`, adds an input there. | `e2e/map.spec.ts` |

A click on the map while a card is open closes the card; only the next click adds. The zoom buttons double and halve
the scale (`e2e/map.spec.ts`).

## Content

- Name the map for what its pins are: `aria-label="Ideas on the map"`.
- Each pin's `label` is the item's title; it names the pin and heads its card. Give the card a `status` ("Accepted").
- Say how many items have no place, in a `MapChip` in a corner: "40 ideas without a location".
- A legend's words name what each tone means on this map ("Accepted", "Rejected"); colour is never the only clue.
- The zoom buttons, the cluster's name ("12 pins: zoom in"), the map surface's name and the error line ("The map can't
  be shown here.") come through `labels` in other languages; counts follow the locale.

## Accessibility

**The map gives you:** a region named by its `aria-label`, pins as buttons named by their labels, one Tab stop for
any number of pins, Enter and Esc for the card with focus kept on the pin, named zoom buttons, credits as text, and
controls that swap sides right to left while the map doesn't mirror.

**You still own:**
- A list of the same items beside or instead of the map; people who can't use a map need another way in.
- A count of items with no place, and a way to reach them.
- Words for the legend, so tone colours never carry meaning alone.
- The map's height on the page.

## Related

- **Data table**: the list beside the map.
- **Segmented control**: the List / Map switch.
- **Banner**: a hint in a map overlay.
- **Side panel**: the full record, opened from the list.

## Provenance

- Built by agents from the prototype's Manage tab map (MapLibre with OpenFreeMap's tiles; Not in Figma).
- Reviewed by a person: not yet.
- Known limits: the platform draws its maps with ArcGIS; that engine is not written (the map takes any engine through
  `engine`, docs/DECISIONS.md, "Maps"); the arrow keys on the map surface pan it, but no test proves that yet; no
  drawing of areas or routes, pins only.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its words come through `labels`.
- 29 Oct 2026: built as Map view: the engine behind an interface (MapLibre by default, loaded on demand), engine-free
  pins with one Tab stop, `value` / `onChange` for the open pin, opt-in clusters, overlays, a legend and credits
  (docs/DECISIONS.md, "Maps").
