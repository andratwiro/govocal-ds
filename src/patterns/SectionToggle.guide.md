# Section toggle

## When to use

- In a builder's section list, to show or hide one section of a page: the homepage builder's Homepage banner,
  Projects, Events, and the sections of a custom page in Pages & menu.
- With `isDisabled` for a section that can't be turned off (the Homepage banner): the switch stays on, out of reach.

## When not to use

- For a setting that isn't a page section (a feature on or off): use **Switch** with its description.
- To choose one of several looks or layouts: use **Choice card** or **Segmented control**.
- For a phase's email that sends itself: use **Notification row**.
- For a menu item in the platform's menu: use **Data table** rows, as Pages & menu does.

## Anatomy

1. **Title**: the section's name ("Events").
2. **Description** (optional): a short line about what it shows.
3. **Status badge**: "Shown on page" or "Not shown on page".
4. **Switch**: with the word "Show", named "Show <title>".

## Behaviour

The switch follows the WAI-ARIA [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/); turning it shows
or hides the section and the badge follows. A locked section's switch is skipped.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the next section's switch, skipping a locked one. | `play: Keyboard` |
| Space | Shows or hides the section; the badge changes with it. | `play: Keyboard` |

## Content

- The title is the section's name as it reads in the builder, sentence case: "Homepage banner", "Image & text
  cards".
- The description says what the section shows in one short line: "Upcoming events from every project."
- The badge words and the switch's name come in through `labels` ("Shown on page", "Not shown on page", "Show",
  "Show <title>").
- Above a list, say how many are shown: the homepage builder's Sections panel counts "3 of 6 shown".

## Accessibility

**The part gives you:** a switch named for its section ("Show Events"), a status badge in words so colour is never
the only signal, and a locked switch that stays on and out of the tab order.

**You still own:**
- A list around the toggles, named ("Sections"), and its heading.
- Saying why a locked section can't be hidden, near the list, since a disabled switch can't explain itself.
- Saving: the toggle only reports the change (`onChange`); the page decides when it is saved (the builder's Save).

## Related

- **Switch**: the switch inside.
- **Status badge**: the shown or hidden badge.
- **Panel**: the builder's section list sits in one.

## Provenance

- Built by AI agents from the real admin's section toggle on the homepage and custom pages; not in Figma.
- Reviewed by a person: not yet.
- Known limits: sections can't be reordered from the row; the badge reuses Status badge's live and draft looks.

## Changes

- 30 Oct 2026: Behaviour names React Aria's parts as docs/REACT-ARIA.md now reads them (SwitchField and
  SwitchButton, through Switch).
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: built for the back office's Pages & menu (homepage builder and custom pages).
