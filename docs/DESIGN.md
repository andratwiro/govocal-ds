# govocal-ds: design

Agreed 29 Oct 2026. From 2 Nov 2026 the designer owns it; the project lead is on leave and answers async.

## What it is

A demo that designers can own Go Vocal's components themselves. It is not a package and not an integration: the
devs decide strategy and implementation later (maybe lifting it into their Storybook). It has two parts on one
public URL:

- **/storybook**: every component in the design system, every state, in left-to-right and Arabic right-to-left, with
  accessibility results per component. After **Overview** (Welcome, Accessibility), four sections, each built only
  from the ones above it:
  - **Foundations**: a page per topic, none with a box that scrolls inside the page: Colour, Typography, Spacing,
    Radius, Shadows (the tokens, with which components use each), Motion, Size (icons, controls, avatars), **Icons** (every icon the system uses,
    Storybook's own `IconGallery` doc block) and Illustrations.
  - **Components**: generic parts built on React Aria and painted with the tokens; what pages use.
  - **Patterns**: compositions that repeat but aren't primitives (the phase timeline, a stat card with a sparkline, a
    next-action row). Same stories, states and accessibility check as components.
  - **Back office** stories (planned, empty today): whole pages, the same pages as /backoffice.
  - **Base**, last: React Aria's starter painted with the tokens, the primitives the Components build on. Pages don't
    use them directly; when one truly needs a part no Component covers, it imports it from `govocal-ds/base`.
- **/backoffice**: the whole Go Vocal back office, shallow: one page per nav item, invented data, built only from
  the components. Deeper screens borrow patterns from the Augur prototypes.

**Done (week 4):** the designer has taken several changes from Figma to the live URL on their own, through their agent, and a
dev walking the back office sees one consistent system with every main component and its states.

## The flow

1. The Figma file and the working prototype (https://govocal.augur.page/ux-ui-audit/design/, which has components and
   patterns Figma doesn't yet) → the agent, through the Figma MCP → components, patterns and stories in this repo.
2. The agent builds back-office pages from those components.
3. A push to `main` puts both live.
4. To refine something the agent filled in, the designer pulls it back into Figma (or has the agent fix it), then step 1.

## Rules

- **Code wins.** When Figma and the repo disagree, the repo is the truth. Tokens flow one way: Figma variables →
  `tokens/` → `tokens.css`.
- **System first, not everything in it.** The back office builds from `src/components`, `src/patterns` and the tokens, and
  adds to the system only what passes the rule in docs/NAMING.md (generic and used twice, or a Figma component). One-offs
  stay in their page, built from components.
- **Fill the gaps.** The agent applies the system to everything Figma doesn't draw (states, RTL, focus). Nothing is
  marked as filled in: the designer browses and judges.
- **Say what it is for.** Each component and pattern has a doc comment above its export; its first sentence says
  what someone would ask for ("a key figure: one number with its label"), not how it is built. docs/COMPONENTS.md is
  generated from these, and an agent finds parts by reading it.
- **Paint only through `var(--gv-*)`.** Plain React + plain CSS on CSS variables. No styled-components, no Tailwind.
- **Accessibility is shown, never blocking.** WCAG 2.2 AA is the front office's bar; this system serves the back office
  for now, so the design is followed as drawn. Findings show in Storybook's Accessibility panel, on
  Overview/Accessibility and as e2e annotations; none fails a check, and none is a reason to change the design.
  Results hold for Go Vocal's own palette only (no city colours yet), and the page says so.
- **Public repo hygiene.** No licensed font files (link a font service), no real tenant names or data, no unreleased
  roadmap items. Pages carry `noindex`.

## Repo

```
src/index.ts         the `govocal-ds` entry: Components, Patterns, AppProvider (package.json "exports")
src/base.ts          the `govocal-ds/base` entry: Base, React Aria's starter parts painted with the tokens
src/tokens.css       the `govocal-ds/tokens.css` entry, generated from tokens/ (npm run tokens:build)
src/components/      the Base parts (Storybook's Base, primitives: prefer a Component), each with its .css and .stories.tsx
  gv/                the Components (Storybook's Components), one file name per export
src/patterns/        the Patterns (grouped in Storybook by the screen they belong to); recipes/ is markup to copy
src/foundations/     the Foundations pages: colour, type, spacing, size, radius, shadows, motion, icons, focus
src/illustrations/   the illustration SVGs
src/stories/         story fixtures (invented data, pictures); product code never imports them
src/*.mdx            Overview pages: Welcome, Accessibility, For developers (docs/CONSUMING.md)
tokens/              Figma variables (JSON) + the hand-written motion, size and semantic sets
public/              tokens.json (tokens:build) and llms.txt (components:index), copied to the site's root
scripts/             token build and renames, the Figma pull and spec, the docs index, the a11y scan, the site
backoffice/          the demo back office (Vite + React Router), built only from the three entries
.storybook/          docgen + the components manifest, the a11y addon (WCAG 2.2 AA + target size), theme, redirects
tests/               Vitest guards (npm test): tokens, names, the public API, the docs index
e2e/                 Playwright against dist/: every story, the site, the back office, keyboard; axe reported
docs/                the rules, decisions and recipes; COMPONENTS.md is generated
site/index.html      the landing page at the site's root
AGENTS.md            the agent's map (CLAUDE.md imports it); .mcp.json: the Storybook, Figma, React Aria servers
.github/workflows/   checks.yml on every pull request; deploy.yml on main: build, e2e + a11y, GitHub Pages
```

## The designer's loop

The designer works through their own agent: claude.ai with the GitHub and Figma connectors, or Claude Code in the repo
with the Figma, Storybook and React Aria MCP servers.

- **Component:** point at a Figma frame, "apply this". The agent first lists what it reuses and what is new; the designer
  says go; it edits the component and stories and pushes; the designer looks at the result in Storybook.
- **Tokens:** edit variables in Figma, export JSON into `tokens/`, the agent rebuilds `tokens.css`. In Figma, each
  variable's code syntax is `var(--gv-…)`, so the MCP hands the agent real token names.
- **Page:** "build Users from this Augur pattern". Missing component → system first.
- **Back to Figma:** the Figma MCP draws a component into a draft (beta, Full seat), or the designer redraws it.

## Live, and when it breaks

- A pull request into `main` runs the checks: typecheck, unit tests, build (Storybook, back office), e2e. A push to
  `main` runs them again, the accessibility scan beside the e2e, folds the scan's results into Overview/Accessibility,
  and publishes to GitHub Pages. The scan never fails the run.
- A failed build deploys nothing; the last good version stays live; GitHub emails the pusher.
- Stuck → the agent opens one issue labelled `stuck`: what was tried, the error, one question. (The label and its
  issue template are still to be made.)
- The agent never edits the workflow or the accessibility settings (a rule in AGENTS.md, not a lock).

## Out of scope for the 4 weeks

Front-office screens, city colours, a published package, marking what was filled in, integration with citizenlab.
