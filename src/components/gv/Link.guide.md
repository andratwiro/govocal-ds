# Link

## When to use

- To go to another page, a section or a file: "Go to Input Manager" in a dashboard card, a project's title in a list,
  "Edit projects", "Back to the back office".
- In a sentence, where the link takes the size of the words around it.
- As a row's or a card's small action that leads somewhere: `size="small"` (12/16) in rows and cards, `size="medium"`
  (14/20) for a section's action.

## When not to use

- For an action that stays on the page (save, open a dialog, add a row): use **Button** (quiet for a light one).
- For a row of links back up the page tree: use **Breadcrumbs**.
- For the app's main navigation: use **Side nav**.
- For moving between pages of a list: use **Pagination**.
- For sections of the same page: use **Tabs**.

## Anatomy

1. **Words**: in the link blue, weight 500, a darker blue on hover; never underlined or filled.
2. **Icon** (optional): a small icon before or after the words ("+ Add tag", "Go to Input Manager →").

Sizes: small (12/16), medium (14/20), or the text's own size when left out.

## Behaviour

It follows the WAI-ARIA [Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/): `href` navigates (through
`AppProvider`'s router when one is set), `onPress` runs for a link that is handled in code, and `isDisabled` greys it
out and takes it out of the tab order.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the link. A disabled one is skipped. | `play: Keyboard` |
| Enter | Follows the link. | `play: Keyboard` |

## Content

- Say where it goes, in a few words: "Go to Input Manager", "Edit projects", "How it works". Never "Click here" or
  "here".
- Sentence case, no full stop unless it ends a sentence.
- A link to a file says what and which format: "Download the results (PDF)".
- Words that make sense out of context, since screen reader users list links by name.

## Accessibility

**The link gives you:** a real link to assistive tech (`<a href>` when it has one), the focus ring, Enter, and a
disabled state that leaves the tab order.

**You still own:**
- Words that say where it goes, read on their own.
- An `href` for real navigation, so it opens in a new tab and shows its address; `onPress` only for links handled in
  code.
- Saying so when a link opens something outside the app.

## Related

- **Button**: an action that stays on the page.
- **Breadcrumbs**: links up the page tree.
- **Side nav**: the app's main navigation.
- **Action row**: a whole row that leads somewhere.

## Provenance

- **Built by:** AI agents, from the prototype (its tertiary text links, small and medium). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** no "opens in a new tab" mark; the file still lives in `src/components/` until the folder move.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab and Enter.
- 29 Oct 2026: moved from Base to Components › Navigation; exported from `govocal-ds` (docs/DECISIONS.md, "Structure:
  one place for each part").
- 29 Oct 2026: `size` stays small | medium, a type size, not a height (docs/DECISIONS.md, "Public API and prop names").
- 29 Oct 2026: blue text is the Link's alone; the prototype's grey text button is a quiet Button (docs/DECISIONS.md,
  "Fidelity review against Figma and the prototype").
