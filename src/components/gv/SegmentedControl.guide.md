# Segmented control

## When to use

- To switch between two to five views or ranges of the same content, one at a time, with the choice taking effect at
  once: the phase's Build / Manage / Insights, the Manage tab's List / Map, a chart's range, the Dashboard's
  resolution, a report's Length.
- **36** (default) for a page's main switch; **30** (`size={30}`) for a switch in a card's head or a toolbar (a
  dashboard card's range, List / Map).
- With an unread dot (`isUnread`) and a `tooltip` that says what it counts ("18 new ideas").

## When not to use

- For sections of a page, each with its own panel and content: use **Tabs**.
- For a choice in a form that is saved with the form: use **Radio group** (or **Choice card** for big options).
- For more than five options, or options with long names: use **Select**.
- To turn one setting on or off: use **Switch**.
- For actions: use **Button**s; a segment selects, it never does.

## Anatomy

1. **Track**: the grey rounded bar, 36 (or 30) tall.
2. **Segments** (`SegmentedControlItem`): the words, with an optional 16 (or 14) icon before them.
3. **Indicator**: the white raised block behind the chosen segment; it slides when the choice changes.
4. **New dot** (optional): in a segment's top corner, with its tooltip.

## Behaviour

Behaviour from React Aria's `ToggleButtonGroup`, `ToggleButton` and `SelectionIndicator`, through the system's
Tooltip.

With `selectionMode="single"` it is a radio group: one Tab stop, the arrows move between segments, and Enter or Space
picks the focused one. It follows the WAI-ARIA [Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/),
except that the arrows move focus without picking.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus into the control, onto a segment; the next Tab leaves it. | `play: Keyboard` |
| → and ← | Move focus to the next or previous segment, without picking it. | `play: Keyboard` |
| Enter or Space | Picks the focused segment. | `play: Keyboard` |
| (focus on a segment with a tooltip) | Shows the tooltip and reads it as the segment's description. | `e2e/segmented-control.spec.ts` |

## Content

- One or two words per segment, nouns, sentence case: "List", "Map", "Daily", "Weekly", "Build".
- Segments of about the same length; the longest sets the feel of the row.
- Name the control (`aria-label`) for what it switches: "View", "Range", "Resolution".
- The New dot's meaning is "Unread" by default (`labels.unread`); its tooltip says the number ("18 new ideas").

## Accessibility

**The control gives you:** a named radio group with one Tab stop, arrow keys, the chosen segment announced as checked,
icons hidden from screen readers, and tooltips read as descriptions.

**You still own:**
- An `aria-label` for the group.
- `disallowEmptySelection`, so the chosen view can't be unticked into nothing.
- Showing the content the choice switches to, and keeping the choice when the page re-renders.
- Words in the page's language.

## Related

- **Tabs**: sections with their own panels.
- **Radio group**: a choice saved with a form.
- **Select**: a choice from many.
- **New dot**: the unread mark a segment can carry.
- **Tooltip**: what the dot stands for.

## Provenance

- **Built by:** agents, from Figma (Segmented control, node 14:883, and its item, 14:882) and the prototype (the 30
  range switch, the unread tooltip).
- **Reviewed by a person:** not yet.
- **Known limits:** the track doesn't wrap, so it suits up to about five short segments.

## Changes

- 30 Oct 2026: this page written; its doc comment now says what it is for; a play function proves the keyboard table.
- 30 Oct 2026: List / Map on the Manage tab is a 30 Segmented control (docs/DECISIONS.md, "Back office: the project
  lead's asks").
- 29 Oct 2026: `size` takes `36 | 30` (was default | small) (docs/DECISIONS.md, "Public API and prop names").
- 29 Oct 2026: the segment is 28 in a 4-padded track, still 36 (docs/DECISIONS.md, "Token names").
