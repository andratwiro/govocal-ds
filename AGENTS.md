# govocal-ds: the agent's map

Go Vocal's design system: React Aria Components 1.22 painted with `--gv-*` tokens (DTCG, from Figma), shown in
Storybook 10.6, plus a demo back office (`backoffice/`) built only from the system. The designer owns it from
2 Nov 2026; the front-end team judges it as code. Live: https://andratwiro.github.io/govocal-ds/ (Storybook at
`/storybook/`, the back office at `/backoffice/`).

Read this file first; it points to the detail. Every claim names the file or command that proves it.

| For | Read |
|---|---|
| Find a part | `docs/COMPONENTS.md` (generated: one line per Storybook entry) |
| Props, imports, the naming convention | `docs/API.md` |
| The designer's recipes (change a token, a look, add a story) | `docs/HOW-TO.md` |
| Names, the tree, tags, what becomes a component | `docs/NAMING.md` |
| Why it is built this way | `docs/DESIGN.md` |
| Using it from another app | `docs/CONSUMING.md` |
| Calls already made / still open | `docs/DECISIONS.md` / `docs/OPEN-DECISIONS.md` |
| Figma: tokens, the MCP, the REST limit | `docs/FIGMA.md` |
| Branches, PRs, CI | `CONTRIBUTING.md` |

## The tiers

| Tier | What it is | Use it? |
|---|---|---|
| **Components** | Generic parts any admin could ship (Button, Select, Data table, Modal…). Storybook `Components/<Group>/<Name>`. | **Yes, first.** |
| **Patterns** | Go Vocal assemblies, grouped by the screen they belong to (Project rail, Build tab, Manage tab…). Their props speak phases, methods, projects. | When your screen is that place. |
| **Base** | React Aria's starter parts painted with the tokens (Calendar, ComboBox, Tree, Popover…). | Only when no Component does the job. Never in place of one. |

Component groups: Actions · AI · Charts · Data display · Forms · Layout & containers · Navigation · Overlays · Status &
feedback · Tables & lists · Text. Link, Radio group and Checkbox group are Components (Navigation, Forms).

Each layer builds only on the ones above it. A part used once stays in its page; it is promoted on its second use
(`docs/NAMING.md`, "What becomes a component").

## Import only from the entry points

```tsx
import 'govocal-ds/tokens.css';                       // once, at the app's root
import {AppProvider, Button, DataTable, type Key} from 'govocal-ds';  // Components, Patterns, React Aria value types
import {ComboBox, ComboBoxItem} from 'govocal-ds/base';  // a Base part, only when govocal-ds has nothing
```

- The three entries are `package.json` `exports`; `tsconfig.json` `paths`, `backoffice/vite.config.ts` and
  `.storybook/main.ts` resolve them. Never import a file path (`../../src/components/gv/Panel`):
  `tests/system-first.test.mjs` fails the back office on it. `npm run api:imports` rewrites deep imports.
- Wrap the app once in `AppProvider` (locale, router, the one toast region, the 1.75 icon stroke); call `toast()`.
- A new export goes in `src/index.ts` (or `src/base.ts`) beside its Storybook group; the same test fails until it is.

## Find a part

1. Search `docs/COMPONENTS.md` for what you need ("status", "filter", "confirm"). Each line: the Storybook name, the
   export, what it is for, its stories.
2. Open its stories file: the entry's name in PascalCase, `Stat tile` → `StatTile.stories.tsx`
   (`git ls-files '*StatTile.stories.tsx'`). Each story is a configuration to copy.
3. Props: the JSDoc above the export, `docs/API.md` for the convention, or the Storybook MCP (below).
4. Nothing fits? Build the page from smaller Components. A missing part in the back office is a `<Gap name="…">`
   (`backoffice/src/Gap.tsx`); the system adds it on its second use.

## Add a back-office screen

