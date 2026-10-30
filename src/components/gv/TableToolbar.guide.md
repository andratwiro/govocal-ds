# Table toolbar

## When to use

- In the row above every admin list, between the Panel's head and the Data table: the count at the start ("124
  ideas"), the tools at the end (a collapsible Search field, the Filter menu, an export menu). The phase Manage tab,
  the Input manager, Projects, Messaging, Users, the Inspiration hub, the Dashboard's lists.
- With a **Selection bar** as its `start`: while rows are ticked the bar takes the count's place, and the tools stay
  where they were.
- With the count following what the table shows, search and filters included ("19 ideas" after a search).

## When not to use

- For a page's own actions (Create, Export all) above everything: put them in the **Page header** or the
  **Panel**'s head actions.
- For the filters that are on: use **Filter chips**, under the toolbar.
- For the actions on ticked rows: use **Selection bar** (in the toolbar's `start`).
- For a toolbar of formatting buttons over a text: use **Rich text toolbar**.
- For a row of buttons with no count and no arrow keys: use **Inline**.

## Anatomy

1. **Start**: the count heading (`TableToolbarHeading`, an h3 by default), or a Selection bar while rows are ticked.
2. **Tools**: at the end, in a toolbar: a collapsible Search field (a button until it opens or holds a query), the
   Filter menu (it wears a dot while a filter is on), an export menu.

## Behaviour

The tools follow the WAI-ARIA [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/): one Tab stop for
all of them, the arrow keys between them.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus into the tools, onto the first. | `play: Keyboard` |
| Tab (in the tools) | Leaves them. | `e2e/toolbars.spec.ts` |
| → and ← | Move between the tools. | `play: Keyboard` |
| ← and → (in the search field) | Move the caret; only at the field's edge do they move to the next tool. | `e2e/table.spec.ts` |

## Content

- The count says how many and of what, in the page's numbers: "124 ideas", "1 user". It follows search and filters.
  An empty list says so in an Empty state, not in the count.
- Name the tools (`aria-label`) for the list when a page has more than one: "Input tools". The default is "Table
  tools" (`labels.tools`).
- The search's name says what it searches: "Search ideas", "Search projects".

## Accessibility

**The toolbar gives you:** a count heading that screen readers hear politely as it changes, the tools as one named
toolbar with arrow keys, and a search field whose arrows move the caret before they move focus.

**You still own:**
- A count that matches what the table shows, in words ("124 ideas").
- Names for the search and each tool.
- A distinct `aria-label` when two lists share a page.
- Words in the page's language.

## Related

- **Data table**: the list under it.
- **Selection bar**: takes the count's place while rows are ticked.
- **Filter menu** and **Filter chips**: the filter button in the tools and the chips under the row.
- **Search field**: its collapsible search.
- **Panel**: the frame the toolbar and table sit in.

## Provenance

- **Built by:** AI agents, from the prototype (the Manage tables' and the Audience table's top row). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** the tools don't fold into a menu on a narrow screen.

## Changes

- 30 Oct 2026: Tab leaving the tools is checked in a browser; the play function can't press it.
- 30 Oct 2026: this page written; a play function proves Tab and the arrows between tools.
- 29 Oct 2026: moved to Components › Tables & lists with the rest of the list kit (docs/DECISIONS.md, "Structure: one
  place for each part").
- 29 Oct 2026: the count and search in the Table toolbar on every admin list (docs/DECISIONS.md, "Back office redesign
  on the current components").
