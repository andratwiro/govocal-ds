# Filter chips

## When to use

- Words this page uses: a *facet* is one thing a list can be filtered by (Assignee, Status, Tags); its *values* are
  the choices under it (Manager A; Proposed, Viewed); the *operator* is the word between them, "is" for one value,
  "is any of" for more.
- Under a list's Table toolbar, to show which filters are on and turn them off one by one. Each chip reads as a
  sentence, "Assignee is Manager A ×" or "Status is any of Proposed or Viewed ×", and "Clear" comes after the chips.
- Always together with a **Filter menu** in the toolbar above: the menu picks filters, the chips show them. They stay
  in step: removing a chip unticks the same value in the menu, and ticking in the menu adds a chip. Real screens: a
  phase's Manage tab (its list of inputs), the Input manager, Projects, the Inspiration hub, Messaging.
- When the list also has a quick view: a stat card above the table that filters it when pressed ("New ideas"). Its
  chip comes first and has the view's name only.

## When not to use

- To pick filters: use **Filter menu**. The chips only show and remove what is already on.
- For tags that belong to a record: use **Tag picker** (an idea's Cycling, Housing, added and removed on the idea).
  Ask "does removing it change the record, or only what the list shows?" Only the list: Filter chips.
- For a word that says what something is, with no ×: use **Badge** (a kind or a tag) or **Status badge** (a stage, such
  as Draft or Live).
- To switch between a few fixed views that are always shown, one at a time: use **Segmented control**. A quick view's
  chip only appears once someone has pressed the stat card, and goes with its ×.

## Anatomy

1. **Strip**: a light grey bar (the secondary surface) holding the chips. Chips wrap onto more lines when they don't
   fit. The strip disappears while no filter is on, so the table moves up.
2. **Chip**: the facet's icon (from the facet, the same as in the Filter menu; no icon if the facet has none), the
   facet's name, the operator in grey, the values, and a ×, split by thin lines.
3. **Quick-view chip** (only with a quick view): the view's name only, no icon or operator, first in the strip.
4. **Clear** (shown by default; a developer can turn it off, `showClear`): a quiet text button at the far end of the
   strip's first line. It turns every filter off.

Sizes: chips are 6px apart; the strip has no margin of its own.

## Behaviour

The chips are one group, after the WAI-ARIA [Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/): Tab lands on
the chips once, then the arrow keys move between them. Pressing a chip's × with a pointer removes it, like Delete. The
chip itself does nothing when pressed (it doesn't open the Filter menu).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus into the chips, onto the first; the next Tab goes on to Clear. | `play: Keyboard` |
| → and ← | Move between the chips. | `play: Keyboard` |
| Delete or Backspace | Turns the focused chip's filter off; focus moves to the next chip, or the previous one if it was the last. | `play: Keyboard` |
| Enter (on Clear) | Turns every filter off; the strip goes. | `play: Keyboard` |

When the strip goes while it holds focus (the last chip removed, or Clear), focus moves to the Filter menu's button
beside it, or else the table, never to the page (`play: With a filter menu`).

## Content

- The chip reads as a sentence: facet, operator, values. Facet names and values are written once, for the Filter menu,
  in sentence case ("Assignee", "Under consideration"), and the chips repeat them.
- Values are joined the way the language says "or": "Proposed, Viewed or Under consideration" in English. All the
  values show; the chip doesn't shorten them, so keep value names short (one to three words).
- Chips come in the order of the facets in the Filter menu, not the order they were turned on.
- Only "is" and "is any of" exist today: no "is not", ranges or text search.
- The words the chips say on their own, which a screen passes translated (`labels`): "is", "is any of", the × name
  "Remove the {facet} filter" ("Remove the Assignee filter"), "Clear", and the strip's name for screen readers,
  "Active filters".
- A quick-view chip says the view's name as its stat card says it: "New ideas".

## Accessibility

**The chips give you:** a named group with one Tab stop, chips read as sentences ("Assignee is Manager A"), Delete and
Backspace to remove, each × named for its facet, and values joined in the page's language.

**You still own** (the screen's designer and developer):
- Telling people the list changed: the Table toolbar's count does it when the two share the filters. Without a toolbar
  count, show the list's count somewhere else.
- Where focus goes after Clear: the strip disappears, so send focus to the Filter menu's button (the chips can't do it;
  see Provenance).
- The chips' words in the page's language (`labels`).

## Related

- **Filter menu**: picks the filters the chips show.
- **Table toolbar**: the row above, whose count follows the filters.
- **Data table**: the list being filtered.
- **Tag picker**: tags on a record, not filters.

## Provenance

- **Built by:** AI agents, from the prototype (the Manage tab's active-filter bar, modelled on the Linear app's). Not in
  Figma: design with the stories.
- **Reviewed by a person:** not yet.
- **Known limits:** pressing a chip doesn't open its facet in the Filter menu; the strip renders nothing at all while no
  filter is on, so focus on Clear is lost when it empties.

## Changes

- 30 Oct 2026: a chip's × leaves the Tab order (React Aria's tag group put each × in it), so the strip is the one
  Tab stop this page promised; Delete removes from the keyboard, the × from a pointer.
- 30 Oct 2026: when the last chip goes with focus on it, focus moves to the Filter menu's button (docs/DECISIONS.md,
  "Small fixes").
- 30 Oct 2026: values join with "or" in every language (Arabic and French said "and" before); the page reworded after
  a fresh-eyes read.
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: moved from Patterns to Components › Tables & lists (docs/DECISIONS.md, "Structure: one place for each
  part").
- 29 Oct 2026: the Filter menu and Filter chips replace the feeds' and the Inspiration hub's own filters
  (docs/DECISIONS.md, "Back office redesign on the current components", "Building from the prototype review").
- 29 Oct 2026: one way to filter a list (docs/DECISIONS.md, "Prototype review").
