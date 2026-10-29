# Required marker

## When to use

- Beside a field that must be filled, when the part doesn't draw its own: most parts that need one already do (Title
  field, Date range field, Multilingual text field, Card take `isRequired`).
- In a card's footer row (`placement="card"`) to say a setup card still needs something.

## When not to use

- On a field that draws it already: pass `isRequired` to **Title field**, **Date range field**,
  **Multilingual text field** or **Card**.
- To say something is wrong: show the field's error or use **Banner**.
- For a status (Draft, Published): use **Status badge**.

## Anatomy

1. **Dot**: a 6 dot, hidden from screen readers.
2. **Label**: "Required".

Two placements: `field` (beside a field's label) and `card` (in a card's foot).

## Behaviour

Not interactive: it shows a word and takes no focus or keys.

## Content

- The word is "Required", in sentence case; pass another language through `labels={{required: '…'}}`.
- A part that draws one takes the same `required` key in its own `labels` and hands it on, so one word serves all.
- Don't add an asterisk as well.

## Accessibility

**The marker gives you:** the word "Required" as text, so it is read; the dot is decoration and hidden.

**You still own:**
- `isRequired` on the field itself, so assistive tech hears "required" with the input: the marker beside it is only
  what sighted people see.
- An error message that says what is missing once the field is checked.

## Related

- **Title field**: draws the marker when required.
- **Card**: its footer marker.
- **Multilingual text field**: required in every language.

## Provenance

- Built by agents from Figma (Required marker, node 14:878).
- Reviewed by a person: not yet.
- Known limits: the 6px gap before the word is the prototype's (Figma has none).

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its word comes through `labels` (English default); parts that draw it extend its labels.
- 29 Oct 2026: 6px gap everywhere, as the prototype; in the Title field it sits 56 from the end (Figma's 52.5,
  snapped) (docs/DECISIONS.md).
