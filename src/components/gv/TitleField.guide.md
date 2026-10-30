# Title field

## When to use

- For the big name at the top of an editor: a phase's title in its setup card, the platform's name in Settings.
- When the title is required and should say so in the field (`isRequired` draws the Required marker at its end).
- With `localeSwitcher` when the title is written in each of the platform's languages: a Locale switcher menu sits in
  the field's end and can drive the description under it too.

## When not to use

- For an ordinary labelled field in a form: use **Text field**.
- For a title in each language with the language row above it: use **Multilingual text field**.
- For a longer text or a description: use **Rich text editor** or **Multilingual rich text editor**.
- For a page's heading that isn't edited: use **Page header**.

## Anatomy

1. **Input**: large type, no visible label; the placeholder carries the hint ("Add a title").
2. **Required marker** (with `isRequired`): inside the end of the field, 56 from the edge.
3. **Content-language button** (with `localeSwitcher`): after the marker in the same end: the language icon, the code,
   "1/3" while languages are empty, a chevron.
4. **Error** (optional): under the field.

## Behaviour

No WAI-ARIA APG pattern covers a plain text field: the title is the browser's own text input; its language button opens
a list after the [Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/). Behaviour from React Aria's
TextField (and, with the button, Locale switcher's Select).

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus into the title, then to the language button in its end. | `e2e/multilingual-text-field.spec.ts` |
| Down arrow (on the language button) | Opens the list of languages, each saying filled or empty. | `e2e/multilingual-text-field.spec.ts` |
| Enter (on a language) | Picks it: the title (and a description it drives) shows that language. | `e2e/multilingual-text-field.spec.ts` |

## Content

- No label is shown, so give it an `aria-label` that names it: "Phase title", "Project title".
- The placeholder is the hint: "Add a title" by default; "Name of your platform" in Settings.
- Sentence case for the title itself is the author's call; don't add a full stop to the placeholder.
- The error says what is missing: "Give your project a title".
- "Required" and the placeholder come in through `labels`.

## Accessibility

**The field gives you:** an input named by its `aria-label`, `aria-required` heard (the visible marker is hidden from
screen readers, so it isn't read twice), the error read with it, and the text's language set on the input (`lang`)
so it is read in that language and runs its way.

**You still own:**
- An `aria-label`: there is no visible label.
- `lang` and `value` for the language the button shows.
- A heading elsewhere on the page if the title is the page's subject; the field is not a heading.

## Related

- **Text field**: the ordinary field.
- **Locale switcher**: the language menu in its end.
- **Multilingual rich text editor**: the description a title's language button can drive.
- **Required marker**: what `isRequired` draws.
- **Card**: the setup card it sits in on a phase.

## Provenance

- Built by agents from Figma (Title field, node 4:123) and the prototype (`.pj-titlereq`); the invalid state and the
  language button are not in Figma.
- Reviewed by a person: not yet.
- Known limits: the language button's place is an open decision with the designer (Figma keeps the end clear).

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: takes the content-language button (`localeSwitcher`) in the end Figma keeps clear (docs/DECISIONS.md,
  multilingual fields).
- 29 Oct 2026: its words (placeholder, Required) come through `labels`; the Required marker sits 56 from the end
  (Figma's 52.5, snapped).
