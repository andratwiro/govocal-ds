# How to

Six recipes for the designer, who works through an agent (Claude Code in this folder, with the Figma MCP). Each says
what to ask, what the agent will touch, and how to check. The rules behind them are in docs/DESIGN.md and
docs/NAMING.md; the Figma side is in docs/FIGMA.md.

## Before you start (once)

- **Node 24.** The repo says so in `.nvmrc`; with nvm, `nvm use` picks it.
- **`npm ci`** installs exactly what the repo lists.
- **The Figma MCP** in Claude Code, signed in with your Full seat (docs/FIGMA.md, "Components").
- **A Figma token of your own,** only if you'll pull tokens (docs/FIGMA.md, "Your own Figma token").
- **For the end-to-end tests:** `npx playwright install chromium`.

## 1. Change a token

Tokens are the named values everything is painted with: colours, spacing, radius, type, shadows, motion, sizes.

**Where they live:**
- `tokens/foundations.tokens.json`: the ones that come from Figma (colour, spacing, radius, type, shadows).
- `tokens/motion.tokens.json` and `tokens/size.tokens.json`: written by hand, Not in Figma.
- `src/tokens.css`: built from those files by `npm run tokens:build`. **Never edit it by hand**; `npm test` fails if it
  isn't exactly the build.

**A token Figma owns:**
1. Change the variable in Figma.
2. Ask: *"I changed <the variable> in Figma. Bring the tokens in, rebuild them, and show me what changed and which
   components use it."*
3. The agent runs `npm run tokens:pull` (one call to Figma with your token), then `npm run tokens:build`. Once the
   Variables export is set up, you export with the plugin and commit its file into `tokens/` first (docs/FIGMA.md).
4. It touches `tokens/foundations.tokens.json` (and `variable-ids.json`, `icons.json`) and `src/tokens.css`.

Today's pull reads the Foundations page's drawings. A new variable must also be drawn there (a swatch, a bar or a
shape named after it), or it won't reach code.

**A token Figma doesn't have** (motion, sizes): ask *"Make the medium duration 240ms"* or *"Add a 20px control
height"*. The agent edits the hand-written file and rebuilds.

**Check:**
- In Storybook, the Foundations page for that kind of token shows the new value and lists the components that use it.
  Open two or three of them.
- `npm test`.
- An end-to-end test may check the old value (`e2e/paint.spec.ts` checks the primary button's colour and corners).
  The agent updates that test to your new value. It must never undo your change to make a test pass.

## 2. Change a component's look

**Ask:** *"Make <component> match this frame: <Figma link>"* (in Figma, right-click → Copy link to selection), or
*"<component>: rounder corners"*. Say whether you mean this component only, or everything that shares the look.

**What the agent does:**
- Reads the frame through the Figma MCP, or `npm run figma:spec -- "<component>"` for a quick look at the cached file.
  A component changed in Figma doesn't travel with the token export: the agent reads the frame itself.
- Lists what it reuses and what is new, and waits for your go.
- Edits the component's stylesheet, `src/components/gv/<Name>.css` (a pattern's: `src/patterns/<Name>.css`), and its
  `.tsx` only if the structure changes. Then the stories, so they show the new look.
- Paints only with tokens. A value with no token snaps to the nearest one (`tests/tokens-only.test.mjs`).
- Tells you when the change is really a token. There's no "button corners" token today: buttons share their radius
  step with cards, fields and menus, so changing the step changes them all. The agent asks which you mean.
- Checks docs/DECISIONS.md. If a line there says otherwise ("every icon-only button is square, radius 8"), it tells
  you and updates that line, so the system doesn't split. Where Figma and the prototype disagree, it picks, builds and
  logs one line there.

**Check:**
- The component's All variants story, then the toolbar's Direction button for right to left, and its Locale menu
  (German, say) for numbers and dates. The words stay English there: a story shows another language through `labels`.
- The Accessibility panel under the story. Findings are reported, never blocking (docs/DESIGN.md).
- The back-office pages that use it. docs/COMPONENTS.md lists every entry; ask the agent where one is used.
- `npm test`, then the end-to-end tests (recipe 5).

## 3. Add a story

A story is one state or configuration of a component, worth showing. A configuration is a story, not a new component
("Select · with search"; docs/NAMING.md, "What becomes a component").

**Ask:** *"Add a story to <component> showing <the state>."*

