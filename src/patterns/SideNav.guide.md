# Side nav

## When to use

- As the back office's main navigation, down the window's start edge on every page: the "To platform" band, the main
  pages (Dashboard, Projects, Input manager, Users…), then at the bottom Settings, Notifications, the account and
  Support.
- Folded (`isFolded`) inside a project or phase, where the page needs the room: a 52 wide rail of icons, each name as
  a tooltip.
- `SideNavLink` for a row that goes to a page (`isCurrent` on the open one); `SideNavButton` for a row that opens a
  menu or a popover (the account menu, the notifications list), placed first inside a MenuTrigger or DialogTrigger.
- `count` with `countLabel` for a red count that needs attention ("46 inputs need feedback").

## When not to use

- To switch between views or sections inside a page: use **Tabs**.
- For the phases of a project: use **Phase timeline** or **Rail phase** in the project rail.
- To show where the page sits in the hierarchy: use **Breadcrumbs**.
- For a list of actions: use **Menu** (opened from a `SideNavButton` with `hasMenu`).

## Anatomy

1. **Home band** (`SideNavHome`): "To platform", leaving the back office for the resident site.
2. **Groups** (`SideNavGroup`): lists of rows; `isAtBottom` sends a group to the foot of the rail.
3. **Rows**: the icon (18) or an avatar, the label, an optional second line (the account's role), a red count, and a
   chevron on a row that opens a menu (`hasMenu`).
4. **Tooltips** (folded only): each row's name, at the end side.

224 wide open, 52 folded; it runs the window's full height on the dark surface.

## Behaviour

A navigation landmark of links and buttons, after the WAI-ARIA
[Disclosure navigation pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): Tab walks the rows, and the
rows with a menu open it.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves through the rows in order, top to bottom. | `play: Keyboard` |
| Tab (folded) | Shows the focused row's name as a tooltip. | `play: Keyboard` |
| Enter (on a row with a menu) | Opens its menu with focus on the first item. | `play: Keyboard` |
| Esc (in its menu) | Closes the menu and puts focus back on the row. | `play: Keyboard` |

No hover peek when folded: an edge that opens on hover catches stray pointers and no keyboard reaches it
(docs/DECISIONS.md, "Building from the prototype review").

## Content

- Row labels are the page's name, one or two words, sentence case: "Input manager", "Users", "Settings".
- The account row shows the person's name and their role on the second line ("Administrator").
- `countLabel` says what the count means, in words: "46 inputs need feedback", "28 unread". The number alone is read
  out otherwise.
- Counts are numbers; the nav writes them in the page's locale.
- The home band's words come in through `labels` ("To platform").
- Give the nav a name (`aria-label`, "Main") that sets it apart from other navigation on the page.

## Accessibility

**The nav gives you:** a named navigation landmark, `aria-current="page"` on the open page, names that stay with the
controls when folded (and show as tooltips on focus and hover), counts read in words, and a focus ring that shows on
the dark surface.

**You still own:**
- `isCurrent` on the row of the page that is open.
- A `countLabel` for every count.
- Wiring each `SideNavButton` to its menu or popover, and naming that menu.
- Folding only where the page needs the room; a folded rail hides the words people scan for.

## Related

- **Notification list**: what the Notifications row opens.
- **Menu**: the account and Support menus.
- **Tooltip**: the folded rail's names.
- **Avatar**: the account row's picture.
- **Breadcrumbs**: where a page sits, inside the area the nav opened.

## Provenance

- Built by AI agents from the real admin's dark rail and the prototype's sidebar, not from Figma (tagged Not in Figma).
- Reviewed by a person: not yet.
- Known limits: only two levels (no nested items); the accent icon and focus ring use component tokens on the one dark
  surface (docs/DECISIONS.md); the folded count's text is a step larger than the prototype's.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table; the doc comment moved onto `SideNav` so
  the page has its Purpose.
- 29 Oct 2026: counts follow the locale; the home band's words come in through `labels`.
- 29 Oct 2026: folded with tooltips and no hover peek (docs/DECISIONS.md, "Building from the prototype review").
- 29 Oct 2026: built with the back office's full sidebar.
