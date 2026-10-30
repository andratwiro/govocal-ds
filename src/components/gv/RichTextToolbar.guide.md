# Rich text toolbar

## When to use

- Over a text that takes formatting: it is the top of the **Rich text editor**, and of Notification email's body.
- On its own only when a page builds its own editor: pass `isBold` / `onBoldChange` and the like, and `onLink`,
  `onImage`, `onVideo` for the pickers.

## When not to use

- For a text editor: use **Rich text editor**, which holds the toolbar.
- For a row of actions on a page: use **Button**s or a **Table toolbar**.
- For one formatting tool on its own: use **Rich text toolbar button**.

## Anatomy

1. **Toggles**: Bold, Italic, List, each a **Rich text toolbar button** that stays pressed.
2. **Pickers**: Add link, Add image, Embed video: plain buttons that open a picker.

25 tall with its bottom line; icons at 14 with a 1.75 stroke.

`variant="floating"` (not in Figma): the format bar over a text block on a document's page (a **Block frame**'s
`toolbar`), a card with the overlay shadow. It adds a **block-type segment** first (Section · Sub-section · Text, with
`onBlockTypeChange`) and an **actions** slot last, after a hairline (Ask the assistant, Delete); image and video show
only when a page handles them.

## Behaviour

The toolbar follows the WAI-ARIA [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/): one Tab stop,
arrows inside.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Lands on the first tool; the next Tab leaves the toolbar. | `play: Keyboard` |
| Right arrow, Left arrow | Move between the tools. | `play: Keyboard` |
| Enter | Presses the tool: a toggle goes in or out. | `play: Keyboard` |

## Content

- The toolbar is named "Formatting"; the tools "Bold", "Italic", "List", "Add link", "Add image", "Embed video"; all
  through `labels`.
- Tools are icons only, so every name matters: it is what a tooltip-less tool says.

## Accessibility

**The toolbar gives you:** a named toolbar, one Tab stop with arrow keys, toggles that say pressed or not, and named
icon buttons.

**You still own:**
- The pickers the link, image and video buttons open, and focus back on the button when they close.
- Applying the formatting to the text.
- The names in the page's language (`labels`).

## Related

- **Rich text editor**: the editor it heads.
- **Rich text toolbar button**: one toggle.
- **Notification row**: an email's body with this toolbar.

## Provenance

- Built by AI agents from Figma (Rich text toolbar, node 4:178) and the prototype's 14px icons.
- Reviewed by a person: not yet.
- Known limits: the tools hold state only; no tooltips on the icon-only tools.

## Changes

- 30 Oct 2026: a `floating` variant with a block-type segment and an `actions` slot, for a report's text blocks
  (docs/DECISIONS.md, "Report parts"); `play: FloatingKeyboard` proves its segment's keys.
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: link, image and video became plain buttons (as toggles they stayed pressed after a click); words through
  `labels`.
