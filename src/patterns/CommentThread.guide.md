# Comment thread

## When to use

- Under a record in the Manage tab's Side panel: residents' comments on an idea, with the team's replies, as on a
  phase's Manage tab and in the Input manager.
- With `internal` when the team also talks about the record among themselves: a second tab, Internal conversation,
  which residents never see.
- Without `internal` where a record has no internal conversation (a voting option): one "Comments (n)" heading.
- With `CommentComposer` on its own when a page needs only the team's field and Post.

## When not to use

- For the team's public answer to a record (one official message, with a name): use **Official update**.
- For a short note that something happened (a status change, a saved edit): use **Toast**.
- For the record's own facts (status, assignee, tags): use **Property list**.
- For a list of records with their comment counts: use **Data table** or **List row**.

## Anatomy

1. **Heading or tabs**: "Comments (5)", or the tabs Comments (n) and Internal conversation (n) with `internal`.
2. **Comment**: the avatar, then name · time · "New" (until the team has seen it), the content warning line when the
   automatic check flagged it, the words, and its actions (Reply, Dismiss warning, Delete).
3. **Replies**: one level deep, under their comment.
4. **Empty line**: "No comments yet" when there are none.
5. **Composer**: the team member's avatar, a field that grows with the words, and Post; with a reply, a "Replying to
   …" line with its ×.

It fills the side panel's width (512 in the stories); a new comment sits on the stage grey.

## Behaviour

The two lists are tabs, after the WAI-ARIA [Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/); each
action is a button. Every action applies at once: Post adds the comment, Delete and Dismiss warning act with an Undo
toast from the page. Behaviour from React Aria's Button, TextArea and TextField (and its Tabs, through the system's
Tabs).

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the tabs, then through each comment's actions in order, then to the composer and Post. | `play: Keyboard` |
| Right arrow, Left arrow (on the tabs) | Moves between Comments and Internal conversation and shows it. | `play: Keyboard` |
| Enter (on Reply) | Points the composer at that comment and moves focus into its field. | `play: Keyboard` |
| Enter (in the field) | Starts a new line; it never posts by itself. | `play: Keyboard` |
| Ctrl + Enter or ⌘ + Enter (in the field) | Posts the comment. | `e2e/comment-thread.spec.ts` |
| Esc (in the field, in a side panel) | Keeps the words; the next Esc reaches the panel. | `e2e/comment-thread.spec.ts` |

## Content

- The author is the name people see on the platform ("Anonymous" when they chose so); the team's replies carry the
  team member's name. `time` is already written: "Today", "2 days ago".
- The warning says what the check found, in a few words: "Possibly offensive language"; the row adds "Content
  warning: … Detected automatically."
- The composer's hint says who is writing: "Reply as the project team"; the internal one says "This comment is not
  visible to regular users".
- Every fixed word (the tabs' counts, Reply, Delete, Post, the warning line, the empty lines) comes in through
  `labels`; counts follow the page's locale.
- Toasts after Delete or Dismiss warning say what happened, with Undo: "Comment deleted".

## Accessibility

**The thread gives you:** each comment as an article named by its head (name, time, New), lists named "Comments",
"Internal comments" and "Replies to …", actions named for their comment ("Reply to Tom R.", "Delete Tom R.'s
comment"), focus moved to the field on Reply and back to it when a reply is cancelled, and Post off until there are
words.

**You still own:**
- The Undo toast after Delete and Dismiss warning (`onDelete`, `onDismissWarning` only report the press).
- Adding the posted comment to `comments` or `internal` (`onPost`); the thread only clears its field.
- Every word in the page's language (`labels`).
- Keeping internal comments out of anything residents can see.

## Related

- **Official update**: the team's public answer, above the thread in the same panel.
- **Side panel**: where the thread sits, under the record's properties.
- **Toast**: the Undo after an action.
- **Tabs**: the tabs it draws with `internal`.
- **Avatar**: each comment's letters.

## Provenance

- Built by agents from the designer's prototype (its discussion block); not in Figma.
- Reviewed by a person: not yet.
- Known limits: replies go one level deep (a reply to a reply answers its parent); `time` is text the page writes, not
  a date the thread formats; the composer's field draws no visible label (it is named by its place).

## Changes

- 30 Oct 2026: this page written; a play function proves the tabs, Reply and the field's Enter.
- 29 Oct 2026: the story data names a role ("Resident") instead of a person.
- 29 Oct 2026: its words come in through `labels`; counts follow the locale.
- 29 Oct 2026: a Pattern in the Manage tab, not a Component: team replies, internal notes and content warnings are Go
  Vocal moderation (docs/DECISIONS.md, "Building from the prototype review").
- 29 Oct 2026: built from the prototype: New, content warnings, Reply / Dismiss warning / Delete with Undo, replies,
  the composer and the two tabs.
