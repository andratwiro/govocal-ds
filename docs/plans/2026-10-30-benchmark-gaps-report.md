# Benchmark gaps: morning report (30 Oct 2026)

The overnight run of [the plan](2026-10-30-benchmark-gaps.md), from `main` at 826fac8 to 56d1463: 162 commits, each
green before it was pushed. Built by AI agents, one builder per task in its own checkout; no person has reviewed it
yet. Storybook: https://andratwiro.github.io/govocal-ds/storybook/ · back office:
https://andratwiro.github.io/govocal-ds/backoffice/

## 1. Baseline, before and after

| Measure | 29 Oct (plan) | Start of run | Morning |
| --- | --- | --- | --- |
| Component and Pattern pages with usage guidance | 0 of 83 | 0 of 101 | 121 of 121 (new parts arrived tonight; a guard makes every new part ship with its page) |
| Copy pages (voice and tone, word list) | 0 | 0 | 2 |
| Layout parts (Stack, Inline, Grid) | 0 | 0 | 3, plus App frame and Workspace layout |
| Back-office CSS | 388 lines, 457 `className=` | 388 lines, 466 `className=` | 128 lines, 141 `className=`; 0 paint properties (guarded) |
| Hard-coded locale or English in parts | 4 | 15 entries still to convert | 0 (the list is deleted); `en-GB` stays only on two docs pages |
| Parts with a lifecycle status | 0 | 0 | all 121: 83 candidate, 38 draft, 0 stable (no developer has reviewed an API yet) |
| Props without a description | 309 of 922 | 517 in the `govocal-ds` entry | 0 in the `govocal-ds` entry (guarded); Base keeps React Aria's own |
| Developer-facing pages | 0 | 0 | 3: Who owns what, Questions for developers, What comes from React Aria |
| Play functions failing | not measured | 18 (the check passed them all) | 0 (the check now fails on a red play) |
| Visual regression baselines | 0 | 0 | 0 (not tonight, as planned) |

Checks at the start: typecheck clean, 234 unit tests, build, 1,008 e2e. At the end: `npm run check` on 56d1463: typecheck clean, 280 unit tests, build, 1,562 e2e passed (2 skipped), in about 7 minutes. The two Option list Esc tests that flaked through the night passed 12 of 12 after the popover fix.

## 2. What landed

- **Main green again** (826fac8): a build setting still pointed at the old fixtures folder, so Data table's "In a
  panel" crashed.
- **The component page** (Task 1–2): one `<Name>.guide.md` beside each part feeds its page, the components manifest
  and `docs/COMPONENTS.md`. Thirteen sections: purpose, status, when to use, when not (each naming the part to use
  instead), anatomy, states, behaviour with a keyboard table whose every row cites its test, content, accessibility,
  tokens, related, provenance, changes. 121 pages; a fresh-eyes check by ten new readers found 413 confusions on ten
  pages and fixed them, systemic ones on every page (a glossary, plain status words, right to left shown right to
  left). See [Button](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/components-actions-button--docs).
- **Compose without CSS** (Task 3): Stack, Inline, Grid (spacing props take token steps only; a type test refuses
  `"13px"`), a no-outer-margin test, `docs/API-REPORT.md` (every export and prop, a test fails when stale). The back
  office moved onto them: 393 → 128 CSS lines, zero paint, most pages pixel-identical.
- **The developers' side** (Task 4): [Who owns what](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/overview-who-owns-what--docs),
  [Questions for developers](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/overview-questions-for-developers--docs)
  (four sections, CSS size per part measured live),
  [What comes from React Aria](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/overview-what-comes-from-react-aria--docs),
  four seam stories (router link, form library, translate function, a table from loading to error to data).
- **Orientation and language** (Task 5): [Start here](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/overview-start-here--docs),
  Principles, [Lifecycle](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/overview-lifecycle--docs)
  (a written rule, a script, the tag in the sidebar),
  [Voice and tone](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/foundations-voice-and-tone--docs),
  [Word list](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/foundations-word-list--docs) (26 terms,
  each citing where the back office uses it), which-token-for-which-job tables, a copy check.
