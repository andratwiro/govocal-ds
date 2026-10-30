# Notification list

## When to use

- In the popover the side nav's Notifications row opens: what happened since the admin last looked ("3 new inputs in
  Collect ideas", "Your report for Riverside Park is ready"), newest first.
- With `onMarkAllRead` when the list can clear its unread dots in one press.
- With an empty line ("You don't have any notifications yet") when there is nothing to show.

## When not to use

- For a passing confirmation of something the admin just did: use **Toast**.
- For a message about the page in front of them: use **Banner**.
- For the emails a phase sends participants: use **Notification row**.
- For a long, filterable list of records: use **Data table**.

## Anatomy

1. **Head**: the title ("Notifications", a level 2 heading) and the quiet "Mark all as read" at the end.
2. **Rows**, one per notification:
   - **Icon** (optional, 16): what kind it is (a comment, inputs, a report);
   - **Text**: what happened, a link when the row leads somewhere;
   - **Time**: when, as shown ("12 min ago");
   - **Unread dot**: a New dot, with the row's words bolder.
3. **Empty line**: in place of the rows when there are none.

It fills the popover it sits in; the back office's is about 360 wide.

## Behaviour

The list holds a button and links, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
and [Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/); the popover around it is the page's (a Popover with
a Dialog). Behaviour from React Aria's Link, and Button through the system's Button.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to "Mark all as read", then to each notification that leads somewhere. | `play: Keyboard` |
| Enter (on Mark all as read) | Clears every unread dot; focus stays on the button. | `play: Keyboard` |
| Esc | Closes the popover the list sits in (the back office's). | `e2e/sidebar.spec.ts` |

"Mark all as read" stays enabled once everything is read, so focus never drops out of the popover. Following a
notification closes the list in the back office (docs/DECISIONS.md, "App shell: notifications and account menu").

## Content

- Say what happened, to what, in one sentence with no full stop: "A resident commented on your input", "3 new inputs
  in Collect ideas". Name the project or phase so the row makes sense out of context.
- Lead with the news, not the actor's name; residents stay "a resident" unless the platform shows their name.
- Time is short and relative for the last day ("12 min ago", "1 h ago"), then "Yesterday", then a date.
- The list's own words (the title, "Mark all as read", the empty line, "Unread") come in through `labels`.
- Older notifications come on demand under the list ("Show older notifications"), not as an endless list.

## Accessibility

**The list gives you:** a heading, a real list of rows, links for the rows that lead somewhere, an unread dot named
"Unread", and a Mark all as read that never takes focus away.

**You still own:**
- The popover and the dialog around it, named "Notifications", and focus going back to the bell when it closes.
- The bell's count as words for screen readers (`countLabel`: "28 unread").
- A link for every row that leads somewhere, so the keyboard can follow it.
- The list's words in the page's language (`labels`).

## Related

- **Side nav**: its Notifications row opens the list.
- **New dot**: the unread mark.
- **Toast**: the passing confirmation, not a record.
- **Link**: the row's text when it leads somewhere.

## Provenance

- Built by agents from neither Figma nor the prototype: from the real admin's notification menu (tagged Not in
  Figma).
- Reviewed by a person: not yet.
- Known limits: no paging of its own (the page adds "Show older notifications"); `time` is text the page writes;
  rows that don't lead anywhere can't be reached by the keyboard.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab and Mark all as read.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: "Show older notifications" under the list, and following a notification closes it (docs/DECISIONS.md,
  "App shell: notifications and account menu").
- 29 Oct 2026: built with the back office's full sidebar.
