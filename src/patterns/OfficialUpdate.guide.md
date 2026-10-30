# Official update

## When to use

- For the team's public answer to a record in the Manage tab's Side panel: what is happening with an idea, posted
  under a name people see ("The project team" or a team's own name), as on a phase's Manage tab and in the Input
  manager.
- `BulkOfficialUpdate` from the Selection bar's "Official update", to send one update to several selected records at
  once ("This update goes to 2 ideas").
- `PostedOfficialUpdate` alone to show an update without the form; `OfficialUpdateForm` alone where the Send belongs
  elsewhere (a Modal's footer, with `id`).

## When not to use

- For a conversation with residents or the team's internal notes: use **Comment thread**.
- To tell the person at the screen that something happened: use **Toast**.
- For a notice about the whole page or project: use **Banner**.
- For an email the platform sends by itself: use **Notification row**.

## Anatomy

1. **Posted updates**: newest first, each on the stage grey, its key "Official update · name · date" in small
   secondary words over the update.
2. **Words**: a field that grows with the words.
3. **Name**: the name people see with the update; empty reads "The project team".
4. **Publish**: on once there are words.

In bulk: the same form in a Modal titled "Official update", its footer saying how many records it goes to, then Send.

## Behaviour

A form with a button; in bulk, a modal dialog after the WAI-ARIA
[Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) that opens on the words and gives focus back
to its button when it closes. Publishing applies at once, with an Undo toast from the page. Behaviour from React
Aria's TextArea and TextField (and its Button and Modal, through the system's parts).

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves from the words to the name, then to Publish. | `play: Keyboard` |
| Enter (on Publish) | Publishes the update and clears the words. | `play: Keyboard` |
| Ctrl + Enter or ⌘ + Enter (in the words) | Publishes the update. | `e2e/official-update.spec.ts` |
| Esc (in the words, in a side panel) | Keeps the words; the next Esc reaches the panel. | `e2e/comment-thread.spec.ts` |
| Esc (bulk) | Closes the modal and puts focus back on the button that opened it. | `e2e/official-update.spec.ts` |

## Content

- Write as the team, to residents, in plain words: what was decided or what happens next, and when ("The council has
  agreed to test this on Linden Avenue in July.").
- The name is the team people know, not a person's account: "Parks and public space team"; leave it empty for "The
  project team".
- The date is already written: "12 October 2026".
- The toast after Publish says who will see it, with Undo: "Official update published" / "The author and everyone
  following this idea will see it."
- In bulk, name the records in the reach line through `labels.reach` ("This update goes to 2 ideas").
- Every fixed word comes in through `labels`.

## Accessibility

**The part gives you:** each posted update as an article named by its key, fields named "Official update" and "Name
shown with the update", Publish and Send off until there are words, and in bulk a modal that opens on the words and
returns focus when it closes.

**You still own:**
- The Undo toast after Publish or Send (`onPublish`, `onSend` only report the press).
- Adding the new update to `updates`.
- The button that opens the bulk modal, so focus has somewhere to go back to.
- The words in the page's language (`labels`).

## Related

- **Comment thread**: the conversation under the update in the same panel.
- **Side panel**: where the update sits.
- **Selection bar**: the bulk "Official update" button.
- **Modal**: the bulk form's container.
- **Toast**: the Undo after publishing.

## Provenance

- Built by agents from the designer's prototype (its update block and bulk popover); not in Figma.
- Reviewed by a person: not yet.
- Known limits: the words field draws no visible label (it is named by its place); an update can't be edited or
  deleted once posted, only taken back by the page's Undo.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab and Publish.
- 29 Oct 2026: its words come in through `labels`; the reach count follows the locale.
- 29 Oct 2026: bulk in a Modal, not the prototype's popover: it is a long-text form (docs/DECISIONS.md, "Prototype
  review").
- 29 Oct 2026: built from the prototype: posted updates, the form and the bulk Modal.
