# Multilingual rich text editor

## When to use

- For a description or a page's text written in each of the platform's languages, with formatting: a project's
  introduction, a content builder's text block.
- Under a **Title field** whose language menu drives it too (`showLocaleSwitcher={false}`, the same `locale`): a phase's
  title and description in its setup card.

## When not to use

- For formatted text in one language: use **Rich text editor**.
- For plain text in each language: use **Multilingual text field** (with `isMultiline` for several lines).
- For a title: use **Title field** or **Multilingual text field**.

## Anatomy

1. **Label row**: the label, the Required marker (with `isRequired`), the **Locale switcher** at the end.
2. **Rich text toolbar**: bold, italic, list, link, image, video, in the interface's order.
3. **Text**: the shown language's text, running its way (right to left for Arabic).
4. **Error**: names the missing language ("Add the text in Spanish (Spain)"), through the Rich text editor's own error.

## Behaviour

The language row follows the WAI-ARIA [Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), the
toolbar the [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Lands on the shown language, then on the toolbar. | `play: Keyboard` |
| Right arrow (on the languages) | Shows the next language; the editor follows. | `play: Keyboard` |

The toolbar's and the text's keys are the **Rich text editor**'s.

## Content

- The label names the text ("Description"); the text area is named "Description, Spanish (Spain)".
- The placeholder is a prompt for the author: "Add a short introduction here".
- The missing-language error is written for you; every word comes through `labels`.

## Accessibility

**The editor gives you:** a text area named with its language, `lang` and `dir` per language, the language row with
marks read in words, and the missing language shown and named (in an alert) when invalid.

**You still own:**
- A label or `aria-label`.
- What "required" means on the page.
- The toolbar's link, image and video pickers.

## Related

- **Rich text editor**: one language.
- **Locale switcher**: its language row.
- **Title field**: the title above it, whose menu can drive it.
- **Multilingual text field**: plain text per language.

## Provenance

- Built by AI agents from the platform's multilingual rich text field (QuillMultilocWithLocaleSwitcher) on the Rich text
  editor; not in Figma (the designer's drawings are pending: docs/OPEN-DECISIONS.md).
- Reviewed by a person: not yet.
- Known limits: the text is plain under the toolbar, as in Rich text editor (the toolbar shows state, it doesn't format
  yet).

## Changes

- 30 Oct 2026: the language's `lang` and `dir`, the error and `isDisabled` go through the Rich text editor; its own direction
  override and alert went (docs/DECISIONS.md, "Small fixes").
- 30 Oct 2026: this page written; a play function proves Tab and the arrow.
- 29 Oct 2026: its words moved onto the multilingual fields' shared `labels` (docs/DECISIONS.md).
- 29 Oct 2026: built from the Rich text editor and the Locale switcher, one Multiloc for every language.