- **Strings and locale** (Task 6): every part's words are `labels`; a Locale toolbar (en-GB, nl-BE, fr-BE, de-DE,
  es-CL, ar-SA); edge-case stories (Data table's nine states, long German and Arabic on five parts). The German
  stories found a real Text field wrapping bug.
- **Proof anyone can rerun** (Task 7): `npm run check`, `npm run break-it` (four faults, four reds, about a minute,
  no build), [Checks](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/overview-checks--docs) and
  [AI assistance](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/overview-ai-assistance--docs), provenance on
  every page, every prop described. The cold-agent trial is in section 5.
- **The project lead's asks** (8a): Users is one virtualised list of 5,012 people; the ideation Manage tab has
  List / Map; titles are typed in every platform language at all ten call sites.
- **Small fixes** (8b and three more batches): 16 from the deep dive (Tooltip on first focus, a hideable Side nav,
  Panel without a frame, Modal description, Toast no longer eating clicks, …) and about 40 the page writers found
  while reading each part closely (column heads that looked sortable and weren't, rows that toggled but read as
  links, a filter that said "and" for "or" in French and Arabic, focus lost when a bar or a chip closed). The
  Option list's Esc flake had a real cause: a popover that flipped while closing stayed on the page, invisible.
- **The AI assistant** (8c): Components › AI (Item chip, Chat message, Chat progress, Chat thread, Prompt composer,
  Prompt suggestions), Activity feed, the Assistant panel pattern in five states.
- **The report** (8d): Page stage and Zoom bar, Block frame, the floating text toolbar and an inline editor, Stat
  tile's plain look, Figure, Quote, a Sortable list that works by keyboard. The report view runs on all of it, and
  on the assistant parts.
- **The project screens** (8e): one setup row (Card), Stat card's flat sparkline, Project header's unread dots and
  save states, Workspace layout, Phone phase card, Method card, event phases. The overview and phase screens run on
  them.

## 3. Decisions and questions

New sections in [`docs/DECISIONS.md`](../DECISIONS.md): Compose without CSS · Component pages · Developers' side and
orientation · Words, locale and edge cases · Proof anyone can rerun · Back office: the project lead's asks · The AI
assistant · Report parts · The report view on the new parts · Project screens · Project screens in the back office ·
Small fixes · Component page fixes · Red plays · Lifecycle · Gaps the builders found.

Questions added to [`docs/OPEN-DECISIONS.md`](../OPEN-DECISIONS.md), for the designer:
- Should Button wrap or truncate a long label? (German runs past a narrow column.)
- Should Banner get a danger tone? (A failed refresh uses warning today.)
- Should Toast keep its slide, or drop it everywhere?

The developers' calls (package, CSS layers, refs on Select and Number field, the base library) are laid out on
Questions for developers, not decided.

## 4. Skipped or reverted

Nothing was reverted. Not built, because no design exists yet: the assistant's real streaming, rate limits, a partly
applied change; setup rows for Proposals, Voting and Survey phases. The phase description's disabled and error
states aren't wired (nothing says when a description is locked). Four Gaps in the back office could now be swapped
for parts that exist (Quote on the Inspiration hub, drag-and-drop on Projects and Pages & menu, Map in the report):
next. Known open: a Date range field compares dates but not times; stacked toasts can cover the last rows' menus; menus inside a trigger can't take their own name; Tooltip, Modal, Tabs, Coachmark and Side nav have closing animations that may stick like the popover's did (unchecked); some older pages still use Select's retired `selectedKey`.

## 5. Look at these first

1. **A component page**, e.g. [Data table](https://andratwiro.github.io/govocal-ds/storybook/?path=/docs/components-tables-lists-data-table--docs):
   is this the shape the designers want for their bible? Every page was written by agents from the code, the
   back-office use and the prototype; "Reviewed by a person: not yet" is on all of them, honestly.
2. **The cold-agent trial**: a fresh agent given only `AGENTS.md` built a project Events screen (list, filter, row
   menu, create modal, empty state) with no hard-rule breaks (imports, tokens, paint, labels, accessibility: 0) and
   one wrong part (a plain Text field where residents read the title: the guide now says so). Its twelve stumbles
   became docs fixes, including a new "Add a back-office screen" section in AGENTS.md. The screen itself was not
   pushed.
3. **The report view and the project screens in the back office**, against the prototypes: the builders followed
   Storybook where it and the prototype differ (selection navy, not teal; label over value on a stat), all logged.

## 6. The architecture review, re-graded

| Area | 29 Oct | Now | Evidence |
|---|---|---|---|
| Structure | C | B+ | Base is primitives; one place per part; Components › AI and Layout groups; a lifecycle tag on every part; the folder renames still wait (planned, week 1) |
| Tests | C+ | A− | 44 unit guard files; the story smoke test and a play check that now fails on red; real-keyboard toolbar tests; break-it proves four guards; one Esc test on Inputs still needs watching |
| Build | D+ | B | `npm run check` runs everything in order; CI runs typecheck, tests, build, e2e and a sharded a11y scan before deploy (since 29 Oct); no branch protection yet (a developer call) |
| Code | B− | B+ | prop descriptions complete; `labels` everywhere; one table system; the API report shows every change as a diff; Setup step and Action row deprecated into Card |
| Types | B+ | A− | token-step types refuse raw spacing; the API report from TypeScript; one project still covers browser, Node and tests |
| CSS | C+ | B | Base scoped; no outer margins; back-office CSS places only (zero paint); the reach-in list shrank to 20; no cascade layers yet (a developer question) |
| Docs | D | A− | 121 component pages, Start here, Principles, Lifecycle, Voice and tone, Word list, Checks, AI assistance, the developers' pages; a cold agent built a screen from AGENTS.md alone |
