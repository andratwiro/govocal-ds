# Rich text toolbar button

## When to use

- For one formatting tool that stays pressed while it is on (bold, italic, list), inside a **Rich text toolbar**.
- On its own in a page's own formatting row: the Report view's text blocks.

## When not to use

- For a tool that opens a picker (link, image, video): use the toolbar's plain buttons, or an **Icon button**.
- For a whole formatting row: use **Rich text toolbar**.
- To switch a setting on or off: use **Switch**.
- To pick between views: use **Segmented control**.

## Anatomy

1. **Button**: a small square, filled when pressed.
2. **Icon**: 14 with a 1.75 stroke, hidden from screen readers; the button is named by `aria-label`.

## Behaviour

The tool is a toggle button, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the tool (inside a toolbar, the arrows do). | `play: Keyboard` |
| Space | Presses it in, or out. | `play: Keyboard` |
| Enter | Presses it in, or out. | `play: Keyboard` |

## Content

- `aria-label` is the format's name, one word where possible: "Bold", "Italic", "List".
- Never change the name with the state: pressed is said by the button.

## Accessibility

**The tool gives you:** a toggle button that says pressed or not, a focus ring, Space and Enter, and a disabled state.

**You still own:**
- The `aria-label`: the icon says nothing to a screen reader.
- Keeping `isSelected` true to the text under the cursor.

## Related

- **Rich text toolbar**: the row it sits in.
- **Rich text editor**: the editor.
- **Icon button**: an icon action that doesn't stay pressed.

## Provenance

- Built by AI agents from Figma's toolbar tool (one shape with each icon); the selected and disabled states are not in
  Figma or the prototype.
- Reviewed by a person: not yet.
- Known limits: no tooltip shows its name.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its own Component under Forms, drawn as Figma's one shape.
