# Page header

## When to use

- At the top of every back-office page: the title, the page's actions at the end of its row ("Create token", "New
  project ▾"), and a line about the page ("Tokens let other tools read this platform's data.").
- With breadcrumbs above the title on a sub-page (`breadcrumbs`): "Tools › Public API tokens".
- Title only, for a page that needs nothing else ("Projects").

## When not to use

- For the head of a section or a list inside the page: use **Panel** (its title, count and actions).
- For an editor's top bar with a draft or live status: use **Breadcrumbs** `variant="editor"`, or the
  **Project header** on a project's screens.
- For a heading with no actions or description inside content: use **Text** with `kind="title"`.

## Anatomy

1. **Breadcrumbs** (optional): above the title, 12 above it; Breadcrumbs draws its own `nav`, named "Breadcrumbs".
2. **Title**: Title type, the page's `h1` unless `headingLevel` says otherwise.
3. **Actions** (optional): at the end of the title's row.
4. **Description** (optional): Small, meta grey, 8 under the title.

It has no margin of its own: the page places it (a Stack's gap).

## Behaviour

Not interactive itself: it can't be reached with Tab and answers no keys. The breadcrumbs and actions you pass keep their own keys (see
**Breadcrumbs** and **Button**).

## Content

- The title is the page's name as the Side nav says it: "Reporting", "Projects", "Public API tokens". Sentence case, no
  full stop.
- The description is one sentence saying what the page is for, ending with a full stop.
- One primary action at most; the rest secondary, or in a menu.
- The breadcrumbs' `nav` name is "Breadcrumbs", set on Breadcrumbs (`labels.nav`).

## Accessibility

**The header gives you:** the page's first heading (an `h1` by default), and a place for the breadcrumbs, which bring their own named `nav` landmark.

**You still own:**
- One `h1` per page: set `headingLevel` when the header sits under another `h1`.
- The title matching the page's document title and the last breadcrumb.
- Words in the page's language (`labels`).

## Related

- **Breadcrumbs**: the trail above the title.
- **Button**: the page's actions.
- **Panel**: a section's head inside the page.
- **Stack**: places the header above the page's panels.

## Provenance

- **Built by:** AI agents, from the back office's own page head (on every page). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** the back office's pages still draw their own head (`backoffice/src/pages/Page.tsx`) and haven't
  moved onto it.

## Changes

- 30 Oct 2026: no `nav` of its own around the breadcrumbs: Breadcrumbs draws it; `labels.breadcrumbs` is ignored and
  goes in the next release.
- 30 Oct 2026: this page written.
- 29 Oct 2026: added from the back office's local page head (16 pages); the title is an `h1` unless `headingLevel` says
  otherwise (docs/DECISIONS.md, "Composition contracts in code").
