# Breadcrumbs

## When to use

- On a sub-page, to show where it sits and lead back up: "Tools › Public API tokens", "Messaging › New email",
  "Reporting › <report>". The back office puts them in the Page header (`breadcrumbs`).
- **Editor** (`variant="editor"`) at the top of an editor: a phase's setup ("Green Corridors for Riverside / Collect
  ideas"), with the panel toggle, a back arrow and the Draft or Live badge.

## When not to use

- On a top-level page reached from the Side nav: the **Page header**'s title is enough.
- To move between sections of the same page: use **Tabs**.
- For a single "back" link: use **Link**.
- To switch between the views of one thing (Build / Manage / Insights): use **Segmented control**.

## Anatomy

0. **Nav**: the whole part is a `nav` landmark named "Breadcrumbs" (`labels.nav`, or `aria-label`).
1. **Crumbs**: links to each level above, in order, then the current page in strong text (not a link).
2. **Separators**: a chevron (default) or a slash (editor), hidden from screen readers.
3. **Panel toggle and back arrow** (editor only): two ghost Icon buttons, split by a divider, before the trail.
4. **Status badge** (editor only): Draft or Live after the trail (`status`).

## Behaviour

It follows the WAI-ARIA [Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/): each crumb is a
link, and the last one is the current page (`aria-current="page"`).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves through the crumbs that lead somewhere; the current page is skipped. | `play: Keyboard` |
| Enter | Follows the focused crumb. | `play: Keyboard` |

## Content

- Each crumb is the page's name as its own title says it: "Tools", "Messaging", the project's title. Sentence case.
- The last crumb is the current page's title, the same words as the Page header's title.
- Keep it to the levels above; don't repeat the Side nav's top level unless the page is reached from it.
- The editor's words (the toggle's and back arrow's names, "Draft", "Live") come through `labels`.

## Accessibility

**The breadcrumbs give you:** their own `nav` landmark, named "Breadcrumbs", a list of links, the current page marked `aria-current="page"` and left out of the tab
order, separators hidden from screen readers, and named editor buttons.

**You still own:**
- Wrapping it in nothing: it draws its own `nav`, so a second one around it would be a landmark twice. Name it for
  the place when a page has two trails (`aria-label`).
- Crumb names that match the pages they lead to.
- Words in the page's language (`labels`).

## Related

- **Page header**: where breadcrumbs sit, above the title.
- **Link**: a single link back.
- **Status badge**: the editor's Draft and Live.
- **Icon button**: the editor's toggle and back arrow.

## Provenance

- **Built by:** AI agents, from Figma (Breadcrumbs, node 14:875: Project, Phase · Draft, Phase · Live) and the prototype
  (`.pj-bc`).
- **Reviewed by a person:** not yet.
- **Known limits:** long trails don't collapse into "…".

## Changes

- 30 Oct 2026: draws its own `nav` landmark, named "Breadcrumbs" (`labels.nav`); Page header and Project header no
  longer wrap it in theirs.
- 30 Oct 2026: this page written; a play function proves Tab and Enter.
- 29 Oct 2026: `level="phase"` and `phaseState` became `variant="editor"` and `status` (docs/DECISIONS.md, "Public API and
  prop names").
- 29 Oct 2026: the Component takes the name Breadcrumbs; the starter part is gone (docs/DECISIONS.md, "Public API and
  prop names").