1. **Route:** one line in `backoffice/src/routes.tsx`, at the real admin's path (`projects/:projectId/events`).
2. **Page:** `backoffice/src/pages/<Name>.tsx`, wrapped in `Page` (`./Page`: title, line, actions, the trail of a
   sub-page). Demo data goes in `backoffice/src/data-<area>.ts`, invented, with no real tenant. Reach the screen from
   where the real admin does (the side nav's `nav.ts`, a link on its parent page).
3. **Parts:** pick each from `docs/COMPONENTS.md` and read its "Not for" before using it. The usual admin list is a
   `Panel` holding a `TableToolbar` and a `DataTable`, a row's actions in `DataTableOptions`, a create form in a
   `Modal`, a delete in an `AlertDialog`, nothing yet in an `EmptyState`. Words residents read (an event's title, a
   description) take every platform language: `MultilingualTextField`, as the rest of the back office.
4. **Words and dates** are the page's own English; numbers and dates go through `useNumberFormatter` and
   `useDateFormatter` from `govocal-ds` (`docs/API.md`, rule 11), never a fixed locale.
5. **No new CSS** if you can help it: Stack, Inline and Grid place; what is left may only place (`docs/API.md`, "Page
   CSS places").
6. **A browser test** `e2e/<name>.spec.ts`: find by role and label, report axe with `a11yReport(await
   axeViolations(page, 'main'))`. Give it a line in `src/overview/guards.json` (`tests/checks-page.test.mjs` fails
   until it has one). Run it after the full `npm run build` (the server's root is the landing page, so
   `build:backoffice` alone times out).

Older pages break a few of these rules (`selectedKey` on a Select, hard-coded `'en-GB'` dates): the rules win, never
copy the old page.

## Tokens: a closed set

- Every `--gv-*` token is in `public/tokens.json` (DTCG, with each token's purpose; published as
  https://andratwiro.github.io/govocal-ds/tokens.json) and `src/tokens.css`. Pick from them. **Never guess a name:**
  `tests/tokens-defined.test.mjs` fails on a token that doesn't exist.
- `src/tokens.css` is generated (`npm run tokens:build` from `tokens/`). Never edit it: `npm test` fails if it isn't
  the build.
- Paint with semantic tokens (`--gv-surface-*`, `--gv-text-*`, `--gv-icon-*`, `--gv-border-*`), never with
  `--gv-color-*` primitives (`tests/paint.test.mjs`). The grammar: `docs/NAMING.md`, "Token names".
- No value without a token: spacing, radius, type and shadow come from tokens (`tests/tokens-only.test.mjs`). A value
  with no token snaps to the nearest one; a real gap goes to the designer (`docs/OPEN-DECISIONS.md`).
- After a merge, `npm run tokens:rename` moves every file onto today's token names (re-runnable; `-- --check`).

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Once per checkout (each worktree installs its own `node_modules`). |
| `npm run storybook` | Storybook at http://localhost:6006, reloading on save; its MCP server at `/mcp`. |
| `npm run typecheck` | `tsc --noEmit` over `src`, `backoffice/src`, `.storybook`, `e2e`. |
| `npm test` | Vitest guards in `tests/` (about a second): tokens, names, the public API, the docs index. |
| `npm run build` | Storybook, the back office and the landing page into `dist/`. |
| `E2E_PORT=<port> npx playwright test` | Browser tests against `dist/` (the full `npm run build` first). Pick a free port; one run at a time. |
| `E2E_PORT=<port> npm run check` | Everything in order: typecheck, unit guards, build, e2e. Stops at the first red step; its counts feed Overview › Checks. |
| `npm run break-it` | Makes four faults on a copy of the repo and prints the check that catches each (about a minute; no build). |
| `npm run components:index` | Regenerates `docs/COMPONENTS.md` and `public/llms.txt` from the stories, and `docs/REACT-ARIA.md` (what each part takes from React Aria) from the code. Run after any story or doc-comment change: `npm test` fails if stale. |
| `npm run api:report` | Regenerates `docs/API-REPORT.md` (every export and its props, from TypeScript). Run after any API change: `npm test` fails if stale. |
| `npm run api:imports` | Moves the back office's deep imports onto the entry points (`--check` to test). |
| `npm run tokens:rename` | Moves every file onto today's token names. |
| `npm run tokens:build` | `tokens/*.tokens.json` → `src/tokens.css` + `public/tokens.json`. |
| `npm run figma:spec -- "<Name>"` | A Figma component's sizes and tokens, from the local cache. No network call. |

## MCP servers (`.mcp.json`)

- **storybook** (`http://localhost:6006/mcp`): works only while `npm run storybook` runs. `docs-list` lists every
  entry, `docs-show <id>` gives its props (its own and the React Aria ones a page sets: `isDisabled`, `onPress`,
  `isInvalid`, `selectedKeys`…) and every story's code; `stories-preview` returns links to look at. Start Storybook
  first; if it is down, use `docs/COMPONENTS.md` and the stories files. The same manifest is built to
  `dist/storybook/manifests/components.json` (`features.componentsManifest` and the docgen in `.storybook/main.ts`).
- **figma** (`https://mcp.figma.com/mcp`, Figma's remote server): works once you sign in to Figma through `/mcp` in
  Claude Code, with a Full or Dev seat (about 200 calls a day). Nothing secret is in the file. Figma's desktop server
  (`http://127.0.0.1:3845/mcp`) works only while the Figma desktop app runs with its MCP server on; add it yourself if
  you prefer it (`docs/FIGMA.md`, "Components").
- **react-aria** (`@react-aria/mcp@1.2.1`, Adobe's server for React Aria's docs, run with `npx`): always, with
  network. For how a React Aria prop the system passes through behaves (`validationBehavior`, `selectionMode`).

## Hard rules

1. **Never call the Figma REST API** and never print a Figma token. `figma:spec` reads `.cache/`; `--fresh` and
   `tokens:pull` cost calls on a rate-limited token (`docs/FIGMA.md`, "The REST API").
2. **Never `git stash`**: the stash is shared by every worktree.
3. **Accessibility is reported, never blocking.** Never change a colour, size or weight for contrast; e2e reports axe
   findings with `a11yReport(await axeViolations(page, sel))` (`e2e/axe.ts`). Keyboard and focus tests still assert.
4. **Tokens win.** Paint only through `var(--gv-*)`. No raw colours, no CSS-in-JS for paint, no Tailwind.
5. **`className` and `style` place a part; they never paint it** (grid area, width, margin). Never target
   `.react-aria-*` or `.gv-*` from page CSS (`docs/API.md`, "className and style place").
6. **Code wins over Figma**; calls go in `docs/DECISIONS.md` (what disagreed → what we built → why).
7. **No new npm dependencies** without the front-end team's say. Never edit `.github/workflows/` or the a11y settings.
8. **Public repo:** no real tenant names or data, no font files, no secrets.

## Contracts the types don't show

- `TabPanel` lives inside `TabPanels` (a development warning says so).
- Both Alert dialog buttons close it; `onCancel` also runs on Esc and a click outside.
- A floating Side panel is closed unless `isOpen` / `defaultOpen`.
- Data table: a press opens the row (`onRowAction`), the checkbox ticks; `toKeySet(selection, allKeys)` turns
  React Aria's `'all'` into keys.
- Select takes `value` / `onChange`, never the deprecated `selectedKey`.
- Words a part says come in as props with English defaults; numbers and dates follow `AppProvider`'s `locale`.

## Add or change a component

Follow `docs/HOW-TO.md` §2–3 and `docs/API.md`, "Adding a part". In short:

1. Check it should exist: `docs/NAMING.md`, "What becomes a component".
2. Stories first, named the NAMING way; tag the file `not-in-figma` if Figma doesn't draw it.
3. Build on a React Aria part; props by the ten rules in `docs/API.md`; CSS on tokens only, logical properties (RTL).
4. Export it and its props type from `src/index.ts`.
5. Write its page: `<Name>.guide.md` beside the stories (`docs/HOW-TO.md` §6); `npm test` fails on a new part without one.
6. `npm run components:index`, `npm run typecheck`, `npm test`, then build and e2e.
7. A branch and a pull request to `main`, never a push to it (`CONTRIBUTING.md`).
