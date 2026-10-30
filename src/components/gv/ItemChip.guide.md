# Item chip

## When to use

- To name one thing from the document (a section, a chart, a question) with its kind icon, where people may want to
  go to it: the items a version changed in the Activity feed, the block a prompt is about in the Prompt composer, the
  block your message asked about above your bubble in a Chat message.
- To show what a change did to an item: added (+ and an accent edge), removed (dashed and struck through), renamed
  (the old name struck through, then the new one).
- With `onPress` when pressing it should reveal the item (scroll to it, flash it); with `onRemove` when the chip is a
  choice the person can take back (the composer's scope).

## When not to use

- For a status of a record (Live, Draft, Accepted): use **Status badge** or **Badge**.
- For an active filter on a list: use **Filter chips**.
- For tags a person picks for a record: use **Tag picker**.
- For a file attached to a form: use **File list** (the Prompt composer draws its own attachment chips).

## Anatomy

1. **Mark** (added only): a + in the accent icon colour.
2. **Kind icon**: 14 (outlined) or 12 (filled, quiet), in the secondary icon grey.
3. **Label**: Small 12, truncated with the whole name as its tooltip; renamed: the old name struck through, an arrow,
   the new name.
4. **×** (optional): a 16 hit inside the chip, icon 12.

Looks: `outlined` (a 28 pill with a control border), `filled` (a 24 grey tag, radius 6), `quiet` (no chrome, secondary
words).

## Behaviour

A plain chip is static text. With `onPress` its label is a button, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/); with `onRemove` an × button sits beside it (two
buttons, never one inside the other). A removed item can't be pressed: it is gone.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the chip's press, then to its ×. | `play: Keyboard` |
| Enter (on the label) | Reveals the item (the page scrolls to it). | `play: Keyboard` |
| Enter (on ×) | Removes the chip (the composer goes back to the whole document). | `play: Keyboard` |

## Content

- The label is the item's name exactly as the document shows it ("Votes per cycle lane route"), never a description.
- Name the × for what removing it does, through `labels.remove`: "Ask about the whole report", not "Remove".
- The words a screen reader hears for a status come from `labels`: `added`, `removed` and `renamed` are functions of
  the label ("Added: Summary", "Renamed from Participants to Who took part").

## Accessibility

**The part gives you:** the status said in words before the label (the + and the strike say it only to the eye), the
whole name as a tooltip when it truncates, separate buttons for reveal and remove, and a focus ring on each.

**You still own:**
- The kind icon is decoration: pass it `aria-hidden`.
- A name for the × that says what happens, in the page's language.
- Where focus goes after a remove (the Prompt composer puts it in its field).

## Related

- **Activity feed**: lists the items a version changed as Item chips.
- **Prompt composer**: the scope chip and the attachments.
- **Chat message**: the quiet chip above your bubble.
- **Filter chips**: the chip for an active filter.
- **Badge**: a short status label.

## Changes

- 30 Oct 2026: built (outlined, filled and quiet looks; added, removed and renamed), with this page.
