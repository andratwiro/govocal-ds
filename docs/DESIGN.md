# govocal-ds: design

Agreed by Rob, 29 Oct 2026. Owner from 2 Nov 2026: Tali (Rob on leave, answers async).

## What it is

A demo that designers can own Go Vocal's components themselves. It is not a package and not an integration: the
devs decide strategy and implementation later (maybe lifting it into their Storybook). It has two parts on one
public URL:

- **/storybook**: every component in Tali's system, every state, in left-to-right and Arabic right-to-left, with
  accessibility results per component.
- **/backoffice**: the whole Go Vocal back office, shallow: one page per nav item, invented data, built only from
  the components. Deeper screens borrow patterns from the Augur prototypes.

**Done (week 4):** Tali has taken several changes from Figma to the live URL by herself through the terminal, and a
dev walking the back office sees one consistent system with every main component and its states.

## The flow

1. Tali's Figma (and Rob's Augur patterns) → Figma MCP in the terminal → components and stories in this repo.
2. The terminal builds back-office pages from those components.
3. A push to `main` puts both live.
4. To refine something the agent filled in, Tali pulls it back into Figma (or fixes it in the terminal), then step 1.

## Rules

- **Code wins.** When Figma and the repo disagree, the repo is the truth. Tokens flow one way: Figma variables →
  `tokens/` → `tokens.css`.
- **System first.** The back office uses only `src/components` and the tokens. A page that needs something the
  system lacks gets it added to the system first. That is how the demo shows what Tali's system is missing.
- **Fill the gaps.** The agent applies Tali's system to everything she hasn't drawn (states, RTL, focus). Nothing is
  marked as filled in: Tali browses and judges.
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
backoffice/        Vite app: sidebar + one route per nav item, invented data
.storybook/        a11y addon (WCAG 2.2 AA + target size), Components page with counts
AGENTS.md          the rules for Tali's agent
.github/workflows/ push to main → build both → GitHub Pages
```

## Tali's loop

She opens Claude Code in the repo with the Figma, Storybook and React Aria MCP servers.

- **Component:** point at a Figma frame, "apply this". The agent first lists what it reuses and what is new; she says
  go; it edits the component and stories, runs the accessibility tests, she looks in local Storybook, she pushes.
- **Tokens:** edit variables in Figma, export JSON into `tokens/`, the agent rebuilds `tokens.css`. In Figma, each
  variable's code syntax is `var(--gv-…)`, so the MCP hands the agent real token names.
- **Page:** "build Users from this Augur pattern". Missing component → system first.
- **Back to Figma:** the Figma MCP draws a component into a draft (beta, Full seat), or she redraws it.

## Live, and when it breaks

- Push to `main` → GitHub Action: tokens → Storybook → accessibility run (results JSON for the Components page) →
  back office → GitHub Pages.
- A failed build deploys nothing; the last good version stays live; GitHub emails the pusher.
- Stuck → the agent opens one issue labelled `for-rob`: what was tried, the error, one question.
- The agent never edits the workflow or the accessibility settings (a rule in AGENTS.md, not a lock).

## Out of scope for the 4 weeks

Front-office screens, city colours, a published package, marking what was filled in, integration with citizenlab.
