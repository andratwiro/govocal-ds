# Tag picker

## When to use

- To show the tags on one item and let people add and remove them in place: an input's tags in the Manage tab's Side
  panel.
- When tags come from a known list (the platform's tags), searched once there are more than five.

## When not to use

- To filter a list by tags: use **Filter menu**.
- To pick tags in a setup step or a popover of your own: use **Option list**.
- To show tags that can't be changed: use **Badge**s.
- For one value from a list: use **Select**.

## Anatomy

1. **Tags**: each a removable Badge with its ×.
2. **Add tag**: "+ Add tag", after the tags.
3. **Popover**: an **Option list** (pick several, searchable), with a footer ("2 selected", Done) when `selectionLabel`
   is given.

## Behaviour

The tags follow the WAI-ARIA [Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) as one row, and Add tag
opens a popover with the Option list. Behaviour from React Aria's TagGroup and DialogTrigger, with the Option list's Menu.

| Key | What it does | Checked by |
| --- | --- | --- |
| Right arrow, Left arrow | Move between the tags. | `e2e/selectors.spec.ts` |
| Backspace or Delete | Removes the focused tag; focus moves to its neighbour, or to Add tag when none is left. | `e2e/selectors.spec.ts` |
| Enter (on Add tag) | Opens the list with focus in its search; typing narrows it, Down arrow and Enter tick a tag. | `e2e/selectors.spec.ts`, `e2e/inputs.spec.ts` |
| Esc | Empties the search, then closes the list and puts focus back on Add tag. | `e2e/selectors.spec.ts` |

## Content

- Name it with `aria-label` ("Tags"); the page shows its own label beside it.
- The button says "Add tag"; each × says "Remove <tag>"; the list's search "Search tags..." (named "Search tags"); all through `labels`.
- Tag names are short, in sentence case, as the platform holds them.
- The footer counts the ticks: `selectionLabel={n => `${n} selected`}`.

## Accessibility

**The picker gives you:** the tags as one focusable row with arrow keys, Delete and Backspace that remove and move
focus somewhere sensible, a named × on each tag, and focus back on Add tag when the list closes.

**You still own:**
- An `aria-label` and a visible label beside it.
- Saying a change where it matters (an Undo toast, if removing a tag is a big deal on that page).
- The words in the page's language.

## Related

- **Option list**: the list it opens.
- **Badge**: what each tag is drawn as.
- **Filter menu**: filtering by tags.
- **Side panel**: where the Manage tab shows it.

## Provenance

- Built by agents from the prototype's tag picker in the idea drawer; not in Figma yet.
- Reviewed by a person: not yet.
- Known limits: no story shows the footer's count; the only page using it is the Input manager.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its list is the Option list (several, searchable), shared with Filter menu and the setup steps
  (docs/DECISIONS.md).
