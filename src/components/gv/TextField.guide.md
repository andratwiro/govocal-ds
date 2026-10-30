# Text field

## When to use

- For a line of words people type: a group's name, a contact email, an event's title, the reply-to address of an email.
- With a fixed `prefix` inside the field: the project URL's "internal.govocal.com/en/projects/".
- With a counter (`maxLength` and `showCounter`) when the words have a limit: a statement in Common ground (140).
- Read only (`isReadOnly`) to show a value people may copy but not change.

## When not to use

- For the big name at the top of an editor (a project's or a phase's title): use **Title field**.
- For a text people write in each of the platform's languages: use **Multilingual text field**.
- For formatted text (bold, lists, links): use **Rich text editor**.
- For a number: use **Number field**.
- To search or filter a list: use **Search field**.
- To pick from known values: use **Select**.

## Anatomy

1. **Label**: above the field.
2. **Input**: one line, 36 tall.
3. **Prefix** / **Suffix** (optional): fixed words inside the field, before or after the input.
4. **Foot**: the description and the error on the start side, the counter ("33/140") at the end.

## Behaviour

No WAI-ARIA APG pattern covers a plain text field: it is the browser's own text input, with its label, description
and error wired to it.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus into the field. A read-only field takes focus too, so its words can be read and copied. | `play: Keyboard` |
| Typing | Fills the field; the counter follows. A read-only field ignores it. | `play: Keyboard` |

## Content

- The label names the thing, in sentence case: "Contact email", "Name of the group". No colon.
- The placeholder is an example, never the label or an instruction people need ("green-corridors", not "Enter the
  URL").
- Help that people need goes in `description`: "One sentence participants can agree or disagree with."
- An error says how to fix it: "Add a contact email.", "That is not an email address".
- Counter numbers follow the page's language.

## Accessibility

**The field gives you:** an input named by its label, the description and error read with it (`aria-describedby`),
`aria-invalid` and `aria-required` when set, and focus first on the field when a form's submit fails.

**You still own:**
- A label, or `aria-label` when the label is elsewhere.
- Saying the limit when it matters: the counter is seen, not read.
- `type="email"`, `autoComplete` and the like where they help people fill it in.

## Related

- **Title field**: the editor's big title.
- **Multilingual text field**: the same field per language.
- **Number field**: numbers.
- **Search field**: searching a list.
- **Required marker**: what required fields show.

## Provenance

- Built by AI agents from Figma (Text field, node 4:224) on React Aria's starter TextField; the prefix, the counter and
  read only come from the prototype's pages.
- Reviewed by a person: not yet.
- Known limits: the multi-line `TextArea` beside it has no story of its own.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: the help and the error take the row beside the counter (they were a word wide); the counter's numbers
  follow the locale.
- 29 Oct 2026: moved up from Base to Components › Forms, with the prefix, counter and read-only stories.
