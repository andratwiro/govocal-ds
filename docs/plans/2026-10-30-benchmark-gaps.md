# Benchmark gaps: overnight plan (30 Oct 2026)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**The brief to hand an agent:** "Work in your own fresh clone of `andratwiro/govocal-ds`, from the latest `main`. Read
`docs/research/storybook-benchmark/report.md`, then this plan. Execute it overnight in the order under *If time runs
short*, following *Global constraints* in every subagent brief, and leave the morning report described at the end."

**State at handover (the steward, 30 Oct ~00:30).** These landed on `main` tonight. Re-measure them in Task 0 and
build on them; don't build them twice.
- **Words and locales** (Task 6, most of it):
  - API rule 11, "Words": a part's own words are `labels` with English defaults (`XLabels` / `xLabels`). Numbers and
    dates follow React Aria's locale.
  - `tests/words.test.mjs` is the guard. Its `TO_CONVERT` list names the parts that landed later and still carry
    English: Map view, the multilingual fields, the long-list loading row.
- **Structure** (Task 5, Base):
  - Base is primitives: an intro page, one line on every Base docs page, last in the sidebar.
  - The 17 dead starter parts are deleted.
  - Link, Radio group and Checkbox group are Components.
  - New groups: Tables & lists, and Text.
  - Fixtures live in `src/stories/`.
  - `npm run css:scope`: Base CSS selects `gv-base-*` classes, never global `react-aria-*` ones.
  - `tests/own-block.test.mjs`: no stylesheet reaches into another part beyond a shrinking list.
- **Agent and developer docs** (parts of Tasks 4, 5 and 7):
  - `AGENTS.md`, `CLAUDE.md` and `.mcp.json`.
  - A truthful components manifest.
  - `README.md` (start here, per audience) and `CONTRIBUTING.md`.
  - `docs/CONSUMING.md`, plus Overview › For developers: what it is and isn't, copy or package, the CSS caveat,
    providers, a react-hook-form recipe.
  - `public/llms.txt`.
  - Patterns › Recipes › Form validation.
- **New parts:**
  - Multilingual text field, Multilingual rich text editor and Locale switcher, plus the Title field's language
    button.
  - Map view: the engine behind `MapEngine`, MapLibre by default, loaded on demand.
  - Data table `isVirtualized`, with `rowLines` and `onLoadMore`.
- **Started, not finished: two `wip/*` branches on origin.** They are unreviewed. Start from them or ignore them:
  - `wip/ai-parts`: ItemChip, ChatMessage, ChatProgress, a started PromptComposer.
  - `wip/report-parts`: one commit, the report type tokens.

