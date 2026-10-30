# Selection bar

## When to use

- While rows of a list are ticked, to act on all of them at once: change status, assign, tag, copy to phase or post
  an official update on ideas (the phase Manage tab); add to group or export (Users); delete (the Input manager).
- As the Table toolbar's `start`: it takes the count's place while rows are ticked and gives it back (`children`) when
  none are, so the tools beside it never move.
- With a contextual action that joins while a view is on ("Dismiss warnings" on the content-warnings view).

## When not to use

- For actions on one record: use the row's options **Menu**, or the **Side panel**'s actions.
- For the list's own actions, ticked or not ("Export all", "Create"): put them in the **Panel**'s head or the
  **Table toolbar**'s tools.
- To confirm a bulk delete: open an **Alert dialog** from the bar's button.

## Anatomy

1. **Count**: "2 selected", read out as it changes.
2. **Actions**: secondary 32 Buttons with a 16 icon; a button opens its own menu (statuses, managers, groups) or acts
   at once.
3. **×**: an Icon button that clears the selection.

## Behaviour

Behaviour from React Aria's `Toolbar` and `MenuTrigger`, through the system's Button, Icon button and Popover.

It follows the WAI-ARIA [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/): one Tab stop, the arrows
between the actions.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus into the bar, onto its first action. | `play: Keyboard` |
| → and ← | Move between the actions and the ×. | `play: Keyboard` |
| Enter | Presses the focused action (or opens its menu). | `play: Keyboard` |
| Enter (on ×) | Clears the selection; the bar gives way to the count. | `play: Keyboard` |

## Content

- Actions are a verb or the field they set, one or two words: "Status", "Assign", "Tags", "Copy to phase", "Add to
  group", "Export selected".
- The count is "N selected" in the page's numbers (`labels.selected`); the × is "Clear selection" (`labels.clear`);
  the bar's name "Selection actions" (`labels.actions`).
- Name the bar (`aria-label`) for the list when a page has more than one: "Bulk actions".

## Accessibility

**The bar gives you:** a named toolbar with one Tab stop and arrow keys, a count read politely as it changes, menu
buttons announced as such, and a named ×.

**You still own:**
- Where focus goes after × or an action empties the selection: the bar disappears with focus inside it.
- Saying what a bulk action did, in a **Toast** with Undo where it can be undone.
- Asking first, in an Alert dialog, before a bulk action that can't be undone.
- Words in the page's language (`labels`, the action names).

## Related

- **Table toolbar**: holds the bar in its `start`.
- **Data table**: whose ticked rows it acts on.
- **Alert dialog**: the confirm before a bulk delete.
- **Toast**: what a bulk action says it did.
- **Menu**: what a menu action opens.

## Provenance

- **Built by:** agents, from the prototype (its one `.pj-inbar` bulk bar). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** focus isn't moved anywhere when the bar disappears; with many actions the bar doesn't fold them into
  a "More" menu.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: moved from Patterns to Components › Tables & lists (docs/DECISIONS.md, "Structure: one place for each
  part").
- 29 Oct 2026: `actions` became `items`, each a menu button or a plain button with its own `onPress` (docs/DECISIONS.md,
  "Composition contracts in code").
- 29 Oct 2026: one Selection bar on the Manage tab, the Input manager and Users: secondary buttons, no chevrons, a ×
  that clears (docs/DECISIONS.md, "Prototype review").
