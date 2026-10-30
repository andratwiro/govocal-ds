# Toast

## When to use

- To confirm that something just happened, without stopping people: "Link copied", "Invitation sent", a section of
  Settings saved, a report template ready.
- With Undo (`action: 'Undo'`) for a change that applied at once and can be taken back: a status changed in a Side
  panel, an idea archived, a phase deleted from the rail, a person added to a group, a page removed from the menu.
- After an Alert dialog's confirm, to say the thing is gone (a deleted token or webhook).
- Call `toast(title, description, options)` from anywhere; the one region comes with **App provider**.

## When not to use

- For something people must read before acting, or that stays true on the page: use **Banner**.
- To confirm before a change that can't be undone: use **Alert dialog**, then a toast.
- For an error on one field or form: show it on the field (**Text field**, **Select**); a toast vanishes before it is
  fixed.
- For the result of a save inside a dialog: turn the dialog's **Button** to a disabled "Copied!" (the back office's
  call), not a toast behind it.

## Anatomy

1. **Icon**: a check in a green circle by default; any other with `icon`, none with `icon: null`.
2. **Title**: one short line.
3. **Description** (optional): a line under it, such as what moved where.
4. **Action** (optional): a text button under the words, "Undo".
5. **Close ×**: at the end.

Toasts sit fixed at the window's bottom end, newest on top, and leave after 5 seconds unless `timeout` says otherwise
(`0` keeps one until it is closed).

## Behaviour

The toasts sit in a landmark region and each is announced
when it appears, after the WAI-ARIA [Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/); its action and
× are buttons. Pressing the action closes the toast, then runs `onAction`.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus into the toast, to its action (Undo) and then its ×. | `play: Keyboard` |
| Enter (on the action) | Closes the toast and runs the action: Undo takes the change back. | `play: Keyboard` |
| Enter (on the ×) | Closes the toast. | `play: Keyboard` |

A toast doesn't leave while it has focus or the pointer is over it (React Aria pauses its timer).

## Content

- Title: what happened, in the past tense, a few words: "Idea archived", "Status changed to Accepted", "Link copied".
- Description: only when it adds something: what moved where, "Moved to the archive."
- The action is one verb: "Undo". Nothing else belongs there; a toast is not a menu.
- After Undo, say it in a plain toast with no icon: "Idea restored".
- One toast per change; never a toast for something people can already see change on the page and can't undo.
- The ×'s name is "Close"; pass `labels` to App provider in other languages.

## Accessibility

**The toast gives you:** an announcement when it appears, a landmark region people can reach from the keyboard, a
timer that waits while it is focused or hovered, a named ×, and focus that never jumps into it on its own.

**You still own:**
- Undo for anything a toast confirms that can be taken back; a 5-second toast is easy to miss.
- A `timeout` long enough to read, or `0`, for a toast whose action matters.
- Nothing only in a toast that people need later.

## Related

- **App provider**: renders the one toast region.
- **Banner**: the message that stays on the page.
- **Alert dialog**: the confirm before a change that can't be undone.
- **Side panel**: its changes apply at once, with an Undo toast.

## Provenance

- Built by AI agents from React Aria's toast and the prototype's undo snackbar (icon and Undo action; Not in Figma).
- Reviewed by a person: not yet.
- Known limits: React Aria 1.22 still marks its toast unstable (`UNSTABLE_Toast`, `UNSTABLE_ToastRegion`,
  `UNSTABLE_ToastQueue`), so its API may change; one action per toast; no error or warning look.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: the ×'s name comes through `labels` (App provider's).
- 29 Oct 2026: `AppProvider` renders the one region and `toast()` shows a toast from anywhere; Toast's `body` became
  `description` (docs/DECISIONS.md, "Composition contracts in code").
- 29 Oct 2026: saves, copies and instant changes say themselves in a Toast, with Undo where they can be taken back
  (docs/DECISIONS.md, "Back office redesign on the current components").
- 29 Oct 2026: the prototype's icon and Undo action slots.