**What the agent does:**
- Adds it to `src/components/gv/<Name>.stories.tsx` (a pattern's: `src/patterns/<Name>.stories.tsx`).
- Names it the docs/NAMING.md way:
  - All variants first;
  - Figma's variant values word for word, joined by ` · ` ("Phase · Draft");
  - states in React Aria's words (Hovered, Pressed, Focused, Selected, Disabled, Invalid, Pending, Empty);
  - sentence case.
- Renames a story with `name:`, never its export: the export is part of the story's address, and links use it.
- Tags the file `not-in-figma` if Figma doesn't draw the component.
- Runs `npm run components:index`, which refreshes docs/COMPONENTS.md. `npm test` fails if that file is stale.

**A new component** follows the same road, plus the rule in docs/NAMING.md: generic and used on two screens, or drawn
as a component in Figma. Its file, its export and the last part of its Storybook title share one name
(`Components/Data display/Stat tile` = `StatTile` = `src/components/gv/StatTile.tsx`).

**Check:** the story in Storybook, left to right and right to left; `npm test`.

## 4. Add an illustration

**Ask:** *"Convert the prototype's <scene> into an illustration, following docs/ILLUSTRATIONS.md."*

**What the agent does:** writes `src/illustrations/<name>.svg`, adds the name to `src/illustrations/names.ts`, and
raises the tile counts in `e2e/illustrations.spec.ts`. The format, the rules and the scenes still to convert are in
docs/ILLUSTRATIONS.md.

**Check:**
- Foundations/Illustrations: the new tile plays, and its Still switch stops it.
- With your computer's reduced-motion setting on, it shows its still.
- `npm test` (`tests/illustrations.test.mjs` checks the file).

## 5. Check a change

| What | Command | What it tells you |
|---|---|---|
| Look at it | `npm run storybook` | Storybook at http://localhost:6006, reloading as files change. While it runs, the agent can read the stories through the Storybook MCP (`http://localhost:6006/mcp`). |
| The guards | `npm test` | About a second. Tokens only, paint only through tokens, no names, the illustration format, docs/COMPONENTS.md up to date, `src/tokens.css` equal to the build. |
| The types | `npm run typecheck` | A few seconds. The code still fits together. |
| Everything, end to end | `npm run build`, then `npm run test:e2e` | A few minutes. Builds Storybook, the back office and the landing page into `dist/`, then about 330 browser tests run against it. |

**What the end-to-end tests need:**
- Chromium, installed once: `npx playwright install chromium`.
- A fresh `npm run build` first: they test `dist/`, not your open Storybook.
- A free port. They serve `dist/` on port 4173, and **reuse whatever already answers there**. If another copy of the
  repo might be serving, pick another port: `E2E_PORT=4405 npm run test:e2e`. Run one suite at a time.
- When a test fails after a change you meant, the test changes, not your design.

**To see the back office yourself:** `npm run build`, then `node scripts/lib/serve.mjs dist 4173`, and open
http://127.0.0.1:4173/backoffice/ (Storybook is at `/storybook/`).

**After a push to `main`:** GitHub runs the typecheck, `npm test`, the build, the accessibility scan and the
end-to-end tests (a failing one is retried twice). Green puts the live site up. Red deploys nothing, and the last good
version stays live (docs/DESIGN.md, "Live, and when it breaks").

## 6. Write a component page

Every Components and Patterns entry's docs page is the component page: thirteen sections in one order, the same on
every part. The page makes four of them from the code; you write the rest in one Markdown file beside the part.
Button, Data table and Side panel are the finished examples: copy their shape.

**Ask:** *"Write the component page for <part>."* (or a whole sidebar group).

**The file:** `<Name>.guide.md`, in the same folder and with the same name as the part's stories file:
`src/components/gv/StatTile.stories.tsx` → `src/components/gv/StatTile.guide.md`;
`src/patterns/RailPhase.stories.tsx` → `src/patterns/RailPhase.guide.md`. One file per part, so writers working on
different parts never touch the same file.

**What the page makes itself (never write these):**
1. **Purpose**: the first sentence of the doc comment above the part's export. If the page says "No doc comment yet",
   write one that says what someone would ask for, run `npm run components:index`, and take the part off `NOT_YET` in
   `tests/components-described.test.mjs`.
2. **Status**: the part's `status:<stage>` tag in its stories (draft · candidate · stable); no tag reads "Draft".
3. **Variants and states**: the part's stories.
4. **Tokens**: the tokens its stylesheet (`<Name>.css`) uses, from `npm run tokens:usage`.

**What you write**, as `## ` headings, exactly these, in this order (a `# <Name>` line on top is fine):

| Section | What goes in it |
|---|---|
| `## When to use` | Bullets: the jobs it does, with real examples from the back office ("an idea in the Manage tab"). |
| `## When not to use` | Bullets. **Every bullet names the part to use instead, in bold, by its sidebar name**: `use **Link**`. The guard fails on a bullet with no bold name, or a bold name that isn't a Components or Patterns entry. |
| `## Anatomy` | A numbered list of its named parts (Head, Label, Leading icon…), and its sizes in a line. |
| `## Behaviour` | Interactive parts: one sentence linking the WAI-ARIA APG pattern (`https://www.w3.org/WAI/ARIA/apg/patterns/<name>/`; a plain text input has none: start "No WAI-ARIA APG pattern covers…"), then a keyboard table, `\| Key \| What it does \| Tested by \|`, in plain words (no React Aria terms, and no "Behaviour from React Aria's …" line: docs/REACT-ARIA.md lists those). Each row's "Tested by" names what proves it: `` `e2e/<spec>.spec.ts` `` or `` `play: <StoryExport>` ``. A part that takes no focus or keys: one line starting "Not interactive" ("Not interactive: you can't reach it with Tab or press it"). |
| `## Content` | Label rules, sentence case, how long, the exact words for common cases, which words come in through `labels`. |
| `## Accessibility` | "The part gives you:" and "You still own:" (the page adds its axe results and the link to Overview › Accessibility). |
| `## Related` | Bullets, each with a bold part name and why you'd look at it. |
| `## Changes` | Dated bullets, newest first, from `docs/DECISIONS.md` and the git log; the first is the day you wrote the page. |

**Write for a designer new to the system** (the fresh-eyes check of 30 Oct 2026 found the same confusions on most
pages):
- Say a setting in words first, its prop name after, if at all: "the Clear button (`showClear`, on by default)", not
  "Clear (optional, `showClear`)". `aria-label` is "a name screen readers hear, not shown on screen".
- Sizes in pixels with the unit: "32px tall", "a 16px icon". Type as its role and size: "Small (12px)".
- Every product word once explained where it first appears: "the Manage tab (a phase's list of inputs)".
- A story described in Content or When to use must show it: a story named "Filled" is filled, "Empty" is empty, and a
  layout the page promises (wrapping, a short last row, right to left) is visible in the story.
- "When not to use" gives the test, not just the name: "Pick **Badge** when the word names a kind, not a stage".
- "You still own" lists what the screen's designer or developer must decide; say which when it is only one of them.
- Changes and Provenance cite `docs/DECISIONS.md` with the decision in a few words; the page links the file.
- The page explains its own words (part, story, `labels`, Not in Figma, Tested by…) in "Words on this page" at the
  top (`WORDS` in `src/overview/ComponentPage.tsx`); add one there rather than explaining it on every page.

Leave out `## Provenance`: the page says "Not yet recorded" until it is filled in (who built it, from what, who
reviewed it). If you add it, it goes between Related and Changes.

**Keyboard tables say only what a test proves.** Look in `e2e/` for the part's spec (`grep -l "<Part name>" e2e/`)
and use what it presses. For a key nothing tests, add a `Keyboard` story with a play function to the part's stories
file: find elements by role and name (`within(canvasElement).getByRole('button', {name: 'Save'})`), never by test id
or class; `import {expect, userEvent, waitFor, within} from 'storybook/test'`. Button, Data table and Side panel have
one each. `e2e/play.spec.ts` runs every play function. If you can't prove a key, leave its row out.

**Sources** (never invent a product fact):
- The part's doc comment and props (its `.tsx`) and its stories.
- `docs/DECISIONS.md`: search for the part's name; most "When not to use" and "Changes" lines come from here.
- The back-office pages that use it: `grep -rn "<PartExport" backoffice/src`. Real use is the best "When to use".
- Its e2e spec, for the keyboard.
- Figma through its MCP, when it's connected (docs/FIGMA.md).

**The "not written yet" list is the parts with no guide.** There is nothing to edit: creating the file takes the part
off. `WRITTEN_LATER` in `tests/component-pages.test.mjs` only lists who could still be missing on 30 Oct 2026, so a
part added later must arrive with its page; never add to it, and delete it once every guide is written. A guide that
exists must be complete, or `npm test` fails.

**Where it goes besides the page:** `npm run components:index` adds a "Not for" line from your "When not to use" under
the part in docs/COMPONENTS.md, and the Storybook build puts the whole guide into the components manifest the MCP serves
agents (`.storybook/main.ts`, `withGuides`). So "use X instead" reaches agents from the same file.

**Check:**
- `npm test`: `tests/component-pages.test.mjs` names every gap ("When not to use names "Linky", which is not a part").
- `npm run components:index`, then `npm run typecheck`.
- The page itself: `npm run storybook`, open the part's Docs.
- If you added a play function: `npm run build`, then `npx playwright test e2e/play.spec.ts e2e/stories.spec.ts`.
- Writing a group in parallel with others: commit only your group's guides, stories and doc comments; after a rebase,
  re-run `npm run components:index` rather than merging docs/COMPONENTS.md by hand.
