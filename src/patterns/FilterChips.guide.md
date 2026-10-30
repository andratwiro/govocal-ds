# Filter chips

## When to use

- Under a list's Table toolbar, to show which filters are on and turn them off one by one: "Assignee | is | Manager
  A | ×", "Status | is any of | Proposed, Viewed | ×", with "Clear" at the end.
- Always beside a **Filter menu**, sharing its `value`, so the two stay in step: the phase Manage tab, the Input
  manager, Projects, the Inspiration hub, Messaging.
- With a quick view from the stats above the table (`metric`, "New ideas") as the first chip.

## When not to use

- To pick filters: use **Filter menu** (the chips only show and remove them).
- For tags on a record that people add and remove: use **Tag picker**.
- For a status or a label that isn't a filter: use **Badge** or **Status badge**.
- For a pick-one view switch: use **Segmented control**.

## Anatomy

1. **Strip**: a quiet bar holding the chips, wrapping onto more lines when it needs to. It disappears while no filter is
   on.
2. **Chip**: the facet's icon and name, the operator ("is", "is any of"), the values joined as the language lists them,
   and a ×.
3. **Metric chip** (optional): a quick view's name only, first.
4. **Clear** (optional, `showClear`): at the end; turns every filter off.

## Behaviour

Behaviour from React Aria's `TagGroup`, `TagList`, `Tag` and `Button`.

The chips are one group after the WAI-ARIA [Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/): one Tab
stop, the arrows between chips.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus into the chips, onto the first; the next Tab goes on to Clear. | `play: Keyboard` |
| → and ← | Move between the chips. | `play: Keyboard` |
| Delete or Backspace | Turns the focused chip's filter off; focus moves to a chip beside it. | `play: Keyboard` |
| Enter (on Clear) | Turns every filter off; the strip goes. | `play: Keyboard` |

## Content

- The chip reads as a sentence: facet, operator, values. The facet's name and values come from the facets you pass
  (the same as the Filter menu's).
- The words it says itself come through `labels`: "is", "is any of", "Remove the Assignee filter", "Clear", and the
  strip's name, "Active filters".
- A metric chip says the quick view's name as the stats row says it: "New ideas", "Unassigned".

## Accessibility

**The chips give you:** a named group with one Tab stop, chips read as sentences ("Assignee is Manager A"), Delete and
Backspace to remove, each × named for its facet, and values joined in the page's language.

**You still own:**
- Telling people the list changed: the Table toolbar's count does it when the two share the filter.
- Where focus goes when Clear empties the strip and it disappears.
- Words in the page's language (`labels`).

## Related

- **Filter menu**: picks the filters the chips show.
- **Table toolbar**: the row above, whose count follows the filters.
- **Data table**: the list being filtered.
- **Tag picker**: tags on a record, not filters.

## Provenance

- **Built by:** agents, from the prototype (the Manage tab's active-filter bar, after Linear). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** pressing a chip doesn't open its facet in the Filter menu; the strip renders nothing at all while no
  filter is on, so focus on Clear is lost when it empties.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: moved from Patterns to Components › Tables & lists (docs/DECISIONS.md, "Structure: one place for each
  part").
- 29 Oct 2026: the Filter menu and Filter chips replace the feeds' and the Inspiration hub's own filters
  (docs/DECISIONS.md, "Back office redesign on the current components", "Building from the prototype review").
- 29 Oct 2026: one way to filter a list (docs/DECISIONS.md, "Prototype review").
