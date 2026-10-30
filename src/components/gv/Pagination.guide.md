# Pagination

## When to use

- At the foot of an admin list that people page through: Projects, the Input manager, Messaging, Reporting, a Data
  table in a Panel ("Idea pages"). It goes in the Panel's foot, at the end.
- When positions should stay put and a ticked page should mean a known set of rows.
- With the list's count in the Table toolbar above it, so people know how much there is.

## When not to use

- For a list of thousands that people scroll and search rather than page: use a virtualised **Data table**
  (`isVirtualized`), as the Users list does.
- To step through records one at a time beside a list ("‹ 3 of 124 ›"): use the **Side panel**'s pager.
- For steps of a form: put Back and Next **Button**s in the **Modal**'s footer.
- For a list of ten or so: show it all in the **Data table** and leave the pager out.

## Anatomy

1. **‹ and ›**: square quiet buttons at each end; they fade and turn off where there is nowhere to go.
2. **Pages**: square 28 buttons, 8 apart, the current page filled.
3. **Ellipsis**: "…" stands for the pages not shown.

Up to seven pages shows them all; past that it keeps seven slots (the first page, the last, and five that slide with
the current one), so it never changes width as you walk it. In right to left, pages run from the right and ‹ › point
the reading way.

## Behaviour

Behaviour from React Aria's `Button`.

It is a `nav` landmark of buttons, after the WAI-ARIA [Landmark regions](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/)
practice: each page button is named "Page N", and the current one is `aria-current="page"`.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves through ‹, each page and ›; a turned-off arrow is skipped. | `play: Keyboard` |
| Enter or Space | Goes to that page. | `play: Keyboard` |
| Enter (on ‹ or ›, onto the first or last page) | Goes there and moves focus to the current page, since the arrow just turned off. | `play: Keyboard` |

`e2e/table.spec.ts` checks the same focus move with a click onto the last page.

## Content

- Name the landmark for what it pages (`aria-label`): "Idea pages", "Project pages". Give each pager on a page its own.
- The words are "Previous page", "Next page" and "Page N" by default (`labels`); numbers follow the page's language.
- Show the list's total elsewhere (the Table toolbar's count, "124 ideas"); the pager doesn't say it.

## Accessibility

**The pager gives you:** a named `nav` landmark, page buttons named "Page N" in the page's numbers, the current page
marked, arrows that turn off at the ends, and focus that lands on the current page instead of being lost on a
turned-off arrow.

**You still own:**
- A distinct `aria-label` for each pager on a page.
- Moving the list to the new page and keeping the ticked rows' meaning clear when the page changes.
- Telling people how many results there are (the count above the list).
- Words in the page's language (`labels`).

## Related

- **Data table**: the list it pages; `isVirtualized` for very long lists.
- **Panel**: its foot holds the pager.
- **Table toolbar**: the count above the list.
- **Side panel**: its record pager steps through one record at a time.

## Provenance

- **Built by:** agents, from the prototype (the Audience table's pager, `.gv-bo-pager`). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** no page size choice and no "go to page" field.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab, Enter, Space and the focus move at the first page.
- 30 Oct 2026: the Users list drops it for one virtualised table; the other admin lists keep their pages
  (docs/DECISIONS.md, "Back office: the project lead's asks").
- 29 Oct 2026: Pagination on every admin table, over "scroll down to load more" (docs/DECISIONS.md, "Building from the
  prototype review").
