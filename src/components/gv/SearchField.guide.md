# Search field

## When to use

- To narrow a list as people type: "Search projects" in Projects, "Search users", "Search emails" in Messaging.
- In a Table toolbar, collapsible (`isCollapsible`): a search button that opens into the field, as the prototype's
  Manage tables do ("Search ideas").
- With a visible label in a form, when the search is a field among others ("Find a project").

## When not to use

- To pick one value from a known list: use **Select** with `isSearchable`.
- To pick several from a list with a search over it: use **Option list**.
- For words that are saved: use **Text field**.
- To filter by fixed facets (status, assignee): use **Filter menu**.

## Anatomy

1. **Magnifier**: at the start.
2. **Input**: the query, with a placeholder that says what is searched.
3. **Clear button** (×): at the end once there is text.
4. **Label**, **Description**, **Error** (optional).

Collapsible: a bordered search **Icon button** with the tooltip "Search" until it is opened; open it is 180 wide.

## Behaviour

No WAI-ARIA APG pattern covers a search input: it is the browser's own search field. The list it filters is the
page's.

| Key | What it does | Tested by |
| --- | --- | --- |
| Enter (on the search button) | Opens the collapsible field with focus inside. | `play: Keyboard` |
| Esc | Clears the text and keeps focus in the field. | `play: Keyboard` |
| Esc (empty, collapsible) | Folds the field and puts focus back on the search button. | `play: Keyboard` |

## Content

- The placeholder says what is searched: "Search projects", "Search users". It names the field too when there is no
  label, so pass the same words as `aria-label`.
- Say what the search looks in when it isn't obvious: `description="Search by title or folder."`.
- The results' count and "No results" belong to the list, beside it, in a status people hear.
- The button's tooltip is "Search"; pass another language through `labels={{search: '…'}}`.

## Accessibility

**The field gives you:** a search box named by its label or `aria-label`, a clear button React Aria names in the
page's language, Esc to clear, and a collapsible button that shares the field's name and gives focus back when it folds.

**You still own:**
- A name (`aria-label` or `label`).
- Announcing the results: a count in a `role="status"` near the list, so people know the search did something.
- Keeping the list's focus order sensible after it narrows.

## Related

- **Table toolbar**: where the collapsible search sits beside the count and the filters.
- **Select**: a search over a pick-one list.
- **Option list**: a search over a pick-several list.
- **Filter menu**: facets beside the search.

## Provenance

- Built by AI agents from the prototype (its Manage tables' collapsible search); not in Figma.
- Reviewed by a person: not yet.
- Known limits: Enter submitting (`onSubmit`) has no story.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: moved up from Base to Components › Forms (used on two screens or more); the collapsible toolbar search
  and its tooltip added.
