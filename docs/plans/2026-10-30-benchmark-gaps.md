# Benchmark gaps: overnight plan (30 Oct 2026)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**The brief to hand an agent:** "Work in your own fresh clone of `andratwiro/govocal-ds`, from the latest `main`. Read
`docs/research/storybook-benchmark/report.md`, then this plan. Execute it overnight in the order under *If time runs
short*, following *Global constraints* in every subagent brief, and leave the morning report described at the end."

**Already in flight (the steward, 29 Oct 23:15).** Builders running tonight land these on `main` through the
steward; don't build them twice, build on them once merged:
- **Task 6, locale and strings:** branch `strings`. Every fixed word becomes a `labels` prop with English defaults (API
  rule 11, "Words"). Numbers and dates follow React Aria's locale, never `en-GB`. A guard test, and a locale toolbar
  in Storybook.
- **Task 5, Base:** branch `structure`.
  - Base gets an intro page ("primitives: prefer Components"), a line on every Base docs page, and sorts last.
  - The 17 dead starter parts are deleted.
  - Link, Radio group and Checkbox group are promoted.
  - Tables & lists and Text groups.
  - A guard against one stylesheet reaching into another's classes.
- **Tasks 4, 5 and 7 (part):** branch `docs-wave`.
  - `AGENTS.md`, `CLAUDE.md`, `.mcp.json`, `README.md` ("Start here" per audience), `CONTRIBUTING.md`, `llms.txt`.
  - A truthful manifest.
  - `docs/CONSUMING.md` plus an Overview "For developers" page: what it is and isn't, copy vs package, the CSS scoping
    caveat, providers, a react-hook-form recipe.
  - A form-validation recipe story.
  - The Storybook pages "Start here", "Questions for developers" and "AI assistance" are still to build, on top of
    these.
- **Landed since 8bd57e5:**
  - multilingual fields (`19582a8`);
  - Map view (`f699c3c`);
  - a virtualised Data table with load-more (`af60b0c`).
- **Building now, from the back office's deep dive of the live prototypes:**
  - AI assistant parts (chat thread, message, progress, prompt composer, suggestions, item chip, Assistant panel,
    Activity feed);
  - report parts (report type tokens, Page stage + Zoom bar, Block frame, inline rich text, StatTile plain, Figure,
    Quote, Sortable list);
  - next: project screens (one setup row, header, rail, workspace layout, phone preview) and a batch of small fixes,
    including doc comments for the 19 undocumented components.

**Goal:** by morning, close the gaps between this Storybook and the benchmark panel
([report](../research/storybook-benchmark/report.md)) that matter most to its two kinds of reader: the designers who run
it as the design bible, and the developers who import its components and compose screens. Only work the design
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
- [ ] Create `docs/plans/2026-10-30-benchmark-gaps-report.md`, the morning report, with the table. Fill it in as you go.

### Task 1: the component page (≈1 h)

Rubric D5, D2, D4 and D9. The benchmark pieces are in the report's section "A design bible the designers can run":
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
  - a field wired to a stand-in form library (ref and name reach the input);
  - strings from a stand-in translate function;
  - a table driven from loading to error to data.

**Accept:** the pages are linked from Start here (developer path); the seam stories pass.

### Task 5: orientation and language (≈1.5 h)

Rubric D5, D2 and D8.

- [ ] **Overview/Start here**, with two paths:
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
- [ ] Sidebar:
  - Explain Base where it sits: starter parts, used only when nothing in Components does the job, as `docs/API.md`
    says.
  - Keep test-only entries out of the public tree.
- [ ] A small copy check over docs pages: it flags Title Case headings and words from the word list's avoid column.

**Accept:** every page is linked from Welcome; every part carries a status tag in `index.json`; the copy check passes.

### Task 6: strings, locale and edge cases (≈1.5 h)

Rubric D2 and D4.

- [ ] **Locale:**
  - LegendRow, DashboardCard and Chart format numbers by the locale (React Aria's `useLocale` with `Intl`), never `en-GB`.
  - CommentThread's "Delete", and any other visible literal in a Component or Pattern, becomes a prop with a default.
  - A guard test finds visible string literals in the parts' JSX, with a short allow-list where one is justified.
- [ ] **Edge-case stories.** Benchmarks: Carbon's empty states, AgDS's data loading.
  - Data table: 0, 1 and 1,000 rows; loading; error; no permission (Empty state's four kinds).
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
- [ ] **Overview/AI assistance:**
  - How an agent should use the system: the entry points, `docs/COMPONENTS.md`, the manifest URL, never inventing props
    or tokens, reading a page's "When not to use".
  - Say plainly that the MCP server needs a running Storybook. A hosted endpoint is a later call.
- [ ] **Prop descriptions:** none left empty among the props the `govocal-ds` entry point declares itself. Props
  inherited from React Aria may link to its docs.

**Accept:** the break-it demo shows four reds, and `npm run check` passes.

## If time runs short

Order: the task numbers, 0 to 7, with Task 2 doing Data display, Forms and Overlays first.
- The component page comes first because it is both the designer's bible and what the agents' manifest reads.
- Composing a screen without CSS is the strongest proof for developers.
- The developers' page is the alignment.

Stop any task cleanly at a green commit rather than start the next half-done.

## Not tonight, and why

- **Visual regression baselines:** the tool is a hosting and cost call outside this plan: Chromatic, or Playwright
  screenshots in the repo. Rushed baselines are flaky across machines. Prepare only: list the stories that would become
  baselines.
- **The city theming boundary and a second-city swap test:** the front office needs them first, and the back office has
  one palette. Next, after a review of this plan's results.
- **Contrast pairs as token data, a hosted MCP endpoint, a published package, CI gates:** later calls. They appear as
  questions on Task 4's page.
- **Scoring the panel and this Storybook:** that's the re-audit after the review, not the builder's job.
- **Anything outside this repo.**

## Morning report

Put it in `docs/plans/2026-10-30-benchmark-gaps-report.md`, in this order:
1. The baseline table, with before and after numbers.
2. What landed: one line per group of commits, with Storybook links.
3. Decisions logged (links into `docs/DECISIONS.md`) and questions added to `docs/OPEN-DECISIONS.md`.
4. What was skipped or reverted, and why.
5. The three things a reviewer should look at first.
