# Card

## When to use

- For one setting or one piece of a setup, as a titled box with where it stands and a control: a phase's Build tab
  ("Dates", "Idea form", "What should an input be called?", "Available views"), with Required, To review or Reviewed.
- **Expand** (`control="expand"`) to open the setting in place, **open** (→) when it leads to its own page, **menu** to
  pick one value from the header (Sorting), icon actions or a switch for a quick action.
- **Filled** (`variant="filled"`) on the grey stage of Manage and Insights ("Add an idea", "Exports", "Get an AI
  Sensemaking summary"); **outlined** on a white panel.
- **With media** (`media`) for a gallery of things to pick: a project in the Inspiration hub, a template, a tool on the
  Tools page.

## When not to use

- For a list or a table with a head, count and actions: use **Panel**.
- For a choice between options in a form: use **Choice card** (in a Radio group); Card's own radios are deprecated.
- For a row that leads somewhere or runs one action: use **Action row**.
- For a number with its label: use **Stat tile**.
- For a dashboard's chart in a frame: use **Dashboard card**.
- To lay out a page's columns: use **Grid** or **Tile grid**; a Card is content, not a layout.

## Anatomy

1. **Media** (optional): a picture on top, edge to edge, 2:1.
2. **Title**: Small type.
3. **Status line**: a Required marker, a Review status, a grey summary ("Not set") or pills ("6 questions"); pills hide
   while the card is open.
4. **Control**: the chevron (expand or menu), the → (open), ghost Icon buttons (`iconActions`, each with an optional
   tooltip), or anything else at the end (`actions`: Compact buttons, a `CardSwitch`).
5. **Body** (optional): under the header; with expand, only while open. `layout="stacked"` puts it 24 under the title.

## Behaviour

Behaviour from React Aria's `Disclosure`, `DisclosurePanel`, `Button`, `Heading`, `MenuTrigger`, `Menu` and `MenuItem`,
through the system's Popover, Tooltip, Radio group and Switch.

An expanding card follows the WAI-ARIA [Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): its
whole header is one button. A menu card's header is a menu button.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the card's header, then to its actions in order. | `play: Keyboard` |
| Enter or Space (on an expanding header) | Opens or closes the body. | `play: Keyboard` |
| Enter (on a menu header) | Opens the values; Esc closes them and puts focus back on the header. | `play: Keyboard` |
| Tab (onto a disabled action with a tooltip) | Focus still lands on it and the tooltip says why it is off. | `e2e/build-tab.spec.ts` |

## Content

- The title names the setting as a person would: "Dates", "Idea form", "Collect demographic data". Sentence case; a
  question is fine when the setting is one ("What should an input be called?").
- The summary is the current value in a few words ("Not set", "Survey"); pills are counts or the chosen value ("6
  questions", "Idea").
- An icon action's `label` says the action: "Add an attachment", "Download the ideas"; a disabled one's `tooltip` says
  why: "Nobody has signed up yet".
- The words it says itself come through `labels`: "Required", "To review", "To set", "Reviewed", and the →'s name
  ("Open Collect demographic data").

## Accessibility

**The card gives you:** a heading around the header, an expanding header that says whether it is open, a menu header
announced as a menu button, named icon actions, disabled actions that stay focusable and explain themselves, and a
review status in words, not only colour.

**You still own:**
- A title that is plain text when the card is open-to-navigate, so the → gets a name.
- `aria-label` on a `CardSwitch` (it has no visible label of its own).
- The heading level fitting the page's outline.
- Words in the page's language (`labels`).

## Related

- **Panel**: the frame for lists and tables.
- **Choice card**: tiles for a choice in a form.
- **Action row**: a row that leads somewhere.
- **Review status**: the status a card shows.
- **Compact button**: the in-card action.
- **Setup step**: a Build tab step built on a card.

## Provenance

- **Built by:** agents, from Figma (Card, node 14:879, its 23 types as props) and the prototype (media, the disabled
  action with its tooltip, Reviewed, the menu with icons).
- **Reviewed by a person:** not yet.
- **Known limits:** `CardRadioGroup` and `CardRadio` are deprecated but kept until Reporting and Users move to Choice
  card; Card's row, Setup step and Action row are close cousins the plan means to merge into one setup row.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab, Enter and Space on an expanding card and the menu card.
- 29 Oct 2026: `tone="build" | "manage"` became `variant="outlined" | "filled"`; `review` became `status`; the menu
  card takes `value` / `defaultValue` / `onChange` (docs/DECISIONS.md, "Composition contracts in code").
- 29 Oct 2026: a disabled action with a `tooltip` uses `aria-disabled`, so it can say why; Card radios are deprecated in
  favour of Choice card (docs/DECISIONS.md, "Building from the prototype review").
