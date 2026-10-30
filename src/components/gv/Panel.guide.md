# Panel

## When to use

- As the white frame of every list or table in the back office, with its head: "All participants", "Custom emails",
  "Tags", "Reports". A Panel holds the title, a count, a description, the head's actions, a Table toolbar row, the
  Data table and Pagination in its foot.
- For a form section of a settings page, with Save in its foot (Settings' sub-tabs, a custom page, Popup).
- For a composer (Messaging's new email), with Cancel and Send in the foot.

## When not to use

- For one setting with a status and a control: use **Card**.
- For a bare table with no head: Data table's `framed` is enough (**Data table**).
- To show one record beside a list: use **Side panel**.
- For the page's own title and actions: use **Page header**.
- For a dashboard's chart in a frame: use **Dashboard card**.

## Anatomy

1. **Head**: the title (an `h2` by default), a count Badge after it, a description under it, and actions at the end,
   over a hairline.
2. **Toolbar** (optional, `toolbar`): a row between the head and a flush body, 20 in: a Table toolbar and its Filter
   chips.
3. **Body**: padded, or flush (`isFlush`) for a table or list that runs edge to edge.
4. **Foot** (optional, `footer`): under a hairline, its content at the end: Pagination, or Cancel / Send.

## Behaviour

Not interactive itself: it takes no focus or keys. It is a `section` named by its title, so screen readers can jump to
it; its actions, toolbar and body keep their own keys.

## Content

- The title names what the panel holds, a noun in sentence case: "All participants", "Tags", "Custom emails".
- The count is a number, in the page's numbers ("2,184"); leave it out when the Table toolbar already says it.
- The description is one sentence saying what the list is for.
- One primary action in the head at most ("Create email", "Add tag").

## Accessibility

**The panel gives you:** a `section` landmark named by its heading, and the count read with the title.

**You still own:**
- The heading level fitting the page's outline (`headingLevel`, 2 under the page's `h1`).
- Names for the head's actions and the body's table.
- Words in the page's language.

## Related

- **Data table**: the list most panels hold.
- **Table toolbar**: the row in `toolbar`.
- **Pagination**: the foot of a list panel.
- **Card**: a single setting.
- **Side panel**: a record beside its list.

## Provenance

- **Built by:** agents, from the prototype (the Audience table card, the Messaging panel and composer). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** no borderless look yet (the plan's small fixes list it); it can't fold away (that is a Section
  toggle's job).

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: every admin list is a Panel over a Table toolbar, a Data table and Pagination (docs/DECISIONS.md, "Back
  office redesign on the current components").
- 29 Oct 2026: one Panel for three table card heads (title, count Badge, description, actions, footer)
  (docs/DECISIONS.md, "Building from the prototype review").
