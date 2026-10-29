# govocal-ds: design

Agreed 29 Oct 2026. From 2 Nov 2026 the designer owns it; the project lead is on leave and answers async.

## What it is

A demo that designers can own Go Vocal's components themselves. It is not a package and not an integration: the
devs decide strategy and implementation later (maybe lifting it into their Storybook). It has two parts on one
public URL:

- **/storybook**: every component in the design system, every state, in left-to-right and Arabic right-to-left, with
  accessibility results per component. Four sections, each built only from the ones above it:
  - **Foundations**: the tokens (with which components use each), and **Icons**: every icon the system uses,
    searchable (Storybook's own `IconGallery` doc block).
  - **Components**: React Aria primitives painted with the tokens.
  - **Patterns**: compositions that repeat but aren't primitives (the phase timeline, a stat card with a sparkline, a
    next-action row, the drafts bar). Same stories, states and accessibility check as components.
  - **Back office** stories: whole pages (the same pages as /backoffice).
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
- **System first.** The back office uses only `src/components`, `src/patterns` and the tokens. A page that needs something the
  system lacks gets it added to the system first. That is how the demo shows what the system is missing.
- **Fill the gaps.** The agent applies the system to everything Figma doesn't draw (states, RTL, focus). Nothing is
  marked as filled in: the designer browses and judges.
- **Paint only through `var(--gv-*)`.** Plain React + plain CSS on CSS variables. No styled-components, no Tailwind.
- **Accessibility is shown, never blocking.** Results hold for Go Vocal's own palette only (no city colours yet), and
  the page says so.
- **Public repo hygiene.** No licensed font files (link a font service), no real tenant names or data, no unreleased
  roadmap items. Pages carry `noindex`.

## Repo

```
tokens/            Figma variables export (JSON) → built into src/tokens.css (--gv-*)
src/components/    React Aria Components, painted with the tokens
  *.stories.tsx    every state, LTR + Arabic RTL
src/patterns/      compositions of components (timeline, stat card…), tokens only, same stories
backoffice/        Vite app: sidebar + one route per nav item, invented data
.storybook/        a11y addon (WCAG 2.2 AA + target size), Components page with counts
AGENTS.md          the rules for the designer's agent
.github/workflows/ push to main → build both → GitHub Pages
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

- Push to `main` → GitHub Action: tokens → Storybook → accessibility run (results JSON for the Components page) →
  back office → GitHub Pages.
- A failed build deploys nothing; the last good version stays live; GitHub emails the pusher.
- Stuck → the agent opens one issue labelled `stuck`: what was tried, the error, one question.
- The agent never edits the workflow or the accessibility settings (a rule in AGENTS.md, not a lock).

## Out of scope for the 4 weeks

Front-office screens, city colours, a published package, marking what was filled in, integration with citizenlab.
