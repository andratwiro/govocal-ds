# Badge

## When to use

- **Filled** (Figma's grey pill) for what kind of thing something is or a plain status: a tool's category, "Not in
  your plan" with a lock, a message's status in Messaging, "New" and "Progress" on a report, an input's status in a
  list.
- **Outlined** for a quiet status or a flag: "Pending" on an invitation, a quote's tag, "Beta" in a menu item.
- **Value** (teal) for a value someone chose, shown on what it belongs to: a person's groups in their profile, a
  setup step's area, a report block's source.
- **Count** for a number beside a title or a control: "Only show inputs that need feedback 12", a Panel's total.
- **Removable** (`onRemove`) for one tag on an item that can be taken off with its ×.

## When not to use

- For where something stands in a draft-to-live flow (Draft, Live, Sent, Published): use **Status badge**, which
  carries the green.
- To say something is new or unread with no words: use **New dot**.
- For several removable tags with "Add tag": use **Tag picker**, which adds arrow keys and Backspace between them.
- For whether an admin has looked at a card: use **Review status**.
- For a pressable filter that shows it's on: use **Filter chips**.

## Anatomy

1. **Pill**: a rounded shape, filled grey, outlined, teal (value) or the count look.
2. **Leading icon** (optional): a 14 icon before the words.
3. **Label**: the words or the number, one line.
4. **Remove ×** (with `onRemove`): a 12 × at the end; the badge takes the outlined look.

## Behaviour

A badge is display only unless it is removable; then its × is a
button, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the next badge's ×. | `play: Keyboard` |
| Enter | Removes the badge whose × has focus. | `play: Keyboard` |
| Space | Removes the badge, as Enter. | `play: Keyboard` |

## Content

- One to three words, or a number; sentence case: "Not in your plan", "6 questions".
- A count is the number alone, formatted for the page's locale ("2,184"); the title beside it says what's counted.
- The ×'s name is "Remove" and the badge's words ("Remove Cycling"); pass `labels` in other languages.
- Never use a badge for a sentence or an action; a badge that does something other than remove itself is a button.

## Accessibility

**The badge gives you:** plain text a screen reader reads in place, and a removable badge's × as a real button named
for what it removes.

**You still own:**
- Words that make sense read out in the row or title they sit in; colour (teal, grey) never says anything alone.
- Where focus goes after a removal (the next badge's ×, or the control after them), and an Undo toast if it matters.
- A name for a count's meaning nearby ("12 inputs need feedback" when the number stands alone).

## Related

- **Status badge**: the draft and live pill.
- **Tag picker**: removable tags with arrow keys and "Add tag".
- **New dot**: "new" without words.
- **Menu**: its items take a badge ("Beta").
- **Panel**: its head takes a count badge.

## Provenance

- Built by AI agents from Figma's Badge (filled, with or without an icon); the outlined, value and count looks and the
  remove × come from the prototype (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: no tone colours beyond grey and teal (a status with a colour is a Status badge); the value teal has no
  Figma token yet (a candidate, docs/DECISIONS.md).

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: the remove ×'s name comes through `labels`.
- 29 Oct 2026: outlined, value and count looks, and a removable × (`onRemove`), beside Figma's filled pill.
- 29 Oct 2026: built from Figma and the prototype.
