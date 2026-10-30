# App frame

## When to use

- Once, around every page of the back office: the Side nav in its column and the page on the grey ground.
- With `isNavFolded` inside a project, where the nav folds to its 52 rail and the project's columns take the room.
- App frame panel for a white region of the frame with no head of its own: a page's bar around its Page header, a
  project page's rail or setup column, an empty column.

## When not to use

- For a titled region over a hairline, such as a table and its toolbar: use **Panel**.
- For a box people tick, open or expand: use **Card**.
- To lay out a page's regions inside the frame: use **Stack**, **Grid** or **Tile grid**.
- For a record beside a list: use **Side panel**.

## Anatomy

1. **Nav column**: the Side nav, 224 wide (52 folded), sticky and as tall as the window.
2. **Main**: the page, 8 in from the edges, on the app's grey ground, its words in UI type and the body text colour.
3. **App frame panel** (optional): white, radius 12, no border; its padding takes spacing tokens (`padding="16"`).

## Behaviour

Not interactive: the frame can't be reached with Tab and answers no keys. The Side nav and the page keep their own.

## Content

- The frame says nothing itself. The page's title is its Page header; a panel with no visible heading is named with
  `aria-label` when it is an `aside` or a `section` ("Participation").

## Accessibility

**The part gives you:** the page in the `main` landmark, after the nav.

**You still own:**
- Naming the Side nav (`aria-label="Main"`) and any App frame panel that is a landmark.
- One `h1` per page, usually the Page header's title.

## Related

- **Side nav**: what goes in the nav column.
- **Page header**: the top of every page, in a panel of the frame.
- **Stack**: the column of panels on a page.
- **Panel**: the white frame with a head, for tables and lists.

## Changes

- 30 Oct 2026: added, from the back office's own layout, so the back office's stylesheet paints nothing
  (docs/DECISIONS.md, "Compose without CSS").
