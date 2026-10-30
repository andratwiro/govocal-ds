# Option list

## When to use

- Inside a popover, to pick from a list with an optional search: a filter's submenu (Filter menu uses it), a phase's
  topic tags, the shared status or tags in the Manage tab's bulk edit.
- **Several** (the default): a box at the start of each row, the list stays open while ticking. With
  `selectionLabel`, a footer says "2 tags selected" with Done.
- **One** (`selectionMode="single"`): a check at the end of the chosen row; the popover closes on a choice.
- With counts beside each value ("14 ideas") when people pick by how much there is.

## When not to use

- For a form field that shows its value when closed: use **Select**.
- For actions (Edit, Delete): use **Menu**.
- For a toolbar's filters with chips: use **Filter menu**, which holds Option lists.
- For tags on a record, each removable: use **Tag picker**, which opens an Option list.
- For a few options always in view: use **Checkbox group** or **Radio group**.

## Anatomy

1. **Search** (optional; on by default past five options): the magnifier, then the hint ("Filter...").
2. **Rows**: box (several) · icon or Avatar · value · count; a check at the end (one).
3. **Empty line**: "No results" when the search matches nothing.
4. **Footer** (with `selectionLabel`): how many are chosen, and Done.

## Behaviour

The list is a menu with checkable items, after the WAI-ARIA [Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/),
with a search over it. Behaviour from React Aria's Menu inside its Autocomplete.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus into the list (or its search). | `play: Keyboard` |
| Down arrow | Moves to the next option, also while focus stays in the search. | `play: Keyboard`, `e2e/selectors.spec.ts` |
| Enter (pick several) | Ticks the option; the list stays open and focus stays in the search. | `e2e/selectors.spec.ts` |
| Enter (pick one) | Chooses the option; only it is marked. | `play: Keyboard` |
| Esc (search has text) | Empties the search; the ticks stay. | `e2e/selectors.spec.ts` |

## Content

- Name the list with `aria-label`, as a noun: "Tags", "Status", "Topic tags".
- The search's hint says what is filtered: `placeholder="Search tags..."`; "No results" when nothing matches.
- Counts read as words, through `countLabel`: "14 ideas" (numbers in the page's language).
- The footer counts what is chosen: "2 tags selected", "No tags selected"; the button is "Done".
- Values in sentence case, in a sensible order (most used, or alphabetical in long lists).

## Accessibility

**The list gives you:** a menu named by its label, checkable rows that say ticked or not, the search kept focused while
the arrows move, "No results" in the list, and Esc that empties a search before anything else.

**You still own:**
- The popover it sits in, and where focus goes when it closes (back to what opened it).
- A label, and the words in the page's language (`labels`, `placeholder`, `countLabel`, `selectionLabel`).
- Saying the result outside the list (a badge or a count on what opened it: "1 tag").

## Related

- **Filter menu**: a toolbar's filters built from Option lists.
- **Tag picker**: removable tags that open an Option list.
- **Select**: the same rows in a field.
- **Setup step**: opens a picker of this kind under its card.

## Provenance

- Built by agents from the prototype's filter submenu, tag pickers and setup steps; not in Figma yet.
- Reviewed by a person: not yet.
- Known limits: in the back office's topic-tags picker, the Esc that closes the popover flaked once under load
  (`e2e/project-overview.spec.ts`, "Set topic tags"); its play function leaves Esc to the popover's tests.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab, the arrow and Enter on a pick-one list.
- 29 Oct 2026: a Menu with selection rather than a list box, so it can serve as a Filter menu's submenu; "No results"
  as in Select; pick several = a box at the start, pick one = a check at the end (docs/DECISIONS.md).
- 29 Oct 2026: moved up from Filter menu's body, since Select with search, Tag picker, topic tags and areas need it.
