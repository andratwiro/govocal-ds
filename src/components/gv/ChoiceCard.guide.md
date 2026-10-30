# Choice card

## When to use

- To pick one of a few options that each need a title, a line of explanation and maybe an icon, as bordered tiles
  inside a **Radio group**: a report's template in Create report, the two kinds of user group, a template in the
  template gallery, who can take a survey in Settings.
- With `revealed` when choosing an option opens its own fields under the tile: a smart group's rule picker, Budget
  allocation's Min and Max.
- As checkbox tiles (`ChoiceCardCheckbox` inside a **Checkbox group**) for a checklist, with `ChoiceCardGroupHeading`
  over each group: the contents of a report ("Project context", "Phases").

## When not to use

- For short options that need no explanation: use **Radio group** with plain radios, or **Checkbox group**.
- For a tile that opens a page or a record: use **Card**.
- For more options than fit on a screen: use **Select**.
- To switch views: use **Segmented control**.

## Anatomy

1. **Tile**: a bordered box; chosen = a 2px primary border drawn inside, so the tile never moves.
2. **Control**: the radio dot (or the checkbox) at the start.
3. **Media** (optional): an icon above the title.
4. **Title** and **Description**: the option's name and a grey line under it.
5. **Revealed** (optional): fields under the tile, shown only while it is chosen.
6. **Group heading** (`ChoiceCardGroupHeading`, optional): a Section label over a group of checkbox tiles.

## Behaviour

Radio tiles follow the WAI-ARIA [Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/); checkbox tiles
the [Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/). Behaviour from React Aria's RadioField and
RadioButton, or CheckboxField and CheckboxButton.

| Key | What it does | Checked by |
| --- | --- | --- |
| Down arrow (radio tiles) | Moves to the next tile and chooses it. | `e2e/forms.spec.ts` |
| Tab (checkbox tiles) | Moves to the next tile; each is its own stop. | `play: Keyboard` |
| Space (checkbox tiles) | Ticks or unticks the focused tile. | `play: Keyboard` |

## Content

- Titles are short nouns or noun phrases in sentence case: "Participation report", "Create a smart group".
- The description says what the option means or does, in one sentence: "Users who meet its rules join it by
  themselves."
- Name the group with the Radio group's or Checkbox group's `label` (or `aria-label` when a heading names it).
- Group headings are Section labels in sentence case: "Project context", "Phases".

## Accessibility

**The tile gives you:** a real radio or checkbox named by its title and described by its line, the whole tile as its
target, the group's arrow keys or Tab stops, and revealed fields placed after the tile, not inside its label.

**You still own:**
- The group's name (on Radio group or Checkbox group).
- Fields in `revealed` that make sense on their own, with their own labels.
- An icon in `media` that adds nothing the title doesn't say, or hiding it from screen readers.

## Related

- **Radio group**: holds radio tiles.
- **Checkbox group**: holds checkbox tiles.
- **Section label**: the group heading.
- **Card**: a tile that is content, not a choice.
- **Modal**: where Create report's tiles sit.

## Provenance

- Built by agents from the prototype (`.pj-repopt`, `.pj-pick`); not in Figma yet.
- Reviewed by a person: not yet.
- Known limits: `media` takes an icon today; the method picker's Illustration in it is still to come.

## Changes

- 30 Oct 2026: this page written; a play function proves the checkbox tiles' keys.
- 29 Oct 2026: its group heading renders Section label; Card's radios deprecated in its favour.
- 29 Oct 2026: replaced stacked Cards in Create report, Add a new group, the template gallery and Settings' access
  (docs/DECISIONS.md).
- 29 Oct 2026: built as one component for radio and checkbox tiles, with a media slot; chosen border drawn inside,
  revealed fields beside the radio, not inside its label.