The tasks below carry what is still open from tonight, each marked **(from the steward)**. Task 8 holds the parts the
live prototypes need (the back office's own deep dive). The back-office agent's notes, `notes/deep-dive/`, are its
spec.

**Goal:** by morning, close the gaps between this Storybook and the benchmark panel
([report](../research/storybook-benchmark/report.md)) that matter most to its two readers: the designer who will run
it as the design bible, and the developers who will import its components and compose screens. Only work the design
side owns.

**Where it stands (29 Oct evening, `main` at 8bd57e5).** Strong where the panel is often weak:
- Tokens: a DTCG source, plus guards for raw values, undefined tokens, token names and retired names.
- Arabic right-to-left on every story.
- A per-component accessibility report.
- API conventions (`docs/API.md`) and entry points.
- A served components manifest and generated `docs/COMPONENTS.md`.

Weak where the panel is strongest:
- Component pages carry no usage guidance (rubric D5).
- There is no copy guidance (D2).
- A screen can't be composed without custom CSS (D3).
- The proof isn't visible in the Storybook (D7).
- Nothing tells developers which calls are theirs (V1–V4).

## Baseline

Re-measure in Task 0; these are the 29 Oct numbers.

| Measure | 29 Oct | Morning target |
| --- | --- | --- |
| Component and Pattern pages with usage guidance (when to use, when not, do and don't) | 0 of 83 (57 + 26) | 83 |
| Copy pages (voice and tone, word list) | 0 | 2 |
| Layout parts in the system (Stack, Inline, Grid) | 0 | 3 |
| Back-office CSS | 388 lines, 457 `className=` in pages | measured after; zero paint properties |
| Hard-coded locale or English in parts | `en-GB` in LegendRow, DashboardCard, Chart; "Delete" in CommentThread | 0 |
| Parts with a lifecycle status | 0 | all |
| Props without a description (live manifest) | 309 of 922 (134 entries, 57 with no description, most of them Base) | 0 for props the `govocal-ds` entry point declares |
| Developer-facing pages (who owns what, questions for developers) | 0 | 2 |
| Visual regression baselines | 0 | not tonight (see *Not tonight*) |

## Global constraints

Put all of these in every subagent brief.

- **Stay in the lane.** Work in this repo only. Do nothing for other apps or tools that might use it, and nothing in
  the platform's own repo.
- **Design-owned work only.** Developer calls stay open:
  - no package publishing;
  - no sign-up to Chromatic or any other service;
  - no change to the CI workflow or the accessibility settings;
  - no decision about the base library.

  Where a task touches a developer call, write it as a question on the page Task 4 builds.
- **No names anywhere:** not in pages, docs, story data, code comments or commit messages. Use roles ("the designer",
  "developers", "the project lead") and "Not in Figma". `tests/no-names.test.mjs` stays green.
- **Be opinionated.** Where sources disagree or say nothing, pick: follow React Aria and platform conventions and stay
  consistent with `docs/API.md` and `docs/NAMING.md`. Build it, and add one line to `docs/DECISIONS.md`: what disagreed →
  what we built → why. Only what truly needs the designer goes to `docs/OPEN-DECISIONS.md`. Never stop to ask.
- **Accessibility is reported, never blocking.** Never change a colour, size or weight for contrast or target size.
  Keyboard and focus tests still assert.
- **Tokens win.** Paint only through `var(--gv-*)`. Snap any off-token value to the nearest token, and log the snaps
  people would see.
- **Never invent product facts.** Facts about Go Vocal come from the repo: docs, doc comments, story data, back-office
  pages, `DECISIONS.md`. Examples: what a phase is, who uses Insights. Design judgment, such as when to use one part
  over another, is yours to make and log.
- **Every commit green:**
  - `npm run typecheck`, `npm test`, and the e2e specs the change touches (`npx playwright test e2e/<spec>`).
  - Small commits, pushed to `main` as the repo does. A push deploys.
  - Rebase on `origin/main` before each push, because other work lands there too. Never force-push. Never work in a
    checkout another session is using.
  - If a task can't go green, revert it and say why in the morning report.
  - Commit messages follow the repo's style ("Area: what changed", then a body with the why), ending with the
    Co-Authored-By line.
- **Plain words.** Write every docs page so a designer can read it first; a developer should still find what they need.

## Tasks

### Task 0: baseline (≈15 min)

- [ ] Pull, run every check, and re-measure the baseline table.
- [ ] **(from the steward) Fix the e2e failures the handover merges left; main is red until these are done.**
  - `e2e/data-table-virtual.spec.ts:62` expects "5000 selected". The count is now locale-formatted, "5,000 selected",
    which is correct: update the test.
  - `e2e/form-validation.spec.ts:89` still says `test.fail(...)`, but the Text field bug it records was fixed in
    8bd57e5. Remove the `test.fail` line and its comment.
  - `e2e/motion.spec.ts:52`: the Modal's class is now `react-aria-Modal gv-base-modal` (`npm run css:scope`). Update
    the expected `part`, or match on the first class.
  - **A real break:** the story Tables & lists › Data table › "In a panel" crashes with "undefined is not a function".
    `MANAGE_IDEAS.filter(METRICS[m].test)` in `src/components/gv/DataTable.stories.tsx` (`total`) gets an undefined
    `test`. Check `METRICS` / `Metric` in `src/stories/data/ideas.tsx` after the strings and structure merges.
    `e2e/table.spec.ts:53` fails on it. The story smoke test should have caught it, so check why it didn't.
  - `e2e/project-overview.spec.ts:246` (the Option list's Esc) flaked once under load and passed on a rerun: Task 8b.
- [ ] Create `docs/plans/2026-10-30-benchmark-gaps-report.md`, the morning report, with the table. Fill it in as you go.

### Task 1: the component page (≈1 h)

Rubric D5, D2, D4 and D9. The benchmark pieces are in the report's section "A bible a designer with taste can run":
- Circuit: status, when to use, content guidelines.
- Grafana: do and don't, anatomy, placement.
- Vibe: use cases.
- Canvas Kit: accessibility requirements.
- Amsterdam: how to write, the part's own token table.
- GOV.UK: recent changes, help improve.

- [ ] Choose where the guidance lives: one source per part, next to it, feeding both the docs page and the components
  manifest. Avoid the trap in `notes/designer-owned-code-and-agents.md`. The manifest reads doc comments and props, not
  the Docs tab, so "use X instead" has to be in the doc comment, where agents see it. Log the choice.
- [ ] Build one page template, a docs page or a shared doc block, with these sections in this order:
  1. **Purpose:** the doc comment's first sentence, as today.
  2. **Status.**
  3. **When to use.**
  4. **When not to use:** each line names the part to use instead.
  5. **Anatomy:** the named parts.
  6. **Variants and states:** the existing stories.
  7. **Behaviour:** for interactive parts only. Link the WAI-ARIA APG pattern and give a keyboard table in plain
     words, without React Aria terms.
  8. **Content:** label rules, casing, length budget, exact strings for common cases.
  9. **Accessibility:** what the part gives, what the person composing a screen still owns, and a link to its row on
     Overview/Accessibility.
  10. **Tokens:** the part's own tokens, from the token usage file.
  11. **Related.**
  12. **Provenance:** see Task 7.
  13. **Changes.**
- [ ] Write three sample pages to settle the shape: Button, Data table, Side panel.
- [ ] Add the guard test: every Component and Pattern has every section, non-empty. Every "instead" names a part that
  exists. Every interactive part names an APG pattern and has a keyboard table.
  - So the suite stays green while pages are written, the guard reads a "not written yet" list.
  - Task 2 empties that list.
  - The guard fails on any part that is in neither the list nor complete.

**Accept:** the three sample pages render; the guard runs; the list holds the other 80 parts.

### Task 2: write every page (≈4 h, subagents in parallel by sidebar group)

- [ ] Write the groups in this order: Data display, Forms, Overlays (the back office's heaviest), then Actions,
  Navigation, Status & feedback, Layout & containers, Charts, then Patterns.
- [ ] Sources, all already in the repo:
  - doc comments and `DECISIONS.md`;
  - the back-office pages that use the part (real use is the best "when to use");
  - the prototype references;
  - Figma through its MCP server, when available.
- [ ] Keyboard tables: take them from what the e2e specs and play functions already prove. Where a behaviour isn't
  tested, add a play function that proves the table. Find elements by role and label, never by test ID.
- [ ] Remove each finished part from the "not written yet" list.
- [ ] Fresh-eyes check: a new subagent with no context reads 10 random pages as "a designer new to the system" and lists
  every confusion. Fix them.

**Accept:** the list is empty and the guard is green over all 83 parts; the fresh-eyes confusions are fixed.

### Task 3: compose without CSS (≈2 h)

Rubric D3; the strongest proof for developers.

- [ ] Add layout parts: Stack (vertical), Inline (horizontal, wrap, align) and Grid (columns, areas). Their `gap` and
  padding props take spacing token names only.
  - **(from the steward)** Tile grid (`minTileWidth`, `layout`, `density`) and Page header already exist under
    Layout & containers. Grid absorbs Tile grid or sits beside it with a clear line between them: decide and log it.
    Never two grids.
  - Add a typecheck-only file where `gap="13px"` and `gap={13}` fail to compile (`// @ts-expect-error`).
  - Each gets a page as in Task 1.
  - Benchmarks: Grafana's Stack, Amsterdam's Grid.
- [ ] Add a test over component CSS: no Component sets an outer margin.
- [ ] Move the back office onto Stack, Inline and Grid. Whatever stays in back-office CSS places things; it never paints.
  Measure CSS lines and `className=` uses before and after.
- [ ] Enforce `docs/API.md`'s rule "className and style place, never paint" on the consumer side.
  - Add a test over back-office CSS that fails on paint properties: color, background, border, font, box-shadow, fill
    and the like.
  - Write the allowed list into `docs/API.md`.
- [ ] Add a public API report, the practice behind React Spectrum's `api-diff.md`.
  - A generated file under `docs/` lists every exported name and its props, built from TypeScript or the manifest.
  - A test fails when it's out of date, so every API change shows up as a diff developers can review.

**Accept:** the type test is green; the back office has zero paint properties; before and after numbers are in the
report.

### Task 4: the developers' side (≈1 h)

Rubric V1–V4. These pages lay out the developers' calls; they make none of them.

**(from the steward)** `docs/CONSUMING.md` and Overview › For developers already exist. They cover what it is and
isn't, copy or package, the CSS scoping caveat, providers and a react-hook-form recipe. Build these pages on them:
link, don't repeat. The architecture review's open developer calls belong on Questions for developers:
- cascade layers (`@layer gv.tokens, gv.base, gv.components, gv.patterns`, with the host's reset in a lower layer);
- `theme.css`'s `:root` rules moved to an opt-in `global.css`;
- splitting tsconfig into lib, node and app;
- Prettier and ESLint (react-hooks only);
- branch protection and auto-merge (already in docs/OPEN-DECISIONS.md).

- [ ] **Overview/Who owns what:**
  - Design owns the tokens, the components and their API, the stories, the docs and the components' tests.
  - Developers own data, state, routing, translation plumbing, performance, their build and the adoption decision.
    They also review the API.
  - Follow the three-zone model in `notes/design-side-contract.md`.
- [ ] **Overview/Questions for developers**, in four sections:
  1. The base library.
  2. How the components reach their apps: package, versions, CSS layering, living beside styled-components.
  3. The integration seams: router links, form-library refs, translated strings, data-driven states.
  4. The terms of adoption: first screens, pace, gates.

  Each section gives what design has done, the options, and what design needs from the answer. Add facts where they're
  cheap to measure: size per part, how the CSS is layered, no runtime CSS-in-JS. Don't dress a recommendation up as a
  decision.
- [ ] **A React Aria table:** for each part, what comes from React Aria (behaviour wiring, props passed straight through,
  locale formatting) and what survives a swap (tokens, CSS, stories, docs, role-based tests). Each component page gets
  one line, "Behaviour from React Aria's …", as B.C. Gov does.
- [ ] **Seam stories**, each labelled "who wires what", each with a play function:
  - a router link (React Aria's `RouterProvider` with a stand-in navigate);
  - a field wired to a stand-in form library (ref and name reach the input). Patterns › Recipes › Form validation is
    the start;
  - strings from a stand-in translate function;
  - a table driven from loading to error to data.

**Accept:** the pages are linked from Start here (developer path); the seam stories pass.

### Task 5: orientation and language (≈1.5 h)

Rubric D5, D2 and D8.

- [ ] **Overview/Start here**, with two paths. `README.md` already has the per-audience start; the page mirrors it:
  - for designers: how to read a page, how to propose and land a change through an agent, where decisions live;
  - for developers: the entry points from `docs/API.md`, the className rule, how to rerun the checks, and what's theirs
    (Task 4).
- [ ] **Overview/Principles:** five to seven short principles drawn from `docs/DESIGN.md`'s rules: system first, tokens
  only, code wins, every state in both directions, accessibility shown.
- [ ] **Foundations/Voice and tone**, and **Foundations/Word list**. Benchmarks: Vibe's UX Writing Handbook, Grafana's
  Voice and Tone, GOV.UK's button labels.
  - Voice and tone covers sentence case, button verbs, and error, empty and confirmation copy. Numbers and dates
    follow the locale. Every visible string arrives as a prop and is never stitched together.
  - The word list takes the platform's terms as the back office uses them (project, phase, input, participant,
    proposal…), with the words to avoid.
- [ ] A "which token for which job" table on the Colour, Spacing and Typography pages. Use semantic tokens only, never
  primitives.
- [ ] **Overview/Lifecycle:** draft · candidate · stable, with what each promises (Circuit's model).
  - Start honest: nothing is stable until a developer has reviewed its API. A Not in Figma part can still be a
    candidate.
  - Tag every part `status:<stage>` and show the tag on its page and in the sidebar.
- [x] Sidebar: explain Base where it sits. Done on 30 Oct: the Base intro page, a line on every Base docs page, Base
  last.
- [ ] Sidebar: keep test-only entries out of the public tree.
- [ ] A small copy check over docs pages: it flags Title Case headings and words from the word list's avoid column.

**Accept:** every page is linked from Welcome; every part carries a status tag in `index.json`; the copy check passes.

### Task 6: strings, locale and edge cases (≈1.5 h)

Rubric D2 and D4.

- [x] **Locale** (landed 30 Oct; see API rule 11):
  - numbers and dates in the React Aria locale;
  - every part's words as `labels`;
  - `tests/words.test.mjs`.
- [ ] **(from the steward) Empty `TO_CONVERT` in `tests/words.test.mjs`.** The parts that landed after the words work
  still say English:
  - Map view: the zoom and legend names, the "can't be shown" line, the cluster's label.
  - Locale switcher and Multilingual text field: "Language", "of … languages filled". Locale switcher's
    `Intl.DisplayNames([inLocale])` is fine once the check reads it as handed in.
  - Data table: `loadingLabel`, which becomes a `labels` key.

  Remove each entry as it moves.
- [ ] **(from the steward) A Storybook Locale toolbar.** A `locale` global (en-GB, nl-BE, fr-BE, de-DE, es-CL,
  ar-SA) wraps every story in `I18nProvider`, so a Dutch or German viewer sees their numbers and dates.
  - Keep Direction's "Right to left" meaning Arabic, so old `globals=direction:rtl` links still work.
  - The words stay English: a story shows another language through `labels`.
  - An untested draft existed. Build it fresh in `.storybook/preview.tsx`.
- [ ] **Edge-case stories.** Benchmarks: Carbon's empty states, AgDS's data loading.
  - Data table: 0, 1 and 1,000 rows; loading; error; no permission (Empty state's four kinds). The virtualised 5,000
    rows and the load-more stories already exist.
  - Long translated labels (German) and Arabic on Text field, Select, Button, Tabs and Side panel.
  - First load against refresh, where they differ.

**Accept:** the guard is green; the new stories render in both directions (the smoke spec covers them).

### Task 7: proof anyone can rerun (≈1 h)

Rubric D7 and D9.

- [ ] Add `npm run check`: one command for typecheck, unit tests, e2e and build.
- [ ] **Overview/Checks:** every guard, what it proves, how to rerun it, and the counts from the last run.
- [ ] **A break-it demo**, `npm run break-it`:
  - It copies the repo to a temp folder and makes four faults: an undefined token, a raw hex, a renamed prop and a
    missing label.
  - It runs the checks and prints which one failed for each fault.
  - Its output goes on the Checks page.
- [ ] **Provenance** on every page: built by agents from Figma, from the prototype, or from neither; reviewed by a
  person (role and date) or "not yet"; known limits. Honest by default.
- [ ] **Overview/AI assistance**, built on `AGENTS.md`, `.mcp.json`, `public/llms.txt` and the manifest (all landed):
  - How an agent should use the system: the entry points, `docs/COMPONENTS.md`, the manifest URL, never inventing props
    or tokens, reading a page's "When not to use".
  - Say plainly that the MCP server needs a running Storybook. A hosted endpoint is a later call.
- [ ] **Prop descriptions:** none left empty among the props the `govocal-ds` entry point declares itself. Props
  inherited from React Aria may link to its docs.
  - **(from the steward and the deep dive §6)** 19 components have no doc comment, so their docs/COMPONENTS.md line is
    name-only; a test lists them.
  - Sharpen BarRow (ranking), SegmentedControl (view switch), CommentThread (replies) and Switch.
- [ ] **(from the steward) A cold-agent trial.** A fresh agent, given only `AGENTS.md`, builds one back-office screen.
  Fix the docs wherever it stumbles, and list the stumbles in the morning report.

**Accept:** the break-it demo shows four reds, and `npm run check` passes.

### Task 8: the parts the live prototypes need (from the steward and the back office's deep dive)

The back office's deep dive of the live prototypes (`notes/deep-dive/for-steward.md`, `project/REPORT.md`,
`report/REPORT.md`, `report-audit.md`) is the spec. The prototypes are public: `govocal.augur.page/ux-ui-audit/design/`
and `govocal.augur.page/future-analytics/prototypes/folder-report-revamp/`.

Every part follows the same contract:
- rule 11 `labels`, tokens only, the Task 1 page;
- stories for every state;
- an e2e by role with axe reported;
- the barrel and `npm run components:index`;
- one DECISIONS line per call.

- [ ] **8a. The project lead's asks, pages only (≈30 min each; working recipes exist):**
  - **The Users tab, virtualised.** The recipe is Tables & lists › Data table › "Virtualized".
    - Drop the paging. Select all means every row in view: `toKeySet(keys, rows.map(r => r.id))`.
    - The table needs a height from its container.
    - Rows need `dependencies` for any handler a cell reads.
    - Generate an invented tail of about 5,000 people after the twelve.
    - Rewrite the paging tests in `e2e/users.spec.ts`.
  - **The ideation Manage tab, List / Map.** The recipe is Data display › Map view › "In the Manage tab".
    - A List / Map segmented control.
    - The map beside a one-column list.
    - The map's `value` is the open idea, `hoveredKey` the hovered row. Rows need `onRowAction`, or their hover never
      fires.
    - Ideas gain an invented `place`. A chip counts the ideas without one.
  - **Multilingual fields at their call sites:**
    - the Settings platform name;
    - the phase title and description (the Title field with a `LocaleSwitcher kind="menu"`, then a Multilingual rich
      text editor);
    - project, event and phase titles;
    - the new project, the custom page title, the group name;
    - the report block heading (`showLocaleSwitcher={false}`, `locale` from the page's Select).
- [ ] **8b. Small fixes** (deep dive §5):
  - Tooltip never opens on the first, programmatic focus.
  - Side nav gets a hidden state that the header toggle opens.
  - Tree gets a flush look and a trailing page-number slot.
  - Choice card takes thumbnail-only media.
  - Panel gets a borderless look.
  - Option list's Esc flake.
  - Toast blocks clicks for about 200 ms after Undo.
  - Colour swatch is too big in a table cell.
  - File list's Delete is a Link.
  - Modal gets a description slot.
  - Project header gets an archived state.
  - Phase timeline passes `onDelete`.
  - Rich text editor passes through `lang`, `dir`, `isInvalid`, a description and `isDisabled`. Then the Multilingual
    rich text editor drops its CSS direction override and its own alert, and gains a disabled state.
- [ ] **8c. The AI assistant**, Components/AI (report §3; start from `wip/ai-parts` or ignore it):
  - ItemChip, ChatMessage, ChatProgress, PromptComposer, PromptSuggestions and ChatThread;
  - the Pattern AssistantPanel (on, off/upsell, empty report, generating, scoped to a block);
  - the Activity feed (version history; it shares ItemChip);
  - Side panel's head-less inline mode, head icon and 15px title.
- [ ] **8d. The report** (report §4; `wip/report-parts` holds the report type tokens):
  - a sheet surface token;
  - Page stage and Zoom bar;
  - Block frame (hover, selected, toolbar, pinned, AI-made, insert line);
  - Rich text toolbar's floating variant with the block-type segment, and Rich text editor's inline mode;
  - Stat tile's plain look;
  - Figure and Quote;
  - Sortable list (React Aria drag and drop with keyboard reordering: the critique's skipped hard screen).
- [ ] **8e. The project screens** (project §3):
  - **One setup row.** Card's row, Setup step and Action row become one part with optional status, pills, a trailing
    control and a body. Open: pills hidden and a square chevron. Reviewed: tinted pills. The title never truncates.
  - Badge `isSelected`.
  - Review status: Reviewed as a green check-circle.
  - Stat card: a flat sparkline that absorbs Stat tile's sparkline.
  - Project header: the project's status pill, a `tabs` prop, an unread dot per tab, Save → saving → Back to project.
  - Rail phase: an `event` kind, an Events section, and the panel toggle on every screen.
  - Workspace layout.
  - Phone preview: a logo header, a sticky countdown footer, a stage toolbar and a caption. Plus Phone phase card.
  - Access popover and Method card.

**Accept:** each part green with its page; the back office uses it where the deep dive found the gap.

## If time runs short

Order: the task numbers, 0 to 8, with Task 2 doing Data display, Forms and Overlays first. Task 8a is the project
lead's own asks with working recipes: fit it in early. 8b's fixes are cheap and can ride along with Task 2.
- The component page comes first because it is both the designer's bible and what the agents' manifest reads.
- Composing a screen without CSS is the strongest proof for developers.
- The developers' page is the alignment.

Stop any task cleanly at a green commit rather than start the next half-done.

## Not tonight, and why

- **Visual regression baselines:** the tool is a hosting and cost call for the project lead: Chromatic, or Playwright
  screenshots in the repo. Rushed baselines are flaky across machines. Prepare only: list the stories that would become
  baselines.
- **The city theming boundary and a second-city swap test:** the front office needs them first, and the back office has
  one palette. Next, after the project lead's review.
- **Contrast pairs as token data, a hosted MCP endpoint, a published package, CI gates:** later calls. They appear as
  questions on Task 4's page.
- **Scoring the panel and this Storybook:** that's the re-audit after the review, not the builder's job.
- **The folder renames** (`src/components/gv/` → `src/components/`, the starter → `src/base/`; the architecture
  review's move 3). One codemod in week 1, after a quiet day: about 1,000 import lines move. It is safe whenever nothing
  outside imports a path, and the entry points already guarantee that.
- **Anything outside this repo.**

## Morning report

Put it in `docs/plans/2026-10-30-benchmark-gaps-report.md`, in this order:
1. The baseline table, with before and after numbers.
2. What landed: one line per group of commits, with Storybook links.
3. Decisions logged (links into `docs/DECISIONS.md`) and questions added to `docs/OPEN-DECISIONS.md`.
4. What was skipped or reverted, and why.
5. The three things a reviewer should look at first.
6. **(from the steward)** The architecture review's grades, re-graded with evidence. The 29 Oct "before" grades:

   | Area | 29 Oct | Why then |
   |---|---|---|
   | Structure | C | the folders contradicted the tree, Base was 39 % dead, the list kit was split over four groups |
   | Tests | C+ | strong guards, but 69 % guarded the demo; no story smoke test; one failing test |
   | Build | D+ | push-to-main with no typecheck and no gate; a placeholder a11y step; a 35 % red rate; no Node pin |
   | Code | B− | 2,782 dead lines, three table systems, story code as large as component code, Vite-only code |
   | Types | B+ | strict, 2 `any`; one project for browser, Node and tests; configs unchecked |
   | CSS | C+ | no layers, global `.react-aria-*` selectors, 13 files reaching into others, `:root` side effects |
   | Docs | D | no README, CONTRIBUTING, consumption guide or AGENTS.md; some claims false |

   Since then, 29–30 Oct:
   - CI runs typecheck, tests, build, e2e and a sharded a11y scan before any deploy, plus a story smoke test over every
     story.
   - Base: 17 dead parts are gone; Base CSS is scoped; the reach-in guard is on.
   - Docs: README, CONTRIBUTING, CONSUMING, AGENTS and llms.txt.
   - API: one public entry and one prop convention; tokens: one name grammar.

