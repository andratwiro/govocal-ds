# Activity feed

## When to use

- For a document's version history, newest first and grouped by day: the report builder's history, the survey
  editor's.
- When each version can name the items it changed (Item chips: added, removed, renamed) and an older one can be
  restored.
- When the assistant made some of the versions: its runs sit on the AI tint with the prompt quoted and a count of
  what changed.

## When not to use

- For notifications a person reads and clears: use **Notification list**.
- For a conversation with the assistant: use **Chat thread**.
- For comments on a record: use **Comment thread**.
- For a table of records with columns: use **Data table**.

## Anatomy

1. **Day heading**: Small strong secondary ("Today", "Yesterday").
2. **Entry**: the actor's Avatar (28), "**Actor** action", the time line (with "Showing now" on the current version),
   a hairline under it.
3. **Assistant run**: the info tint, a 3px accent edge at the start, the prompt quoted in three lines, the count.
4. **Toggles**: Show full prompt, Show N changes (when there are more than a page).
5. **Pager**: a Pagination over the changes.
6. **Changes**: outlined Item chips, 6 apart.
7. **Note**: a Small secondary line under the chips.
8. **⋯ menu**: Restore this version, on every entry but the current one.
9. **Show older** (optional): at the foot.

## Behaviour

The toggles and chips are buttons, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/);
the ⋯ opens a menu, after the [Menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves through an entry's toggles, its chips and its ⋯ menu. | `play: Keyboard` |
| Enter (on a toggle) | Opens the full prompt, or the changes. | `play: Keyboard` |
| Enter (on ⋯) | Opens the menu with focus on Restore this version. | `play: Keyboard` |
| Enter (on Restore this version) | Restores that version. | `play: Keyboard` |

## Content

- The actor is "You", a person's name, or "Assistant"; the action is past tense and counts: "edited 2 widgets",
  "changed the report".
- The time line is written by the page in its locale ("Today, 10:12 to 10:19 · asked by Resident A").
- The count reads "142 changed, 3 added, 1 removed".
- Every fixed word ("Showing now", "Show full prompt", "Restore this version", the empty line) comes from `labels`;
  `showChanges` is a count function.

## Accessibility

**The part gives you:** day headings to move by, toggles that say whether they are open, chips that say a change's
status in words, a labelled menu, numbers in the page's locale.

**You still own:**
- The heading level (`headingLevel`) so the days fit the page's outline.
- Confirming or announcing a restore (a Toast with Undo).
- What pressing a chip shows.

## Related

- **Item chip**: each changed item.
- **Pagination**: pages the changes.
- **Notification list**: notifications, not versions.
- **Side panel**: where the history usually opens.

## Changes

- 30 Oct 2026: built (day groups, assistant runs, chips paged, Restore, empty, Show older), with this page.
