# The design side's contract: what design owns and delivers as owner of the component layer, and how it aligns with engineering (2025–2026)

**Framing, as corrected by the project lead mid-research:**
- Developers will **not** open Figma or Dev Mode.
- The design side (two designers working as front-of-the-front-end developers and system architects, with AI agents) **owns the Storybook and the component code and API**. Developers import the package and compose screens.
- Collaboration between the designers and the developers happens **in Storybook**. The project lead prototypes there from the system's components.
- So "design-owned" now covers the components, their API, layout primitives, the style-override policy, docs and tests. "Dev-owned" covers app integration (data, state, routing, i18n plumbing, performance, the consuming build) and the decision to adopt, and on what terms.
- Figma artefacts are optional inputs (§5).

Scope note: tokens (DTCG, naming tiers, linting, deprecation of tokens) and Storybook-as-docs mechanics (Code Connect, Storybook Connect, status badges, the "designers in the repo" zones, the Storybook MCP manifest) are covered in the sibling notes `tokens.md` and `designer_bible_and_language.md`. This file does not repeat them.

Source markers: **[snippet]** = taken from a search-result summary, page not fetched; **[background]** = older than 2025 or undated, used as origin only.

## 1. What developers say is missing or painful in what designers hand them

### Takeaway
Nearly everyone on both sides thinks handoff is broken (Figma: 91% of developers, 92% of designers). The gap is **intent**, not tooling:
- states and edge cases (empty, loading, error, permission, overflow) that were never designed;
- behaviour never written down;
- no line between what is a constraint and what is a preference.

Accessibility is the most measurable cost: GitHub reports that nearly half its audit issues were preventable with upfront intent. When design owns the component code, these gaps stop being "missing from the handoff" and become **the design side's own coding obligations**. Each state, edge case and behaviour must exist as a story and a test.

