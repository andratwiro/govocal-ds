# Drop zone

## When to use

- To add a file by dropping it or browsing for it: a platform's logo and banner in Settings, an answers file in
  Community monitor, attachments on a phase.
- **Default**: the large centred zone, where adding files is the main job (Attachments).
- **Compact** (`density="compact"`): one row with a hint line ("PNG or JPG · max 5 MB"), inside a form (Event image, Add
  input).

## When not to use

- To list the files already added: put a **File list** under the zone.
- For an action that isn't about a file: use **Button**.
- To show an image that is already chosen: use **Card** with `media`, or the File list.

## Anatomy

1. **Zone**: a dashed border (the prototype's; Figma draws it solid), the whole zone one button.
2. **Upload icon**.
3. **Label**: "Drop a file here or browse", or the page's own words (`children`).
4. **Hint** (compact only): the types and size allowed.

## Behaviour

The zone is one button, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/): pressing
it opens the device's file picker; a file dropped on it is taken the same way. Behaviour from React Aria's DropZone and
FileTrigger.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus to the zone. A disabled zone is skipped. | `play: Keyboard` |

## Content

- Say what to drop and that browsing works: "Drop a file here or browse", "Drop your cover image here, or browse".
- Put the types and size in the hint: "PNG or JPG · max 5 MB". Say the same limits in the error when a file is refused.
- The label is plain text: the whole zone is the button, so no link inside it.
- Pass another language through `labels={{prompt: '…'}}`.

## Accessibility

**The zone gives you:** one button named by its label, the file picker on press, drops taken from the keyboard's
browse as well as the mouse, and a disabled state that leaves the tab order.

**You still own:**
- `acceptedFileTypes` and the limits said in words.
- Showing what was added (a File list) and saying it, so people know the drop worked.
- An `aria-label` when the zone's words don't say what the file is for ("Answers file").

## Related

- **File list**: the files added, under the zone.
- **Button**: other actions.
- **Toast**: Undo after removing a file.

## Provenance

- Built by agents from Figma (Drop zone, node 5:490) and the prototype (`.attz`, compact `.gv-dropzone`); the dashed
  border and the disabled state are the prototype's, not Figma's.
- Reviewed by a person: not yet.
- Known limits: Enter opening the file picker isn't checked by a test (the browser's picker can't be seen by one); no
  story shows a refused file.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab.
- 29 Oct 2026: the File list sits under it for the chosen logo and banner (docs/DECISIONS.md).
- 29 Oct 2026: one Drop zone: the starter part of the same name left both entry points; its words come through `labels`.
