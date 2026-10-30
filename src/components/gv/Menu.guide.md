# Menu

## When to use

- For a short list of actions on one thing, opened from a button: a row's "…" (Edit, Duplicate, Delete), "New
  project ▾" (From scratch, Use a template), Export and Download formats.
- For a short list of settings to pick from, where the choice is an action more than a form field: the project's
  Area (one of three, with a line each), the account menu's Language (a submenu).
- To tick several things and keep the menu open, then act: Copy to phase (a pick-several section with
  `shouldCloseOnSelect={false}`, then "Add phase" after a divider).
- With sections and headings when the items fall into groups (Export: Ideas, Project, Votes), and a disabled item kept
  in its place when it can't be used yet.

## When not to use

- For a form field whose value is saved with the form: use **Select**.
- To filter a list by several facets: use **Filter menu** (it is built on Menu).
- For a searchable list of many options to tick: use **Option list**.
- To move between pages of the app: use **Link**s or the **Side nav**.
- For one action: a **Button**; for two or three that always show, a row of Buttons.
- To confirm what an item does: open an **Alert dialog** from the item, never ask inside the menu.

## Anatomy

1. **Trigger**: a Button (often with `hasMenu`, "▾") or a "…" Icon button, in a `MenuTrigger`.
2. **Popover**: under the trigger, at its start edge (`placement`, `bottom start` by default).
3. **Items** (`MenuItem`): 32 tall, with an optional leading 16 icon or Avatar, a name, an optional Badge after it
   and an optional description line under it.
4. **Sections** (`MenuSection`) with a small heading, and **separators** between groups.
5. **Selection marks**: a box at the start when ticking several; a check at the end for the one chosen.
6. **Submenu** (`SubmenuTrigger`): a chevron at the end; the submenu opens beside its row.

## Behaviour

The menu follows the WAI-ARIA [Menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/): one Tab
stop for the button; inside the menu the arrow keys move and typing a letter jumps to an item.

| Key | What it does | Tested by |
| --- | --- | --- |
| Enter (on the button) | Opens the menu with focus on its first item. | `play: Keyboard` |
| ↓ and ↑ | Move to the next or previous item. | `play: Keyboard` |
| → (on an item with a submenu) | Opens the submenu with focus on its first item. | `play: Keyboard` |
| ← (in a submenu) | Closes the submenu and goes back to its row. | `play: Keyboard` |
| Enter (on an action) | Does the action and closes the menu. | `e2e/menu.spec.ts` |
| Enter or Space (on a tick, in a pick-several section) | Ticks or unticks it; the menu stays open. | `e2e/menu.spec.ts` |
| Esc | Closes the menu and puts focus back on the button. | `play: Keyboard` |

## Content

- Items start with a verb when they act ("Duplicate", "Export ideas to Excel", "Copy link"), or name the value when
  they choose ("No specific area", "Français").
- Sentence case, no full stop, one line. A description line, when it helps, is one short sentence: "The project will
  show on every area filter."
- The destructive item ("Delete", "Block user") goes last, after a separator.
- Section headings are short nouns: "Ideas", "Project", "Votes".
- Name the menu (`aria-label`) for what it holds: "Export", "Options for Resident A".
- The loading row's name is "Loading more…" (`labels.loading` on `MenuLoadMoreItem`).

## Accessibility

**The menu gives you:** a menu button announced as one, focus into the menu and back, arrow keys and typeahead,
`menuitemcheckbox` and `menuitemradio` roles for ticks and choices, disabled items that stay announced, and submenus
that open and close by keyboard.

**You still own:**
- A name for the menu and the button (an Icon button's "…" needs "Options for …").
- Items that make sense alone: "Delete project", not "Delete" when the menu could be about something else.
- What happens after an item: a Toast, an Alert dialog, or moving focus to what the item opened.
- Words in the page's language.

## Related

- **Button**: `hasMenu` adds the chevron of a button that opens a menu.
- **Select**: a form field's single choice.
- **Filter menu**: the filtering menu with facets and options.
- **Option list**: a searchable list of options to tick.
- **Data table**: its row options column opens a Menu.
- **Alert dialog**: where a destructive item asks first.

## Provenance

- **Built by:** AI agents, from the prototype's one dropdown rhythm (rows 32, icons, descriptions, sections, submenus).
  Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** React Aria closes a menu on Enter, ticks included, unless the section sets
  `shouldCloseOnSelect={false}`; the page must set it for pick-several menus.

## Changes

- 30 Oct 2026: this page written; a play function proves Enter, the arrows, the submenu and Esc.
- 29 Oct 2026: a pick-several section keeps the menu open on click, Space and Enter (docs/DECISIONS.md, "Composition
  contracts in code").
- 29 Oct 2026: row menus carry icons in the icon slot, the removing items after a separator (docs/DECISIONS.md, "Back
  office redesign on the current components").
- 29 Oct 2026: moved up from Base to Components, used on two or more screens (docs/DECISIONS.md, "Building from the
  prototype review").
