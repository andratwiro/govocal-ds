# Select

## When to use

- To pick one value from a list that is too long to show, or too short of room: a folder, a role, a phase, an
  idea's assignee.
- **Field** (default) in a form, with its label above: "Role" when inviting people (with a description line under
  each role), "Project folder", "Subject".
- **Pill** for a value shown among others: New project's "Space: City parks", a status or assignee in a Side panel's
  property row (22 tall), Dashboard's "Project:" filter.
- **Quiet** for a toolbar's sort or a card's metric: "Sort: Newest".
- With `isSearchable` when the list is long enough that people look for a name (spaces, projects).
- Options may carry a 16 icon, an Avatar (people) or a description line.

## When not to use

- For two to six options that should all be read: use **Radio group**, or **Choice card** for tiles.
- To switch between views: use **Segmented control**.
- For a list of actions (Edit, Duplicate, Delete): use **Menu**.
- To pick several values with counts or a "Done": use **Option list** (or **Filter menu** in a toolbar).
- For tags on a record, each removable: use **Tag picker**.
- To pick the language a multilingual field shows: use **Locale switcher**.

## Anatomy

1. **Label** (field look): above the trigger. Pills and quiet ones name themselves with `aria-label`.
2. **Trigger**: an optional 16 icon (or the chosen option's), an optional prefix ("Space:"), the value, a chevron.
   Field and quiet: 36 or 32 tall; pill: 28 or 22.
3. **Popover list**: a search at the top (with `isSearchable`), then the options: icon or Avatar, name, description
   line, a check at the end of the chosen one.
4. **Description** and **Error** (field look, optional).

## Behaviour

The trigger is a button that opens a list after the WAI-ARIA [Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/).
Behaviour from React Aria's Select (and its Autocomplete when searchable).

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (on the trigger) | Opens the list, focus on an option; with a search, focus goes to the search. | `e2e/form-validation.spec.ts`, `e2e/selectors.spec.ts` |
| Typing (in the search) | Narrows the list; "No results" when nothing matches. | `e2e/selectors.spec.ts` |
| Down arrow, Up arrow (in the search) | Move through the options while focus stays in the search. | `e2e/selectors.spec.ts` |
| Enter (on an option) | Chooses it, closes the list and puts focus back on the trigger. | `e2e/form-validation.spec.ts`, `e2e/selectors.spec.ts` |
| Esc (search has text) | Empties the search, the list stays open. | `e2e/selectors.spec.ts` |
| Esc | Closes the list and puts focus back on the trigger. | `e2e/selectors.spec.ts` |

## Content

- A field's label names the value, in sentence case: "Role", "Project folder". A pill's or quiet trigger's prefix
  says it in a word and a colon ("Space:", "Sort:"), and `aria-label` names it without the colon.
- Option names are short and parallel; put what an option does in its `description` ("Can edit every project").
- A placeholder for no value yet: "Choose a person".
- The search's hint names what is searched: `searchPlaceholder="Search spaces"`; "No results" when nothing matches
  (`emptyLabel` or `labels`).
- Pass `value` / `onChange`, never the deprecated `selectedKey`.

## Accessibility

**The select gives you:** a button that says its name and value, a list named after the field, the chosen option
marked selected, focus back on the trigger when it closes, a search that keeps focus while the arrows move, and
"No results" said in the list.

**You still own:**
- A name: `label`, or `aria-label` for pills and quiet triggers (the prefix is seen, not read).
- Option names that make sense alone (not "Yes" under a question in the label).
- The words in the page's language (`labels`, `searchPlaceholder`, `emptyLabel`).

## Related

- **Option list**: the same rows, several at once, in a popover of your own.
- **Radio group**: one of a few, all in view.
- **Menu**: actions, not values.
- **Avatar**: the face before a person option.
- **Side panel**: where 22-tall pill selects sit in property rows.

## Provenance

- Built by agents from the prototype's selectors (New project's Space pill, the drawer's property pills, the toolbar
  sorts) on React Aria's Select; not in Figma yet.
- Reviewed by a person: not yet.
- Known limits: several values at once (`selectionMode="multiple"`) has no story; use Option list for that today.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: `size` is checked per look (pill 22 | 28, field and quiet 32 | 36); words through `labels`.
- 29 Oct 2026: five names for one pill selector became Select; "No results" for every empty search; pick one shows a
  check at the end (docs/DECISIONS.md).
- 29 Oct 2026: moved up from Base to Components › Forms with the field, pill and quiet triggers, the search and the
  option rows.
