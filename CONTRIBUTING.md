# Contributing

Two people change this repo, each through a loop of their own:

- **The designer**, through Claude Code in this folder (docs/HOW-TO.md has the recipes).
- **A front-end developer**, by hand or with an agent.

Both follow the same road: a branch, a pull request, green checks, then `main`. Agents read AGENTS.md first.

## The change flow

1. **A branch** from an up-to-date `main`: `git switch -c <area>-<what>` (`badge-hover`, `tokens-oct-export`).
2. **The change**, with its stories, tests and docs in the same branch. Before you push:
   ```sh
   npm run components:index   # if a story or a doc comment changed
   npm run typecheck && npm test
   npm run build && E2E_PORT=<port> npx playwright test
   ```
3. **A pull request to `main`.** An agent opens it and asks for auto-merge in one go:
   ```sh
   git push -u origin HEAD
   gh pr create --base main --fill
   gh pr merge --auto --squash
   ```
4. **The Checks workflow** (`.github/workflows/checks.yml`, job `checks`) runs on the pull request: `npm ci`,
   `npm run typecheck`, `npm test`, `npm run build`, then the Playwright suite (retried twice on CI; a failure uploads
   `playwright-report/` as the run's artifact). Green merges it (squashed); red stops it at the pull request, and
   production never sees it. A newer push to the same pull request replaces the running check.
5. **Merged to `main`**, the Deploy workflow puts it live (below).

`main` is not protected yet (30 Oct): a push to `main` runs deploy.yml, which publishes nothing unless typecheck, unit
tests, build and e2e are green. Branch protection with the `checks` job required, and auto-merge, are the project
lead's call (docs/OPEN-DECISIONS.md); once on, the flow below is the only way in.

**Stuck?** After three tries at a red check, the agent stops and opens an issue labelled `stuck`: what it tried, the
error's last lines, one question.

## Commits

- One coherent change per commit, the subject `<Area>: <what changed>`: `Badge: a hover state`, `Tokens: the
  October export`, `Docs: …`, `e2e: …`. The area is the part's name or the kind of change. Say what changed, in a
  sentence a designer can read.
- An agent's commit ends with its `Co-Authored-By:` line.
- `npm run typecheck && npm test` is green after every commit, not just the last.
- No person's name in a commit, a file or a story (`tests/no-names.test.mjs`): "the designer", "the project lead",
  "the front-end team", "the back-office agent".
- Never `git stash` (the stash is shared by every worktree), never rewrite `main`'s history.

## Tests, locally

| What | Command | Notes |
|---|---|---|
| The guards | `npm test` | About a second. Tokens only, no names, the public API, the docs index, `src/tokens.css` = its build. |
| The types | `npm run typecheck` | `tsc --noEmit`. CI runs it; Vite and Storybook don't check types. |
| The browser | `npm run build`, then `E2E_PORT=<port> npx playwright test` | Two projects: `system` (stories and site) and `backoffice` (`--project system` for one). |

- e2e serves `dist/` on `E2E_PORT` (default 4173) and **reuses whatever already answers on that port**. With several
  worktrees or checkouts, give each its own port.
- One browser suite at a time on a shared machine. `--workers 2` is enough.
- `e2e/stories.spec.ts` renders every story in the build: a story that breaks says so by its id.
- **Accessibility is reported, never blocking.** e2e passes axe findings to `a11yReport(await axeViolations(page,
  sel))` (`e2e/axe.ts`): an annotation and a log line, never a failure. Never change a colour, size or weight to
  satisfy it. Keyboard and focus tests do assert.
- A test that fails after a change the designer meant changes the test, never the design back.

## What agents never do

- Edit `.github/workflows/`, `.storybook/preview.tsx`'s accessibility settings, or `scripts/a11y-scan.mjs`. Those are
  the front-end team's (docs/DESIGN.md, "Live, and when it breaks").
- Call the Figma REST API outside `npm run tokens:pull` or `figma:spec -- --fresh`, or print a Figma token
  (docs/FIGMA.md).
- Add an npm dependency the task didn't ask for.
- Paint off the tokens. A value with no token snaps to the nearest one, and the gap goes to docs/OPEN-DECISIONS.md.
- Treat the prototype's tooling as the platform's: the prototype (govocal.augur.page) is a source of looks and
  behaviours, not of code.

## Adding, promoting or retiring a part

- **Add:** docs/HOW-TO.md §3 (the road), docs/API.md "Adding a part" (props, `className`, the export),
  docs/NAMING.md "What becomes a component" (whether it should exist) and "Story names inside an entry".
- **Promote** a Pattern or a page's one-off to Components on its second use, minus its Go Vocal words; a Base part
  the same way (title, JSDoc, export from `govocal-ds`). The old Storybook link redirects through
  `.storybook/manager-head.html`.
- **Retire:** tag the stories file `deprecated` and the export `@deprecated` (docs/NAMING.md, "Status marks"); both
  leave together, with every call site, in one pull request. Never keep a part or a prop under two names
  (docs/API.md, rule 9).

## Upgrading Storybook

`.storybook/manager-head.html` restyles Storybook's own sidebar (`#storybook-explorer-tree .sidebar-item …`) and holds
the redirect for renamed entries; `.storybook/theme.ts` draws the brand. Those selectors are Storybook's internals,
so a minor version can break them silently. After any `storybook` / `@storybook/*` bump:

1. `npm run storybook`: the brand ("Design system" beside the mark), section labels in sentence case, the selected row
   in the system's selected look, the story icons in the strong icon grey.
2. An old link still lands on its new entry: `?path=/docs/components-pill--docs` opens Badge.
3. The manifest still serves props: `npm run build:storybook`, then `dist/storybook/manifests/components.json`
   has props for `components-actions-button` (the docgen settings in `.storybook/main.ts`).
4. Keep every `storybook` / `@storybook/*` package on the same version.

## How CI deploys

`.github/workflows/deploy.yml`, on every push to `main` (and by hand):

1. **build:** `npm ci` → `npm run typecheck` → `npm test` → `npm run build`; `dist/` is kept as an artifact.
2. **e2e** and **a11y**, side by side on that `dist/`: the Playwright suite, and the accessibility scan in three
   shards (`A11Y_SHARD=1/3`…). A dead scan shard costs the Accessibility page its stories, never the deploy.
3. **publish:** folds the scan's shards into the site (`npm run a11y:scan -- --merge`), uploads `dist/` to Pages.
4. **deploy:** GitHub Pages, https://andratwiro.github.io/govocal-ds/.

A red typecheck, unit test, build or e2e deploys nothing, and the last good version stays live. A newer push waits
for the running deploy instead of cancelling it. Node comes from `.nvmrc` in both workflows.
