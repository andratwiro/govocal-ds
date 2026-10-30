# Notification row

## When to use

- To list the emails the platform sends by itself and turn each on or off: a phase's Notifications card in its
  Build tab ("A reply on my comment", "Phase started"), and Messaging's automated emails, one list per recipient
  group (`NotificationRowList`).
- With `onOpen` when an email can be edited: the row opens the email's page (`NotificationEmail`), which takes the
  setup's place in the panel while the email itself shows on the stage beside it.
- `NotificationEmail` for that page: ← back, the switch "Send this email" with who it goes to and what sends it, then
  its fields (Replies should go to, Subject, Title, Introduction, Button text).

## When not to use

- For the notifications an admin receives (the bell in the side nav): use **Notification list**.
- For any other on-or-off setting with a label and a description: use **Switch**.
- For a participant action and who can take it: use **Participant action row**.
- For an email someone writes and sends once: that is a form of **Text field**s and a **Rich text editor** on its
  page, not a row.

## Anatomy

1. **Switch**: on or off, named by the email.
2. **Name**: the email's name; grey when the email is off.
3. **Meta**: who it goes to (a person icon) and what sends it (a clock icon).
4. **Chevron**: at the end while the email is on; the name, meta and chevron are one button to its page.

Rows sit in a `NotificationRowList`, a named group. The switch is the system Switch (36 wide).

## Behaviour

The switch follows the WAI-ARIA [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/); the rest of the
row is a button to the email's page, after the [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).
Off, the row opens nothing: an email that is off isn't edited. Behaviour from React Aria's Button, and through the
system's Switch, Text field and Rich text editor (the email's page).

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the switch, then to the row's button while the email is on. | `play: Keyboard` |
| Space (on the switch) | Turns the email off or on; off, the row's button goes. | `play: Keyboard` |
| Enter (on the row) | Opens the email's page. | `play: Keyboard` |
| Enter (on the closed card), Space (on a switch) | Opens the Notifications card; turning an email off updates the card's count when it closes. | `e2e/build-tab.spec.ts` |

## Content

- The email's name says what the recipient is told, from their side: "A reply on my comment", "Publication of my
  input", "Phase started".
- Who: the recipient as a role, "User who commented", "Users who follow the input".
- When: the event that sends it, "User replies to comment", "A phase starts".
- The row's button reads "Edit <email>" by default (`labels.edit`); the email page's ← should name where it goes back
  to (`labels={{back: 'Back to Ideation setup'}}`).
- A closed card counts what is on: "3 emails on".

## Accessibility

**The row gives you:** a switch named by the email, a button named "Edit <email>", a named group around the rows, no
button at all for an email that is off (rather than a dead one), and grey that is never the only sign of off (the
switch says it).

**You still own:**
- A name for each group of rows when a page has several (`aria-label`, as Messaging's per recipient group).
- The way back from the email's page, and where focus lands when it opens and closes.
- Saving what the fields say: the email page's fields start from their values and report nothing back.
- The words in the page's language (`labels`).

## Related

- **Switch**: the on-or-off control at the start of each row.
- **Participant action row**, **View option row**: the Build tab's other switch rows, built the same way.
- **Rich text editor**: the email page's Introduction.
- **Notification list**: the admin's own notifications, not emails.
- **Card**: the closed-and-open card the rows sit in.

## Provenance

- Built by agents from the designer's prototype (a phase's Notifications card and the email's page); not in Figma.
- Reviewed by a person: not yet.
- Known limits: `NotificationEmail`'s fields are uncontrolled (`defaultValue`, no `onChange`), so the page can't read
  what was typed; there is no preview of the email itself in the part (the page draws it on the stage).

## Changes

- 30 Oct 2026: this page written; a play function proves the switch and the row's keys.
- 29 Oct 2026: its words come in through `labels`, English by default.
- 29 Oct 2026: the list's own root class (`gv-notification-row-list`), apart from the bell's Notification list.
- 29 Oct 2026: Messaging's automated emails use these rows, one list per recipient group (docs/DECISIONS.md,
  "Messaging").
- 29 Oct 2026: the system Switch (36) instead of the prototype's 26-wide one (docs/DECISIONS.md, "Built in the
  project package").
- 29 Oct 2026: built from the prototype: a switch, the email's name with who and when, a way to its page.
