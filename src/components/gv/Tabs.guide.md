# Tabs

## When to use

- To split one page or one card into sections people move between, each with its own panel: Audience's Participants /
  Demographics / Traffic, the report list's "Your reports (18)", the Projects list's views with icons.
- With a count (`count`) when each section is a list: "All reports (18)".
- With status dots (`status`) for a multilingual field's languages, green complete, red missing.
- **Vertical** (`orientation="vertical"`) for a side list beside its panel, and **grouped** (`GroupedTabs`) for the
  Project settings dialog's side list under "Project" and "Inputs".

## When not to use

- To switch between views of the same content (List / Map, a chart's range): use **Segmented control**.
- To go to another page: use **Link**s or the **Side nav**.
- For a choice in a form: use **Radio group**.
- For content that should all be read in order: one long page in **Panel**s reads better than hiding parts.

## Anatomy

1. **Tab list** (`TabList`): a row of tabs over a hairline, named by `aria-label`.
2. **Tabs** (`Tab`): the words, with an optional 16 icon before them, a count "(18)" or a status dot after them; the
   chosen tab strong on a 2px line.
3. **Panels** (`TabPanels`, then a `TabPanel` per tab with the same `id`): only the chosen one is drawn; the height
   eases between panels. `panelPadding`: `flush` (default) puts 12 above and below the content and none at the
   sides, so it lines up with the tab list and with a page without tabs; `inset` is 12 all round; `none` is nothing.
4. **Group headings** (grouped side list only): small headings that never take focus.

## Behaviour

It follows the WAI-ARIA [Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): the tab list is one Tab stop,
and moving to a tab shows its panel at once.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the chosen tab; the next Tab moves into its panel. | `play: Keyboard` |
| → and ← | Choose the next or previous tab and show its panel; they wrap at the ends. | `play: Keyboard` |
| End and Home | Choose the last or the first tab. | `play: Keyboard` |
| ↓ and ↑ (grouped side list) | Move through the tabs across groups, skipping the headings; the panel follows. | `e2e/tabs.spec.ts` |

## Content

- One or two words per tab, nouns, sentence case: "Participants", "Your reports", "Folders".
- Name the tab list (`aria-label`) for what it divides: "Audience", "Reports", "Settings".
- A count is a number in brackets after the label, in the page's numbers; it is part of the tab's name.
- A status dot says its meaning in words to screen readers ("ES-ES, missing"); the words come through `labels`
  (complete, incomplete, missing).

## Accessibility

**The tabs give you:** a tab list with one Tab stop, arrow keys, Home and End, the chosen tab announced, panels named
by their tabs, counts and dots read as part of the tab's name, and a grouped side list whose headings never take focus.

**You still own:**
- An `aria-label` for the tab list.
- Every `TabPanel` inside `TabPanels` (a development warning says so).
- Something focusable in a panel, or the panel itself takes focus, so keyboard users can reach it.
- Words in the page's language (`labels`).

## Related

- **Segmented control**: switching views of the same content.
- **Modal**: the settings dialog that holds the grouped side tabs.
- **Panel**: each tab's content often sits in one.
- **Locale switcher**: the multilingual field's languages, with the same dots.

## Provenance

- **Built by:** AI agents, from the prototype (the underline tabs, counts, icons, status dots and the settings side list).
  Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** the horizontal tab list doesn't scroll or fold when its tabs outgrow the width.

## Changes

- 30 Oct 2026: `panelPadding` (`flush` by default, `inset`, `none`): a panel's content no longer sits 12 in from
  the tab list's edge (docs/DECISIONS.md, "Deep review 2: system parts").
- 30 Oct 2026: this page written; a play function proves Tab, the arrows, Home and End.
- 29 Oct 2026: a `TabPanel` outside `TabPanels` warns in development; a caller's class is added to React Aria's, not
  put in its place (docs/DECISIONS.md, "Composition contracts in code").
- 29 Oct 2026: Project settings' side tabs grouped under headings (docs/DECISIONS.md, "Back office redesign on the
  current components").
- 29 Oct 2026: moved up from Base to Components, used on two or more screens (docs/DECISIONS.md, "Building from the
  prototype review").
