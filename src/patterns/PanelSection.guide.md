# Panel section

## When to use

- To split a project's setup column into named sections: "Collecting now", "Next actions", "Before you publish" (with
  `aside="0 of 6 ready"`) on the project overview, a method's setup ("Voting setup") on a phase's Build tab.
- With `isCollapsible` for details people open now and then: "Project details" on the overview, folded by default.

## When not to use

- For a whole panel with its own head and actions: use **Panel**.
- For a section of the side panel that shows one record: use **Side panel**'s sections.
- For a heading over a group of rows without a body of its own: use **Section label**.
- For a card that folds open in a setup checklist: use **Setup step**.

## Anatomy

1. **Header**: the title (a small strong heading, h3 by default) and, at the end, a short note (`aside`) or, when
   collapsible, a chevron.
2. **Body**: the content, 16 below the header.

## Behaviour

A collapsible section is a disclosure, after the WAI-ARIA
[Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): its header is a button that folds the body.
A plain section takes no focus itself. Behaviour from React Aria's Button, Heading, Disclosure and DisclosurePanel.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to a collapsible section's header. | `play: Keyboard` |
| Enter, Space | Opens or folds the section. | `play: Keyboard` |

## Content

- The title names what's in it, sentence case, two or three words: "Next actions", "Project details".
- `aside` is a short status in numbers: "0 of 6 ready". It doesn't show on a collapsible section.
- Fold only what people rarely need; a folded section hides its content from a quick scan.

## Accessibility

**The section gives you:** a real heading for the title, and on a collapsible one a header button that says whether it
is open (`aria-expanded`) with its body tied to it.

**You still own:**
- The heading level that fits the page's outline (`headingLevel`).
- Putting the section in a named region (the Panel around it), so the headings have a context.

## Related

- **Panel**: the panel the sections divide.
- **Action row**: the rows of "Next actions".
- **Stat card**: the figure in "Collecting now".
- **Setup step**: the checklist under "Before you publish".

## Provenance

- Built by agents from the designer's prototype (the project page's panel sections); not in Figma.
- Reviewed by a person: not yet.
- Known limits: no `aside` on a collapsible section; the open state can only be set at first render
  (`defaultExpanded`).

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: `headingLevel` sets the title's level.
- 29 Oct 2026: project setup as a Panel whose parts are Panel sections, on the overview and a phase's Build tab
  (docs/DECISIONS.md, "Project overview").
- 29 Oct 2026: built for the project overview from the prototype.
