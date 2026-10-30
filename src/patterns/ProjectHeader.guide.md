# Project header

## When to use

- At the top of every project screen. On the project overview it is the bar: the panel toggle and crumbs (Projects ›
  project), Share ▾, and Publish ▾ while a draft or ● Live ▾ once published; one Save while the setup has changes.
- On a phase screen (`level="phase"`): ← and the project, the phase with its Draft or Live badge, the mode switch in the
  middle (Build · Manage · Insights; a survey has Build · Insights), who is here, and Save.
- As Figma's 48-tall crumb frame alone, without the bar's props, where a project screen needs only the trail.

## When not to use

- For the head of an admin page that isn't a project (Users, Messaging): use **Page header**.
- For a trail on its own: use **Breadcrumbs**.
- For switching views inside a panel: use **Segmented control** or **Tabs**.

## Anatomy

1. **Panel toggle** (optional): shows or hides project setup (the project) or the timeline (a phase).
2. **Crumbs**: the parent and the project, or ← the project and the phase with its status badge.
3. **Mode switch** (phase, with `modes`): a Segmented control in the middle; modes that can't open yet are off.
4. **People** (optional): an Avatar, or an Avatar group when others edit the same phase.
5. **Actions**: Share ▾ and Publish ▾ / ● Live ▾ on the project, or Save.

The crumb frame is 48 tall; the bar is full width.

## Behaviour

The bar is a row of buttons and links; Share and Publish open menus, after the WAI-ARIA
[Menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), and the mode switch is a single choice.
Behaviour from React Aria's MenuTrigger (through Button, Menu, Breadcrumbs and Segmented control).

| Key | What it does | Checked by |
| --- | --- | --- |
| Right arrow, Left arrow (in the mode switch) | Moves to the next or previous mode. | `play: Keyboard` |
| Enter (on a mode) | Opens that mode. | `play: Keyboard` |
| Enter (on Share or Publish) | Opens its menu, focus on the first item. | `play: Keyboard` |
| Esc (in a menu) | Closes it and puts focus back on its button. | `play: Keyboard` |
| Tab | Moves on from Share to Publish. | `play: Keyboard` |

## Content

- Names come from the project: the project's title and the phase's title as the admin wrote them.
- The menus' items start with a verb: "Invite collaborators", "Copy preview link", "Publish now", "Archive project".
- The bar's words (Save, Share, Publish, Live, Draft, the toggles' and ←'s names) come in through `labels`.
- Modes are one word each: "Build", "Manage", "Insights".

## Accessibility

**The header gives you:** a named breadcrumb navigation with the current page marked, named icon buttons, a status
badge in words, a mode switch read as one choice, and menu buttons whose menus return focus.

**You still own:**
- The page's `h1` (the header doesn't render one).
- Saying why a mode is off (Manage and Insights wait for the phase to be published) somewhere on the page.
- Confirming what can't be undone from the menus (Archive project asks first in an Alert dialog).
- The `labels` in the page's language.

## Related

- **Breadcrumbs**: the trail inside it.
- **Segmented control**: the mode switch.
- **Menu**: what Share and Publish open.
- **Avatar**: who is here.
- **Alert dialog**: the confirm behind Archive project.

## Provenance

- Built by agents from Figma ("Project header", its three levels) and the designer's prototype (the full bar).
- Reviewed by a person: not yet.
- Known limits: no archived state (the page says it in a Banner and Publish ▾ offers the way back); a phase has no
  Share.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: one status word, `status`; the bar is built into the header, switched on by the bar's props
  (docs/DECISIONS.md, "Built in the project package").
- 29 Oct 2026: the bar's panel toggle, Share ▾, Publish ▾ / ● Live ▾ and one Save while the setup has changes; the
  View menu went (docs/DECISIONS.md, "Project overview").
- 29 Oct 2026: built from Figma and the prototype.
