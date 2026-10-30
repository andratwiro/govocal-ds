# Locale switcher

## When to use

- To pick which of the platform's languages a multilingual field shows, with a mark per language saying whether it has
  text yet. Most pages get it inside **Multilingual text field** or **Multilingual rich text editor** and never place
  it themselves.
- On its own when one switcher drives several fields at once: pass all their Multilocs as `values` and each mark counts
  every field (a phase's title and description share the Title field's menu).
- **Menu** (`kind="menu"`): the compact version in a Title field's end: the language icon, the shown code, "1/3"
  while languages are empty, a chevron, the languages in a list.

## When not to use

- For a text field in several languages: use **Multilingual text field**, which holds its own switcher.
- For a description in several languages: use **Multilingual rich text editor**.
- For the interface's language or the top bar's content language: use **Select** (quiet), as the top bar does.
- For tabbed panels with status dots: use **Tabs**.

## Anatomy

1. **Language buttons** (`kind="buttons"`): a 24-tall chip per language code (EN · NL-BE · FR-BE); the shown one is
   filled with the primary colour, the others on the pill grey; the row wraps.
2. **Mark** (with `values`): an 8 dot on each: green filled, grey empty (optional), amber empty and required, red once
   invalid.
3. **Menu trigger** (`kind="menu"`): language icon, code, "n/m" filled count, chevron; its list shows each language's
   name and mark.

## Behaviour

The buttons are one radio group, after the WAI-ARIA [Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/);
the menu opens a list after the [Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/). Behaviour from
React Aria's RadioGroup and Radio, or Select.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Lands on the shown language (one stop for the row); the next Tab goes on into the field. | `e2e/multilingual-text-field.spec.ts` |
| Right arrow, Left arrow | Pick the next or previous language; the field follows. | `e2e/multilingual-text-field.spec.ts` |
| Down arrow (menu) | Opens the list of languages, each saying filled or empty. | `e2e/multilingual-text-field.spec.ts` |
| Enter (menu, on a language) | Picks it and closes the list. | `e2e/multilingual-text-field.spec.ts` |

## Content

- Codes as the platform writes them, upper case: "EN", "NL-BE", "FR-BE". Language names follow the interface's locale
  ("Dutch (Belgium)"), said by the browser, never hand-written.
- Each button reads "EN, English, filled" to screen readers; the marks' words ("filled", "empty", "empty, required",
  "has an error") and the menu's "1 of 3 languages filled" come through `labels`.
- Name the row after the field: "Language of Title".

## Accessibility

**The switcher gives you:** one radio group with arrow keys, each language read with its name and mark (not colour
alone), the menu's filled count read in words, and names in the interface's language.

**You still own:**
- A name for the row (`aria-label`, or the field's label through the multilingual field).
- `values` that are really the field's text, so the marks tell the truth.
- Words in the page's language (`labels`).

## Related

- **Multilingual text field**: a text field with this switcher.
- **Multilingual rich text editor**: an editor with this switcher.
- **Title field**: holds the menu in its end.
- **Select**: the top bar's content-language picker.

## Provenance

- Built by agents from the platform's multilingual fields and the prototype's language button; not in Figma (the
  designer's drawings for multilingual fields are pending: docs/OPEN-DECISIONS.md).
- Reviewed by a person: not yet.
- Known limits: the marks' colours and the shown chip's fill are the agents' call until the drawings land.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its words moved onto `labels` (the marks as `mark…` keys), and language names follow the locale it is
  handed (docs/DECISIONS.md).
- 29 Oct 2026: built as a React Aria radio group (Tab lands on the shown language, arrows move and pick), the shown chip
  in the primary fill, Tabs' 8 dot colours for the marks; the menu kind for the Title field's end.
