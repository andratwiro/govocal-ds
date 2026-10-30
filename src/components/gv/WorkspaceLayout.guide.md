# Workspace layout

## When to use

- For the project screens' three columns, so they line up: the overview (rail beside the stage), a phase's Build tab
  (rail, setup column, phone stage), Manage (rail, metrics column, the list) and Insights (rail, actions column, tiles).
- When a rail should collapse to a strip and give its width to the work.

## When not to use

- For a page's own columns of panels anywhere else: use **Grid**.
- For parts one under another inside a column: use **Stack**.
- For a list beside a detail that slides in over it: use **Side panel**.
- For many like tiles that wrap: use **Tile grid**.

## Anatomy

1. **Rail** (optional): a white panel at the start, 300 wide, its own header carrying the collapse button.
2. **Strip**: the collapsed rail, 44 wide, one button that opens it again.
3. **Work column** (optional): a white panel in the middle, up to 480 wide.
4. **Main**: the rest, on the light stage grey (`main="stage"`) or on no fill (`main="plain"`) for a list or tiles.

Columns 8 apart, panels radius 12. The page gives the layout its height.

## Behaviour

A layout with landmarks, after the WAI-ARIA [Landmark regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)
practice: the rail is a named complementary region and the work column a named region. Its one control, the strip's
button, follows the [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter or Space (on the strip's button) | Opens the rail again. | `play: Keyboard` |

## Content

- `railLabel` names the rail as its header does ("Participation"); `columnLabel` names the column as its heading does
  ("Proposals setup").
- The strip's button says what it opens; its words come through `labels` ("Show panel").

## Accessibility

**The layout gives you:** a named complementary region for the rail and a named region for the work column, in
reading order (rail, column, main), mirrored right to left; a collapsed rail that keeps one named button.

**You still own:**
- `railLabel` and `columnLabel`, so the regions have names.
- Moving focus sensibly when the rail collapses (the rail's own button goes away with it).
- The height: put the layout in a container that has one.

## Related

- **Rail header**: the rail's head, with the button that collapses it.
- **Phase timeline**: the rail's content.
- **Card**: the setup rows in the work column.
- **Phone preview**: the stage's phone (Phone stage).
- **Grid**: columns for any other page.

## Changes

- 30 Oct 2026: built from the back office's deep dive (project §3): every project screen drifted because each page
  built its own columns (docs/DECISIONS.md, "Project screens").
