# Go Vocal design system

Go Vocal's components, drawn in Figma, built on [React Aria Components](https://react-aria.adobe.com/) and painted
only with the Figma tokens (`--gv-*` CSS variables). A demo back office is built from them alone, to show what the
system covers and what it still lacks.

**Live:** https://andratwiro.github.io/govocal-ds/

- Storybook: https://andratwiro.github.io/govocal-ds/storybook/ (every component, every state, left to right and in
  Arabic right to left, with its accessibility results)
- The back office: https://andratwiro.github.io/govocal-ds/backoffice/
- The tokens as JSON: https://andratwiro.github.io/govocal-ds/tokens.json · for agents:
  https://andratwiro.github.io/govocal-ds/llms.txt

## Start here

### The designer

You own the system and change it by asking Claude Code, in this folder, with the Figma MCP.

1. **Look first.** Open the live Storybook. Overview › Welcome explains the sections; each component's stories show
   its states, the toolbar's Direction button shows it right to left, and its Locale menu shows numbers and dates
   as a Dutch, French, German, Chilean or Arabic viewer reads them (the words stay English).
2. **Set up once** (docs/HOW-TO.md, "Before you start"): Node 24 (`nvm use`), `npm ci`, then `claude` in this folder
   and `/mcp` to sign in to Figma. Nothing secret goes in the repo.
3. **Ask for a change.** Say what you want and point at Figma: *"Make Badge match this frame: <link>"*,
   *"I changed the primary colour in Figma, bring the tokens in"*, *"Add a story showing Select with an error"*. The
   agent lists what it reuses and what is new, waits for your go, and shows you the result. The five recipes, with
   what to ask and how to check: **docs/HOW-TO.md**.
4. **See it before it ships.** `npm run storybook` opens it at http://localhost:6006. The change goes live through a
   pull request whose checks pass (CONTRIBUTING.md).
5. **The Figma side.** The rename checklist that makes Figma's names match code: docs/NAMING.md, "Figma mirror". How
   tokens and components travel, and the Figma limits: docs/FIGMA.md. Your queue of open calls:
   docs/OPEN-DECISIONS.md.

### A developer

```sh
nvm use                 # Node 24 (.nvmrc); package.json engines: node >=24.14.0, npm >=11.11.0
npm ci
npm run storybook       # http://localhost:6006
npm run typecheck && npm test
npm run build           # dist/: Storybook, the back office, the landing page
npx playwright install chromium   # once
E2E_PORT=4173 npx playwright test # against dist/; pick a free port
```

- **Using it from another app** (the entry points, what the build needs, CSS scoping, providers, forms):
  **docs/CONSUMING.md**, also in Storybook under Overview › For developers.
- **Props and naming:** docs/API.md. **The component map:** docs/COMPONENTS.md (generated). **Why it is built this
  way:** docs/DESIGN.md. **Calls made where Figma and the prototype disagreed:** docs/DECISIONS.md.
- **Changing it:** CONTRIBUTING.md (branches, pull requests, the checks, how CI deploys).

### An agent

Read **AGENTS.md** first (`CLAUDE.md` imports it). It maps the tiers, the entry points, where to find a part, the
token set, the commands, the MCP servers in `.mcp.json` and the rules.

## What's in the repo

| Path | What |
|---|---|
| `src/index.ts`, `src/base.ts`, `src/tokens.css` | The three entry points: `govocal-ds`, `govocal-ds/base`, `govocal-ds/tokens.css` |
| `src/components/`, `src/patterns/` | The parts, each with its `.css` and `.stories.tsx` |
| `src/foundations/`, `src/illustrations/` | The Foundations pages and the illustration SVGs |
| `tokens/` | The token sources (from Figma, plus hand-written motion, size and semantic sets) |
| `backoffice/` | The demo back office (Vite + React Router), built only from the entry points |
| `tests/`, `e2e/` | Vitest guards; Playwright browser tests against `dist/` |
| `docs/` | The written rules, decisions and recipes |
| `.github/workflows/` | Checks on every pull request; build, test and deploy on `main` |

Not a published package yet, and not wired into the platform: docs/CONSUMING.md says what it is and isn't.
