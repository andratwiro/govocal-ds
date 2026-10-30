# Block frame

## When to use

- Around each block of a document people edit on a **Page stage**: a report's text section, key figures, chart or
  quotes. It shows which block is under the pointer, which one is selected, and the tools to move, duplicate or
  delete it.
- With `isPinned` for a block that stays in place (the title page, the contents): only Delete is left.
- With `toolbar` for a text block, whose tools are its format bar (a floating **Rich text toolbar**).
- With **Block insert line** (exported with it) between blocks, where a new one can go.

## When not to use

- For a card someone opens or acts on: use **Card**.
- For a row someone picks in a list: use **List row**.

## Anatomy

1. **Frame**: an outline 6 outside the content, so nothing inside moves. Hover: the hovered control grey. Selected: the
   selected navy.
2. **Tag**: the block's kind icon and name, hanging off the top start; grey on hover, filled navy when selected.
3. **Toolbar**: a card of 24 Icon buttons off the top end (↑ ↓ ⧉ and the bin), only while selected; centred for a
   custom `toolbar`.
4. **✦ mark** (`isAiMade`): on the end edge, in the accent icon colour.
5. **Insert line**: a hairline with a 24 round + in the middle, shown on hover, focus, or as the target.

## Behaviour

The block is a focusable group; its toolbar follows the WAI-ARIA
[Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) (one Tab stop, the arrow keys between tools).
Pressing anywhere in a block selects it; Esc anywhere inside the selected block deselects it and puts focus back on
the block.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the block, then into its toolbar when selected. | `play: Keyboard` |
| Enter or Space (on the block) | Selects the block; the toolbar appears. | `play: Keyboard` |
| Right arrow (in the toolbar) | Moves to the next tool. | `play: Keyboard` |
| Escape | Deselects the block; focus goes back to it. | `play: Keyboard` |
| Enter (on a tool) | Moves the block up or down, duplicates or deletes it. | `e2e/report-parts.spec.ts` |

## Content

- The tag is the block's name as the outline shows it ("By the numbers"), never its kind alone.
- Tool names come from `labels`: "Move up", "Move down", "Duplicate", "Delete"; the toolbar's name is a function of the
  block's name ("By the numbers: block tools"); the ✦ mark says "Made by the assistant".
- The insert line's + is named "Add widget here" (`labels.insert` on Block insert line).

## Accessibility

**The part gives you:** a named group per block that takes focus, selection by keyboard, Esc back out with focus kept,
named tools with tooltips, ends that turn off (`canMoveUp`, `canMoveDown`), and a ✦ mark with a name.

**You still own:**
- Moving focus after a delete (to the next block, or the stage).
- Telling people what moved (the outline's order changes; a Toast for a delete with Undo).
- Keeping the hover link with the outline (`isHighlighted`, `onHoverChange`).

## Related

- **Page stage**: the sheets the blocks sit on.
- **Rich text toolbar**: the floating format bar a text block puts in `toolbar`.
- **Icon button**: the toolbar's tools.

## Changes

- 30 Oct 2026: built (hover, highlighted, selected, pinned, AI-made, dragging, a custom toolbar, the insert line), with
  this page.
