# What a designer-owned, agent-built component library must prove before product developers import it (2025–2026 evidence)

Researcher notes for the govocal-ds audit benchmark. Collected 29 Oct 2026. Every claim has its source next to it. Some pages were read through a summarising fetch tool. Numbers that matter for a decision (marked "re-check") should be confirmed on the page before the audit quotes them. Sources from before 2025 are marked **[background]**.

**Framing.**
- The design side (designers working as front-end developers and design-system architects) **owns the Storybook component code** and builds it with AI agents.
- Product developers **import** those components and compose screens.
- Design controls the visual language.
- The aim is an interface layer that lets more roles build product with AI.

The trust question becomes: what must this library **prove** before developers import it, and what stays theirs?

Ownership tags used throughout:
- **DESIGN-OWNED**: inside the component package and its docs and manifest. The library has to prove it: tests, API stability and review, versioning and breaking-change policy, CSS delivery, no style escape hatches, docs and manifests agents can read.
- **DEV-OWNED**: app integration. Data, state, routing, i18n plumbing, performance budgets, the consuming build, page-level composition and tests, and the adoption decision itself.
- **JOINT**: seams where the library must meet an app contract. Public API review and sign-off, router links, form refs (react-hook-form), translated strings (react-intl), the lint rules the app adopts to hold the boundary, and page-level accessibility.

(Superseded: an earlier version tagged packaging, semver, tests and CSS delivery as DEV-OWNED, back when engineering was expected to build the library. With design owning the code, those move to DESIGN-OWNED. The component-foundation choice, e.g. React Aria, is now a design-side architecture call, ideally recorded as a decision developers can read.)

---

## 1. Quality engineering: what do exemplar libraries prove with tests, and what is the norm?

### Takeaway
The 2025–2026 norm for a library others import:
- behavioural tests that drive each component in a real browser (keyboard, focus, states);
- axe in the same run, set to fail;
- visual-regression baselines on every PR;
- a per-component definition of "tested", rather than a coverage percentage.

Primer, Carbon, Fluent and Spectrum run these as named public CI workflows that a consuming developer can inspect. All of it is **DESIGN-OWNED** here: it is the library's proof. Page-level tests of composed screens are **DEV-OWNED**.

