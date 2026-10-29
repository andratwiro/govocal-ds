# File list

## When to use

- To show the files attached to something, each with View and Delete: a phase's attachments (the Attachments dialog
  in a phase), a platform's logo and banner in Settings, the file picked for an import in Community monitor.
- Under a **Drop zone**, to show what was just dropped, removable (in Settings, with an Undo toast).
- With a `footer` that adds a file: a compact Drop zone or an "Add a file" button.

## When not to use

- To let people drop or pick a file: use **Drop zone**; the File list only shows what is already there.
- For a list of records people open and work through: use **Data table**.
- For short labels on an item that can be removed (tags, chosen values): use **Tag picker** or a removable **Badge**.
- For one link to a file in running text: use **Link**.

## Anatomy

1. **Row**: one per file, 8 between rows.
2. **File icon**: a 16 paperclip at the start.
3. **Name**: the file's name, "street.webp".
4. **Meta line**: under the name, type and size, "PDF · 340 KB".
5. **Actions**: "View" (when the file has a `url`, opens in a new tab) and "Delete" (when there is an `onDelete`), as
   small links at the end.
6. **Empty line**: in place of the rows when there are no files, "No files yet".
7. **Footer** (optional): a row under the list.

## Behaviour

Behaviour from React Aria's GridList. The list follows the WAI-ARIA [Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/):
the list is one stop for Tab, the arrow keys move between rows and into a row's links. Nothing in it is selected;
the rows are only a way to reach each file's actions.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus into the list, onto the first row. | `play: Keyboard` |
| ↓ and ↑ | Move focus to the next or previous file. | `play: Keyboard` |
| → and ← | Move focus between the row's links (View, Delete). | `play: Keyboard` |
| Enter | Follows the focused link: View opens the file, Delete removes it. | `play: Keyboard` |

Delete calls the page's latest `onDelete`, so deleting one file after another removes each in turn
(`e2e/file-list.spec.ts`).

## Content

- The name is the file's own name, as uploaded; don't shorten it.
- The meta line: the type in capitals, a middle dot, the size with its unit: "PDF · 340 KB", "XLSX · 58 KB". Just the
  type when the size isn't known ("CSV").
- Name the list for what the files are: `aria-label="Attachments"`, "Platform logo", "File to import".
- Say what's missing with `emptyLabel` when "No files yet" is too vague: "No logo yet".
- View, Delete and the empty line come through `labels` in other languages.
- Deleting is undone with a Toast with Undo, not confirmed first, unless the file can't be got back.

## Accessibility

**The list gives you:** a grid named by its `aria-label`, each row named by its file, one Tab stop with arrow keys
between rows and links, links that open files in a new tab safely (`noopener`), and the paperclip hidden from
assistive tech.

**You still own:**
- An `aria-label` that says what the files are.
- Telling people a file went (a Toast with Undo) and where focus lands after a Delete.
- A meta line that makes sense read aloud ("PDF · 340 KB").

## Related

- **Drop zone**: adds the files this list shows.
- **Modal**: the Attachments dialog that holds a Drop zone and the list.
- **Toast**: the Undo after a Delete.
- **Link**: the View and Delete actions are Links.

## Provenance

- Built by agents from the prototype's attachment rows (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: no upload progress or error per file; no file type icon (one paperclip for all); the meta line is
  text the page formats, so sizes don't follow the locale on their own.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: View, Delete and the empty line come through `labels`.
- 29 Oct 2026: Delete calls the latest handler, so deleting one file after another works; the `addButton` slot became
  `footer`, as on Panel and Side panel (docs/DECISIONS.md, "Composition contracts in code").
- 29 Oct 2026: Settings shows a chosen logo and banner in a File list under the Drop zone, removable with Undo.
- 29 Oct 2026: built on React Aria's GridList from the prototype.
