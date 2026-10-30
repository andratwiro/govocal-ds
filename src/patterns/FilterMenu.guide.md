# Filter menu

## When to use

- To filter a list by a few facets, each with values to tick: the phase Manage tab (Source, Status, Assignee, Tags,
  Reply), Projects (Visibility, Folder, Manager), the Inspiration hub (Method, Country, Population, Topic).
- Among the Table toolbar's tools, at the end, with **Filter chips** under the toolbar on the same `value`.
- With counts per value (`countLabel`, "48 ideas") so people see what a filter will leave.

## When not to use

- To show and remove the filters that are on: use **Filter chips** beside it.
- For one filter with a few values that always shows: a **Select** (quiet or pill) or a **Segmented control** reads
  more directly.
- For a list of actions: use **Menu**.
- To find a row by its words: use the **Search field** in the Table toolbar.

## Anatomy

1. **Button**: a bordered funnel Icon button; a dot shows on it while any filter is on, and its name says how many
   ("Filter (2 on)").
2. **Facets**: the menu's rows, each with an icon, a name and how many of its values are ticked, and a submenu.
3. **Options**: each facet's submenu, an Option list: a box, an optional icon or Avatar, the value and its count. A
   long list (more than five) gets a search.
4. **Clear all filters**: after a divider, once something is on.

## Behaviour

It follows the WAI-ARIA [Menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/). Ticking a value
keeps the menus open, so several can be ticked in a row.

| Key | What it does | Tested by |
| --- | --- | --- |
| Enter (on the button) | Opens the facets with focus on the first. | `play: Keyboard` |
| ↓ and ↑ | Move between the facets, or between a facet's values. | `play: Keyboard` |
| → (on a facet) | Opens its values. | `play: Keyboard` |
| Enter (on a value) | Ticks or unticks it; the menus stay open. | `play: Keyboard` |
| ← (in a facet's values) | Goes back to the facets. | `play: Keyboard` |
| Esc | Closes the menus and puts focus back on the button. | `play: Keyboard` |

## Content

- Facets are short nouns, as the list's columns name them: "Status", "Assignee", "Tags".
- Values are the list's own words, with counts in the page's numbers ("48 ideas", through `countLabel`).
- Its own words come through `labels`: "Filter", "Filter (2 on)", "Clear all filters", and the Option list's search
  and "No results".

## Accessibility

**The menu gives you:** a named button that says how many filters are on, a menu with arrow keys and submenus,
`menuitemcheckbox` values announced as ticked, a search on long facets, and focus back on the button when it closes.

**You still own:**
- Telling people the list changed: the Table toolbar's count, when it follows the filter.
- Sharing `value` with Filter chips, so what is on is visible without opening the menu.
- Words in the page's language (`labels`, facet names, values, `countLabel`).

## Related

- **Filter chips**: the filters that are on, under the toolbar.
- **Table toolbar**: where the button sits.
- **Option list**: each facet's values.
- **Menu**: the part it is built on.
- **Data table**: the list being filtered.

## Provenance

- **Built by:** AI agents, from the prototype (the Manage tab's filter, after Linear). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** it only holds which values are ticked (`value`); filtering the rows, and how facets combine, is the
  page's job. No "is not" operator.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: moved from Patterns to Components › Tables & lists (docs/DECISIONS.md, "Structure: one place for each
  part").
- 29 Oct 2026: Enter ticks and keeps the list open in pick-several lists, the Filter menu included (docs/DECISIONS.md,
  "Building from the prototype review").
- 29 Oct 2026: its options body moved up as Option list (docs/DECISIONS.md, "Building from the prototype review").