### Cited Findings
- **Storybook 9 (3 Jun 2025)** put the testing tools into one suite on Vitest, "in local development and CI":
  - interaction tests ("run all interaction tests across all your stories with a single click");
  - axe-core accessibility tests;
  - visual tests ("down to the pixel", via Chromatic);
  - coverage ("exactly which lines, functions, and branches are exercised");
  - a test widget.

  — [Storybook 9 blog](https://storybook.js.org/blog/storybook-9/). Coverage comes from Vitest itself, with no `@storybook/addon-coverage` needed. — [Storybook test coverage](https://storybook.js.org/docs/9/writing-tests/test-coverage); [Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)
- **Storybook a11y modes.** `parameters.a11y.test = 'error'` fails "in the Storybook UI and CLI/CI", `'todo'` warns, `'off'` skips. The documented adoption path: `'error'` project-wide, `'todo'` on known violations, fix one component at a time (start with Button), then remove the `'todo'`. — [Storybook a11y tests](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- **Storybook 10 (28 Oct 2025)** is ESM-only, with a 29% smaller install, module automocking and type-safe CSF factories. It needs Node 20.16+/22.19+/24+. — [Storybook 10 blog](https://storybook.js.org/blog/storybook-10/); [alternativeto](https://alternativeto.net/news/2025/11/storybook-10-debuts-esm-only-29-lighter-module-automocking-and-typesafe-csf-factories)
- **Primer** follows "the behavioral testing paradigm". Percentage coverage "is not always helpful", and "Tested" is "more like a checklist than a number": variants, states, appearance, layouts per viewport, behaviour, the component API, and axe on stories. Shared baseline tests are `BehavesAsComponent`, `checkExports` and `checkStoriesForAxeViolations`. Unit tests run on Vitest "in Chromium through Vitest's Playwright provider". — [Primer testing.md](https://github.com/primer/react/blob/main/contributor-docs/testing.md)
- **Primer ADR-017** replaced its earlier play-function recommendation: "use Playwright to visit a storybook story and interact with the component directly", to integrate with VRT and axe. — [Primer ADR-017](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-017-interaction-tests-revisited.md)
- Primer's public CI includes `vrt.yml`, `vrt-reports.yml`, `aat-reports.yml`, `check_for_changeset.yml`, `figma_connect_publish.yml`, `stress-tests.yml`, `migration-status.yml`, `lint-autofix.yml`, `copilot-setup-steps.yml` and `agentics-maintenance.yml`. — [primer/react workflows](https://github.com/primer/react/tree/main/.github/workflows)
- **Carbon** runs automated accessibility verification tests (AVT) on every change, tagged by kind (e.g. `@avt-keyboard-nav`). The Playwright report generates the per-component accessibility status on its site, plus periodic manual screen-reader testing. Its Playwright VRT is split across 4 runners. — [Carbon accessibility status](https://www.carbondesignsystem.com/building-blocks/core/components/overview/accessibility-status); [Carbon #19810](https://github.com/carbon-design-system/carbon/issues/19810)
- **Fluent UI** runs `pr-vrt.yml`, `vrt-baseline.yml` and `bundle-size*.yml`. — [fluentui workflows](https://github.com/microsoft/fluentui/tree/master/.github/workflows). Its agent instructions require "Unit tests for all public APIs, Accessibility tests for interactive components, Visual regression tests via Storybook". — [Fluent copilot.instructions.md](https://github.com/microsoft/fluentui/blob/master/.github/instructions/copilot.instructions.md)
- **React Spectrum / S2** runs `weekly-chromatic.yml` and `weekly-api-diff.yml`. — [react-spectrum workflows](https://github.com/adobe/react-spectrum/tree/HEAD/.github/workflows); [S2 chromatic story example](https://github.com/adobe/react-spectrum/blob/main/packages/@react-spectrum/s2/chromatic/Badge.stories.tsx)
- Only 64% of WCAG A/AA criteria are automatically detectable: "It is entirely possible to have code that passes automated accessibility checks, yet is functionally unusable." (15 May 2026) — [GitHub blog: accessibility agent](https://github.blog/ai-and-ml/github-copilot/building-a-general-purpose-accessibility-agent-and-what-we-learned-in-the-process/)
- An agent-built component can pass every behaviour test while visually broken: "27 fabricated tokens… The component rendered unstyled, yet all tests passed because tests validate behavior, not appearance." (22 Apr 2026) — [kaelig.fr: agent teams](https://www.kaelig.fr/design-system-components-with-ai-agent-teams/)

### Inferences
- An agent-built library needs **visual regression plus a token-existence check** on top of behaviour tests. Kaelig's case shows behaviour tests alone cannot catch the most likely agent failure: plausible tokens that don't exist. In govocal-ds terms, every `var(--gv-*)` used must resolve to a defined token, and a story smoke test is not proof of correct styling.
- Axe that "reports but doesn't block" is below the bar consumers expect. Storybook's `'error'` + `'todo'` path makes it blocking without fixing everything first, and the `'todo'` list doubles as a public known-issues list.
- Primer's per-component checklist (variants × states × viewports × API × a11y), published per component, is stronger evidence than any coverage %.
- **Ownership:** all of the above is **DESIGN-OWNED**. Page-level a11y (landmarks, heading order, focus across routes) and screen tests are **DEV-OWNED**. A recorded manual screen-reader pass of each component is DESIGN-OWNED; doing it on composed flows is DEV-OWNED or JOINT.

### Gaps
- No cross-system census of play functions vs Playwright vs Vitest browser mode, and no enforced coverage thresholds, were found (Primer avoids one).
- Canvas, GitLab Pajamas and Paste test stacks were only seen at workflow-name level.

---

## 2. API design, stability and review: how do exemplars keep a consumed API consistent, and who reviews it?

### Takeaway
Mature libraries write API conventions as numbered decisions (ADRs, specs), generate the public API as a reviewable text file (API Extractor `api.md`, S2's `api-diff.md`, Spectrum's weekly API diff), and check code against the conventions, increasingly with AI reviewers that must cite a rule ID. Primer's Sept 2026 audit of 83 components against 21 principles is the clearest public example. Authoring the API is **DESIGN-OWNED** here. Because developers consume it, **signing off public API changes is JOINT**: developers as API reviewers are the main alignment mechanism.

### Cited Findings
- **Primer ADR-003 "Prop norms"** [background, adopted]: every DOM-rendering component accepts `ref` (usually to the root); `as` only "with a clear need"; no per-component `theme`. It opens with "Our component prop APIs have, at times been a bit of a mess". — [Primer ADR-003](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-003-prop-norms.md)
- Primer keeps 25+ ADRs: children-as-API (004), file structure (013), internal modules (015), CSS (016), deprecating props (019), CSS layers (021), stable selectors via `data-component` (023), modular DS (024, 17 May 2026, "Proposed ⚠️"), prop merging (025). Each follows Context / Decision / Consequences / Alternatives. — [Primer ADR index](https://github.com/primer/react/tree/main/contributor-docs/adrs); [ADR-024](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-024-modular-ds.md)
- **Primer API Review, issue #8384 (4–14 Sep 2026).** 83 exported components were checked against 21 principles by a Copilot workflow with a `component-api-auditor` sub-agent.
  - Principles include extensible callback args, `useControllableState` for controlled/uncontrolled, "Avoid using the variant prop to communicate appearance", rest props on the root, and `data-*` for states.
  - Findings: rest props not forwarded or mis-ordered (blocking `data-testid`/`aria-*`), positional callback args, `size` "normal" vs "medium", controlled `value` synced through an effect, a hook returning a ref instead of accepting one.

  — [primer/react #8384](https://github.com/primer/react/issues/8384) (re-check counts; a snippet said "32 of 80" for a partial pass)
- Primer's AI review rules cite ADR-backed IDs ("Report concrete impact, cite the rule ID, and do not report pre-existing migration debt"). Its `modular-ds-reviewer` agent is "read-only… Never modify files" and checks that "established ARIA Authoring Practices Guide patterns use the expected pattern semantics and structure" and that "consumers can customize appearance, content, semantics, and behavior without forking Primer or relying on overrides". — [component-review.instructions.md](https://github.com/primer/react/blob/main/.github/instructions/component-review.instructions.md); [modular-ds-reviewer.agent.md](https://github.com/primer/react/blob/main/.github/agents/modular-ds-reviewer.agent.md)
- **Public API as text.**
  - Fluent generates `api.md` per package with API Extractor. — [Fluent instructions](https://github.com/microsoft/fluentui/blob/master/.github/instructions/copilot.instructions.md)
  - React Spectrum runs `weekly-api-diff.yml`, and S2 keeps an `api-diff.md`. — [react-spectrum workflows](https://github.com/adobe/react-spectrum/tree/HEAD/.github/workflows); [S2 api-diff.md](https://github.com/adobe/react-spectrum/blob/main/packages/@react-spectrum/s2/api-diff.md)
- **Fluent v9** defines composition in a written Slots spec (`slot.always`/`slot.optional`, `assertSlots`) with a fixed hook/style/render structure. — [Fluent Slots spec](https://github.com/microsoft/fluentui/blob/master/specs/Slots.md); [implementation guide](https://github.com/microsoft/fluentui/blob/master/docs/react-v9/contributing/component-implementation-guide.md)
- **React Aria Components** (one possible foundation): behaviour passed via context, slots, a `render` prop to swap DOM elements (e.g. a router link), `composeRenderProps`/`useContextProps` for wrappers, and states as `data-*` attributes. — [RAC Customization](https://react-aria.adobe.com/customization); [RAC Styling](https://react-aria.adobe.com/styling); origin **[background, 2023]**: [RAC RFC](https://github.com/adobe/react-spectrum/blob/main/rfcs/2023-react-aria-components.md)
- **Primer's versioning table** (an API-stability contract): component deprecated = `minor`, removed = `major`; prop narrowed or removed = `major`; "the element onto which props are spread is changed" = potentially `major`; broader event-handler element type = `major`. — [Primer versioning.md](https://github.com/primer/react/blob/main/contributor-docs/versioning.md)

### Inferences
- What developers who import a library ask is "is there a written rule, is the API surface a reviewable file, and do *we* get to approve changes to it?". Primer (ADRs + AI auditor + findings issue), Fluent (`api.md`) and Spectrum (API diff) together show all three.
- For govocal-ds this means:
  - API conventions written as ADRs (`ref` to root, rest props on root, one extensible object per callback, a `small|medium|large` scale, `value`/`defaultValue`/`onChange` via one controllable-state hook, states as `data-*`, how links and router components are passed in);
  - a generated `api.md` (or equivalent) committed and diffed on each PR;
  - a rule that a PR changing that file needs a developer reviewer.
  That last rule is the JOINT gate that turns "designers' code" into "our contract".
- Integration seams with the consuming stack need explicit API decisions. Accept a router link (via `render`/`as`) for routing. Forward `ref` plus `name`/`value`/`onChange`/`onBlur` to the real input for react-hook-form. Take all user-visible text as props or children, with no hard-coded copy, so react-intl can supply it. These are **JOINT**: the library designs the API (DESIGN-OWNED) to fit app plumbing that stays DEV-OWNED.
- **Ownership:** conventions, `api.md`, and the AI and human API reviews: **DESIGN-OWNED** authoring, **JOINT** sign-off. Foundation choice (React Aria or other): DESIGN-OWNED architecture, recorded as an ADR developers can challenge.

### Gaps
- No public API review checklists were found for Carbon, Polaris, Atlassian or Paste comparable to Primer's.
- I found no exemplar that formally requires consumer-team sign-off on API changes. This is common practice in internal platforms, but no source was found.

---

## 3. Distribution and change management: packaging, semver, deprecation, codemods, CSS delivery, SSR, coexistence

### Takeaway
Developers will only import what they can pin, upgrade and roll back. Exemplars provide:
- semver with a written breaking-change table;
- a changeset or change file on every PR, checked by CI;
- deprecation warnings a minor release before removal;
- codemods plus upgrade guides;
- canary releases and bundle-size reports on PRs.

On CSS, Primer measured a move off runtime styled-components to static CSS on CSS variables, scoped it with `@layer`, and shipped a bridge for consumers still on styled-components. All of that is **DESIGN-OWNED** here. Where the stylesheet is imported, layer order against the app's own styled-components, the bundler, SSR setup, and performance budgets are **DEV-OWNED**.

### Cited Findings
- Primer requires a changeset for public API or runtime changes, checked by `check_for_changeset.yml`, with an agent instruction file for it. — [Primer workflows](https://github.com/primer/react/tree/main/.github/workflows); [skills.lc mirror of Primer's changesets guidance (secondary)](https://skills.lc/primer/react/primer-react-github-skills-changesets-skill-md). Fluent uses Beachball change files. — [Fluent instructions](https://github.com/microsoft/fluentui/blob/master/.github/instructions/copilot.instructions.md)
- **Primer deprecation:** `@deprecated` in a minor/patch release, `"status": "deprecated"` in docs metadata, a Deprecation docs section with a diff, replacements built in a `drafts` bundle and promoted in a major. — [Primer deprecating-components.md](https://github.com/primer/react/blob/main/contributor-docs/deprecating-components.md)
- **Canvas Kit** has shipped codemods since v5 (`npx @workday/canvas-kit-codemod v14 [path]`), run in sequence, with 🤖 marks in upgrade guides. "The codemod will not handle every breaking change." — [Canvas v14 upgrade guide](https://canvas.workday.com/help/upgrade-guides/canvas-v14-upgrade-guide). Canary and release-major/minor workflows, plus OpenSSF scorecard. — [canvas-kit workflows](https://github.com/Workday/canvas-kit/tree/HEAD/.github/workflows)
- Paste publishes codemods and checks package size per PR. — [paste-codemods](https://github.com/twilio-labs/paste/tree/HEAD/packages/paste-codemods); [Paste workflows](https://github.com/twilio-labs/paste/tree/HEAD/.github/workflows). Fluent reports bundle size per PR. — [fluentui workflows](https://github.com/microsoft/fluentui/tree/master/.github/workflows)
- Polaris (secondary summary): deprecated prop values `console.warn()` in development, with automated migrations. — [polaris-react PR #11613](https://github.com/Shopify/polaris-react/pull/11613/files) (re-check)
- **Primer ADR-016** [background, adopted]. Runtime CSS injection took 242 ms for 1000 components vs 96 ms with static CSS. Server style collection added about 20% to SSR (450 ms on 1900 ms). Dynamic `sx` took 400 ms vs 165 ms with .css. The decision: CSS Modules plus CSS variables, one `@primer/react/styles.css`. — [Primer ADR-016](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-016-css.md)
- **Primer ADR-021:** `@layer primer.components.<name>` keeps consumer overrides stable even if a later version raises specificity, which otherwise risks "accidentally shipping a breaking change". — [Primer ADR-021](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-021-css-layers.md)
- **Primer ADR-022 (4 Sep 2025):** `@primer/styled-react`, a bridge for consumers still on `sx`/styled-components. Pre-1.0, "deprecated by default", and components are removed as `sx` usage "across key GitHub repos goes to zero". — [Primer ADR-022](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-022-styled-react.md)
- styled-components entered maintenance mode in 2025. It doesn't work in React Server Components without `'use client'`. — [Max Stoiber on X](https://x.com/mxstbr/status/1908201327811059926); [Sanity blog](https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort) (17 Mar 2025 date per secondary coverage; re-check)
- **Token format:** DTCG 2025.10, the first stable version (28 Oct 2025): `$value`/`$type`, aliases, theming, P3/Oklch, 40+ backing organisations. It is a community-group spec, not a W3C standard. — [designtokens.org](https://www.designtokens.org/); [DTCG FAQ](https://www.designtokens.org/faq/)
- Chromatic publishes **version- and branch-specific** Storybook MCP servers ("permalinks for version and branch-specific servers"), so consumers' agents can read the docs of the exact version installed. — [Chromatic: published Storybook MCP servers (23 Mar 2026)](https://www.chromatic.com/blog/introducing-published-storybook-mcp-servers/)

### Inferences
- "Private, no semver" is the biggest blocker for import. Without a version there is no pinning, no changelog and no rollback, so every library change can break a product screen. The proof is small and DESIGN-OWNED:
  - a private registry package;
  - Changesets;
  - Primer's semver table adapted;
  - a CI check refusing PRs without a changeset;
  - canary builds;
  - a written deprecation policy (warn in a minor, remove in a major, codemod for renames).
- Coexistence with styled-components needs proof the library delivers, and choices the app makes:
  - Library (DESIGN-OWNED): all CSS in named `@layer`s (e.g. `gv.components.*`), one stylesheet entry, no global element selectors, a CSS-variable token layer.
  - App (DEV-OWNED): import order, whether app overrides are allowed at all, and SSR setup.
  - Primer ADR-016/021/022 is evidence developers will respect.
- Versioned docs and MCP matter more for an AI-consumed library than a human-consumed one. A consumer's agent reading the docs of `main` while the app pins an older version will produce invented or wrong props. Version-pinned manifests (Chromatic's per-version MCP) close that gap.
- **Ownership:** package, semver, changesets, deprecation, codemods, size reporting, CSS layering, SSR-safety of the components, versioned manifest: **DESIGN-OWNED**. Performance budgets for the app, bundler and consuming build config, SSR/hydration of the app, upgrade timing, the adoption decision: **DEV-OWNED**.

### Gaps
- React Aria's SSR and tree-shaking guidance, and exemplars' actual KB budgets, were not collected.
- No exemplar was found that publishes coexistence tests against a CSS-in-JS host.
- GitLab Pajamas' process was not inspected.

---

## 4. No style escape hatches: how do exemplars keep the visual language inside the library?

### Takeaway
Where the library owns the visual language, exemplars close or label the escape hatches. Spectrum 2 limits its `styles` prop to layout, spacing, sizing and positioning, and treats `UNSAFE_className` as discouraged. Atlassian ships lint rules that ban `className`, global styles, `!important`, nested and unsafe selectors, and non-standard CSS-in-JS in consuming code. Fluent and Atlassian lint for tokens over raw values. Primer is removing `sx` from its main package. The library defines the boundary (**DESIGN-OWNED**). Enforcing it in product code needs an app lint rule developers adopt (**JOINT**).

### Cited Findings
- **Spectrum 2:** "The `styles` prop accepts a limited set of CSS properties, including layout, spacing, sizing, and positioning." The build-time `style` macro "returns a class name that applies Spectrum 2 design tokens". Custom components should use "the `style` macro with React Aria Components". — [React Spectrum S2 styling](https://react-spectrum.adobe.com/styling)
- S2 AI guidance (as summarised): "Prefer S2 components first; use their `styles` prop only for layout-style properties. Using UNSAFE_className results in inconsistent UIs and hard to maintain code." Style macros passed to `UNSAFE_className` raise a TypeScript error. — [State of AI in DS: React Spectrum S2](https://state-of-ai-in-design-systems.netlify.app/systems/react-spectrum-s2) (via search summary; re-check)
- **Atlassian `@atlaskit/eslint-plugin-ui-styling-standard`** (v3.0.3, updated 29 Oct 2026). Its recommended rules include `no-classname-prop` ("Disallows usage of the `className` prop in JSX"), `no-global-styles`, `no-important-styles`, `no-nested-selectors`, `no-unsafe-selectors`, `no-unsafe-values` ("styles that are difficult/impossible to statically analyze"), `no-imported-style-values`, `no-styled` and `use-compiled`, plus `local-cx-xcss` for the constrained `xcss` prop. — [npm: @atlaskit/eslint-plugin-ui-styling-standard](https://www.npmjs.com/package/@atlaskit/eslint-plugin-ui-styling-standard)
- Atlassian `ensure-design-token-usage` enforces tokens over hard-coded values (recommended, fixable). — [Atlassian ESLint usage](https://atlassian.design/components/eslint-plugin-design-system/usage). Fluent: "Always use design tokens… instead of hardcoded values". — [Fluent instructions](https://github.com/microsoft/fluentui/blob/master/.github/instructions/copilot.instructions.md)
- Primer is moving the `sx` escape hatch out of `@primer/react` into a deprecated bridge package. — [Primer ADR-022](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-022-styled-react.md). Primer's reviewer agent checks that consumers can customise "without forking Primer or relying on overrides". — [modular-ds-reviewer](https://github.com/primer/react/blob/main/.github/agents/modular-ds-reviewer.agent.md)
- 15 of 165 techniques catalogued across 21 systems are "token enforcement" ("semantic tokens only, never raw values"), and 28 are "prohibition". — [State of AI in DS: techniques](https://state-of-ai-in-design-systems.netlify.app/techniques)

### Inferences
- A govocal-ds proof here has three parts:
  - (a) components expose no visual-override props: no free `className`/`style` on visual properties, or only an explicitly named escape hatch like `UNSAFE_className` for emergencies;
  - (b) a layout-only prop or wrapper for spacing and placement, à la S2 `styles`;
  - (c) a shipped lint rule set the app can turn on (no raw colours or spacing, no `UNSAFE_` without a ticket, no styling govocal-ds internals through styled-components).
  Parts (a) and (b) are DESIGN-OWNED. Turning on (c) in citizenlab is a DEV-OWNED decision, made JOINT by the library shipping the rules.
- This is also what makes the library safe for *consumers' agents*. With no escape hatch, an agent composing screens cannot drift the visual language even if it tries. That is the "tool-gating so hallucination can't happen" pattern in the State of AI report.

### Gaps
- S2's `UNSAFE_*` guidance was seen only through a summary of the State of AI page. The S2 docs page fetched did not mention it.
- No data was found on how often consumers of these systems need escape hatches, or how exemplars handle legitimate one-off needs.

---

## 5. Adoption and health metrics

### Takeaway
Exemplars measure adoption with static scanners (Omlet, react-scanner) and track migration and repo health in CI (Primer's nightly migration status, Carbon's merge-rate and repo-stats, Canvas Kit's OpenSSF Scorecard). Chromatic adds "UI context coverage" as an AI-era metric. *Ownership:* library-side coverage (docs, tests, manifest completeness, a11y status per component) is **DESIGN-OWNED**. Scanning product code and deciding adoption targets is **DEV-OWNED**, or JOINT if the library team runs the scan with developers.

### Cited Findings
- Omlet scans repos and charts adoption over time: DS vs non-DS components, legacy vs latest, newly created DS vs custom. **[background, May 2024]** — [Omlet](https://omlet.dev/blog/how-leaders-measure-design-system-adoption/). "Adoption that just measures the amount of use is missing the amount it's used correctly." (Instacart's design-systems lead, via Omlet) — [same](https://omlet.dev/blog/how-leaders-measure-design-system-adoption/)
- react-scanner extracts React component and prop usage statically. — [react-scanner](https://github.com/moroshko/react-scanner)
- Primer's nightly `Migration Status` reports React-compiler and ts-docgen status. — [migration-status.yml](https://github.com/primer/react/blob/main/.github/workflows/migration-status.yml). The styled-components bridge is retired by usage data. — [ADR-022](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-022-styled-react.md)
- Carbon runs `metrics-merge-rate.yml` and `metrics-repo-stats.yml`, Paste runs `track-workflow-metrics.yml`, and Canvas Kit runs `scorecard.yml`. — [Carbon workflows](https://github.com/carbon-design-system/carbon/tree/HEAD/.github/workflows); [Paste workflows](https://github.com/twilio-labs/paste/tree/HEAD/.github/workflows); [canvas-kit workflows](https://github.com/Workday/canvas-kit/tree/HEAD/.github/workflows)
- Chromatic: **UI context coverage = "% test coverage × % schema integrity"**, plus four agent signals (context coverage, success rate, time-to-completion, token usage). — [Chromatic: Frontend workflow for AI](https://www.chromatic.com/frontend-workflow-for-ai)

### Inferences
- Before import, the persuasive numbers are library-side: % of components with stories, docs, keyboard tests, VRT baselines, a11y `'error'` status, manifest entries and an API-report entry, plus 0 raw values. A per-component scorecard page, like Carbon's accessibility status, makes it checkable. Once import starts, scanning citizenlab for govocal-ds vs styled-components usage is the trend developers will watch.
- Issue response time is a trust signal (Carbon automates merge-rate metrics). A design-owned library should publish an SLA for bug reports from product developers, since they now depend on it.

### Gaps
- No 2025–2026 benchmark values (typical response times, adoption %) were found.
- Token coverage was found only as lint enforcement, not as a reported metric.

---

## 6. AI and design systems in 2025–2026: the agent workflow on both sides, failure modes, guardrails, case studies, trust data

### Takeaway
By mid-2026 nearly every major system ships machine-readable context (MCP, llms.txt, agent skills, AGENTS.md). Storybook and Chromatic now support the two-sided workflow this proposal describes:
- the library team's agents build components against specs, tokens and validation loops;
- consumers' agents read a **published, versioned Storybook MCP** to compose screens from real components and self-check with the library's tests.

The documented failure modes are fabricated tokens, invented props and components, cross-agent information loss, and silent guessing when inputs degrade. Exemplars contain them with deterministic gates the AI can't bypass. Developer trust in AI output is low and falling, lowest among seniors, so the library must show its gates rather than ask for trust.

### Cited Findings

**Design side: agents building components**
- **Agent team building a DS component (22 Apr 2026, Kaelig Deloumeau-Prigent).** An 8-agent pipeline (design analyst, library researcher, component architect, code writer, accessibility auditor, story author, visual reviewer, quality gate) built a complex React Menu in about 1 h vs 15–20 h manually.
  - Failures: "27 fabricated tokens" (wrong `--ids-*` prefix) with all tests green; about 300 lines of keyboard handling reinvented because research didn't reach the code writer's context; agents "silently guessed at token mappings" when Figma MCP was unavailable; and an autonomy ceiling, since it "couldn't *question*" specs.
  - What worked: rules encoded once ("once told, never recurs"); structured handoff docs as contracts (`[BLOCKING]`/`[CONCERN]`); fresh-context validators; exit criteria defined before execution.
  - Human gates that remained: pause-and-ask for design intent, quality-threshold stops, and manual checklists (screen reader, hover feel, motion). "The most honest thing an agent system can do is tell you where it stops."

  — [kaelig.fr](https://www.kaelig.fr/design-system-components-with-ai-agent-teams/)
- **Primer** maintains itself partly with agents: `copilot-instructions.md`; instruction files (changesets, component review, CSS, TS/React); agents `modular-ds-implementer` and a read-only `modular-ds-reviewer`; `copilot-setup-steps.yml` and `agentics-maintenance.yml` workflows; and an AI-run API audit. — [primer/react .github](https://github.com/primer/react/tree/main/.github); [workflows](https://github.com/primer/react/tree/main/.github/workflows); [#8384](https://github.com/primer/react/issues/8384)
- **Fluent** keeps agent instructions that make tokens-only, slots, tests, VRT and change files mandatory. Its skills "wrap lint auto-fix loops with Storybook and Playwright visual checks". — [Fluent instructions](https://github.com/microsoft/fluentui/blob/master/.github/instructions/copilot.instructions.md); [State of AI in DS insights](https://state-of-ai-in-design-systems.netlify.app/insights)
- **Astryx (Meta, open-sourced 18 Jun 2026):** a review gate where "Detection is path-based and deterministic (no LLM in the enforcement path)", with Copilot advisory only. — [Astryx REVIEW_GATE.md](https://github.com/facebook/astryx/blob/main/.github/REVIEW_GATE.md); [report: Astryx](https://state-of-ai-in-design-systems.netlify.app/systems/astryx)

**Consumer side: developers' agents composing screens from the manifest**
- **Storybook MCP for React (23 Mar 2026, updated 11 Sep 2026):**
  - gives agents "component metadata like stories, API, and docs" to reuse components rather than invent;
  - provides tools "to run component and accessibility tests", so an agent can "apply fixes itself or alert the developer when human judgement is needed";
  - shows "live stories directly inside the chat UI".
  On the Reshaped library: **12.8% better component reuse, 2.76× faster generation, 27% fewer tokens**. React, Storybook 10.3+. — [Storybook blog: Storybook MCP for React](https://storybook.js.org/blog/storybook-mcp-for-react/)
- The Storybook MCP is in **preview** ("The API may change"). Its component manifest holds props, the first three stories, the story index and docs, generated for React with `componentsManifest`. The docs tools are `docs-list`, `docs-show` and `docs-show-story`; `test-run` returns test and a11y results. Agents are told "Never hallucinate component properties!" — [Storybook MCP overview](https://storybook.js.org/docs/ai/mcp/overview)
- **Published, composed MCP (Chromatic, 23 Mar 2026).** A design system team publishes its Storybook and Chromatic serves MCP at `/mcp`. Consumers configure `.mcp.json`, and can "merge a local Storybook MCP with various remotely published MCPs", so an app's agent sees both the app's own components and the design system's. There are "version and branch-specific servers", with access mirrored from GitHub/GitLab/Bitbucket orgs. — [Chromatic: published Storybook MCP servers](https://www.chromatic.com/blog/introducing-published-storybook-mcp-servers/); [Chromatic MCP docs](https://www.chromatic.com/docs/mcp/)
- **Storybook's "Design Systems with Agents" RFC (9 Sep 2025)** frames the problem as agents that "ignore existing design systems and create their own". DS authors produce component manifests (names, descriptions, prop types with defaults, examples, docs, related components) and host the MCP or tell users how to run it. Consumers point an MCP at the manifest (npm package, local build or Chromatic URL) and call "List all components" / "Get details for components" before generating code. — [storybookjs/ds-mcp-experiment-reshaped RFC](https://github.com/storybookjs/ds-mcp-experiment-reshaped/discussions/1)
- **Atlassian** serves consumers through `llms.txt` topic files, a hosted ADS MCP (`https://mcp.atlassian.com/v1/ads/public/mcp`) or `npx -y @atlaskit/ads-mcp`, and an agent skill. — [atlassian.design/llms.txt](https://atlassian.design/llms.txt)
- **State of AI in Design Systems, July 2026** (Kaelig Deloumeau-Prigent; 21 systems; published 28 Oct 2026). 15/21 ship llms.txt, 16 ship repo agent files, and only 3 use Code Connect. MCP counts conflict between pages: 20/21 on the overview vs "18 of 21 ship an official MCP server" on insights (re-check). The report catalogues 165 techniques in 11 categories to stop agents hallucinating components and tokens; the validation loop is largest (31). Astryx's nightly benchmark (agents build with HTML, shadcn/Tailwind, Astryx, Astryx+Tailwind) had "Baseline won 50, Astryx 19, Astryx-plus-Tailwind 9, and 13 were ties" over 91 nights. — [overview](https://state-of-ai-in-design-systems.netlify.app/); [insights](https://state-of-ai-in-design-systems.netlify.app/insights); [techniques](https://state-of-ai-in-design-systems.netlify.app/techniques); [Astryx](https://state-of-ai-in-design-systems.netlify.app/systems/astryx)
- **Controlled study (arXiv, submitted 14 Jul 2026):** at a large Brazilian enterprise (Angular, iOS, Android), design-system-aware AI cut time-to-delivery by 46.7%–69.4% vs manual and DS-only, with lower variability and better design fidelity (abstract only). — [arXiv 2607.13156](https://arxiv.org/abs/2607.13156)
- **Brad Frost (16 Dec 2025):** "the AI is deliberately constrained to using the high-quality design system materials… This is what distinguishes DS+AI from vibe coding". — [Agentic Design Systems in 2026](https://bradfrost.com/blog/post/agentic-design-systems-in-2026/)
- shadcn added MCP in Apr 2025. CLI 3.0 in Aug 2025 brought namespaced registries (`@shadcn`, `@v0`, private `@acme`) and MCP for any registry, an alternative distribution model where agents install source, not packages. — [shadcn Apr 2025](https://ui.shadcn.com/docs/changelog/2025-04-mcp); [shadcn CLI 3.0](https://ui.shadcn.com/docs/changelog/2025-08-cli-3-mcp)
- Figma's MCP (beta June 2025, remote plus Make in Sept 2025) is listed for completeness only. — [alternativeto](https://alternativeto.net/news/2025/9/figma-mcp-server-adds-remote-access-and-figma-make-connection)

**Failure modes and guardrails** (vendor or practitioner blogs: illustrative)
- Invented token names, spacing drift within a session, forgotten decisions, renamed props still used. — [Superdesign](https://superdesign.dev/blog/ai-design-system-drift). Hard-coded hex instead of tokens. — [UX Magic](https://uxmagic.ai/blog/ai-ui-quality-production-workflow); [Overlay QA](https://overlayqa.com/blog/ai-design-system-drift/). Guardrails: allow-lists, type-checking against `.d.ts`, lint and type checks that "reject everything else". — [Mode Inspect](https://modeinspect.com/blog/ai-design-system)
- Chromatic: "Run the same prompt 100 times and you'll get 100 different UIs". Humans own "ambiguous visual diffs, UX intent, and breaking API changes". — [Chromatic](https://www.chromatic.com/frontend-workflow-for-ai)
- GitClear 2025 (211M changed lines): 8× more duplicated 5+ line blocks in 2024, and copy/paste exceeded moved lines for the first time. — [GitClear 2025](https://www.gitclear.com/ai_assistant_code_quality_2025_research); [DevClass](https://www.devclass.com/ai-ml/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/1626250)
- Other agent-at-scale cases: Airbnb migrated about 3,500 test files in 6 weeks (97% automated, validation-gated). — [Airbnb Tech](https://airbnb.tech/infrastructure/accelerating-large-scale-test-migration-with-llms/). GitHub's accessibility agent: 3,535 PRs, 68% fix rate, high-risk patterns left to humans. — [GitHub blog](https://github.blog/ai-and-ml/github-copilot/building-a-general-purpose-accessibility-agent-and-what-we-learned-in-the-process/)

**Developer trust data**
- **Stack Overflow 2025** (49,009 responses). Trust in AI accuracy (all respondents): highly 3.1%, somewhat 29.6%, somewhat distrust 26.1%, highly distrust 19.6%. 66% say output is "almost right, but not quite", and 45.2% say debugging it takes more time. **75.3% turn to a human "when I don't trust AI's answers"**. Vibe coding is not part of professional work for 72.2% (+5.3% emphatically). — [SO 2025 AI](https://survey.stackoverflow.co/2025/ai). 46% distrust, up from 31%. Experienced developers: 2.6% high trust, 20% high distrust. — [SO press release](https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/)
- **DORA 2025:** 90% use AI and 30% have little or no trust in AI code. AI raises throughput but correlates with lower stability: "Without robust control systems, like strong automated testing, mature version control practices, and fast feedback loops, an increase in change volume leads to instability." — [DORA 2025](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
- **Sonar 2026** (1,100+ developers): 96% don't fully trust AI code, only 48% always verify it, and 38% find reviewing it harder than reviewing a colleague's code. — [Sonar](https://www.sonarsource.com/company/press-releases/sonar-data-reveals-critical-verification-gap-in-ai-coding/)

### Inferences
- **The two-sided loop that the evidence supports:**
  - (1) *Design side, DESIGN-OWNED.* A designer and Claude Code build a component from a written spec, tokens and an APG pattern.
  - Deterministic gates run: typecheck, tokens-only and token-existence lint, story smoke, keyboard/focus e2e, axe `'error'`, VRT.
  - A designer approves visuals. A developer signs off on any `api.md` change (JOINT).
  - A changeset is added, a release is cut, the manifest and docs regenerate, and a versioned MCP is published.
  - (2) *Developer side, DEV-OWNED.* A developer's agent connects to the MCP for the installed version and lists and reads components. It composes screens only from them, runs the library's `test-run` plus the app's own tests, and passes the app's lint (no raw values, no `UNSAFE_`). The developer reviews the PR.
  - (3) *Feedback.* When a consumer's agent can't find a component, the right move is a request to the library, not a local invention. Primer's ADR-024 "model for upstreaming" and GOV.UK's contribution criteria are the precedents.
- Kaelig's failures map one-to-one onto gates a designer-owned library must show:
  - fabricated tokens → token-existence check plus VRT;
  - cross-agent information loss → structured, versioned specs and decision logs in the repo;
  - silent guessing on degraded input → agents instructed (and tested) to stop and ask;
  - spec questions agents can't raise → human pause gates.
- Consumers' agents are the most literal readers of the API. Hallucinated props on the consumer side come from missing or stale manifests. A version-pinned MCP, plus TypeScript types that reject unknown props, is the proof that agent-composed screens will match the library.
- The trust data says developers won't take the AI's word, or the designers' word, for quality. They will take green deterministic checks they can rerun, and a human they can ask (75.3%). The library should name its owners and its gates.

### Gaps
- No rigorous long-horizon case study of a full design system built mostly by agents was found. Kaelig's is a single complex component, and Primer and Fluent are human-built systems with agent maintenance.
- The Reshaped benchmark numbers (12.8%, 2.76×, 27%) come from Storybook's own blog, a vendor source with method not reviewed.
- The "State of AI in DS" counts conflict between pages (MCP 18 vs 20). Re-check.
- The arXiv study was read at abstract level only.
- An unverified listicle claim ("56 percent better UI consistency") was excluded.
- No survey on trust in AI-built *component libraries* specifically was found.

---

## 7. How are design-led design systems received by engineering teams? What made them adopt or reject?

### Takeaway
The evidence is surveys and practitioner reports, not controlled research. Engineering teams adopt what fits their workflow and what they had a say in, and reject what arrives as a mandate ("designers telling devs what to do"). Successful systems have defined decision processes, onboarding and open contributions. In this proposal the design side owns the code, so the alignment levers are the ones engineers recognise from any dependency: a versioned contract they review, honest status, a named owner, and their own control over integration and the adoption decision.

### Cited Findings
- **Sparkbox 2022** [background; 219 responses, 58% design/UX]. Successful systems had support, training and onboarding 76% of the time vs 30% overall. 92% of successful systems accepted coded contributions vs 33% overall. Among satisfied subscribers, 86% had defined processes for feature decisions and 83% had onboarding. — [Sparkbox 2022](https://designsystemssurvey.sparkbox.com/2022/)
- **zeroheight 2025:** more than twice as many engineers responded as in 2024, and designers fell to 63% from 77%. Token adoption rose from 56% to 84%. "Adoption depends not only on technical quality, but also on communication". — [Web Designer Depot summary](https://webdesignerdepot.com/zeroheight-releases-its-design-systems-report-2025/); [report PDF](https://othr.zeroheight.com/hubfs/zeroheight%20-%20Design%20System%20Report%202025%20-%20release%20version.pdf) (not read directly; re-check)
- **zeroheight's following report** (quoted on the next edition's landing page): "3 in 5 design system teams didn't have enough people to meet their goals". "32% were satisfied with how well their organization secures buy-in, down from 42%". "1 in 10 had built AI into their design system processes, though nearly half were experimenting". — [zeroheight report landing](https://report.zeroheight.com/2027)
- **GOV.UK contribution criteria.** Before development a proposal must be **useful** (evidence from many services) and **unique**. Before publication it must be **usable** (research including disabled users), **consistent** (reuses existing styles, follows coding standards) and **versatile** (works across browsers, assistive technologies and devices). — [GOV.UK contribution criteria](https://design-system.service.gov.uk/community/contribution-criteria/)
- **Headway (16 Jun 2026, updated 21 Sep 2026).** Failures are "cultural and organizational barriers, not technical shortcomings", and AI amplifies them. Blockers: sprint pressure ("Engineers under sprint pressure don't want to take extra time to build a design system compliant component"), cold-start knowledge loss, and one-off patches instead of contributions. Remedies: DS engineers in engineering reporting lines, which removes the perceived "designers telling devs" dynamic; non-negotiable rules centralised via MCP with context-specific guidance in skill files; snapshot publishing to private registries for safe experiments; adoption reports paired with team conversations. Observational. — [Headway](https://www.headway.io/blog/the-design-system-adoption-problem-is-older-than-ai)
- Practitioner advice: "Pair engineers and designers during component creation, not in a review meeting after components are done." — [Carlo Ciccarelli](https://www.carlociccarelli.com/post/getting-developer-buy-in-for-your-design-system-stop-fighting-start-collaborating) (its "60% adoption" statistic is unsourced and not used). **[background, 2020]** "It's not enough to tell teams what they need to do—everyone has to agree." — [Rangle](https://rangle.io/blog/design-without-the-system-why-design-system-adoptions-fail)
- **Nathan Curtis (28 Sep 2026):** a spec as a design–code contract: "the spec records what the element *is*, and each platform answers with what it *has*." — [Component and Part Roles](https://nathanacurtis.substack.com/p/component-and-part-roles-as-composites)
- **WAI-ARIA APG** patterns give the roles, states, properties and keyboard interaction for each widget, a shared behaviour vocabulary design and engineering can both check against. — [W3C APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- Engineers already read proposals in ADR form with explicit status ("Proposed ⚠️ / Accepted ✅", Context / Decision / Consequences / Alternatives). — [Primer ADR-024](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-024-modular-ds.md); [ADR-022](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-022-styled-react.md)
- Primer guideline PRs "should be reviewed and approved by a member of the Design Infrastructure team": a named owner. — [Primer contributing docs](https://primer.style/product/contribute/documentation/)
- 75.3% of developers turn to a human when they don't trust AI output. — [SO 2025](https://survey.stackoverflow.co/2025/ai)

### Inferences
- A designer-owned library sits closest to the "handed down" failure pattern. The counterweights developers recognise from any third-party dependency are:
  - a versioned package with semver and a changelog (§3);
  - an API contract file they co-sign (§2);
  - visible gates (§1, §4);
  - a named owner and response SLA (§5);
  - an upstream request path (§6).
- Developers keep the adoption decision, the integration architecture and the pace of migration (DEV-OWNED), which answers the "designers telling devs what to do" worry structurally rather than rhetorically.
- Headway's "snapshot publishing to private registries" and Canvas Kit's canary releases fit an early pilot: developers try a canary build on one real screen before any commitment.
- The GOV.UK criteria split along ownership lines. Useful, unique and usable are design-side evidence. Consistent and versatile (browsers, AT, devices) are shown by the library's own tests, now DESIGN-OWNED. Integration into a product is DEV-OWNED.

### Gaps
- No controlled study comparing design-led vs engineering-led design systems was found.
- No published case was found of designers owning a production component library's code, built with agents, consumed by a separate engineering team. The model appears new. The nearest are practitioner posts on designers shipping code with Claude Code (e.g. [925 Studios guide, Mar 2026](https://www.925studios.co/blog/2026-03-18-claude-code-for-designers-the-complete-guide-to-building-real-websites-in-2026)), which are not evaluated outcomes.
- A "79% of successful systems integrated into developer workflow" figure appears in search summaries of Sparkbox surveys, but its year and page were not confirmed. Not used.

---

## 8. Which proofs must the designer-owned, agent-built library show before developers import it, and what stays dev-owned?

### Takeaway
Developers will import a library that proves, with checks they can rerun, that it is stable, tested, versioned and closed to drift, and whose docs their own agents can read at the installed version. They keep everything about how it plugs into their app. The P-list below is the library's burden (DESIGN-OWNED, with JOINT sign-offs marked). The A-list stays with the app (DEV-OWNED). Each item says how to verify it and which exemplar provides it.

### Cited Findings

**P: what the library must prove (DESIGN-OWNED unless marked)**

- **P1. Tokens only, and only tokens that exist.** A raw value or an undefined `var(--gv-*)` fails CI. Verify: add `color:#333` or `var(--gv-made-up)` and CI goes red. — [Atlassian ensure-design-token-usage](https://atlassian.design/components/eslint-plugin-design-system/usage); [Fluent tokens rule](https://github.com/microsoft/fluentui/blob/master/.github/instructions/copilot.instructions.md); why existence checks matter: [kaelig.fr (27 fabricated tokens, tests green)](https://www.kaelig.fr/design-system-components-with-ai-agent-teams/); a standard source format: [DTCG 2025.10](https://www.designtokens.org/)
- **P2. Behavioural tests per component in a real browser** (keyboard, focus, states, callbacks) against a published per-component checklist and the component's WAI-ARIA APG pattern. — [Primer testing.md](https://github.com/primer/react/blob/main/contributor-docs/testing.md); [Primer ADR-017](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-017-interaction-tests-revisited.md); [Carbon AVT](https://www.carbondesignsystem.com/building-blocks/core/components/overview/accessibility-status); [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- **P3. Accessibility that blocks merges**, with `'todo'` as a public known-issues list and a recorded manual screen-reader pass. — [Storybook a11y modes](https://storybook.js.org/docs/writing-tests/accessibility-testing); [GitHub: 64% automatable](https://github.blog/ai-and-ml/github-copilot/building-a-general-purpose-accessibility-agent-and-what-we-learned-in-the-process/)
- **P4. Visual regression baselines** for every story across themes and viewports, with designer approval of appearance on each PR. — [Primer vrt.yml](https://github.com/primer/react/tree/main/.github/workflows); [Fluent pr-vrt](https://github.com/microsoft/fluentui/tree/master/.github/workflows); [Spectrum weekly Chromatic](https://github.com/adobe/react-spectrum/tree/HEAD/.github/workflows); [Storybook visual tests](https://storybook.js.org/blog/storybook-9/)
- **P5. Written API conventions (ADRs) plus a generated public-API file diffed on every PR. A change to it needs a developer reviewer (JOINT sign-off).** — [Primer ADRs](https://github.com/primer/react/tree/main/contributor-docs/adrs); [Primer #8384](https://github.com/primer/react/issues/8384); [Fluent api.md](https://github.com/microsoft/fluentui/blob/master/.github/instructions/copilot.instructions.md); [S2 api-diff.md](https://github.com/adobe/react-spectrum/blob/main/packages/@react-spectrum/s2/api-diff.md)
- **P6. Integration-ready API seams (JOINT).** Router links via `render`/`as`. `ref` plus form props forwarded to the real input (react-hook-form). All copy via props or children, no hard-coded strings (react-intl). Rest props and `data-testid` reach the root. Verify: a sample app screen using the real router, form library and i18n. — [Primer ADR-003](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-003-prop-norms.md); [Primer #8384 rest-props findings](https://github.com/primer/react/issues/8384); [RAC render prop](https://react-aria.adobe.com/customization)
- **P7. No style escape hatches.** No visual-override props (or only an explicit `UNSAFE_` one), a layout-only spacing and placement API, and a lint preset the app can enable. — [S2 limited `styles` prop](https://react-spectrum.adobe.com/styling); [Atlassian ui-styling-standard rules](https://www.npmjs.com/package/@atlaskit/eslint-plugin-ui-styling-standard); [Primer ADR-022 (removing `sx`)](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-022-styled-react.md)
- **P8. An installable, semver package with a changelog**, a CI check that refuses PRs without a changeset, and canary builds. — [Primer versioning.md](https://github.com/primer/react/blob/main/contributor-docs/versioning.md); [Primer check_for_changeset](https://github.com/primer/react/tree/main/.github/workflows); [Canvas Kit canary/release workflows](https://github.com/Workday/canvas-kit/tree/HEAD/.github/workflows)
- **P9. A breaking-change and deprecation policy**: warn in a minor, remove in a major, codemods for renames, upgrade guides. — [Primer deprecating-components.md](https://github.com/primer/react/blob/main/contributor-docs/deprecating-components.md); [Canvas codemods](https://canvas.workday.com/help/upgrade-guides/canvas-v14-upgrade-guide); [Paste codemods](https://github.com/twilio-labs/paste/tree/HEAD/packages/paste-codemods)
- **P10. CSS that is safe to drop into a styled-components app.** Named `@layer`s, one stylesheet entry, no globals, SSR-safe (no runtime style injection). Verify: a demo page mixing govocal-ds with styled-components and server rendering. — [Primer ADR-016](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-016-css.md); [ADR-021](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-021-css-layers.md); [ADR-022](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-022-styled-react.md)
- **P11. Size reported per PR and per component**, plus tree-shaking proof, as input to the app's budgets (budgets themselves are A4). — [Fluent bundle-size](https://github.com/microsoft/fluentui/tree/master/.github/workflows); [Paste package-size](https://github.com/twilio-labs/paste/tree/HEAD/.github/workflows)
- **P12. Docs and a manifest generated from code, versioned with the package, readable by developers' agents.** Storybook component manifest, and an MCP pinned to the installed version, composable with the app's own Storybook. Verify: a consumer agent lists components and reads one, and its props match the TypeScript types. — [Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview); [Storybook MCP for React](https://storybook.js.org/blog/storybook-mcp-for-react/); [Chromatic versioned/composed MCP](https://www.chromatic.com/blog/introducing-published-storybook-mcp-servers/); [Storybook DS-with-agents RFC](https://github.com/storybookjs/ds-mcp-experiment-reshaped/discussions/1); [Atlassian llms.txt + MCP](https://atlassian.design/llms.txt)
- **P13. Deterministic gates the building agents can't bypass, and named human owners.** Required checks, CODEOWNERS on tokens and `api.md`, AI reviewers advisory or read-only, small PRs. — [Astryx REVIEW_GATE](https://github.com/facebook/astryx/blob/main/.github/REVIEW_GATE.md); [Primer read-only reviewer](https://github.com/primer/react/blob/main/.github/agents/modular-ds-reviewer.agent.md); [Primer rule-ID review](https://github.com/primer/react/blob/main/.github/instructions/component-review.instructions.md); [DORA control systems](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
- **P14. Honest status and provenance per component**: draft/beta/stable, known gaps, what was AI-generated and what a human reviewed, and where the agents stop. — [Primer docs status metadata](https://github.com/primer/react/blob/main/contributor-docs/deprecating-components.md); [kaelig.fr ("tell you where it stops")](https://www.kaelig.fr/design-system-components-with-ai-agent-teams/); [SO 2025 (75.3% ask a human)](https://survey.stackoverflow.co/2025/ai)
- **P15. An agent eval on the consumer side**: a developer's agent builds a real back-office screen from the manifest, scored for component reuse, raw values, invented props, a11y and tokens used. Publish losses too. — [Storybook/Reshaped benchmark](https://storybook.js.org/blog/storybook-mcp-for-react/); [Astryx nightly benchmark](https://state-of-ai-in-design-systems.netlify.app/systems/astryx); [Chromatic's four signals](https://www.chromatic.com/frontend-workflow-for-ai)
- **P16. A per-component readiness scorecard and a response SLA**: stories, docs, tests, VRT, a11y status, manifest entry, API entry, deprecation status, and triage times. — [Carbon accessibility status page](https://www.carbondesignsystem.com/building-blocks/core/components/overview/accessibility-status); [Carbon metrics workflows](https://github.com/carbon-design-system/carbon/tree/HEAD/.github/workflows); [Primer migration-status](https://github.com/primer/react/blob/main/.github/workflows/migration-status.yml)

**A: what stays with the app (DEV-OWNED)**

- **A1. Data** (fetching, caching, loading and error states wired from real APIs). The library exposes loading, empty and error *states* (P2). How they are triggered is the app's.
- **A2. State management and form logic**: react-hook-form schemas, validation rules, submission. The library only guarantees the seams (P6).
- **A3. Routing**: router choice, links and navigation guards. The library accepts a link component (P6).
- **A4. i18n plumbing**: the react-intl provider, message catalogues, locale and RTL switching. The library takes strings in and doesn't own copy (P6). Its built-in a11y strings, if any, are a JOINT question.
- **A5. Performance budgets and measurement** for real screens. The library reports its size (P11) and the app sets and enforces the budget. — [Primer ADR-016 shows app-level measurement](https://github.com/primer/react/blob/main/contributor-docs/adrs/adr-016-css.md)
- **A6. The consuming build**: bundler config, CSS import order relative to styled-components, SSR and hydration of the app, and the app's lint configuration (including whether to enable the library's preset, P7).
- **A7. Screen composition, page-level accessibility and app tests**: landmarks, heading order, focus across routes, E2E flows. Developers' agents compose from the manifest (P12) under the app's own review.
- **A8. The adoption decision and migration plan**: whether, when and where to import, the pilot screen, pace, and coexistence period. Usage tracking (Omlet/react-scanner) if they want it. — [Omlet](https://omlet.dev/blog/how-leaders-measure-design-system-adoption/) [background]; [react-scanner](https://github.com/moroshko/react-scanner); [Headway: snapshot publishing, adoption reports with conversations](https://www.headway.io/blog/the-design-system-adoption-problem-is-older-than-ai)

### Inferences
- Measured against the brief's description, govocal-ds already has parts of P1 (tokens-only governance tests), P2 (Playwright keyboard/focus), P12 (every component described, the Storybook MCP addon) and a story smoke test.
- The clearest shortfalls for an import decision:
  - P3: axe doesn't block.
  - P8 and P9: no package, semver or deprecation policy.
  - P5: no API file or developer sign-off.
  - P7: escape-hatch policy unknown.
  - P1: a token-*existence* check (not only no-raw-values).
  - P12: manifest versioning tied to a release.
  - P4: VRT was not listed.
  - P13 and P14: provenance and owners.
- Each shortfall can be closed by the design side without touching A1–A8. That is the alignment message: "we prove the library; you keep the app".
- The strongest single pre-import demonstration is a canary package plus one real back-office screen built by a *developer's* agent from the published manifest. Use the consuming stack (React 18, styled-components around it, react-intl strings, react-hook-form refs, the real router), then rerun the library's gates live: break a token, a label, a prop and a visual, and watch each fail. It exercises P1–P12 and A1–A7 at once.
- The tagging is my synthesis of the sources and the framing above. No exemplar publishes this exact design/dev split.

### Gaps
- No source measured which proof most moves developer willingness to import. That needs interviews or a survey of the consuming developers.
- React Aria's i18n behaviour (built-in localised strings for a11y labels) and its SSR specifics were not verified. A4 and P10 should be checked against whichever foundation the library uses.
- No published case was found of the exact model (designers own agent-built library code, a separate engineering team imports it) with outcomes.
