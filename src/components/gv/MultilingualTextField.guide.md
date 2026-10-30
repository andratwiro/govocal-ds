# Multilingual text field

## When to use

- For a text people write in each of the platform's languages: a new project's title, a custom page's title in Pages
  & menu, a user group's name, the platform's name in Settings, an event's title, a Report view heading. `value` is
  the platform's Multiloc (`{en: '…', 'nl-BE': '…'}`).
- With `isMultiline` (a text area, with a counter) for a longer plain text.
- With `isRequired` when every language needs text; the error names the missing ones ("Add the text in French (Belgium)
  and 1 more language").
- With `aria-label` and no visible label, where the platform's back office shows the switcher alone over the field.

## When not to use

- For a text in one language only: use **Text field**.
- For formatted text in each language: use **Multilingual rich text editor**.
- For the big title at the top of an editor: use **Title field** with its language menu.
- To pick the language of several fields at once: place one **Locale switcher** and hide the fields' own.

## Anatomy

1. **Label row**: the label, the **Required marker** (with `isRequired`), then the **Locale switcher** at the end
   (wrapping under the label with many languages).
2. **Input**: the shown language's text, read in that language and running its way (right to left for Arabic).
3. **Foot**: the description, the error, the counter (`showCounter`).

One language only: no switcher, and no language in the input's name.

## Behaviour

The language row follows the WAI-ARIA [Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/); the input
is the browser's own text field. Behaviour from React Aria's TextField and the Locale switcher's RadioGroup.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Lands on the shown language, then goes on into the input. | `e2e/multilingual-text-field.spec.ts` |
| Right arrow, Left arrow (on the languages) | Show the next or previous language; each keeps its own text. | `e2e/multilingual-text-field.spec.ts` |
| Typing | Fills only the shown language; its mark turns filled. | `e2e/multilingual-text-field.spec.ts` |
| Shift+Tab | Goes back from the input to the languages. | `e2e/multilingual-text-field.spec.ts` |

## Content

- The label names the thing ("Title"); the input is named "Title, French (Belgium)" for screen readers, and the row
  "Language of Title".
- `isRequired` means every language; "at least one" is the page's call through `isInvalid` and `errorMessage`.
- The missing-language error is written for you: "Add the text in French (Belgium) and 1 more language". An error for
  one language (from the platform) reads "Dutch (Belgium): <message>".
- Every word comes through `labels`, so a page in Dutch passes its own (the story "Dutch interface").

## Accessibility

**The field gives you:** an input named with its language, `lang` and `dir` set per language, a language row with
marks read in words, the missing language shown and named when invalid (no jump while fixing it), and the text still
readable in every language when disabled.

**You still own:**
- A label or `aria-label`.
- Deciding what "required" means on the page, and the save that checks it.
- Words in the page's language (`labels`).

## Related

- **Locale switcher**: its language row.
- **Text field**: one language.
- **Multilingual rich text editor**: formatted text per language.
- **Title field**: the editor's title, with the language menu.
- **Required marker**: drawn after the label.

## Provenance

- Built by agents from the platform's multilingual inputs (InputMultilocWithLocaleSwitcher and its text-area sibling)
  and the prototype; not in Figma (the designer's drawings are pending: docs/OPEN-DECISIONS.md).
- Reviewed by a person: not yet.
- Known limits: the look waits on the designer's drawings for multilingual fields.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its words moved onto one `labels` shared with Locale switcher and Required marker (docs/DECISIONS.md).
- 29 Oct 2026: built with the platform's props in the API's convention (`value` / `onChange(value, locale)`, `locale` /
  `onLocaleChange`, `showLocaleSwitcher`); required means every language; disabled locks the text, not the switcher.