### Cited Findings
- "91% of developers and 92% of designers believe the handoff process could be improved"; "84% of designers say they collaborate with developers at least weekly" (Figma, 2025 Designer-Developer Trends Report) — [Figma: Design statistics](https://www.figma.com/resource-library/design-statistics/)
- The underlying survey is Figma's *State of the Designer 2025*: 493 product designers and 450 front-end developers in the US, Europe and APAC, surveyed in Q3 2024 **[snippet]** — [Figma State of the Designer 2025 (PDF)](https://static.figma.com/uploads/1b5e45f9a06ce51faceaae0a8669ced7b3e465dc)
- Designers do not see tools as the fix (CollabSoft 2025, as quoted by Figma): "39% of designers say the best way to improve collaboration is for designers and developers to learn each other's skills"; "28% believe that involving developers earlier in the design process would be the best solution"; "Only 13% believe that bridging the gap between tools would help" — [Figma: Design statistics](https://www.figma.com/resource-library/design-statistics/) (secondary: Figma quoting CollabSoft)
- "Nearly 48% of accessibility audit issues could have been prevented through better upfront documentation of design intent and WCAG considerations" — [GitHub Blog, Nov 2025](https://github.blog/enterprise-software/collaboration/level-up-design-to-code-collaboration-with-githubs-open-source-annotation-toolkit/)
- A 2026 handoff checklist (vendor blog, 29 Jul 2026, no survey data) lists what engineers need and usually don't get:
  - **states**: "Default, hover, focus, active, disabled, selected, loading, and error for every interactive element", "Error states with actual error copy";
  - **edge cases**: empty ("no data yet" vs "filter matched nothing"), loading (first load vs refresh), errors (network, server, validation, permission), overflow (long names, many items, deep nesting), permissions (hidden, disabled, or an upgrade path), offline/stale data, slow operations (10+ s);
  - **responsive**: "Behaviour between the breakpoints you drew", "Priority order when space runs out";
  - **content**: "Real copy rather than placeholder text", accessible names for icon-only controls;
  - **constraints vs preferences**: "The primary action must remain visible without scrolling" is a constraint; "This card has a twelve-pixel radius" is a preference.
  — [Storyflow: Design Handoff Checklist (2026)](https://storyflow.so/blog/design-handoff-checklist)
- Developers resist designer-built systems over maintenance and technical-debt fears ("maintenance nightmares… breaking existing functionality"), performance ("bundle sizes, load time"), implementation complexity ("significant codebase changes") and rigidity ("Rigid systems that can't handle real-world edge cases") — [Ciccarelli: Getting Developer Buy-In](https://www.carlociccarelli.com/post/getting-developer-buy-in-for-your-design-system-stop-fighting-start-collaborating) **[background: undated]**
- Translation expansion (IBM figures via W3C), average expansion from English: up to 10 chars 200–300%; 11–20 chars 180–200%; 21–30 chars 160–180%; 31–50 chars 140–160%; 51–70 chars 151–170%; over 70 chars 130% — [W3C i18n: Text size in translation](https://www.w3.org/International/articles/article-text-size) **[background]**
- zeroheight 2026: "design and dev still use different tools… there's still a gap"; only 29% have design-to-code automation and 6% sync code back to design — [zeroheight Design Systems Report 2026](https://report.zeroheight.com/2026)

### Inferences
- Under the reframe, the handoff problem largely disappears for visuals: developers import the component, they don't rebuild it from a picture. What remains are the four developer fears above. Each maps to a promise the design-owned package must make:
  - maintenance → versioning and deprecation (§2);
  - performance → bundle and render budgets;
  - complexity → drop-in, prop-based composition with no custom CSS;
  - rigidity → documented escape hatches and an edge-case matrix.
- The constraint vs preference split still matters: it tells developers what they may never override (§2, restricted overrides).

### Gaps
- I found no 2025–2026 *developer-side* survey (e.g. State of JS/CSS) quantifying what front-end developers find missing in design deliverables. "Pixel-perfect nitpicking" is anecdotal here.
- The Figma sample size comes from a search snippet; I did not open the PDF.

## 2. What owners of a design-owned component layer must promise developers: stable API, versioning, composition, layout primitives, restricted overrides

### Takeaway
Mature systems whose components are imported by product teams make **explicit promises**:
- statuses with API guarantees (Primer: experimental vs ready; breaking change = major version);
- SemVer that counts token renames, keyboard-behaviour changes and default changes as breaking;
- deprecation in a minor, removal in a major, with codemods;
- **layout primitives that own all spacing**, so screens need no custom CSS (Braid: "components should not provide surrounding white space"; Atlassian Box/Stack/Inline);
- **bounded style overrides**: Atlassian's xcss allows token values only and no nested selectors; React Spectrum S2's `styles` prop allows layout/spacing/sizing only, "colors and internal padding cannot be customized".

A further constraint from the developers' world: **styled-components entered maintenance mode in March 2025**, and GitHub's Primer dropped it in Oct 2025 as "end-of-life". A design-owned package should not depend on it, but must work for consumers who still use it.

### Cited Findings
**API status and stability promises**
- Primer component statuses:
  - **Experimental**: "proof-of-concept or is work in progress".
  - **Ready**: "significantly mature and usage is strongly encouraged"; "Breaking changes to these components will result in a major version bump in the component package".
  - **Deprecated**: "Documentation exists for the deprecation, including any alternative components" and "a warning is shown to the consumer".
  — [Primer: Component status](https://primer.style/guides/component-lifecycle)
- Primer's contributor lifecycle **[snippet]**: Alpha = "ready for preliminary usage with breaking changes expected". To reach Stable, "the API must remain stable with no breaking changes for at least one month" and "feedback on API usability must be sought from developers using the component" — [Primer: Component lifecycle (contribute)](https://primer.github.io/contribute/component-lifecycle/)
- What counts as breaking in a design system (course material, last modified 5 Mar 2026):
  - "If you rename a token, that's a breaking change. If you change the keyboard interaction pattern on a component, that's a breaking change";
  - also removing CSS variables or props, and changing accessibility behaviour;
  - "Any documented DOM or styling hooks that consuming teams are told they can rely on" are part of the public API;
  - "Deprecations should ship in a minor release and breaking removals require a major release";
  - "Ship codemods for the mechanical migrations and lint rules that flag deprecated tokens in CI";
  - with Changesets, "On merge, CI collects changesets → bumps versions → publishes → writes CHANGELOG".
  — [Steve Kinney: Versioning and Release Management](https://stevekinney.com/courses/enterprise-ui/versioning-and-release-management)
- Changing a default value (e.g. Button's default variant) is a breaking visual change for everyone relying on the default **[snippet; attribution among search results not verified]** — [search results incl. EightShapes: Versioning Design Systems](https://medium.com/eightshapes-llc/versioning-design-systems-48cceb5ace4d) **[background]**

**Composition and layout primitives (screens without custom CSS)**
- Braid (SEEK): "components should not provide surrounding white space. Instead, spacing between elements is owned entirely by layout components."
  - Layout components: Box, Stack, Inline, Columns, Spread, Tiles, ContentBlock, PageBlock, Page, Bleed.
  - Spacing only from a named scale (none, xxsmall … xxxlarge, plus a semantic `gutter`).
  - Responsive props such as `{ mobile: "small", tablet: "medium", desktop: "large" }`.
  — [Braid: Layout foundation](https://seek-oss.github.io/braid-design-system/foundations/layout/)
- Atlassian's composition order of preference:
  1. use components first ("easiest to create and maintain");
  2. use their customisation options (`<Button appearance="primary" spacing="compact">`, `<Box xcss={{ padding: 'space.100' }}>`);
  3. compose with primitives;
  4. only then build custom components on tokens.

  It discourages global/nested styles, shared style objects across files, `!important` and "brittle DOM-dependent selectors" — [Atlassian Design: Composition](https://atlassian.design/get-started/develop/composition/)
- Atlassian primitives: Box ("a generic container and provides managed access to design tokens"), Stack (vertical flex layout), Inline (horizontal flex layout). XCSS restricts "the majority of style attributes… to Atlassian Design Token based values" and "restricts nested selectors completely" **[snippet]** — [Atlassian: Primitives](https://atlassian.design/foundations/spacing/primitives); [Forge XCSS](https://developer.atlassian.com/platform/forge/ui-kit/components/xcss/)

**Restricted style overrides**
- React Spectrum S2: "The `styles` prop accepts a limited set of CSS properties, including layout, spacing, sizing, and positioning. Other styles such as colors and internal padding cannot be customized within Spectrum components." Custom components "that follow Spectrum styling" are built with "the `style` macro with React Aria Components" — [React Spectrum: Styling](https://react-spectrum.adobe.com/styling)
- `UNSAFE_className` is "strongly discouraged because it results in inconsistent UIs and hard to maintain code"; style-macro classes passed to it are a TypeScript error, since it is appended rather than merged **[snippet]** — [React Spectrum: Styling](https://react-spectrum.adobe.com/styling)

**The styling-technology constraint developers face**
- styled-components entered maintenance mode. The co-creator posted "styled-components is entering maintenance mode" — [X post](https://x.com/mxstbr/status/1908201327811059926) **[snippet]**. Secondary sources date the maintainer's announcement to 17 Mar 2025: no new features, critical fixes only, no adaptation to React Server Components, and the maintainer no longer suggests it for new projects **[snippet]** — [Medium summary](https://medium.com/@dgupta.jit/styled-components-in-maintenance-mode-what-react-js-and-frontend-developers-need-to-know-84231869b209); a vendor maintains a faster fork — [Sanity blog](https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort) **[snippet]**
- Primer React v38 (27 Oct 2025) removed "end-of-life library styled-components":
  - "The `sx` prop is no longer supported. You can style components by providing a `className` and using CSS Modules";
  - "Support for theming in JavaScript has been removed";
  - it recommends "CSS modules over `styled-components` and css variables over javascript theming";
  - stated benefit: it "reduces JavaScript bundle sizes and enhances both client and server-side rendering performance";
  - migration: a "Migrating to CSS variables compatibility guide".
  — [primer/react Discussion #7086](https://github.com/primer/react/discussions/7086)

**The front-of-front-end / back-of-front-end split (the ownership line)**
- A front-of-the-front-end developer writes "HTML, CSS, and presentational JavaScript"; a back-of-the-front-end developer writes "JavaScript code necessary to make a web application function properly". One "determines the look and feel of a button", the other "what happens when that button is clicked". At the product layer, "business logic, routing, state management, and cache invalidation come into play" **[snippet]** — [Brad Frost: Front-of-the-front-end and back-of-the-front-end](https://bradfrost.com/blog/post/front-of-the-front-end-and-back-of-the-front-end-web-development/) **[background, 2019]**; "smart components" wrap the "dumb design system components and recipes… in logic" for product teams **[snippet]** — [Brad Frost: The Design System Ecosystem](https://bradfrost.com/blog/post/the-design-system-ecosystem/) **[background]**

### Inferences
- **The four promises the design side must publish** (each answers one developer fear from §1):
  1. **Stability**: per-component status with an API guarantee; SemVer that names visual defaults, keyboard behaviour, token names and documented CSS variables as API; deprecate in a minor, remove in a major; a codemod or migration note for each break; a changelog per release.
  2. **Composition without CSS**: layout primitives own spacing; components have no outer margin; a screen built only from primitives and components needs zero custom CSS.
  3. **Bounded overrides**: a small, typed escape hatch (layout/size/position only, token values only), with colour, type and internal padding locked. That is how "design controls the visual language" while developers keep layout freedom.
  4. **Performance and integration budgets**: bundle size, no runtime CSS-in-JS dependency, SSR-safe.
- **The styled-components fact is the single most useful developer constraint to show awareness of.** A package styled with plain CSS / CSS custom properties (tokens) works when imported into a styled-components app. It also survives that app's eventual migration off styled-components. This is the same direction Primer took. The consumer's own screens can keep using styled-components until engineering decides otherwise.
- **The ownership line** follows Frost's split: design owns the "dumb" presentational components, primitives and their behaviour (focus, keyboard, ARIA, states). Engineering owns the "smart" layer: data fetching, form state wiring, routing, i18n plumbing (message catalogues, locale switching), performance budgets in the app, the build, and the adoption decision.
- Stack-specific interface points the design side should make easy, without deciding (inference; not verified against those libraries' docs in this research):
  - **i18n**: components accept every visible string as a prop or children, with no hard-coded copy, so react-intl stays the developers' choice.
  - **Forms**: form fields forward refs and expose controlled/uncontrolled values plus `invalid`/`errorMessage`, so a form library such as react-hook-form can wire them.
  - **RTL**: components honour `dir` and use logical CSS properties.

### Gaps
- I found no 2025–2026 public policy that states *visual* changes (e.g. a colour or radius change through tokens) are or aren't breaking. Systems differ, and the course material only treats "documented" hooks as API.
- I did not verify the primary styled-components maintainer announcement (GitHub/blog); the date comes from secondary sources.
- I did not verify react-hook-form's or react-intl's exact integration requirements.

## 3. Which artefacts are implementation-agnostic and most valued (and their Storybook-native form)

### Takeaway
What survives a change of library or styling technology is **data and rules**:
- tokens (sibling note);
- a component spec: anatomy, props, states matrix;
- behaviour named by an ARIA APG pattern;
- accessibility acceptance criteria mapped to WCAG and **tagged by who is responsible** (NL Design System: Design / Development / Content);
- i18n rules: text expansion, RTL mirroring, character limits;
- content rules for states;
- a decision/evidence log.

In a design-owned Storybook, each becomes a docs block, a set of stories, or a test.

### Cited Findings
- Material 3 publishes a **Specs** tab per component, with numbered anatomy and measurements. For Tabs, primary tabs have 6 elements (container, badge, icon, label, divider, active indicator), with heights of 48dp (label only) or 64dp (icon + label) and an active indicator of 3dp (primary) / 2dp (secondary) with a 24dp minimum length **[snippet]** — [M3 Tabs specs](https://m3.material.io/components/tabs/specs)
- Adobe keeps "the canonical Spectrum dataset — tokens, components, fields, mode-sets, guidelines, and registry data", with component schemas as "JSON schemas for validating Spectrum component APIs and properties", and an MCP server for AI assistants — [adobe/spectrum-design-data](https://github.com/adobe/spectrum-design-data). Implementation mappings live in platform manifests under `extensions/implementations/` **[snippet]** — [design-data-spec 4.3.0](https://github.com/adobe/spectrum-design-data/releases/tag/%40adobe/design-data-spec%404.3.0)
- The WAI-ARIA APG gives named patterns (Accordion, Alert, Alert Dialog, Breadcrumb, Button, Carousel, Checkbox, Combobox, Dialog (Modal), Disclosure, Feed, Grid, Landmarks, Link, Listbox, Menu/Menubar, Menu Button, Meter, Radio Group, Slider, Spinbutton, Switch, Table, Tabs, Toolbar, Tooltip, Tree View, Treegrid, Window Splitter…) — [W3C APG: Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/). Its caveats: "No ARIA is better than bad ARIA"; a role is a promise of keyboard behaviour; "Testing assistive technology interoperability is essential before using code from this guide in production"; no standard touch patterns — [APG: Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)
- NL Design System writes per-component `acceptance-criteria.md`. Each criterion carries a WCAG success criterion, a priority (Must/Could) and a **responsibility tag** (Design, Development, Design/Development, Content). Example, Form Field Error Message:
  - "no specific variants needed" (Design);
  - content "always has an id" (Development, 1.3.1);
  - "Don't use tabindex" (2.1.1);
  - "visible/accessible only when there is an error" (Design/Development, 3.3.1);
  - optional role="alert" (4.1.3);
  - text spacing (1.4.12);
  - forced-colors currentColor (1.4.11);
  - a separate API section (BEM classes, React props) tagged Development.
  — [NL DS acceptance-criteria.md](https://raw.githubusercontent.com/nl-design-system/candidate/main/packages/docs/form-field-error-message-docs/docs/acceptance-criteria.md)
- NL DS splits criteria into "the component itself" (its own semantics/roles/attributes and base-theme CSS) and "in context". The process: review community implementations and audit reports, write both sets, propose accessible HTML semantics, open a docs PR **[snippet]** — [NL DS candidate issue #1455](https://github.com/nl-design-system/candidate/issues/1455)
- Carbon's empty-state types:
  - **no data** (first use);
  - **user action** (e.g. a search with no matches);
  - **error management** ("data exists but cannot be displayed due to permissions, systems issues, or required configuration");
  - **starter content**.

  Anatomy: optional image, title, body, primary action, secondary link. Copy: "Keep words to a minimum", "Use direct, plain language". Tables: the empty state "should replace the element that would ordinarily show", and "column headers and footer should not be present" — [Carbon: Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- GOV.UK Character count is a *content limit as a design rule*. Use it only "when there is a good reason for limiting the number of characters". It "does not restrict the user from entering information… [they] are told they've entered too many characters". The count can appear from "75% of the limit or more", and a screen-reader double-announcement was fixed — [GOV.UK: Character count](https://design-system.service.gov.uk/components/character-count/)
- W3C: "Allow text to reflow and avoid small fixed-width containers"; "Separate presentation and content"; allow vertical room for Thai, Arabic, Japanese — [W3C i18n: Text size](https://www.w3.org/International/articles/article-text-size) **[background]**
- Material bidirectionality: mirror the layout, padding and directional icons (back/forward, send); do **not** mirror non-directional icons, numbers, clocks, clockwise refresh/progress, or charts; "mirror the meaning of a component, not its pixels" **[snippet; summary mixes M2/M3]** — [M3: Bidirectionality & RTL](https://m3.material.io/foundations/layout/bidirectionality-rtl); [Wikimedia Codex: Bidirectionality](https://doc.wikimedia.org/codex/v1.9.0/style-guide/bidirectionality.html) **[snippet]**
- The Open UI Component Name Matrix cross-references names across 30+ design systems and frameworks; "Convergence is indicated by color and percentage" — [Open UI: Component Name Matrix](https://open-ui.org/research/component-matrix/)
- GOV.UK component pages carry "Research on this component", "Known issues and gaps", "Services using this component", "Next steps", "Recent changes" and "Help improve this component" — [GOV.UK: Character count](https://design-system.service.gov.uk/components/character-count/)

### Inferences
- The NL DS **responsibility tag** is the cleanest found way to write "our side vs your side". Under the reframe, design owns the Design and Content rows *and* most Development rows inside the component (element choice, ARIA, keyboard). The rows about the component *in context* (in a real form with real data and validation) are shared with the developers who wire it.
- An "APG pattern" field per component gives any future re-implementation (if engineering swaps React Aria) a library-neutral behaviour target.
- For multilingual, per-city content: the expansion table gives a checkable budget (≤10-char labels need ×2–3 room), and a mirror/don't-mirror icon list is a small, high-value RTL deliverable.

### Gaps
- No 2025–2026 source found on motion/interaction specs (durations, easings, reduced motion) as a deliverable.
- The M3 pages are JavaScript-rendered and were not fetched; their content comes from snippets.

## 4. Exemplars of "one design spec, several implementations", and how they write the spec layer

### Takeaway
The strongest public-sector exemplars put the contract in **guidance + HTML/CSS + tokens** and treat framework packages as replaceable:
- **Designsystemet** (Norway): CSS + tokens shared; React rebuilt on a framework-agnostic web package in Feb 2026.
- **NL Design System**: shared specs and acceptance criteria; competing implementations allowed until one is proven in two organisations.
- **GOV.UK**: guidance + reference HTML/Nunjucks; community React ports, one of them in styled-components.

Adobe goes furthest towards machine-readable specs. For govocal-ds this means: if engineering later swaps React Aria or the styling layer, the tokens + CSS + behaviour rules + stories survive.

### Cited Findings
- **Designsystemet** (23 Feb 2026): `@digdir/designsystemet-web` gives "all the benefits of Designsystemet without having to commit to React as a technology choice". React "is built on the web package" with "no breaking changes". The web package uses "pure web-standard HTML and CSS" plus minimal JS. The motive: let older applications benefit "without major rewrites" — [Designsystemet blog](https://designsystemet.no/en/blog/designsystemet-web-release). Packages: a theme CLI that creates CSS and tokens from a config file, plus `-web` and `-react`. Tokens are theme-based, set through a Theme Builder, with modes (light/dark/contrast) **[snippet]** — [digdir/designsystemet](https://github.com/digdir/designsystemet)
- **NL Design System** Estafette model:
  - Help Wanted: rationale clear, no implementation.
  - Community: "one or more places", including "competing versions of the same component".
  - Candidate: a "proposal… without controversial parts".
  - Hall of Fame: in production in ≥2 organisations, full a11y audit, semver.
  - Each status has its own Definition of Done.
  — [NL DS: Estafettemodel](https://nldesignsystem.nl/handboek/estafettemodel/)
- NL DS issue #1307 (closed 16 Sep 2026) settled implementation questions publicly: id/role="alert" go on the content element via `contentId`/`contentRole`, and the live region must be in the DOM before an error — [NL DS candidate #1307](https://github.com/nl-design-system/candidate/issues/1307)
- **GOV.UK** shows code as HTML and Nunjucks — [Character count](https://design-system.service.gov.uk/components/character-count/). Community ports:
  - `govuk-react`, "an implementation of the GOV.UK Design System in React using CSSinJS" (styled-components) — [govuk-react](https://github.com/govuk-react/govuk-react) **[snippet]**;
  - NotGovUK — [not-gov.uk](https://not-gov.uk/) **[snippet]**;
  - LandRegistry components output "identical markup structure to Nunjucks macros" — [LandRegistry](https://github.com/LandRegistry/govuk-react-components) **[snippet]**;
  - `govuk-react-jsx` was archived 25 Apr 2024 — [surevine/govuk-react-jsx](https://github.com/surevine/govuk-react-jsx) **[snippet]**.
- **IBM Carbon** lists React (`@carbon/react`) and Web Components among its implementations, for "consistent markup, styles, and behavior" — [Carbon: Frameworks](https://carbondesignsystem.com/developing/frameworks/)
- **Fluent 2**: design assets are "the source of truth for Fluent and Copilot design styling decisions", and its kits "map to the code libraries" for web, iOS and Android **[snippet]** — [Fluent 2: Get started (design)](https://fluent2.microsoft.design/get-started/design)
- **Adobe Spectrum**: React Spectrum S2 is built on React Aria Components, and custom Spectrum-styled components use "the `style` macro with React Aria Components" — [React Spectrum: Styling](https://react-spectrum.adobe.com/styling)

### Inferences
- Designsystemet is the closest analogue to "React Aria may be dropped, and that is fine": the shared layer is CSS + tokens + behaviour, and the framework package can be rebuilt without breaking consumers.
- NL DS is the model for a civic, multi-organisation, multi-brand context: shared spec and criteria, with implementations that compete and then converge.

### Gaps
- SAP Fiori guidelines and Salesforce SLDS blueprints were not researched (budget).
- The Carbon frameworks page as fetched did not separate core-maintained from community-maintained implementations.

## 5. Delivering the contract through Storybook (not Figma), and marking fixed vs replaceable

### Takeaway
Storybook 9+ makes the contract **executable**:
- **interaction tests** in play functions that query by accessible role and label (they act as behaviour specs);
- **axe accessibility tests** per story, failing CI when `a11y.test: 'error'` (axe catches "up to 57% of WCAG issues", so manual notes are still needed);
- docs pages for anatomy, criteria and rules;
- review on preview deploys (sibling note: Chromatic UI Review).

No exemplar labels "fixed design decision" vs "replaceable reference implementation" on one page. The exemplars separate the layers structurally instead: NL DS responsibility tags, Designsystemet's CSS/framework split, APG pattern vs example, Spectrum's schema vs implementation mapping. Figma artefacts (Dev Mode, a11y annotation kits) become optional inputs.

### Cited Findings
**Storybook-native equivalents**
- Interaction tests: "use a play function to simulate user behavior like clicks, typing, and submitting a form and then assert on the end result". Query priority follows Testing Library: "ByRole — Find elements by their accessible role" first, then label text; "using data-testid should be a last resort". Tests run "In the Storybook UI, In your editor, Via the CLI, In CI environments" — [Storybook: Interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing)
- The Vitest addon "transforms your stories into component tests… in a real browser environment" (Playwright Chromium). Every story gets a smoke render test plus its play-function assertions **[snippet]** — [Storybook: Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon); Storybook 9 (June 2025) made accessibility checks across every story part of this testing overhaul **[snippet]** — [AlternativeTo news](https://alternativeto.net/news/2025/6/storybook-9-debuts-revamped-testing-with-vitest-leaner-core-and-accessibility-tools)
- Accessibility tests use axe-core, which can catch "up to 57% of WCAG issues".
  - `parameters.a11y.test`: `'error'` ("violations return a failing test in the Storybook UI and CLI/CI"), `'todo'` (warning in the UI only; "no accessibility-related errors, warnings, or output in CI"), `'off'`.
  - "Incomplete" results "should be confirmed manually".
  — [Storybook: Accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- Review on preview deploys with designer/stakeholder sign-off (Chromatic UI Review), the Storybook MCP components manifest, and status badges: see sibling note `designer_bible_and_language.md` §3.

**Structural separation of contract and implementation (precedents)**
- NL DS criteria carry Design / Development / Content responsibility per row, with a separate API section — [NL DS acceptance-criteria.md](https://raw.githubusercontent.com/nl-design-system/candidate/main/packages/docs/form-field-error-message-docs/docs/acceptance-criteria.md)
- APG separates patterns from examples that need AT testing "before using code from this guide in production" — [APG: Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)
- Designsystemet: "the web package can be used independently of the CSS package"; React is one implementation on top — [Designsystemet blog](https://designsystemet.no/en/blog/designsystemet-web-release)
- Spectrum keeps implementation mappings beside, not inside, the component schema **[snippet]** — [design-data-spec 4.3.0](https://github.com/adobe/spectrum-design-data/releases/tag/%40adobe/design-data-spec%404.3.0)

**Figma as an optional input (down-weighted: developers won't open it)**
- If the design side keeps a Figma library and syncs it with Storybook, Dev Mode provides:
  - variables with code syntax **[snippet]** — [Figma: Guide to Dev Mode](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode);
  - layer-attached annotations that update with the design **[snippet]** — [Figma blog: Dev Mode](https://www.figma.com/blog/dev-mode-ga/);
  - Ready for dev / Completed statuses with an automatic "Changed" state **[snippet]** — [Figma: Dev Mode statuses](https://help.figma.com/hc/en-us/articles/26781702258583-Dev-Mode-statuses-and-notifications).

  The EightShapes Specs plugin generates anatomy/props/spacing sheets that show token names **[snippet]** — [EightShapes Specs](https://nathanacurtis.substack.com/p/the-eightshapes-specs-figma-plugin-2892f21adc96). Open a11y annotation kits: GitHub's Annotation Toolkit (open-sourced 22 Sep 2025), a fork of CVS Health's Web Accessibility Annotation Kit **[lineage: snippet]** — [GitHub Changelog](https://github.blog/changelog/2025-09-22-open-sourcing-the-github-annotation-toolkit/); [github/annotation-toolkit](https://github.com/github/annotation-toolkit/)

### Inferences
- **The Storybook-native forms of each Figma-era artefact:**

  | Figma-era artefact | Storybook-native form |
  |---|---|
  | a11y annotation kit | a docs block per component: headings, landmarks, focus order, accessible names, plus the NL-DS-style criteria table |
  | behaviour spec | a play function per APG keyboard row (Tab/Arrow/Escape/Enter), querying by role and name |
  | states matrix | a story per state, smoke-tested |
  | design QA | review on the PR's preview deploy, with visual diffs |
  | Dev Mode "Changed" | the changelog + changeset per PR |

- Because axe covers only part of WCAG, the docs should list what axe cannot check (focus order makes sense, names are meaningful, reflow at 400%) as manual criteria with an owner.
- **One way to mark fixed vs replaceable** on each component page:
  1. a **Design contract** block (fixed): anatomy, token slots, states, APG pattern + keyboard table, criteria tagged Design/Content, i18n/RTL rules, copy rules, the "Must" constraints;
  2. a **Package API** block (versioned promise): props, slots, the override surface, status;
  3. an **Implementation notes** block (replaceable): React Aria today, how it's styled, known limits, and **Open questions for engineering**.

  Storybook tags (e.g. `contract`, `reference`) can make the split visible in the sidebar.
- Interaction tests that query by role and label double as a re-implementation check: if engineering swaps the underlying library, the same play functions must still pass.

### Gaps
- No public Storybook was found that explicitly labels design-contract vs reference-implementation content. That labelling would be a govocal-ds innovation built from the NL DS, Designsystemet and APG precedents.
- I found no source on how well Testing Library role queries stand in for a written keyboard spec (e.g. focus-trap or roving-tabindex checks), beyond Storybook's own docs.

## 6. Alignment: team models, RFCs, pilots, adoption data, and what stays developer-owned

### Takeaway
Adoption, not quality, is the hard part:
- adoption has topped zeroheight's challenge list five years running;
- buy-in satisfaction fell from 42% to 32%;
- stalled systems blame missing mandate and governance.

Lightweight, engineering-familiar processes exist: Carbon's public RFCs (champion, 3-day final comment period), Primer's "seek feedback from developers before Stable", and NL DS's relay model. The recurring advice: a small pilot built *with* developers, engineering metrics, and an explicit line where design's ownership ends (presentation and behaviour) and engineering's begins (data, state, routing, i18n plumbing, performance, build, the adoption decision).

### Cited Findings
- zeroheight 2026 (5th edition, 147 practitioners):
  - Challenges: "Driving adoption and raising awareness top the list of biggest challenges" (fifth year); then resourcing 56%, prioritising updates 35%, stakeholder buy-in 31%, consistency 31%.
  - Ownership: centralised 51%, hybrid 31%, federated 13%. Understaffed: 53% / 68% / 74%.
  - Adoption: fully 7%, widely 31%, moderately 38%, minimally 22%. Buy-in satisfaction "dropped… from 42% to just 32%".
  - Code libraries: 78% of systems have one; satisfaction with component use in code 54%.
  - AI: 10% built into processes, 46% experimenting; satisfaction 28% positive, 52% neutral.
  - Metrics: adoption 41%, use in code 38%, a11y 36%, dev speed 31%; ROI tracked by 5%.
  — [zeroheight 2026](https://report.zeroheight.com/2026)
- As quoted from zeroheight 2026 by a secondary source: 93% have foundations, but only 56% have documented UX patterns; 55% of stalled systems blame weak governance and 73% point to a lack of company mandate — [DesignRush/ANML, 20 Jul 2026](https://news.designrush.com/design-system-adoption-sequencing) (secondary). The same article's three pre-build questions: "What does this product need to be consistent about, no matter who builds the screen?"; "Who can close a design debate when two reasonable people disagree?"; "What happens to a component six months from now, when it stops matching how the product works?" — [DesignRush/ANML](https://news.designrush.com/design-system-adoption-sequencing)
- Carbon RFCs cover "substantial" changes, e.g. "A new feature that creates new API surface area", removals, "new idiomatic usage or conventions", but not refactors "invisible to users-of-Carbon". The flow: template PR → consensus → "core team champion" → weekly review → 3-day "final comment period" → merge — [carbon-design-system/rfcs](https://github.com/carbon-design-system/rfcs); Norton runs a similar RFC repo **[snippet]** — [wwnorton/design-system-rfcs](https://github.com/wwnorton/design-system-rfcs)
- Primer requires that "feedback on API usability must be sought from developers using the component" before Stable **[snippet]** — [Primer: Component lifecycle](https://primer.github.io/contribute/component-lifecycle/)
- Pilot and governance advice (undated):
  - "3-5 essential components with developer input" and "willing teams as test cases";
  - "component workshops where designers and developers build together";
  - measure "build time improvements, bundle size reductions, bug report decreases, and developer satisfaction scores";
  - build "form components that handle validation, error states, and accessibility automatically".

  Its claim that Carbon "achieved a 2,600% ROI" is unsourced in the article — [Ciccarelli](https://www.carlociccarelli.com/post/getting-developer-buy-in-for-your-design-system-stop-fighting-start-collaborating) **[background]**
- "When a system is built with teams… adoption isn't a behavior change but a continuation of work they already own" **[snippet; attribution not verified]** — [Headway](https://www.headway.io/blog/the-design-system-adoption-problem-is-older-than-ai)
- NL DS allows "competing versions of the same component" until a consolidated Candidate "without controversial parts" — [NL DS Estafettemodel](https://nldesignsystem.nl/handboek/estafettemodel/)
- Ownership line: presentation and behaviour ("look and feel of a button") vs application logic ("what happens when that button is clicked"; "business logic, routing, state management, and cache invalidation") **[snippet]** — [Brad Frost](https://bradfrost.com/blog/post/front-of-the-front-end-and-back-of-the-front-end-web-development/) **[background]**

### Inferences
- **The proposal should be an RFC per component**, in Carbon's shape:
  - what design decided and why (fixed);
  - the proposed package API (open to developer amendment, as Primer requires before Stable);
  - open questions only engineering can answer, e.g.:
    - consume tokens as CSS variables inside styled-components, or move to CSS Modules as Primer did;
    - keep React Aria or wrap the in-house library;
    - SSR needs;
    - how the package is versioned and released into the app build.
- **What stays developer-owned**, stated plainly in the proposal:
  - data and state, routing, form wiring, the i18n plumbing (catalogues, locale switching), performance in the app, the consuming build and bundling;
  - code review rights on the package (CODEOWNERS; sibling note);
  - the go/no-go on adoption and its terms (which components, which screens first, what version promise).
- **A pilot** in NL DS terms: one back-office screen (table + filters + empty/error states) and one citizen screen (RTL + long translations + city theme), built only from package components and primitives with zero custom CSS. That is the "Candidate → proven" step and a concrete answer to the skepticism about AI-built quality.
- Given low AI satisfaction (28%), lead with mechanical evidence: tests passing, a11y `error` mode on, token coverage, bundle size, a changelog. Quality claims alone won't do it.

### Gaps
- I found no well-documented 2025–2026 case of a named engineering org rejecting a design-led system, with its reasons. The reasons above come from practitioner blogs.
- No data compares "design owns the component code" with engineering-owned libraries on adoption. zeroheight splits by centralised/hybrid/federated, not by discipline.
- I found no 2025–2026 case study of designers (not design engineers) owning a production React component package that developers import. The 2026 hybrid-role growth (8%, from 3%) is the nearest data point — [zeroheight 2026](https://report.zeroheight.com/2026).

## 7. The design-owned deliverables list (what, why developers value it, exemplar, done-check)

### Takeaway
Under the reframe, the design side delivers a **versioned component package plus its Storybook contract**. The 16 deliverables below are each checkable and each answers a stated developer fear (maintenance, performance, complexity, rigidity) or a common gap (states, edge cases, a11y, i18n). None decides an engineering strategy question; those go in each component's open questions.

### Cited Findings
(Sources for each item are cited in §1–§6; exemplar URLs are pages listed there.)

### Inferences
1. **Versioned package with a stability promise**: per-component status (experimental / ready / deprecated); SemVer that counts token renames, documented CSS variables, defaults and keyboard behaviour as API; deprecate in a minor, remove in a major; changesets → CHANGELOG. *Why:* it answers the "maintenance nightmare" fear. *Exemplar:* [Primer: Component status](https://primer.style/guides/component-lifecycle); [Kinney: Versioning](https://stevekinney.com/courses/enterprise-ui/versioning-and-release-management). *Done when:* every component page shows a status; every PR carries a changeset; no breaking change ships outside a major; each break has a migration note or codemod.
2. **Layout primitives that own all spacing** (Box, Stack, Inline, Columns/Grid, page containers) on the token scale; components have no outer margin. *Why:* screens are composed with no custom CSS, so the visual language holds without policing. *Exemplar:* [Braid: Layout](https://seek-oss.github.io/braid-design-system/foundations/layout/); [Atlassian: Composition](https://atlassian.design/get-started/develop/composition/). *Done when:* a reference back-office screen and a citizen screen are built in Storybook from primitives and components with zero custom CSS.
3. **A bounded override surface**: a typed escape hatch for layout/size/position only, token values only; colour, typography and internal padding locked; no global/nested selectors. *Why:* developers keep layout freedom, design keeps the language. *Exemplar:* [React Spectrum: Styling](https://react-spectrum.adobe.com/styling); [Atlassian XCSS](https://developer.atlassian.com/platform/forge/ui-kit/components/xcss/). *Done when:* the type system rejects colour/padding overrides, and the docs list exactly what can be overridden.
4. **Styling-technology neutrality and integration notes**: components styled with CSS + CSS custom properties (no runtime CSS-in-JS dependency), working inside a styled-components app; SSR-safe; a published bundle-size budget. *Why:* styled-components is in maintenance mode, and Primer left it for bundle and SSR performance; developers keep their own migration timeline. *Exemplar:* [Primer v38](https://github.com/primer/react/discussions/7086); [Designsystemet web](https://designsystemet.no/en/blog/designsystemet-web-release). *Done when:* a sample styled-components consumer renders the package, the bundle size is reported per release, and tokens are exposed as CSS variables.
5. **Token source + theme (brand-slot) contract** for per-city branding: which tokens a city may set, their allowed ranges, required contrast pairs, and what is fixed. *Why:* one theming API instead of ad-hoc overrides. *Exemplar:* [digdir/designsystemet](https://github.com/digdir/designsystemet) theme CLI; see `tokens.md`. *Done when:* the slot list is published, two contrasting city themes render in Storybook, and contrast checks pass for allowed values.
6. **Component inventory mapped to the existing codebase** (in-house component → package component, usages, map/merge/retire/keep, migration effort, Open UI name). *Why:* it shows the migration cost honestly, in engineering's terms. *Exemplar:* [Open UI Component Name Matrix](https://open-ui.org/research/component-matrix/) (no public old→new exemplar found). *Done when:* every in-house component has a target and usage counts from the repo.
7. **Component API docs**: props table with descriptions and allowed values, slots/children, controlled vs uncontrolled, ref forwarding, every visible string as a prop (no hard-coded copy). *Why:* developers wire data, forms and i18n without reading the source. *Exemplar:* [NL DS criteria API section](https://raw.githubusercontent.com/nl-design-system/candidate/main/packages/docs/form-field-error-message-docs/docs/acceptance-criteria.md); [Spectrum component schemas](https://github.com/adobe/spectrum-design-data). *Done when:* every prop is typed and documented, and the Storybook components manifest has no undocumented props (sibling note).
8. **States and edge-case stories**: default/hover/focus/active/disabled/read-only/selected/loading (first load vs refresh)/error (network, server, validation, permission)/empty (Carbon's four types)/success; data extremes 0, 1, 10,000; long text; slow and offline. *Why:* this is where implementations diverge. *Exemplar:* [Carbon empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/); [Storyflow checklist](https://storyflow.so/blog/design-handoff-checklist). *Done when:* the matrix is complete per component (or marked not applicable) and each cell is a smoke-tested story.
9. **Behaviour as tests**: the APG pattern named per component, a keyboard table in the docs, and a play function per keyboard/focus row, querying by role and name. *Why:* executable behaviour that survives a library swap. *Exemplar:* [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/); [Storybook interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing). *Done when:* every interactive component cites a pattern, every keyboard row has a passing play function, and there are no `data-testid` queries.
10. **Accessibility acceptance criteria + automated gate**: an NL-DS-style table (WCAG SC, Must/Could, owner Design/Development/Content, component vs in-context); axe with `a11y.test: 'error'` in CI; manual items listed. *Why:* the 48%-preventable figure; axe catches only up to 57%. *Exemplar:* [NL DS acceptance-criteria.md](https://raw.githubusercontent.com/nl-design-system/candidate/main/packages/docs/form-field-error-message-docs/docs/acceptance-criteria.md); [Storybook a11y tests](https://storybook.js.org/docs/writing-tests/accessibility-testing). *Done when:* no story is on `'todo'` or `'off'` without a written reason, and every criterion has an owner and a status.
11. **Internationalisation and RTL stories**: expansion budgets (×2–3 for ≤10 chars), no fixed-width text, logical CSS properties, a mirror/don't-mirror icon list, a pseudo-localised story and an RTL story per component. *Why:* many languages per city, plus RTL locales. *Exemplar:* [W3C text size](https://www.w3.org/International/articles/article-text-size); [M3 Bidirectionality](https://m3.material.io/foundations/layout/bidirectionality-rtl). *Done when:* both stories exist per component, show no clipping or overlap, and the icon list is published.
12. **Content and copy rules per component**: real copy in stories, error-message and empty-state copy patterns, character limits and over-limit behaviour. *Why:* "Error states with actual error copy" is a top gap; limits are design decisions. *Exemplar:* [GOV.UK Character count](https://design-system.service.gov.uk/components/character-count/); [Carbon empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/). *Done when:* there is no placeholder copy in any story, and every limited field documents its limit and behaviour.
13. **Composition docs and page recipes**: how to build common screens (table + filters + bulk actions, form with validation summary, builder, dashboard card grid, citizen page) from components and primitives, with the order of preference (component → its options → primitives → tokens). *Why:* developers compose with confidence, and the junior owner sees the gaps that need new components. *Exemplar:* [Atlassian: Composition](https://atlassian.design/get-started/develop/composition/). *Done when:* each recipe is a story, uses no custom CSS, and is linked from the components it uses.
14. **Constraints vs preferences per component** (the "Must" list) + review on preview deploys. *Why:* it ends nitpicking; developers know what is non-negotiable. *Exemplar:* [Storyflow constraint/preference examples](https://storyflow.so/blog/design-handoff-checklist); review flow in sibling note §3. *Done when:* each component lists ≤5 Musts, and every package PR gets a preview deploy reviewed by a designer *and* a developer.
15. **RFC-shaped decision log + open engineering questions** per component: rationale and research (fixed), proposed API (amendable by developers before "ready"), open questions engineering decides, known issues. *Why:* the proposal asks instead of deciding; engineering keeps strategic calls. *Exemplar:* [Carbon RFCs](https://github.com/carbon-design-system/rfcs); [GOV.UK Research/Known issues sections](https://design-system.service.gov.uk/components/character-count/); [NL DS #1307](https://github.com/nl-design-system/candidate/issues/1307). *Done when:* each page has dated decisions and an "Open questions for engineering" list, and a component can't move to ready until developers have signed its API.
16. **A stated ownership boundary**: one page saying what design owns (presentation, behaviour, a11y inside the component, tokens, primitives, docs, tests, versioning) and what developers own (data, state, routing, form wiring, i18n plumbing, app performance, the consuming build, code review rights, the adoption decision and its terms). *Why:* it answers "overstepping" before it is raised. *Exemplar:* [Brad Frost front/back of the front end](https://bradfrost.com/blog/post/front-of-the-front-end-and-back-of-the-front-end-web-development/) **[background]**; [NL DS responsibility tags](https://raw.githubusercontent.com/nl-design-system/candidate/main/packages/docs/form-field-error-message-docs/docs/acceptance-criteria.md). *Done when:* the page is published in Storybook and developers have commented on or accepted it.

Optional: a **machine-readable component contract** (JSON schema per component: props, allowed values, slots), modelled on [Spectrum component schemas](https://github.com/adobe/spectrum-design-data). It is useful for AI agents composing screens (the "more roles build with AI" goal) and for validating a future re-implementation. *Done when:* the schema validates against the Storybook components manifest in CI.

### Gaps
- No 2025–2026 source ranks these deliverables by developer value. The ordering and done-checks are synthesis from the cited exemplars.
- No public exemplar was found of an old→new component inventory for a migration (item 6).
- Motion specs, and the exact integration needs of react-intl and react-hook-form, were not verified in this research.
