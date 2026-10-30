# Access popover

A recipe: copy the story's `AccessPopover` function and `AccessPopover.css` into the page. It becomes a component when
a second page needs it.

## When to use

- For the project overview's Share ▾: invite people by email or group, see who has access and change their role, copy
  the project's link, without leaving the page.

## When not to use

- For a share step that needs the whole screen's attention, or more than a few fields: use **Modal**.
- For a short list of share actions with no people in it: use **Menu**.
- For who can take part in a phase (residents, not the team): use **Access rights**.

## Anatomy

1. **Trigger**: the header's Share ▾ (a secondary Button with a chevron).
2. **Invite**: a section label, a text field and Invite.
3. **People with access**: a section label, then a row per person: Avatar, name (with "you"), email, and a role Select
   or "Owner".
4. **Copy link**: a full-width secondary button at the foot.

360 wide, anchored under the trigger's end.

## Behaviour

The popover is a non-modal dialog (the WAI-ARIA [Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
without the backdrop): focus moves in when it opens and back to Share when it closes.

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (on Share) | Opens the popover with focus inside it. | `play: Keyboard` |
| Enter (in the invite field) | Invites the emails typed. | `play: Keyboard` |
| Esc | Closes the popover and puts focus back on Share. | `play: Keyboard` |

## Content

- Section labels: "Invite people", "People with access".
- The field's hint says what it takes: "Email or group, separated by commas".
- Roles are short: "Can edit", "Can view"; the project's creator reads "Owner".
- All its words are the page's own (it is a recipe): write them in the page's language.

## Accessibility

**The recipe gives you:** a named dialog, a named invite field, a role Select named for each person ("Role for Daan
Verhoeven"), and focus that returns to Share.

**You still own:**
- Saying what happened after Invite or Copy link (a toast).
- The people list's real data and roles.

## Related

- **Modal**: the Share modal story, for the full-screen version.
- **Project header**: where Share ▾ sits.
- **Select**: the role picker.
- **Avatar**: the people.

## Changes

- 30 Oct 2026: written as a recipe from the back office's deep dive (project §3); one page uses it, so it is not
  imported yet (docs/DECISIONS.md, "Project screens").
