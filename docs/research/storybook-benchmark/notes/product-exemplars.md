# Product-company Storybook exemplars for a B2B / back-office design system (live state, 29 Oct 2026)

Method: every Storybook below was probed live on 29 Oct 2026 by downloading its `index.json` (the full sidebar tree: entry/story/docs counts, titles, tags) and `project.json` (Storybook version, addons, build date `generatedAt`). Toolbar, theming and RTL facts come from each repo's `.storybook/preview.*` file read through the GitHub API. Per-component docs anatomy comes from the MDX source behind each docs page, because the docs pages are rendered by JavaScript and a fetcher cannot read them. "Built" = the `generatedAt` date of the live build. Story and docs counts are `index.json` entries.

Tagging, per the brief's addendum. **[DESIGN-OWNED]** = a practice that works whatever stack developers choose: token definitions and naming, states, behaviour specs, content rules, lifecycle labels, IA, Figma hygiene, docs. **[DEV-OWNED]** = an implementation decision: the component library, styling technology, test runner, packaging, Storybook addons/builder. A Storybook *addon* that only shows a design-owned artefact (for example a Figma panel) is tagged by what it shows. The choice of addon stays a dev call.

## Ranked catalogue: which public product-company Storybooks are the exemplars, and are they live?

### Takeaway
Seventeen product-company Storybooks were verified live. For a civic SaaS back office, the strongest benchmarks are: (1) Workday Canvas Kit, (2) monday.com Vibe, (3) Elastic EUI, (4) IBM Carbon, (5) Grafana UI, (6) Sage Carbon, (7) SumUp Circuit UI, (8) Bitwarden. Below them come Primer, Fluent v9, commercetools UI Kit, Contentful Forma 36, SAP fundamental-styles, Zendesk Garden, Adevinta Spark, Kiwi Orbit, JetBrains Ring UI, and Adobe Spectrum CSS / Spectrum Web Components. Eight candidates from the brief were dropped: Polaris, Atlassian, Salesforce, Porsche, Backpack, Twilio Paste, SAP UI5 Web Components and WPDS. Each is either dead, private, archived or not a public Storybook. GitLab UI is live but only partly verifiable.

### Cited Findings

**Ranking at a glance.** "Docs in SB?" says whether the narrative docs live inside Storybook or on a separate site.

| # | System (product) | SB version · built | Entries (docs/stories) | Docs in SB? | Best "steal this" |
|---|---|---|---|---|---|
| 1 | Workday Canvas Kit | 8.4.7 · 27 Oct 2026 | 692 (136/556) | Yes, it is the docs site | Guides/Accessibility/Table Patterns; Upgrade guides; AI for LLMs + Agent Skills |
| 2 | monday.com Vibe | 8.6.15 · 19 Oct 2026 | 655 (131/524) | Yes, it is the docs site | Welcome → Getting Started → Catalog → Playground → Changelog IA; Do's & Don'ts per component |
| 3 | Elastic EUI (Kibana) | 10.6.3 · 27 Oct 2026 | 631 (0/631) | No (eui.elastic.co) | Toolbar for theme, dark, high contrast and LTR/RTL; 186 VRT-only stories; Templates |
| 4 | IBM Carbon React | 10.3.5 · 21 Oct 2026 | 643 (135/508) | Partly (API docs; usage on carbondesignsystem.com) | DataTable split into 11 sub-areas; locale with Arabic + direction toolbar |
| 5 | Grafana UI | 10.6.2 · 27 Oct 2026 | 495 (148/347) | Yes, plus the Saga site | Docs Overview (Design Principles, Voice and Tone); Do's/Don'ts/Anatomy/Placement per component |
| 6 | Sage Carbon (accounting SaaS) | 10.6.2 · 29 Oct 2026 | 1209 (116/1093) | Yes, it is the docs site | Documentation/Validations, i18n, Recommended Practices; locale toolbar |
| 7 | SumUp Circuit UI | 10.5.10 · 29 Oct 2026 | 397 (102/295) | Yes, it is the docs site | `status:*` lifecycle tags + Component Lifecycle page; When to use / Content guidelines |
| 8 | Bitwarden component library | 10.6.0 · 29 Oct 2026 | 1494 | Yes | Real product screens (Admin Console, Billing, Vault) and a Kitchen Sink inside the Storybook |
| 9 | GitHub Primer React | 10.5.10 · 23 Oct 2026 | 1110 (1/1109) | No (primer.style) | Theme toolbar with "All" (every theme side by side); Experimental/Deprecated sections; addon-mcp |
| 10 | Microsoft Fluent UI React v9 | 9.1.17 · 29 Oct 2026 | 1142 (272/870) | Yes | Accessibility spec per component; Theme token pages; Migration |
| 11 | commercetools UI Kit (Merchant Center) | 9.1.20 · 22 Oct 2026 | 407 (193/214) | Yes | Token tiers "Choices" vs "Decisions"; Localized (multi-language) inputs |
| 12 | Contentful Forma 36 | 10.6.2 · 29 Oct 2026 | 467 (102/365) | Partly | "With Density Support" stories; TableNext; AI chat components |
| 13 | SAP fundamental-styles (Fiori) | 10.6.1 · 19 Oct 2026 | 969 | Partly | Content Density doc; 80 Layout + 41 Pattern entries |
| 14 | Zendesk Garden | 10.2.14 · 25 Sep 2026 | 222 (96/126) | Partly (garden.zendesk.com) | addon-designs (Figma) per package |
| 15 | Adevinta Spark | 10.3.5 · 10 Apr 2026 | 529 (82/447) | Yes | Themes – Contrast check; live-value Design Tokens page; addon-mcp |
| 16 | Kiwi.com Orbit | 8.6.14 · 23 Jan 2026 | 397 (0/397) | No (orbit.kiwi) | An "Rtl" story for almost every component (62) |
| 17 | JetBrains Ring UI | 10.6.0 · 27 Oct 2026 | 350 (78/272) | Partly | Listed on the Storybook showcase; themes addon |
| — | Adobe Spectrum CSS / Spectrum Web Components | 8.6.15 · 18 Dec 2025 / 8.6.19 · 29 Oct 2026 | 684 / 1247 | Partly | addon-status, addon-designs, HTML-source addon; shared token package |

Sources for the table:
- Primer: [index.json](https://primer.style/react/storybook/index.json) and [project.json](https://primer.style/react/storybook/project.json)
- Carbon: [index.json](https://react.carbondesignsystem.com/index.json) and [project.json](https://react.carbondesignsystem.com/project.json)
- Fluent: [index.json](https://react.fluentui.dev/index.json) and [project.json](https://react.fluentui.dev/project.json)
- EUI: [index.json](https://eui.elastic.co/storybook/index.json) and [project.json](https://eui.elastic.co/storybook/project.json)
- Grafana: [index.json](https://developers.grafana.com/ui/latest/index.json) and [project.json](https://developers.grafana.com/ui/latest/project.json)
- Canvas Kit: [index.json](https://workday.github.io/canvas-kit/index.json) and [project.json](https://workday.github.io/canvas-kit/project.json)
- Vibe: [index.json](https://vibe.monday.com/index.json) and [project.json](https://vibe.monday.com/project.json)
- Sage Carbon: [index.json](https://carbon.sage.com/index.json) and [project.json](https://carbon.sage.com/project.json)
- Circuit: [index.json](https://circuit.sumup.com/index.json) and [project.json](https://circuit.sumup.com/project.json)
- Bitwarden: [index.json](https://components.bitwarden.com/index.json) and [project.json](https://components.bitwarden.com/project.json)
- commercetools: [index.json](https://uikit.commercetools.com/index.json) and [project.json](https://uikit.commercetools.com/project.json)
- Forma 36: [index.json](https://f36-storybook.contentful.com/index.json) and [project.json](https://f36-storybook.contentful.com/project.json)
- fundamental-styles: [index.json](https://sap.github.io/fundamental-styles/index.json) and [project.json](https://sap.github.io/fundamental-styles/project.json)
- Garden: [index.json](https://zendeskgarden.github.io/react-components/index.json) and [project.json](https://zendeskgarden.github.io/react-components/project.json)
- Spark: [index.json](https://sparkui.vercel.app/index.json) and [project.json](https://sparkui.vercel.app/project.json)
- Orbit: [index.json](https://kiwicom.github.io/orbit/index.json) and [project.json](https://kiwicom.github.io/orbit/project.json)
- Ring UI: [index.json](https://jetbrains.github.io/ring-ui/master/index.json) and [project.json](https://jetbrains.github.io/ring-ui/master/project.json)
- Spectrum CSS: [index.json](https://opensource.adobe.com/spectrum-css/index.json) and [project.json](https://opensource.adobe.com/spectrum-css/project.json)
- Spectrum Web Components: [index.json](https://opensource.adobe.com/spectrum-web-components/storybook/index.json) and [project.json](https://opensource.adobe.com/spectrum-web-components/storybook/project.json)

**Top 8 in depth**

1. **Workday Canvas Kit**: https://workday.github.io/canvas-kit/
   - Live and maintained: Storybook 8.4.7 (from `storybookPackages`), built 27 Oct 2026; repo pushed 29 Oct 2026 — [project.json](https://workday.github.io/canvas-kit/project.json), [repo](https://github.com/Workday/canvas-kit)
   - Sidebar (top level, in order): Welcome · Guides (53) · AI For LLMs · Agent Skills · Styling (8) · Assets (9) · Hooks and Utilities · Features (9) · Tokens (6) · Components (328, grouped Buttons/Containers/Indicators/Inputs/Layout/Navigation/Popups/Text) · Preview (67) · Labs (31) · Changelog · Versions · Examples (5) · Testing (169) — [index.json](https://workday.github.io/canvas-kit/index.json)
   - Steal this [DESIGN-OWNED]: an accessibility guide set written for data-heavy back offices. "Guides/Accessibility" has 17 pages, including Page Structure, Form Validation, Inline Popups, ARIA Live Regions, Windows High Contrast, and Table Patterns with sub-pages for Sortable Column Headers, Selectable Rows, Expandable Rows, Nested Rows, Draggable Rows, Filterable Column Headers and With Form Fields — [Table Patterns](https://workday.github.io/canvas-kit/?path=/docs/guides-accessibility-table-patterns--docs)
   - Steal this [DESIGN-OWNED]: an "Accessibility Requirements" table on the component page (accessible name, menu trigger, related button groups, each marked required or conditional), linked to the WAI-ARIA APG pattern — [Button.mdx](https://github.com/Workday/canvas-kit/blob/HEAD/modules/react/button/stories/button/Button.mdx)
   - Steal this [DESIGN-OWNED]: a worked density spec where Canvas does not ship a density system. A table gives High/Medium/Low density with input height 32/40/48 px, field spacing 16/24/32 px and the type token for each, all mapped to `system.size`/`system.gap` tokens — [Density and Alignment](https://workday.github.io/canvas-kit/?path=/docs/examples-density-and-alignment--docs), [Density.mdx](https://github.com/Workday/canvas-kit/blob/HEAD/modules/react/_examples/stories/mdx/Density.mdx)
   - Steal this [DESIGN-OWNED for the content; DEV-OWNED for the MCP server]: "AI For LLMs/MCP Docs" documents an MCP server that exposes upgrade guides, design-token docs, accessibility guidance and per-component docs to coding agents. "Agent Skills" ships `SKILL.md` files (Version Detection, Tokens, Styling…) aimed at the current v16 + `@workday/canvas-tokens-web` 4.4 — [MCP Docs](https://workday.github.io/canvas-kit/?path=/docs/ai-for-llms-mcp-docs--docs), [MCPDocs.mdx](https://github.com/Workday/canvas-kit/blob/HEAD/modules/mcp/stories/mdx/MCPDocs.mdx), [Agent Skills](https://github.com/Workday/canvas-kit/blob/HEAD/modules/docs/mdx/agent-skills/Overview.mdx)
   - Steal this [DESIGN-OWNED]: lifecycle shown in the sidebar itself (Components → Preview → Labs), plus upgrade guides v4.0–v16.0, some with "Visual Changes" pages, and Tokens Migration mapping tables (Colors, System) — [index.json](https://workday.github.io/canvas-kit/index.json), [v16 upgrade guide](https://workday.github.io/canvas-kit/?path=/docs/guides-upgrade-guides-v16-0-overview--docs)
   - Also shown: a Versions page that renders a `<VersionTable />` of older releases' docs, and a Changelog page — [Versions](https://workday.github.io/canvas-kit/?path=/docs/versions--docs), [Versions.mdx](https://github.com/Workday/canvas-kit/blob/HEAD/modules/docs/mdx/Versions.mdx), [Changelog](https://workday.github.io/canvas-kit/?path=/docs/changelog--docs)
   - RTL: 28 stories are named RTL or "Right To Left" (Table, Segmented Control, Expandable, Banner, Hyperlink, Features/Theming) — [RTL theming story](https://workday.github.io/canvas-kit/?path=/story/features-theming--rtl)
   - Quality [DEV-OWNED]: the `chromatic` addon is loaded; the test packages include cypress 15.6.0, cypress-axe 1.7.0 and vitest 4.0.1 — [project.json](https://workday.github.io/canvas-kit/project.json)
   - Weak: on Storybook 8.4.7, two majors behind 10.x — [project.json](https://workday.github.io/canvas-kit/project.json). The in-Storybook Tokens section is titled "Tokens (deprecated)" (the tokens moved to `canvas-tokens-web`) — [index.json](https://workday.github.io/canvas-kit/index.json). A "Testing" section of 169 visual-test entries sits in the public sidebar (noise for a designer). canvas.workday.com, the design site, answered 403 to automated fetches (unverified).

2. **monday.com Vibe**: https://vibe.monday.com/
   - The Storybook is the public docs site. The repo homepage is vibe.monday.com, and the README calls it "Official monday.com UI resources for application development in React.js" — [README](https://github.com/mondaycom/vibe/blob/HEAD/README.md)
   - Storybook 8.6.15, built 19 Oct 2026 — [project.json](https://vibe.monday.com/project.json)
   - Sidebar (top level, in order): Welcome · Getting Started · Catalog · MCP · Playground · Changelog · Migration Guide · Contributing · Foundations (15) · Components (471) · Layout · Text · Theming · Accessibility · Hooks · Internal · Storybook Blocks — [index.json](https://vibe.monday.com/index.json)
   - Foundations covers Accessibility, Motion, Round Corners, Shadow, Typography, Spacing and a **UX Writing Handbook** — [UX Writing Handbook](https://vibe.monday.com/?path=/docs/foundations-ux-writing-handbook--docs)
   - Steal this [DESIGN-OWNED]: a fixed component-page anatomy. Button runs Import → Props → Usage → Accessibility (when to use `ariaLabel` vs `ariaLabeledBy`) → Variants (kinds, sizes, disabled, states, positive/negative, icons) → **Do's and Don'ts** → **Use cases and examples** (loading state, success state) — [Button docs](https://vibe.monday.com/?path=/docs/components-button--docs), [Button.mdx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/src/pages/components/Button/Button.mdx)
   - Steal this [DESIGN-OWNED]: a visual "Catalog" page of every component, and a live-code Playground story — [Catalog](https://vibe.monday.com/?path=/docs/catalog--docs), [Playground](https://vibe.monday.com/?path=/story/playground--playground)
   - Steal this [DEV-OWNED server, DESIGN-OWNED content]: an MCP page documents tools such as `get-vibe-component-metadata`, `get-vibe-component-accessibility`, `list-vibe-tokens` and `list-vibe-icons` — [MCP](https://vibe.monday.com/?path=/docs/mcp--docs), [mcp.mdx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/src/pages/mcp/mcp.mdx)
   - Theming toolbar: Light, Dark and Black app themes through `withThemeByClassName` — [preview.tsx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/.storybook/preview.tsx)
   - Lifecycle sits in the title: "Combobox [Deprecated]", "List [New]", each with a Migration Guide page — [index.json](https://vibe.monday.com/index.json)
   - Quality: 22 play-function stories; `@chromatic-com/storybook` and `chromatic` addons — [index.json](https://vibe.monday.com/index.json), [project.json](https://vibe.monday.com/project.json)
   - Weak: Storybook 8.6, not 10. Only one RTL story ("Link — Right to left"). Internal "Storybook Blocks" (47 entries) and "Internal" (13) are visible in the public sidebar — [index.json](https://vibe.monday.com/index.json)

3. **Elastic EUI** (Kibana / Elastic Cloud): https://eui.elastic.co/storybook/
   - The most current Storybook in the set: 10.6.3, built 27 Oct 2026 — [project.json](https://eui.elastic.co/storybook/project.json)
   - Sidebar by job, not A–Z: Theming · Templates · Layout · Navigation · Display · Forms · Tabular Content · Editors & Syntax · Utilities · Internal — [index.json](https://eui.elastic.co/storybook/index.json)
   - Steal this [DESIGN-OWNED for the states shown]: the toolbar sets theme (Borealis), Light/Dark mode, High contrast on/off and LTR/RTL writing mode, applied through a story wrapper that sets `dir` — [decorator.tsx](https://github.com/elastic/eui/blob/HEAD/packages/eui/.storybook/decorator.tsx)
   - Steal this [DEV-OWNED]: 186 stories tagged `vrt-only` and 52 with play functions; `test-storybook` + Playwright in package.json — [index.json](https://eui.elastic.co/storybook/index.json), [package.json](https://github.com/elastic/eui/blob/HEAD/packages/eui/package.json)
   - Steal this [DESIGN-OWNED]: full-page templates ("Templates/EuiPageTemplate" with Playground and Dark Mode stories), plus 33 DataGrid entries — [EuiPageTemplate](https://eui.elastic.co/storybook/?path=/story/templates-euipagetemplate--playground), [EuiDataGrid](https://eui.elastic.co/storybook/?path=/story/tabular-content-euidatagrid--playground)
   - Weak: zero docs pages inside Storybook (0 docs entries). Usage guidance lives on the separate docs site eui.elastic.co, so the Storybook teaches a designer little — [index.json](https://eui.elastic.co/storybook/index.json), [repo homepage](https://github.com/elastic/eui)

4. **IBM Carbon (React)**: https://react.carbondesignsystem.com/
   - Storybook 10.3.5, built 21 Oct 2026; addons `storybook-addon-accessibility-checker` + addon-docs — [project.json](https://react.carbondesignsystem.com/project.json)
   - Sidebar: Getting Started (Welcome, Feature Flags) · Components (521) · Deprecated · Elements · Examples · Helpers · Hooks · Layout · Preview (53) · Utilities. A stray lowercase "components" group (7 entries) also appears, an IA inconsistency — [index.json](https://react.carbondesignsystem.com/index.json), [Welcome](https://react.carbondesignsystem.com/?path=/docs/getting-started-welcome--welcome)
   - Steal this [DESIGN-OWNED]: DataTable broken into 11 behaviour sub-areas: Basic, Batch Actions, Dynamic, Expansion, Filtering, Pagination, Selection, Skeleton, Sorting, Toolbar, WithAILabel — [Batch Actions](https://react.carbondesignsystem.com/?path=/docs/components-datatable-batch-actions--overview), [index.json](https://react.carbondesignsystem.com/index.json)
   - Steal this [DESIGN-OWNED states]: toolbar globals for Locale (English, German, **Arabic**, Japanese) and **Text direction**, plus dev-only "Layout size" and "Layout density" — [preview.js](https://github.com/carbon-design-system/carbon/blob/HEAD/packages/react/.storybook/preview.js)
   - Feature flags have their own docs pages: a "Feature Flag" page per affected component (17) and a Getting Started overview — [Feature Flags](https://react.carbondesignsystem.com/?path=/docs/getting-started-feature-flags--overview)
   - Weak: the component pages are API-first. Button.mdx is ToC → Overview → Radius → Danger/Icon-only/Skeleton → Component API with one section per prop, and it links out to carbondesignsystem.com for Usage and Accessibility — [Button.mdx](https://github.com/carbon-design-system/carbon/blob/HEAD/packages/react/src/components/Button/Button.mdx)

5. **Grafana UI** (Grafana): https://developers.grafana.com/ui/latest/
   - Storybook 10.6.2 on the rsbuild framework, built 27 Oct 2026 — [project.json](https://developers.grafana.com/ui/latest/project.json)
   - Sidebar starts with "Docs Overview" (Intro, Design Principles, Accessibility, Voice and Tone), then Foundations and Iconography. Components are grouped by job: Layout, Forms, Inputs, Pickers, Date time pickers, Information, Overlays, Navigation, Utilities. Domain packs follow (Plugins, Alerting with Contact Points/Matchers/Notification Policies/Rules), then Developers — [index.json](https://developers.grafana.com/ui/latest/index.json), [Voice and Tone](https://developers.grafana.com/ui/latest/?path=/docs/docs-overview-voice-and-tone--docs), [Design Principles](https://developers.grafana.com/ui/latest/?path=/docs/docs-overview-design-principles--docs)
   - Steal this [DESIGN-OWNED]: a designer-grade component page. Button.mdx runs Do's → Don'ts → Emphasis → Variants → Sizes and Label Typography → Formatting/**Anatomy** → Hierarchy and Button Pairings → **Placement** → Accessibility → per-variant sections → Further Reading → Props (ArgTypes) — [Button docs](https://developers.grafana.com/ui/latest/?path=/docs/inputs-button--docs), [Button.mdx](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/src/components/Button/Button.mdx)
   - Steal this [DESIGN-OWNED]: the Theme toolbar includes colour-vision themes (deut_prot_dark/light, tritanopia_dark/light) next to light and dark — [preview.ts](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/.storybook/preview.ts)
   - The Intro page tells readers how to use Storybook itself (Controls, Code tab, Docs) — [Intro.mdx](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/src/Intro.mdx)
   - Weak: no RTL stories. Grafana's 8 "rtl" index hits are false positives from "Ale**rtL**abel" — [index.json](https://developers.grafana.com/ui/latest/index.json). "Deprecated" is scattered as a sub-folder in each group. Only a11y + docs addons; no visual-regression addon declared — [project.json](https://developers.grafana.com/ui/latest/project.json)

6. **Sage Carbon** (Sage business/accounting software): https://carbon.sage.com/
   - "Carbon is a React component library developed by Sage"; the README carries a Playwright CI badge — [README](https://github.com/Sage/carbon/blob/HEAD/README.md)
   - Storybook 10.6.2, built 29 Oct 2026; addons a11y, docs, **pseudo-states** and Chromatic — [project.json](https://carbon.sage.com/project.json)
   - Sidebar: Welcome · Documentation (Colors, i18n, Validations, Recommended Practices, Deprecation Migration, Usage with routing, Bundle Size, Extending Styles, Using Lexical, Hooks) · Contributing (How to contribute, **Roadmap**) · Getting Started (Installation, Usage) · components A–Z · Deprecated (336 entries) — [index.json](https://carbon.sage.com/index.json), [Welcome](https://carbon.sage.com/?path=/story/welcome--welcome-page)
   - Steal this [DESIGN-OWNED]: a form-validation guide and an i18n guide aimed at a business back office — [Validations](https://carbon.sage.com/?path=/docs/documentation-validations--docs), [i18n](https://carbon.sage.com/?path=/docs/documentation-i18n--docs), [Recommended Practices](https://carbon.sage.com/?path=/docs/documentation-recommended-practices--docs)
   - Locale toolbar with 8 locales (en-GB, de-DE, en-CA, en-US, es-ES, fr-FR, fr-CA, pt-PT) — [preview.ts](https://github.com/Sage/carbon/blob/HEAD/.storybook/preview.ts)
   - Button page anatomy: Contents → Quick Start → Examples (Default, Content, Click Handler, Variants, Sizes, Disabled, Full-Width, Inverse, Loading, Wrapping Text, HTML type) — [Button.mdx](https://github.com/Sage/carbon/blob/HEAD/src/components/button/__next__/button.mdx)
   - Weak: components sit at the top level A–Z with sub-parts exposed (ActionPopoverItem, CardColumn, Dd, Dt…), and the 336 deprecated entries swamp the sidebar — [index.json](https://carbon.sage.com/index.json). No RTL stories found.

7. **SumUp Circuit UI**: https://circuit.sumup.com/
   - Storybook 10.5.10, built 29 Oct 2026 — [project.json](https://circuit.sumup.com/project.json)
   - Sidebar: Introduction (Welcome, Getting Started, Browser Support, Changelog, **Component Lifecycle**, Internationalization, Migration) · Features · Icons · Typography · Components · Forms · Notification · Brand · Navigation · Layout · Hooks · Contributing (Code Conventions, Release Process, Testing…) · Packages (circuit-ui, **design-tokens**, eslint-plugin, stylelint-plugin, icons, illustrations) · Templates (nextjs, astro) — [index.json](https://circuit.sumup.com/index.json)
   - Steal this [DESIGN-OWNED]: machine-readable lifecycle. Index tags are `status:stable` (314), `status:experimental` (12), `status:internal` (11), `status:under-review` (10), `status:legacy` (7) and `status:deprecated` (4). A Component Lifecycle page defines each stage's promise. For example, Stable means it meets accessibility, browser support, localisation, test coverage and documentation standards; Experimental is exported from `@sumup-oss/circuit-ui/experimental` and outside semver — [index.json](https://circuit.sumup.com/index.json), [Component Lifecycle](https://circuit.sumup.com/?path=/docs/introduction-component-lifecycle--docs), [source](https://github.com/sumup-oss/circuit-ui/blob/HEAD/docs/introduction/3-component-lifecycle.mdx)
   - Steal this [DESIGN-OWNED]: the component page opens with a `<Status>` badge, then "When to use it" → "Usage guidelines" → "**Content guidelines**" → "Component variations" — [Button docs](https://circuit.sumup.com/?path=/docs/components-button--docs), [Button.mdx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/packages/circuit-ui/components/Button/Button.mdx)
   - Toolbar: Theme (Match system / Light / Dark / Consumer) and Locale. The preview config lists past-version Storybooks v5–v11 at circuit-vN.sumup-vercel.app — [preview.tsx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/.storybook/preview.tsx)
   - Quality: 45 play functions; Chromatic addon — [index.json](https://circuit.sumup.com/index.json), [project.json](https://circuit.sumup.com/project.json)
   - Weak: merchant/consumer focus. The Table component has only base/sortable/custom-sort stories. No RTL stories — [index.json](https://circuit.sumup.com/index.json)

8. **Bitwarden component library** (password manager web vault + organisation Admin Console): https://components.bitwarden.com/
   - Storybook 10.6.0, built 29 Oct 2026, 1494 entries — [project.json](https://components.bitwarden.com/project.json)
   - Sidebar: Documentation (Introduction, Colors, Icons, Compact Mode, Feature Flags, Responsive Design, Router Focus Management, Virtual Scrolling, Kitchen Sink) · Component Library (634). Then **product areas built from it**: Admin Console (242, Organizations 204, Providers 35), Billing (111), Web (210, PAM 167), Vault (66), Browser (75), Tools (36), Auth (24) — [index.json](https://components.bitwarden.com/index.json)
   - Steal this [DESIGN-OWNED]: product screens and full compositions live in the same Storybook as the primitives. This is the closest public analogue to a "demo back office built only from the system". A "Kitchen Sink" composes every component into an app-like page (menu, dialog, drawer and popover open; side nav; responsive sidebar; guided tour) "to spot-check visual changes in a more app-like environment… tested by the Chromatic UI tests" — [Kitchen Sink](https://components.bitwarden.com/?path=/docs/documentation-kitchen-sink--docs), [kitchen-sink.mdx](https://github.com/bitwarden/clients/blob/HEAD/libs/components/src/stories/kitchen-sink/kitchen-sink.mdx)
   - Steal this [DESIGN-OWNED rule, DEV-OWNED mechanism]: a written density mode. A global "compact mode" for an information-dense UI is exposed to authors as one `bit-compact` variant — [Compact Mode](https://components.bitwarden.com/?path=/docs/documentation-compact-mode--docs), [compact-mode.mdx](https://github.com/bitwarden/clients/blob/HEAD/libs/components/src/stories/compact-mode.mdx)
   - Quality: 102 play functions; Router Focus Management and Virtual Scrolling docs; a "Table V2 (Beta)" migration doc — [index.json](https://components.bitwarden.com/index.json)
   - Weak: an Angular + Tailwind stack, so the code does not transfer. Product teams' internal story groups ("DIRT", "PAM") use internal jargon in a public sidebar. Little per-component usage prose.

**Positions 9–17 (catalogue)**

9. **GitHub Primer React**: https://primer.style/react/storybook/
   - Storybook 10.5.10, built 23 Oct 2026; addons a11y, links, docs, `@github-ui/storybook-addon-performance-panel` and `@storybook/addon-mcp` — [project.json](https://primer.style/react/storybook/project.json)
   - Sidebar: Components (843) · Experimental (150) · Deprecated (75) · Hooks · Behaviors · Octicons · Private. Only 1 docs entry; the docs are on primer.style — [index.json](https://primer.style/react/storybook/index.json)
   - Steal this [DESIGN-OWNED states]: the Theme toolbar offers 9 themes (light/dark, each with colourblind, tritanopia, high-contrast and dimmed variants) **plus "All"**, which renders the story once per theme, labelled — [preview.jsx](https://github.com/primer/react/blob/HEAD/packages/react/.storybook/preview.jsx)
   - Matrix stories such as "ActionList — All Combinations" — [story](https://primer.style/react/storybook/?path=/story/components-actionlist-examples--all-combinations)
10. **Microsoft Fluent UI React v9**: https://react.fluentui.dev/
    - Storybook 9.1.17, built 29 Oct 2026 — [project.json](https://react.fluentui.dev/project.json)
    - Sidebar: Concepts (173: Introduction, Developer guides, a per-component **Accessibility spec** set, Migration 95) · Theme (Border Radii, Colors, Fonts, Shadows, Spacing, Stroke Widths, Typography, Theme Designer) · Components (700) · Compat Components · Preview Components · Motion · Utilities · Migration Shims — [index.json](https://react.fluentui.dev/index.json), [preview.js](https://github.com/microsoft/fluentui/blob/HEAD/apps/public-docsite-v9/.storybook/preview.js), [Accessibility overview](https://react.fluentui.dev/?path=/docs/concepts-developer-accessibility-components-overview--docs), [Theme Colors](https://react.fluentui.dev/?path=/docs/theme-colors--docs)
    - Its own addon adds a ThemePicker and a DirectionSwitch (RTL), plus export-to-sandbox — [DirectionSwitch.tsx](https://github.com/microsoft/fluentui/blob/HEAD/packages/react-components/react-storybook-addon/src/components/DirectionSwitch.tsx), [project.json](https://react.fluentui.dev/project.json)
11. **commercetools UI Kit** (the Merchant Center back office): https://uikit.commercetools.com/
    - The README points Merchant Center custom-app builders to it and says `@commercetools-uikit/design-system` "exposes the design variables and tokens… for commercetools products" — [README](https://github.com/commercetools/ui-kit/blob/HEAD/README.md)
    - Storybook 9.1.20 — [project.json](https://uikit.commercetools.com/project.json)
    - Steal this [DESIGN-OWNED]: tokens split into "foundation/Choices" (raw palette) and "foundation/Decisions" (semantic), rendered by a `<TokenGroup>` visualiser — [Choices/Colors](https://uikit.commercetools.com/?path=/docs/foundation-choices-colors--props), [Colors.mdx](https://github.com/commercetools/ui-kit/blob/HEAD/storybook/src/docs/choices/Colors.mdx)
    - Steal this [DESIGN-OWNED]: Form split into Inputs (108) vs Fields (82, with label, errors and warnings), plus **Localized** text, multiline, rich-text and money inputs for multi-language content — [LocalizedTextInput](https://uikit.commercetools.com/?path=/docs/form-inputs-localizedtextinput--props)
    - 91 stories tagged `vrt`; Chromatic addon — [index.json](https://uikit.commercetools.com/index.json)
    - Weak: mixed-case group names ("components"/"Form", "foundation"/"Foundation") — [index.json](https://uikit.commercetools.com/index.json)
12. **Contentful Forma 36** (the Contentful web app): https://f36-storybook.contentful.com/
    - Storybook 10.6.2, built 29 Oct 2026; Chromatic addon — [project.json](https://f36-storybook.contentful.com/project.json)
    - "With Density Support" / "With High Density" stories across form elements; TableNext with stackable and sticky variants; an AIChat family (43) — [density story](https://f36-storybook.contentful.com/?path=/story/typography-caption--with-density-support), [index.json](https://f36-storybook.contentful.com/index.json)
    - The main docs are on f36.contentful.com (repo homepage) — [repo](https://github.com/contentful/forma-36)
13. **SAP fundamental-styles** (the Fiori CSS layer): https://sap.github.io/fundamental-styles/
    - Storybook 10.6.1, built 19 Oct 2026; SAP Design group with Components 615, Layouts 80, Patterns 41, BTP 38, AI 24 — [index.json](https://sap.github.io/fundamental-styles/index.json)
    - Steal this [DESIGN-OWNED]: a Content Density doc — [Content Density](https://sap.github.io/fundamental-styles/?path=/docs/docs-content-density--docs)
14. **Zendesk Garden**: https://zendeskgarden.github.io/react-components/
    - Storybook 10.2.14, built 25 Sep 2026; addons a11y, **designs** (Figma panel) and docs; everything sits under "Packages/…" — [project.json](https://zendeskgarden.github.io/react-components/project.json), [index.json](https://zendeskgarden.github.io/react-components/index.json)
    - Design guidance is on garden.zendesk.com, whose component pages link to the code Storybooks — [garden.zendesk.com/components/button](https://garden.zendesk.com/components/button)
15. **Adevinta Spark**: https://sparkui.vercel.app/
    - Storybook 10.3.5, built 10 Apr 2026; addons dark-mode, a11y, designs, docs and **addon-mcp** — [project.json](https://sparkui.vercel.app/project.json)
    - Steal this [DESIGN-OWNED]: a "Themes – Contrast check" page that renders every colour pair of each theme. `getThemeContrastReport(theme)` scores each pair (e.g. main/onMain) Failed/AA/AAA for normal and large text — [Contrast check](https://sparkui.vercel.app/?path=/docs/styling-themes-contrast-check--docs), [source](https://github.com/adevinta/spark/blob/HEAD/packages/utils/theme/src/contrastCheck.doc.mdx)
    - A Design Tokens page "with live CSS values, Tailwind classes, and visual previews" — [Design Tokens](https://sparkui.vercel.app/?path=/docs/styling-design-tokens--docs), [source](https://github.com/adevinta/spark/blob/HEAD/documentation/styling/DesignTokens.mdx)
    - Component pages run Install → Anatomy → API Reference → "Design and Intent" table → Examples — [Button.doc.mdx](https://github.com/adevinta/spark/blob/HEAD/packages/components/src/button/Button.doc.mdx)
    - Weak: consumer marketplaces; the last build was April 2026.
16. **Kiwi.com Orbit**: https://kiwicom.github.io/orbit/
    - Storybook 8.6.14, built 23 Jan 2026; flat sidebar of 78 component titles; 62 stories named "Rtl"/"RTL", nearly one per component, plus a Playground per component — [index.json](https://kiwicom.github.io/orbit/index.json), [Button RTL](https://kiwicom.github.io/orbit/?path=/story/button--rtl)
    - Listed on the Storybook showcase — [showcase](https://storybook.js.org/showcase)
    - Weak: travel consumer product; no docs pages in Storybook; the repo was last pushed 6 Jul 2026 — [repo](https://github.com/kiwicom/orbit)
17. **JetBrains Ring UI** (JetBrains web tools): https://jetbrains.github.io/ring-ui/master/
    - Storybook 10.6.0, built 27 Oct 2026; addons docs, a11y and themes; listed on the Storybook showcase. Design guidelines live separately on jetbrains.com/help/ring-ui — [project.json](https://jetbrains.github.io/ring-ui/master/project.json), [showcase](https://storybook.js.org/showcase), [README](https://github.com/JetBrains/ring-ui/blob/HEAD/README.md)

**Adobe Spectrum CSS** (https://opensource.adobe.com/spectrum-css/) **and Spectrum Web Components** (https://opensource.adobe.com/spectrum-web-components/storybook/)
- Spectrum CSS runs Storybook 8.6.15 (last build 18 Dec 2025). Its addons include `@etchteam/storybook-addon-status`, `@storybook/addon-designs`, `@whitespace/storybook-addon-html` (shows the rendered HTML), measure/outline and Chromatic. It has "Density – Compact/Spacious" stories and a "Guides/Design tokens" page — [project.json](https://opensource.adobe.com/spectrum-css/project.json), [index.json](https://opensource.adobe.com/spectrum-css/index.json), [Design tokens guide](https://opensource.adobe.com/spectrum-css/?path=/docs/guides-design-tokens--docs)
- Spectrum Web Components runs Storybook 8.6.19 (built 29 Oct 2026), with a badges addon, a custom screen-reader addon, Playwright and `@web/test-runner-visual-regression` — [project.json](https://opensource.adobe.com/spectrum-web-components/storybook/project.json)

**Dropped or demoted (verified 29 Oct 2026)**
- **Shopify Polaris**
  - Polaris React is deprecated, and the `Shopify/polaris-react` repo is archived. Its README opens "The Shopify Polaris React library is deprecated" — [repo](https://github.com/Shopify/polaris-react)
  - Deprecation date: 1 Oct 2025, when Polaris Web Components launched — [Nodus Works](https://nodusworks.com/en/blog/shopify-polaris-react-is-now-deprecated-new-polaris-web-components-era), [npm](https://www.npmjs.com/package/@shopify/polaris) (secondary sources)
  - storybook.polaris.shopify.com did not respond (no HTTP answer to a probe), and polaris-react.shopify.com/storybook returns the docs HTML, not a Storybook (probe).
  - Keep it only as background.
- **Atlassian**: no public Storybook. atlassian.design/storybook returns 404 (probe), and Atlassian publishes a token Storybook *addon* instead — [@atlaskit/storybook-addon-design-system](https://www.npmjs.com/package/@atlaskit/storybook-addon-design-system)
- **Salesforce SLDS**: lightningdesignsystem.com is served by zeroheight (page title "zeroheight"), and /storybook returns 404 (probe).
- **Porsche Design System**: custom docs site; probes got 403 AccessDenied.
- **Skyscanner Backpack**: repo archived (read-only; last push 5 Aug 2026), although its package.json was on Storybook 10.4.6. backpack.github.io/storybook returns 404 — [repo](https://github.com/Skyscanner/backpack)
- **Twilio Paste**: paste.twilio.design now redirects to github.com/twilio-labs/paste. The hosted Storybook paste-storybook.twilio.design returns HTTP 401 (`{"loginUrl":"https://www.chromatic.com/custom-domain-verify"}`). The repo is not archived; its last commit was 20 Aug 2026 — [repo](https://github.com/twilio-labs/paste), [hosted Storybook](https://paste-storybook.twilio.design/)
- **SAP UI5 Web Components**: /ui5-webcomponents/storybook meta-refreshes to SAP Community (probe). The docs are a custom site with its own playground — [ui5.github.io/webcomponents](https://ui5.github.io/webcomponents/), [UI5 WC 2.0 blog](https://community.sap.com/t5/technology-blog-posts-by-sap/blast-off-ui5-web-components-2-0-is-now-live/ba-p/13744227)
- **Washington Post WPDS**: build.washingtonpost.com/storybook returns 403 AccessDenied (probe).
- **GitLab UI + Pajamas**
  - The old `gitlab-org/gitlab-ui` repo was "soft-archived" on 28 May 2025; development moved to the `design.gitlab.com` monorepo, active 29 Oct 2026 — [old repo](https://gitlab.com/gitlab-org/gitlab-ui), [new repo](https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com)
  - `@gitlab/ui` 138.8.0 is still on Storybook ^7.6.24 — [package.json](https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com/-/blob/main/packages/gitlab-ui/package.json)
  - The Storybook page at design.gitlab.com/storybook/ loads (title "Storybook"), but index.json/project.json are not served there, so its tree could not be verified. Pajamas component pages link both to that Storybook and to a Figma file — [Pajamas button](https://design.gitlab.com/components/button)

**Storybook's own showcase**: it currently features Chakra UI, Kiwi Orbit, drei, Elastic Charts, Wix Style React, Airbnb React-Dates, SAP fundamental-styles, Grafana UI, JetBrains Ring UI and Fluent UI Web Components as "Reference Storybook projects from leading UI engineering teams" — [showcase](https://storybook.js.org/showcase). Wix Style React (Wix's business dashboard library) could not be verified: its Storybook returned 403 (probe of wix-style-react.com/storybook).

### Inferences
- govocal-ds runs Storybook 10.6. Of the exemplars, only EUI (10.6.3), Sage Carbon (10.6.2), Grafana (10.6.2), Forma 36 (10.6.2), fundamental-styles (10.6.1), Bitwarden (10.6.0) and Ring UI (10.6.0) are on the same minor. The two best "Storybook as the docs site" systems, Canvas Kit (8.4.7) and Vibe (8.6.15), are behind. Being current is a fair point to make to developers, not a weakness.
- No exemplar shows **every story in both LTR and RTL**. The closest are Orbit (one RTL story per component), Canvas Kit (28 RTL stories) and the toolbar toggles of Carbon, EUI and Fluent. A complete LTR + Arabic RTL set would be ahead of the field. The audit should check that it is real (logical CSS properties, mirrored icons), not just `dir="rtl"`.
- Bitwarden is the only exemplar whose public Storybook holds real product screens built from the library, at scale. It is the right benchmark for govocal-ds's demo back office; EUI Templates and Carbon Examples are thinner.
- Good B2B systems split into two camps. In one, Storybook *is* the docs (Canvas Kit, Vibe, Sage Carbon, Circuit, Grafana). In the other, Storybook is a dev workbench and the docs live elsewhere (Primer, EUI, Carbon, Garden, Forma 36). For "the designer's bible", the first camp is the reference.

### Gaps
- Live rendering was not inspected visually: the pages are JavaScript apps. Docs anatomy was read from MDX sources, and toolbars from preview configs.
- For EUI, Garden, Ring UI and Forma 36 the presence of Figma links on component pages was not verified.
- Canvas Kit's design site (canvas.workday.com), SAP Fiori guidelines and Wix Style React blocked automated fetches (403).
- Storybook's Component Encyclopedia was not mined, for time.
- Production-use claims rest on ownership plus README wording. No independent 2025–2026 evidence was gathered on which product screens actually ship each library.

## Is each one in production, maintained in 2025–2026, and on which Storybook version?

### Takeaway
Every ranked entry was rebuilt within the last 7 months, and most within the last 10 days. All are company-owned libraries for the company's own product. Storybook versions range from 8.4 to 10.6. The 10.x group is EUI, Grafana, Sage, Forma 36, Bitwarden, Ring UI, fundamental-styles, Primer, Circuit, Carbon, Garden and Spark. Fluent and commercetools are on 9.1. Canvas Kit, Vibe, Orbit and the Adobe pair are on 8.x. GitLab UI is on 7.6.

### Cited Findings
- **Repo activity**: pushed on 29 Oct 2026 for Primer, EUI, Grafana, Canvas Kit, Sage Carbon, Circuit, Ring UI, Forma 36, Garden, Bitwarden, Carbon, Fluent and fundamental-styles. Vibe was pushed 25 Oct, commercetools 24 Oct, Spark 27 Oct, Orbit 6 Jul 2026 — [GitHub API repos](https://github.com/primer/react), [elastic/eui](https://github.com/elastic/eui), [Workday/canvas-kit](https://github.com/Workday/canvas-kit), [mondaycom/vibe](https://github.com/mondaycom/vibe), [Sage/carbon](https://github.com/Sage/carbon), [sumup-oss/circuit-ui](https://github.com/sumup-oss/circuit-ui), [bitwarden/clients](https://github.com/bitwarden/clients), [kiwicom/orbit](https://github.com/kiwicom/orbit)
- **Product ownership statements**:
  - Vibe: "Official monday.com UI resources for application development" — [README](https://github.com/mondaycom/vibe/blob/HEAD/README.md)
  - Sage Carbon: "a React component library developed by Sage" — [README](https://github.com/Sage/carbon/blob/HEAD/README.md)
  - commercetools UI Kit: tokens "for commercetools products" and Merchant Center custom applications — [README](https://github.com/commercetools/ui-kit/blob/HEAD/README.md)
  - Ring UI: "JetBrains Web UI components" — [README](https://github.com/JetBrains/ring-ui/blob/HEAD/README.md)
  - Grafana UI: "reusable Grafana components… for contribution and plugin development" — [Intro.mdx](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/src/Intro.mdx)
  - Bitwarden: compact mode belongs to "the Bitwarden browser extension" — [compact-mode.mdx](https://github.com/bitwarden/clients/blob/HEAD/libs/components/src/stories/compact-mode.mdx)
- **Storybook version per system** (from each `project.json` linked in the catalogue):
  - 10.6.3 EUI; 10.6.2 Grafana, Sage, Forma 36; 10.6.1 fundamental-styles; 10.6.0 Bitwarden, Ring UI
  - 10.5.10 Primer, Circuit; 10.3.5 Carbon React, Carbon Web Components, Spark; 10.2.14 Garden
  - 9.1.20 commercetools; 9.1.17 Fluent React, Fluent Web Components
  - 8.6.19 Spectrum Web Components; 8.6.15 Vibe, Spectrum CSS; 8.6.14 Orbit; 8.4.7 Canvas Kit
  - Carbon Angular is on 7.6.7; Carbon Vue is on 6.5.15 (last built 22 Nov 2024)
  - Sources: [Carbon Angular project.json](https://angular.carbondesignsystem.com/project.json), [Carbon Vue project.json](https://vue.carbondesignsystem.com/project.json), [Carbon WC project.json](https://web-components.carbondesignsystem.com/project.json), [Fluent WC project.json](https://web-components.fluentui.dev/project.json)
- **Storybook builders in use** [DEV-OWNED]: `@storybook/react-vite` (Primer, Carbon, EUI, Canvas, Garden, Vibe, Sage, Circuit, commercetools, Forma 36, Spark); `react-webpack5` (Fluent, Orbit, Ring UI); `storybook-react-rsbuild` (Grafana); `web-components-vite` (Spectrum CSS) — see each project.json above.
- **MCP readiness**: Storybook's MCP server lets agents query components, docs and tests; Storybook 10.3 added MCP and a11y improvements — [Storybook MCP docs](https://storybook.js.org/docs/ai/mcp/overview), [Storybook 10.3 blog](https://storybook.js.org/blog/storybook-10-3/). Primer and Spark load `@storybook/addon-mcp` (project.json above). Canvas Kit and Vibe document their own MCP servers inside Storybook (pages cited above).

### Inferences
- A `manifest` tag appears on every entry of Primer, Carbon, EUI, Grafana, Garden, Ring UI, Sage, Circuit, Forma 36, Spark and Bitwarden ([e.g. EUI index.json](https://eui.elastic.co/storybook/index.json)). It is probably Storybook 10's component-manifest default (the feature the MCP server reads), not a deliberate team choice. Treat it as a version signal, not a quality signal.
- Developers will read Storybook currency as a maintenance signal. A Storybook kept on the newest minor (EUI-style) shows active upkeep more convincingly than any written claim.

### Gaps
- No public figures were found on how many product screens use each library, and no 2025–2026 talks were gathered on internal adoption.

## How do they organise the sidebar (Foundations / Tokens / Components / Patterns / Templates / pages)? Is there a welcome page?

### Takeaway
The best B2B Storybooks follow the same order. First an orientation block (Welcome, Getting Started, Changelog, Migration, Contributing). Then Foundations and Tokens. Then components grouped **by job** (Inputs, Navigation, Overlays, Tabular content) rather than A–Z. Then a lifecycle or quarantine zone (Preview, Labs, Experimental, Deprecated). Last come examples, templates or product screens. A–Z top-level lists (Sage Carbon, Orbit, Spectrum Web Components) read worst.

### Cited Findings
- **Canvas Kit** [DESIGN-OWNED IA]: Welcome → Guides → AI For LLMs → Agent Skills → Styling → Assets → Hooks and Utilities → Features → Tokens → Components (by job: Buttons, Containers, Indicators, Inputs, Layout, Navigation, Popups, Text) → Preview → Labs → Changelog → Versions → Examples → Testing. The order is set by a custom `storySort` in preview.js — [index.json](https://workday.github.io/canvas-kit/index.json), [preview.js](https://github.com/Workday/canvas-kit/blob/HEAD/.storybook/preview.js)
- **Vibe** [DESIGN-OWNED IA]: Welcome → Getting Started → Catalog → MCP → Playground → Changelog → Migration Guide → Contributing → Foundations → Components → Layout → Text → Theming → Accessibility → Hooks — [index.json](https://vibe.monday.com/index.json). The Welcome page is built from Hero, Resources, Team and Contributors blocks — [welcome.mdx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/src/pages/welcome/welcome.mdx)
- **Circuit** [DESIGN-OWNED IA]: Introduction (Welcome, Getting Started, Browser Support, Changelog, Component Lifecycle, Internationalization, Migration) → Features → Icons → Typography → Components → Forms → Notification → Brand → Navigation → Layout → Hooks → Contributing → Packages → Templates. The Welcome page has npm version and coverage badges and "Getting started" / "Contributing" teasers — [index.json](https://circuit.sumup.com/index.json), [1-welcome.mdx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/docs/introduction/1-welcome.mdx)
- **Grafana** [DESIGN-OWNED IA]: Docs Overview → Foundations → Iconography → Layout → Forms → Inputs → Pickers → Date time pickers → Information → Overlays → Utilities → Navigation → Plugins → Alerting → Developers — [index.json](https://developers.grafana.com/ui/latest/index.json)
- **EUI** [DESIGN-OWNED IA]: Theming → Templates → Layout → Navigation → Display → Forms → Tabular Content → Editors & Syntax → Utilities → Internal — [index.json](https://eui.elastic.co/storybook/index.json)
- **Fluent** [DESIGN-OWNED IA]: Concepts (Introduction, Developer, Migration, Recipes) → Theme → Components → Compat Components → Preview Components → Motion → Utilities → Migration Shims. The order is set explicitly in preview.js, including the Theme sub-order Border Radii, Colors, Fonts, Shadows, Spacing, Stroke Widths, Typography, Theme Designer — [preview.js](https://github.com/microsoft/fluentui/blob/HEAD/apps/public-docsite-v9/.storybook/preview.js)
- **Bitwarden** [DESIGN-OWNED IA]: Documentation → Component Library → product areas (Admin Console, Auth, Billing, Browser, Tools, Vault, Web) — [index.json](https://components.bitwarden.com/index.json)
- **commercetools** [DESIGN-OWNED IA]: home → Foundation (Choices, Decisions) → Text & Media → layout → components → Form (Inputs, Fields) — [index.json](https://uikit.commercetools.com/index.json)
- **Flat A–Z counter-examples**:
  - Sage Carbon puts components (and sub-parts such as "Dd", "Dt", "CardRow") at the top level beside Welcome/Documentation — [index.json](https://carbon.sage.com/index.json)
  - Orbit is 78 top-level component titles — [index.json](https://kiwicom.github.io/orbit/index.json)
  - Spectrum Web Components lists components flat ("Accordion", "Action Bar", "Action Button"…) — [index.json](https://opensource.adobe.com/spectrum-web-components/storybook/index.json)
- **Lifecycle zones in the sidebar** [DESIGN-OWNED]:
  - Primer: Experimental 150, Deprecated 75 — [index.json](https://primer.style/react/storybook/index.json)
  - Carbon: Preview 53, Deprecated 9 — [index.json](https://react.carbondesignsystem.com/index.json)
  - Fluent: Preview Components, Compat Components, Migration Shims — [index.json](https://react.fluentui.dev/index.json)
  - Canvas: Preview 67, Labs 31 — [index.json](https://workday.github.io/canvas-kit/index.json)
  - Spark: Experimental 22 — [index.json](https://sparkui.vercel.app/index.json)
  - Grafana: a "Deprecated" sub-folder inside each group — [index.json](https://developers.grafana.com/ui/latest/index.json)

### Inferences
- With about 55 components and 27 patterns, govocal-ds is the right size for EUI/Grafana-style job groups inside Components. A distinct Patterns zone and a "Demo back office" zone would follow, Bitwarden-style. Canvas Kit, Vibe and Circuit show that Changelog, Migration and Lifecycle pages near the top raise developer trust.
- Public sidebars that expose internal or test folders (Canvas "Testing", Vibe "Storybook Blocks"/"Internal", EUI "Internal") cost designer clarity. An audit should flag them.

### Gaps
- Whether the sidebars collapse by default was not checked; that is a manager setting not visible in index.json.

## What does a per-component docs page contain (usage, do/don't, anatomy, props, code, a11y, status, Figma, related)?

### Takeaway
No single exemplar has everything. Put together, the best page is:
- Circuit's status badge and When to use / Usage / **Content** guidelines
- Grafana's Do's/Don'ts, **Anatomy**, Hierarchy and **Placement**
- Vibe's Accessibility section and **Use cases**
- Canvas Kit's **Accessibility Requirements table**
- Spark's "Design and Intent" matrix
- a props table (ArgTypes) last

Figma links come from addon-designs (Garden, Spark, Spectrum CSS, Spectrum Web Components) or from the separate design site (Pajamas). "Related components" sections are rare.

### Cited Findings
- **Circuit Button** [DESIGN-OWNED]: `<Status variant="stable" />` → When to use it → Usage guidelines → Content guidelines → Component variations (Variants, Destructive, Sizes, With Icons, Loading) → ButtonGroup → As link — [Button.mdx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/packages/circuit-ui/components/Button/Button.mdx)
- **Grafana Button** [DESIGN-OWNED]: Do's → Don'ts (e.g. avoid icon-only buttons, else add a tooltip + aria-label) → Emphasis → Variants → Sizes and Label Typography → Formatting/Anatomy (Icon + Label, Icon Button) → Hierarchy and Button Pairings → Placement → Accessibility → Primary/Secondary/Destructive/Text/Links → Further Reading → Props — [Button.mdx](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/src/components/Button/Button.mdx)
- **Vibe Button** [DESIGN-OWNED]: Import → Props → Usage → Accessibility → Variants (kinds, sizes, disabled, states, positive/negative, icons) → Do's and Don'ts → Use cases and examples — [Button.mdx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/src/pages/components/Button/Button.mdx)
- **Canvas Kit Button**: Installation → Usage (Primary/Secondary/Tertiary/Delete, Grow, Custom Styles, Theme Overrides) → Accessibility (Minimum Accessible Structure, Built-in Behaviors, an Accessibility Requirements table with REQUIRED/conditional rows, an APG link) — [Button.mdx](https://github.com/Workday/canvas-kit/blob/HEAD/modules/react/button/stories/button/Button.mdx). Tags: [DESIGN-OWNED] for the a11y requirements; [DEV-OWNED] for install and styling.
- **Spark Button**: Install → Anatomy → API Reference (ArgTypes) → Examples (a "Design and Intent" table, Disabled, Icons, Loading with an a11y tip about `loadingLabel`, Sizes) → Advanced (Link, Toggle) — [Button.doc.mdx](https://github.com/adevinta/spark/blob/HEAD/packages/components/src/button/Button.doc.mdx). Tags: [DESIGN-OWNED] for the intent matrix and anatomy.
- **Sage Carbon Button**: Contents → Quick Start → Examples (one `<Canvas>` per state: default, content, click handler, variants, sizes with "a note on the xs size", disabled, full width, inverse, loading, wrapping text, HTML type) — [button.mdx](https://github.com/Sage/carbon/blob/HEAD/src/components/button/__next__/button.mdx). This is example-led, with little guidance.
- **Carbon React Button**: ToC → Overview → Radius (flatten a region, per-corner, nested) → Danger/Icon-only/Skeleton → Component API (ArgTypes plus prose for each prop: `as`, `kind`, `size`, `iconDescription`, `role`…). A header link sends Usage and Accessibility to carbondesignsystem.com — [Button.mdx](https://github.com/carbon-design-system/carbon/blob/HEAD/packages/react/src/components/Button/Button.mdx)
- **Fluent**: a separate Accessibility spec page per component (Button, Checkbox, Dropdown, Input, MenuButton, RadioGroup, SpinButton, SplitButton, Textarea), plus cross-cutting pages (Component labelling, Focus indicator, Truncation, Notification Best Practices) — [index.json](https://react.fluentui.dev/index.json), [Button a11y spec source](https://github.com/microsoft/fluentui/blob/HEAD/packages/react-components/react-button/stories/src/Button/ButtonAccessibilitySpec.mdx)
- **Status labels on the page** [DESIGN-OWNED]:
  - Circuit `<Status>` component + `status:*` tags — [index.json](https://circuit.sumup.com/index.json)
  - Spectrum CSS uses `@etchteam/storybook-addon-status` — [project.json](https://opensource.adobe.com/spectrum-css/project.json)
  - Spectrum Web Components uses `@geometricpanda/storybook-addon-badges` — [project.json](https://opensource.adobe.com/spectrum-web-components/storybook/project.json)
  - Vibe marks status in the title: "[New]", "[Deprecated]" — [index.json](https://vibe.monday.com/index.json)
- **Figma link per component** [DESIGN-OWNED link hygiene]:
  - `@storybook/addon-designs` in Garden, Spark and Spectrum CSS — [Garden project.json](https://zendeskgarden.github.io/react-components/project.json), [Spark project.json](https://sparkui.vercel.app/project.json), [Spectrum CSS project.json](https://opensource.adobe.com/spectrum-css/project.json)
  - Spectrum Web Components ships addon-designs 8.2.1 — [project.json](https://opensource.adobe.com/spectrum-web-components/storybook/project.json)
  - Pajamas component pages link to a Figma component-library file — [Pajamas button](https://design.gitlab.com/components/button)

### Inferences
- Content guidelines are the rarest strong section: Circuit's "Content guidelines", Grafana's Voice and Tone page and Vibe's UX Writing Handbook. A civic product with plain-language obligations should treat them as required.
- Developers trust pages that state accessibility as **requirements** (Canvas Kit's table, Fluent's specs) more than pages that only say "use aria-label". Designers learn most from Do/Don't with pictures plus Anatomy (Grafana, Vibe).

### Gaps
- Which exemplars render a "Related components" block was not found. None of the MDX sources read had a dedicated section, so this looks rare, but only Button pages were sampled.
- Whether Vibe, Grafana and Circuit component pages carry a Figma link could not be confirmed from source.

## How are states and variants shown? Theming, dark mode, density and RTL toggles?

### Takeaway
Most use separate named stories per state plus a Controls playground. The strongest add a **matrix** story: Primer's "All Combinations", commercetools' "All Variants" per component, Spark's "Design and Intent" table, Primer's "All themes". The toolbar leaders are EUI (theme, dark, high contrast, LTR/RTL), Primer (9 themes + All), Grafana (colour-vision themes), Carbon (locale incl. Arabic, text direction, density) and Fluent (theme, direction). Density is usually shown as stories or a doc, rarely as a toolbar.

### Cited Findings
- **Matrix stories** [DESIGN-OWNED]:
  - Primer "ActionList/Examples — All Combinations" — [story](https://primer.style/react/storybook/?path=/story/components-actionlist-examples--all-combinations)
  - commercetools "All Variants" stories on Text, Icons, Spacings, Constraints and ThemeProvider — [index.json](https://uikit.commercetools.com/index.json)
  - Bitwarden "Badge — All Variants", "Banner — All Variants" — [index.json](https://components.bitwarden.com/index.json)
  - Spark "Design And Intent Table" on Button, Card, IconButton — [index.json](https://sparkui.vercel.app/index.json)
  - Forma 36 "Tag/PillNext — All Variants" — [index.json](https://f36-storybook.contentful.com/index.json)
- **Pseudo-states** (hover, focus, active without interaction) [DEV-OWNED tooling for DESIGN-OWNED states]: `storybook-addon-pseudo-states` in Sage Carbon and Orbit — [Sage project.json](https://carbon.sage.com/project.json), [Orbit project.json](https://kiwicom.github.io/orbit/project.json)
- **Theme toolbars**:
  - Primer: 9 themes + "All", rendered side by side and labelled — [preview.jsx](https://github.com/primer/react/blob/HEAD/packages/react/.storybook/preview.jsx)
  - Grafana: built-in themes + deut_prot and tritanopia variants — [preview.ts](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/.storybook/preview.ts)
  - Vibe: Light/Dark/Black — [preview.tsx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/.storybook/preview.tsx)
  - Circuit: Match system/Light/Dark/Consumer — [preview.tsx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/.storybook/preview.tsx)
  - EUI: theme + Light/Dark + High contrast — [decorator.tsx](https://github.com/elastic/eui/blob/HEAD/packages/eui/.storybook/decorator.tsx)
  - Spark: dark mode synced to `data-theme` on `<html>` so CSS variables flip in docs pages too — [preview.tsx](https://github.com/adevinta/spark/blob/HEAD/.storybook/preview.tsx)
  - Fluent: a ThemePicker — [ThemePicker.tsx](https://github.com/microsoft/fluentui/blob/HEAD/packages/react-components/react-storybook-addon/src/components/ThemePicker.tsx)
- **RTL**:
  - Toolbars: Carbon "Text direction" global + Arabic locale — [preview.js](https://github.com/carbon-design-system/carbon/blob/HEAD/packages/react/.storybook/preview.js); EUI LTR/RTL writing mode — [decorator.tsx](https://github.com/elastic/eui/blob/HEAD/packages/eui/.storybook/decorator.tsx); Fluent DirectionSwitch — [DirectionSwitch.tsx](https://github.com/microsoft/fluentui/blob/HEAD/packages/react-components/react-storybook-addon/src/components/DirectionSwitch.tsx)
  - Per-story: Orbit 62 RTL stories — [index.json](https://kiwicom.github.io/orbit/index.json); Canvas Kit 28 — [index.json](https://workday.github.io/canvas-kit/index.json)
  - None found by story name in Primer, Grafana, Sage, Circuit, commercetools, Forma 36, Spark or Bitwarden (index.json scans above).
- **Locale toolbars** [DESIGN-OWNED for content/format rules]: Sage Carbon (8 locales) — [preview.ts](https://github.com/Sage/carbon/blob/HEAD/.storybook/preview.ts); Carbon (4 locales) — [preview.js](https://github.com/carbon-design-system/carbon/blob/HEAD/packages/react/.storybook/preview.js); Circuit — [preview.tsx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/.storybook/preview.tsx); commercetools — [preview.tsx](https://github.com/commercetools/ui-kit/blob/HEAD/storybook/.storybook/preview.tsx)
- **Density**:
  - Carbon dev toolbar "Layout density" — [preview.js](https://github.com/carbon-design-system/carbon/blob/HEAD/packages/react/.storybook/preview.js)
  - Forma 36 "With Density Support" stories — [story](https://f36-storybook.contentful.com/?path=/story/typography-caption--with-density-support)
  - Spectrum CSS "Density – Compact/Spacious" stories — [index.json](https://opensource.adobe.com/spectrum-css/index.json)
  - Docs pages: Bitwarden Compact Mode — [doc](https://components.bitwarden.com/?path=/docs/documentation-compact-mode--docs); SAP Content Density — [doc](https://sap.github.io/fundamental-styles/?path=/docs/docs-content-density--docs); Canvas Kit Density and Alignment — [doc](https://workday.github.io/canvas-kit/?path=/docs/examples-density-and-alignment--docs)

### Inferences
- A Primer-style **"All" toggle** would answer the RTL question at a glance: LTR and RTL side by side, or light and dark side by side. That is persuasive to a reviewer, and an "every story in LTR and Arabic RTL" claim would be visible in one screen.
- EUI's high-contrast toggle and Grafana's colour-vision themes are a small step with a big return for a public-sector product. A forced-colours or high-contrast check is worth adding to the benchmark.

### Gaps
- Garden's preview config could not be located in its repo tree, so its toolbars are unverified.

## Are full-screen templates or page examples shown (tables, forms, dashboards, settings)?

### Takeaway
Few public Storybooks show real full pages. Bitwarden is far ahead, with hundreds of product-screen stories plus a Kitchen Sink. EUI shows page templates. Carbon shows Examples and a UI Shell. Canvas Kit shows Layouts and table-pattern guides. SAP fundamental-styles has 80 Layout entries. Most others stop at component-level examples.

### Cited Findings
- **Bitwarden**: Admin Console/Organizations (204), Admin Console/Providers (35), Billing (Cart Summary, Subscription Card, Pricing Card…), Vault (Vault Items Table, Cipher Form), Tools/Import, Web/PAM, and a Kitchen Sink with "Menu Open", "Dialog Open", "Drawer Open", "Side Nav Open", "Responsive Sidebar" and "Guided Tour" stories — [index.json](https://components.bitwarden.com/index.json), [Kitchen Sink](https://components.bitwarden.com/?path=/story/documentation-kitchen-sink--default) [DESIGN-OWNED compositions]
- **EUI**: Templates/EuiPageTemplate (Playground, Dark Mode) and EuiSelectableTemplateSitewide — [story](https://eui.elastic.co/storybook/?path=/story/templates-euipagetemplate--playground)
- **Carbon**: an Examples group (e.g. EmptyState), UI Shell (Header, SideNav: 14 entries), and DataTable variants — [EmptyState](https://react.carbondesignsystem.com/?path=/docs/examples-emptystate--overview), [UI Shell header](https://react.carbondesignsystem.com/?path=/docs/components-ui-shell-header--overview)
- **Canvas Kit**: Examples/Layouts, plus accessibility examples for Page Header, Side Panel Navigation and Contextual Help — [Layouts](https://workday.github.io/canvas-kit/?path=/docs/examples-layouts--docs), [index.json](https://workday.github.io/canvas-kit/index.json)
- **SAP fundamental-styles**: SAP Design/Layouts (80 entries, e.g. Page), BTP Tool Header/Title Bar/User Menu — [Layouts/Page](https://sap.github.io/fundamental-styles/?path=/docs/sap-design-layouts-page--docs)
- **Primer**: PageLayout (44) and SplitPageLayout stories — [PageLayout](https://primer.style/react/storybook/?path=/story/components-pagelayout--default)
- **Circuit**: "Templates" means app starters (Next.js, Astro), not page layouts — [Templates/nextjs](https://circuit.sumup.com/?path=/docs/templates-nextjs--docs)

### Inferences
- A complete demo back office built only from the system (projects, surveys, votes, reports) would sit level with Bitwarden. To match Bitwarden's rigour, the demo pages should also feed visual regression; its Kitchen Sink exists "to be tested by the Chromatic UI tests".

### Gaps
- Live rendering of these templates was not inspected, so their completeness (real data, empty and error states) is unverified.

## Are tokens documented inside Storybook or on a separate site, and how?

### Takeaway
It is split. Some document tokens inside Storybook with live values: Spark's Design Tokens page, commercetools' Choices/Decisions TokenGroups, Fluent's Theme pages, Vibe's Foundations, Sage's Colors. Others hand tokens to a separate package or site: Canvas Kit (in-Storybook token pages marked deprecated), Primer (primer.style), Spectrum (Spectrum Design Data). The most trusted pattern is a raw/semantic tier split rendered from the real token source.

### Cited Findings
- **commercetools** [DESIGN-OWNED naming/tiers]: "foundation/Choices" (raw: Colors etc.) vs "foundation/Decisions" (semantic: Heights etc.), each rendered by `<TokenGroup path="choiceGroupsByTheme.default.colors" visualizer="color"/>` — [Colors.mdx](https://github.com/commercetools/ui-kit/blob/HEAD/storybook/src/docs/choices/Colors.mdx), [Decisions/Heights](https://uikit.commercetools.com/?path=/docs/foundation-decisions-heights--props)
- **Spark**: a Design Tokens page, "Comprehensive reference tables for all Spark design tokens with live CSS values, Tailwind classes, and visual previews" (1,891-line MDX reading computed CSS variable values) — [DesignTokens.mdx](https://github.com/adevinta/spark/blob/HEAD/documentation/styling/DesignTokens.mdx). Plus a contrast report per theme — [Contrast check](https://sparkui.vercel.app/?path=/docs/styling-themes-contrast-check--docs) [DESIGN-OWNED]
- **Fluent**: Theme section with Border Radii, Colors, Fonts, Shadows, Spacing, Stroke Widths, Typography and a Theme Designer — [Theme Colors](https://react.fluentui.dev/?path=/docs/theme-colors--docs), [Theme Designer](https://react.fluentui.dev/?path=/docs/theme-theme-designer--docs)
- **Canvas Kit**: the "Tokens" group is titled "Tokens (deprecated)", with "Tokens Migration" guides (Installation & Setup, Mapping Tables for Colors/System, Migration Codemod, Q&A) pointing to `@workday/canvas-tokens-web` — [index.json](https://workday.github.io/canvas-kit/index.json), [Agent Skills (tokens-web 4.4)](https://github.com/Workday/canvas-kit/blob/HEAD/modules/docs/mdx/agent-skills/Overview.mdx)
- **Circuit**: design tokens ship as their own package with a docs page in Storybook (Packages/design-tokens), plus stylelint/eslint plugins — [Packages/design-tokens](https://circuit.sumup.com/?path=/docs/packages-design-tokens--docs) [DEV-OWNED packaging; DESIGN-OWNED token set]
- **Spectrum**: tokens and component schemas live in a separate "Spectrum Design Data" repo with packages `tokens`, `token-names`, `component-schemas`, `design-data-spec`, `design-system-registry` and a site with /tokens/ and /components/ — [repo](https://github.com/adobe/spectrum-design-data), [site](https://opensource.adobe.com/spectrum-design-data/). Spectrum CSS's tokens package consumes `@adobe/spectrum-tokens` — [tokens/package.json](https://github.com/adobe/spectrum-css/blob/HEAD/tokens/package.json)
- **Vibe**: Foundations pages (Motion, Round Corners, Shadow, Typography, Spacing) and an MCP tool `list-vibe-tokens` — [index.json](https://vibe.monday.com/index.json), [mcp.mdx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/src/pages/mcp/mcp.mdx)
- **Sage Carbon**: Documentation/Colors — [Colors](https://carbon.sage.com/?path=/docs/documentation-colors--docs)

### Inferences
- For govocal-ds (`--gv-*` CSS variables generated from Figma variables), the convincing developer artefact is a tokens page rendered **from the generated CSS at runtime**, as Spark does, plus a raw-versus-semantic split, as commercetools does. That proves Figma, CSS and Storybook agree, rather than asserting it.

### Gaps
- Whether any exemplar shows the Figma variable name next to the CSS variable on the same row was not verified.

## What quality signals are visible (interaction tests, a11y panel, visual regression, changelog, version picker, composition)?

### Takeaway
The visible quality signals are:
- **a11y addon**: nearly universal (Carbon uses IBM's accessibility checker)
- **Chromatic / visual regression**: Canvas, Vibe, Sage, Circuit, commercetools, Forma 36, Spectrum, Bitwarden; EUI via VRT-only stories
- **play-function counts**: Bitwarden 102, EUI 52, Circuit 45, Vibe 22
- **changelog/migration pages**: Canvas, Vibe, Circuit
- **version pickers**: Canvas Versions page, Circuit v5–v11 builds
- **composition**: Spectrum refCount 1

### Cited Findings
- **Play-function stories** (`play-fn` tag), from each index.json linked in the catalogue: Bitwarden 102, EUI 52, Circuit 45, Vibe 22, Spectrum CSS 18, Carbon 4, Primer 3, Sage 3.
- **Visual-regression markers** [DEV-OWNED]:
  - EUI `vrt-only` 186 — [index.json](https://eui.elastic.co/storybook/index.json)
  - commercetools `vrt` 91 — [index.json](https://uikit.commercetools.com/index.json)
  - Chromatic addon in Canvas Kit, Vibe, Spectrum CSS, Spectrum Web Components, Sage Carbon, Circuit, commercetools and Forma 36 — see each project.json above
  - Canvas Kit's "Testing" group, 169 entries — [index.json](https://workday.github.io/canvas-kit/index.json)
  - Spectrum Web Components test packages include `@web/test-runner-visual-regression` — [project.json](https://opensource.adobe.com/spectrum-web-components/storybook/project.json)
- **Accessibility tooling**:
  - Carbon: `storybook-addon-accessibility-checker` — [project.json](https://react.carbondesignsystem.com/project.json)
  - Canvas Kit: cypress-axe 1.7.0 — [project.json](https://workday.github.io/canvas-kit/project.json)
  - Spectrum Web Components: a custom screen-reader addon — [project.json](https://opensource.adobe.com/spectrum-web-components/storybook/project.json)
  - GitLab UI: axe-playwright + `@storybook/test-runner` — [package.json (old repo)](https://gitlab.com/gitlab-org/gitlab-ui)
- **Performance**: Primer's `@github-ui/storybook-addon-performance-panel` — [project.json](https://primer.style/react/storybook/project.json)
- **Changelog / migration pages**: Canvas Kit Changelog + upgrade guides v4–v16 — [Changelog](https://workday.github.io/canvas-kit/?path=/docs/changelog--docs); Vibe Changelog + Migration Guide — [Changelog](https://vibe.monday.com/?path=/docs/changelog--docs); Circuit Changelog + Migration — [Changelog](https://circuit.sumup.com/?path=/docs/introduction-changelog--docs); Sage Deprecation Migration — [index.json](https://carbon.sage.com/index.json)
- **Version access**: Canvas Kit Versions page (`<VersionTable />`) — [Versions.mdx](https://github.com/Workday/canvas-kit/blob/HEAD/modules/docs/mdx/Versions.mdx); Circuit lists v5–v11 Storybook URLs in its preview config — [preview.tsx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/.storybook/preview.tsx)
- **Composition** (`refCount` in project.json): Spectrum CSS 1, Spectrum Web Components 1, Canvas Kit 0 — [Spectrum CSS project.json](https://opensource.adobe.com/spectrum-css/project.json), [Canvas project.json](https://workday.github.io/canvas-kit/project.json)
- **Live-code playgrounds**: Vibe Playground (storybook-addon-playground) — [Playground](https://vibe.monday.com/?path=/story/playground--playground); Fluent `react-storybook-addon-playground` + export-to-sandbox — [project.json](https://react.fluentui.dev/project.json)

### Inferences
- A developer reads a high **play-function count** and **VRT coverage** as proof, not prose. Bitwarden (102 play functions, Chromatic Kitchen Sink) and EUI (186 VRT stories) are the bars. Visible lifecycle and changelog pages (Canvas, Vibe, Circuit) are the governance proof.

### Gaps
- CI pass rates, Chromatic snapshot counts and a11y violation totals are not public, so test effectiveness could not be compared.

## What earns a senior developer's trust, and what teaches a designer?

### Takeaway
Developers are convinced by evidence they can inspect: a current Storybook version, play-function and VRT coverage, typed props tables, token pages rendered from real CSS, lifecycle tags with a semver promise, changelog, migration guides and MCP/agent docs that match the code. Designers learn from orientation pages, Do/Don't, Anatomy, Placement, content and voice guides, and full-page compositions.

### Cited Findings
- **Developer-convincing artefacts, with examples**:
  - Lifecycle with a contract: Circuit's Stable stage means accessibility, browser support, localisation, test coverage and docs are met; Experimental is outside semver and imported from a separate entry point — [Component Lifecycle](https://circuit.sumup.com/?path=/docs/introduction-component-lifecycle--docs) [DESIGN-OWNED stages; DEV-OWNED entry points]
  - Upgrade guides with "Visual Changes" pages: Canvas Kit v14–v15 — [index.json](https://workday.github.io/canvas-kit/index.json)
  - Machine-readable agent docs that mirror the human docs: Canvas Kit MCP + Agent Skills; Vibe MCP — [Canvas MCP](https://workday.github.io/canvas-kit/?path=/docs/ai-for-llms-mcp-docs--docs), [Vibe MCP](https://vibe.monday.com/?path=/docs/mcp--docs)
  - Tests as visible stories: EUI VRT stories, Bitwarden Kitchen Sink — [EUI VRT story](https://eui.elastic.co/storybook/?path=/story/templates-euiselectabletemplatesitewide--vrt), [Kitchen Sink](https://components.bitwarden.com/?path=/docs/documentation-kitchen-sink--docs)
- **Designer-teaching artefacts, with examples**:
  - Grafana's Design Principles + Voice and Tone + a Button page with Anatomy/Hierarchy/Placement — [Design Principles](https://developers.grafana.com/ui/latest/?path=/docs/docs-overview-design-principles--docs), [Button.mdx](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/src/components/Button/Button.mdx)
  - Vibe's UX Writing Handbook and Do's/Don'ts — [UX Writing Handbook](https://vibe.monday.com/?path=/docs/foundations-ux-writing-handbook--docs)
  - Circuit's Content guidelines — [Button.mdx](https://github.com/sumup-oss/circuit-ui/blob/HEAD/packages/circuit-ui/components/Button/Button.mdx)
  - Canvas Kit's accessibility table patterns — [Table Patterns](https://workday.github.io/canvas-kit/?path=/docs/guides-accessibility-table-patterns--docs)
  - Spark's Component Principles (Composition, Compound pattern, Design Inventory, Polymorphism) and a Component checklist — [Composition](https://sparkui.vercel.app/?path=/docs/components-principles-composition--docs), [Component checklist](https://sparkui.vercel.app/?path=/docs/contributing-component-checklist--docs)

### Inferences
- An AI-built system can answer the question "can AI-built be strong?" the way Canvas Kit and Vibe already do. They publish their agent tooling (MCP, Skills) as first-class docs next to the human docs. That frames agents as a governed consumer of the same source of truth, not a shortcut. A strong precedent for govocal-ds's MCP addon is a page explaining what agents can read and how the rules are enforced.
- For a designer who will "own the bible", Grafana's Docs Overview plus Vibe's Foundations show which orientation pages a designer-run Storybook needs before any component.

### Gaps
- No 2025–2026 public testimony was found from developers or designers at these companies on what made them trust their Storybook. These inferences rest on artefacts, not interviews.

## How do multi-implementation systems separate the design spec from the code, and which practices are design-owned vs dev-owned?

### Takeaway
The mature systems keep **one implementation-agnostic spec site** (usage, style, accessibility, content, tokens, sometimes component schemas) and **one Storybook per implementation**. The spec page links out to each code Storybook. Carbon, Spectrum, Fluent, Primer, Pajamas, Garden, Grafana (Saga) and SAP all do this. For govocal-ds, which is a designer's *proposal* to developers, the design-owned layer (tokens, names, states, behaviour and content rules, lifecycle, IA, Figma links) is what must survive whatever stack developers choose.

### Cited Findings
- **IBM Carbon**:
  - carbondesignsystem.com component pages have a Code tab linking to separate Storybooks for React, Web Components, Angular and Vue — [Button code tab](https://carbondesignsystem.com/components/button/code/)
  - The four Storybooks: React (SB 10.3.5) — [project.json](https://react.carbondesignsystem.com/project.json); Web Components (SB 10.3.5, 531 entries, built 21 Oct 2026) — [project.json](https://web-components.carbondesignsystem.com/project.json); Angular (SB 7.6.7, 324 entries, built 20 Oct 2026) — [project.json](https://angular.carbondesignsystem.com/project.json); Vue (SB 6.5.15, last built 22 Nov 2024, stale) — [project.json](https://vue.carbondesignsystem.com/project.json)
  - The React Storybook's Button page links back to the spec site for Usage and Accessibility — [Button.mdx](https://github.com/carbon-design-system/carbon/blob/HEAD/packages/react/src/components/Button/Button.mdx)
- **Adobe Spectrum**:
  - Design spec at spectrum.adobe.com (s2.spectrum.adobe.com redirects there) — [spectrum.adobe.com](https://spectrum.adobe.com/)
  - Design *data* (tokens, token-names, **component-schemas**, design-data-spec, registry) in "Spectrum Design Data", described as "Design data, including design tokens, component schemas, and tooling for Spectrum" — [repo](https://github.com/adobe/spectrum-design-data), [site](https://opensource.adobe.com/spectrum-design-data/)
  - Implementations: Spectrum CSS (Storybook; consumes `@adobe/spectrum-tokens`) — [tokens/package.json](https://github.com/adobe/spectrum-css/blob/HEAD/tokens/package.json); Spectrum Web Components (Storybook) — [Storybook](https://opensource.adobe.com/spectrum-web-components/storybook/); React Spectrum (docs site, with no stable public Storybook found: react-spectrum.adobe.com/storybook returned the docs HTML) — [react-spectrum.adobe.com](https://react-spectrum.adobe.com/)
  - [DESIGN-OWNED]: component schemas are an implementation-agnostic API/behaviour spec.
- **Microsoft Fluent 2**: the design site has per-platform component usage pages (path pattern `/components/web/react/core/button/usage`) — [Fluent 2 Button usage](https://fluent2.microsoft.design/components/web/react/core/button/usage). The code Storybooks are separate: React v9 (SB 9.1.17) — [react.fluentui.dev](https://react.fluentui.dev/); Web Components (SB 9.1.17, 361 entries) — [web-components.fluentui.dev](https://web-components.fluentui.dev/)
- **GitHub Primer**: one component page on primer.style links to React and Rails (ViewComponent) implementations and to Figma getting-started — [Primer Button](https://primer.style/product/components/button/), [Rails Button](https://primer.style/product/getting-started/rails/components/button). The React Storybook is a separate workbench with 1 docs entry — [index.json](https://primer.style/react/storybook/index.json)
- **GitLab Pajamas**: the design.gitlab.com component page links to the GitLab UI Storybook and to a Figma component-library file — [Pajamas button](https://design.gitlab.com/components/button)
- **Grafana**: the "Saga" design system site — [Saga overview](https://grafana.com/developers/saga/about/overview) — sits beside the @grafana/ui Storybook — [Storybook](https://developers.grafana.com/ui/latest/)
- **Zendesk Garden**: garden.zendesk.com (design) links to its code Storybooks — [Garden button](https://garden.zendesk.com/components/button)
- **SAP**: Fiori design guidelines (sap.com/design-system/fiori-design-web; returned 403 to automated fetch). Implementations: fundamental-styles (Storybook) — [Storybook](https://sap.github.io/fundamental-styles/); UI5 Web Components (custom docs site) — [docs](https://ui5.github.io/webcomponents/)
- **Material**: Material Web is "in maintenance mode pending new maintainers" — [material-web README](https://github.com/material-components/material-web). The m3.material.io spec site was not checked in this pass.
- **Workday**: canvas.workday.com (design site, 403 to automated fetch) vs the Canvas Kit Storybook (code). Canvas tokens ship as a separate package, `@workday/canvas-tokens-web` — [Agent Skills overview](https://github.com/Workday/canvas-kit/blob/HEAD/modules/docs/mdx/agent-skills/Overview.mdx)

**Practice ledger** (what each exemplar teaches, tagged)
- [DESIGN-OWNED] **Token tiers + names**: raw "Choices" vs semantic "Decisions" (commercetools); shared token data feeding several implementations (Spectrum Design Data → Spectrum CSS) — sources above.
- [DESIGN-OWNED] **Component behaviour specs**: Spectrum component schemas; Fluent per-component accessibility specs; Canvas Kit accessibility-requirements tables; Canvas Kit table patterns — sources above.
- [DESIGN-OWNED] **States/variants matrix and state names**: Primer All Combinations, Spark Design and Intent, commercetools All Variants — sources above.
- [DESIGN-OWNED] **Content rules**: Grafana Voice and Tone, Vibe UX Writing Handbook, Circuit Content guidelines — sources above.
- [DESIGN-OWNED] **Lifecycle vocabulary**: Circuit's six stages and what each promises; the Primer/Carbon/Canvas sidebar zones — sources above.
- [DESIGN-OWNED] **IA of the docs**: Canvas, Vibe, Circuit, Grafana orders — sources above.
- [DESIGN-OWNED] **Density, RTL and theme rules** as written specs: Canvas density table, Bitwarden compact-mode rule, SAP Content Density — sources above.
- [DESIGN-OWNED] **Figma linkage**: addon-designs (Garden, Spark, Spectrum); Pajamas → Figma file — sources above.
- [DESIGN-OWNED] **Full-page compositions as reference screens**: Bitwarden product areas, EUI templates — sources above.
- [DEV-OWNED] Component library and framework (React/Angular/Vue/WC), styling tech (Emotion in Canvas, Tailwind in Bitwarden and Spark, CSS in Spectrum CSS), Storybook builder (vite/webpack/rsbuild), test stack (Cypress/Playwright/Vitest/Chromatic), packaging (separate token package as in Circuit `design-tokens` and Canvas `canvas-tokens-web`; experimental entry point as in Circuit), lint plugins (Circuit eslint/stylelint), MCP server implementation — sources above.

### Inferences
- For govocal-ds's audience split: the design-owned layer is the deliverable that must stand on its own. That layer is tokens + names, state matrices, behaviour/a11y specs, content rules, lifecycle labels, IA, Figma links and reference screens. The React Aria + plain-CSS Storybook then serves as *one* reference implementation that developers may replace, the way Carbon's four Storybooks or Spectrum's three implementations share one spec. Spectrum's design-data repo, which holds tokens and component schemas outside any implementation, is the clearest model for keeping that layer intact if developers drop React Aria.
- One caution from Carbon: implementations drift. Its Vue Storybook was last built in Nov 2024 on SB 6.5, and Angular is on SB 7.6, while React is on 10.3. A proposal should say which implementation is the reference, and how the spec is checked against the others.

### Gaps
- Material's m3.material.io and the SAP Fiori guidelines were not read, so their spec/code linking is unverified.
- Whether Fluent 2's design pages link directly to react.fluentui.dev stories was not confirmed in the fetched HTML.

## Who owns the component code, and how are consumers kept inside the system's language (restricted styling APIs, token-only layout primitives, lint rules)?

### Takeaway
In every exemplar the component code is owned by **one dedicated design-system / UI-foundation team**. The repo's CODEOWNERS says so: Primer, EUI, Canvas Kit, Vibe, Sage, Circuit, Bitwarden, Forma 36, commercetools, Carbon. Grafana is the exception: a frontend-platform team owns it, with an "everyone contributes" framing. Product engineers consume the code.

Consumers are kept inside the language by four layers:
1. **A narrowed styling API.** Spectrum 2's `styles` prop accepts only layout/spacing/sizing/position, through a token-only `style` macro; v3 names its escape hatches `UNSAFE_className`/`UNSAFE_style`. Primer v38 removed `sx` and styled-system props. Canvas Kit deprecated style props for "prescriptive, opinionated styling". Sage officially discourages style extension.
2. **Layout primitives with token-scale props**, so screens need no custom CSS: Primer `Stack` gap scale, EUI `gutterSize`, Grafana `Stack` gap typed as `ThemeSpacingTokens`, Atlassian primitives.
3. **Lint and stylelint rules shipped to consuming apps** that flag raw colours/spacing/radius/z-index, unknown custom properties, deprecated props, and native HTML where a system component exists.
4. **Codemods plus public-API snapshot tests** for change control.

### Cited Findings
**(1) Who owns the code: CODEOWNERS** (product engineers consume; the DS team reviews)
- Primer React: `* @primer/engineer-reviewers`; the legacy theme folder is owned by `@primer/design-reviewers` — [CODEOWNERS](https://github.com/primer/react/blob/HEAD/CODEOWNERS)
- Elastic EUI: `* @elastic/eui-team` — [CODEOWNERS](https://github.com/elastic/eui/blob/HEAD/CODEOWNERS)
- Workday Canvas Kit: `* @workday/canvas-engineering` — [CODEOWNERS](https://github.com/Workday/canvas-kit/blob/HEAD/.github/CODEOWNERS)
- monday.com Vibe: `* @mondaycom/vibe` — [CODEOWNERS](https://github.com/mondaycom/vibe/blob/HEAD/.github/CODEOWNERS). The Welcome page carries a Team block and a Contributors block — [welcome.mdx](https://github.com/mondaycom/vibe/blob/HEAD/packages/docs/src/pages/welcome/welcome.mdx)
- Sage Carbon: `* @Sage/carbon`, `*.js @Sage/carbon-dev` — [CODEOWNERS](https://github.com/Sage/carbon/blob/HEAD/.github/CODEOWNERS)
- SumUp Circuit UI: `* @sumup-oss/owner-design-system` — [CODEOWNERS](https://github.com/sumup-oss/circuit-ui/blob/HEAD/.github/CODEOWNERS)
- Bitwarden: `libs/components` and `libs/ui` are owned by `@bitwarden/team-ui-foundation`, while the product folders (Admin Console, Billing…) belong to product teams in the same monorepo — [CODEOWNERS](https://github.com/bitwarden/clients/blob/HEAD/.github/CODEOWNERS)
- Contentful Forma 36: `@contentful/team-ui-foundation` — [CODEOWNERS](https://github.com/contentful/forma-36/blob/HEAD/.github/CODEOWNERS)
- commercetools UI Kit: `* @commercetools/merchant-center-foundations-team-devs` — [CODEOWNERS](https://github.com/commercetools/ui-kit/blob/HEAD/.github/CODEOWNERS)
- IBM Carbon: `* @carbon-design-system/monorepo-reviewers`. The **public API snapshot** (`PublicAPI-test.js` / `.snap`) additionally needs `@carbon-design-system/developers-system-admins` — [CODEOWNERS](https://github.com/carbon-design-system/carbon/blob/HEAD/.github/CODEOWNERS) [DEV-OWNED change control]
- Microsoft Fluent v9: owned per component; e.g. `react-button/library` and `/stories` → `@microsoft/cxe-prg` — [CODEOWNERS](https://github.com/microsoft/fluentui/blob/HEAD/.github/CODEOWNERS)
- Grafana UI: `/packages/grafana-ui/ @grafana/grafana-frontend-platform` — [CODEOWNERS](https://github.com/grafana/grafana/blob/HEAD/.github/CODEOWNERS). The Intro adds: "Developers and designers create and improve @grafana/ui together" — [Intro.mdx](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/src/Intro.mdx)
- Adobe React Spectrum: no CODEOWNERS file found in the repo (checked `.github/`, root, `docs/`).
- None of these CODEOWNERS files distinguishes "design engineers" from "engineers" by title. Primer is the only one with a separate design-reviewer group (sources above).

**(2a) Restricted styling APIs and escape hatches** [DESIGN-OWNED rule, enforced by the DS code]
- **Spectrum 2 (React)**:
  - "The `style` macro runs at build time and returns a class name that applies Spectrum 2 design tokens (colors, spacing, sizing, typography, etc.)" — [styling.mdx](https://github.com/adobe/react-spectrum/blob/HEAD/packages/dev/s2-docs/pages/s2/styling.mdx)
  - "The `styles` prop accepts a limited set of CSS properties, including layout, spacing, sizing, and positioning. Other styles such as colors and internal padding cannot be customized within Spectrum components." The documented allow-list starts margin, marginStart/End/Top/Bottom/X/Y, width, minWidth, maxWidth… — same source
  - "CSS resets are strongly discouraged"; Spectrum 2 uses CSS Cascade Layers — same source
  - Live page: [react-spectrum.adobe.com/s2/styling](https://react-spectrum.adobe.com/s2/styling.html)
- **React Spectrum v3**: escape hatches are named `UNSAFE_className` and `UNSAFE_style`, "use at your own risk". The docs give the reason: style overrides in products break when components change, "for this reason, `className` and `style` are unsafe" — [v3 styling.mdx](https://github.com/adobe/react-spectrum/blob/HEAD/packages/dev/docs/pages/react-spectrum/styling.mdx)
- **Primer React v38**: removed the styled-components dependency, which "drops support for the sx prop and styled-system props". Components are styled with `className` + CSS Modules; Box/sx/useTheme users must migrate — [v38 release discussion](https://github.com/primer/react/discussions/7086)
  - `@primer/styled-react` is "a temporary package that bridges the gap between Primer React and styled-components", with components removed "when their sx usage goes to zero" — [styled-react README](https://github.com/primer/react/blob/main/packages/styled-react/README.md)
  - An older lint rule already banned system props — [no-system-props rule](https://github.com/primer/eslint-plugin-primer-react/blob/main/docs/rules/no-system-props.md)
- **Workday Canvas Kit**: "Style Props (deprecated)" plus a Style Props Migration guide and codemod. The migration is away from Emotion's runtime toward `@workday/canvas-kit-styling` (`createStyles`/`createStencil`). Stated goals include "Promote prescriptive, opinionated styling across Workday" and "Support new design tokens and CSS Variables" — [Style Props Migration overview](https://workday.github.io/canvas-kit/?path=/docs/guides-style-props-migration-overview--docs), [source](https://github.com/Workday/canvas-kit/blob/HEAD/modules/docs/mdx/style-props/stylePropsMigrationOverview.mdx), [Why Canvas Styling](https://workday.github.io/canvas-kit/?path=/docs/styling-guides-why-canvas-styling--docs). A `styling-transform` module compiles styles statically — [modules/](https://github.com/Workday/canvas-kit/tree/HEAD/modules) [DEV-OWNED mechanism]
- **Sage Carbon** (policy, not mechanism): "We strongly discourage extending the styles of Carbon components. Please use the available component props to control visuals… Extending styles should only be considered as a last resort… We cannot guarantee our components' internal HTML/CSS will remain unchanged" — [Extending Styles page](https://carbon.sage.com/?path=/docs/documentation-extending-styles-of-carbon-components--docs), [source](https://github.com/Sage/carbon/blob/HEAD/docs/extending-styles-using-styled-components.mdx)
- **Atlassian** (no public Storybook; a guardrail reference only): `@atlaskit/primitives` are "token-backed low-level building blocks": Box, xcss, Inline, Stack, Flex, Grid, Bleed. Version 22.6.0 was published Oct 2026 — [npm @atlaskit/primitives](https://www.npmjs.com/package/@atlaskit/primitives), [xcss docs](https://atlassian.design/components/primitives/xcss)

**(2b) Layout primitives with token-scale props** [DESIGN-OWNED scale; DEV-OWNED component]
- Primer `Stack`: `gap` and `padding` take a named scale `'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'` (responsive) — [Stack.tsx](https://github.com/primer/react/blob/HEAD/packages/react/src/Stack/Stack.tsx)
- Grafana `Stack`: `gap`/`rowGap`/`columnGap` are typed `ResponsiveProp<ThemeSpacingTokens>` and resolved through `theme.spacing(val)` — [Stack.tsx](https://github.com/grafana/grafana/blob/HEAD/packages/grafana-ui/src/components/Layout/Stack/Stack.tsx), [Gap examples story](https://developers.grafana.com/ui/latest/?path=/story/layout-stack--gap-examples)
- EUI `EuiFlexGroup`: `gutterSize` is limited to `['none','xs','s','m','l','xl']` — [flex_group.tsx](https://github.com/elastic/eui/blob/HEAD/packages/eui/src/components/flex/flex_group.tsx)
- Vibe `Flex`: `gap?: FlexGap | number`, where `FlexGap = "xs" | "small" | "medium" | "large"` maps to `--space-*` variables. It accepts the named scale **or a raw number**, a weaker guard — [Flex.tsx](https://github.com/mondaycom/vibe/blob/HEAD/packages/components/layout/src/Flex/Flex.tsx), [Flex.types.ts](https://github.com/mondaycom/vibe/blob/HEAD/packages/components/layout/src/Flex/Flex.types.ts)
- Atlassian: Box/Inline/Stack/Flex/Grid "token-backed" (npm README above), plus the lint rule `use-tokens-space` (below).

**(2c) Lint rules shipped to consuming apps** [DEV-OWNED adoption; the rules encode DESIGN-OWNED decisions]
- **SumUp Circuit**:
  - `eslint-plugin-circuit-ui`: `no-invalid-custom-properties`, `prefer-custom-properties`, `no-deprecated-custom-properties`, `no-deprecated-props`, `no-deprecated-icons`, `no-deprecated-spacing-mixin`, `no-renamed-components`, `no-renamed-props`, `component-lifecycle-imports`, `no-default-props` — [plugin folder](https://github.com/sumup-oss/circuit-ui/tree/HEAD/packages/eslint-plugin-circuit-ui), [README](https://github.com/sumup-oss/circuit-ui/blob/HEAD/packages/eslint-plugin-circuit-ui/README.md)
  - `stylelint-plugin-circuit-ui`: `no-invalid-custom-properties`, `no-deprecated-custom-properties` — [plugin folder](https://github.com/sumup-oss/circuit-ui/tree/HEAD/packages/stylelint-plugin-circuit-ui)
  - Both are documented inside the Storybook under Packages — [index.json](https://circuit.sumup.com/index.json)
- **Atlassian**: `@atlaskit/eslint-plugin-design-system` (16.14.3, Oct 2026) ships rules including `ensure-design-token-usage`, `no-unsafe-design-token-usage`, `no-unsafe-style-overrides`, `use-tokens-space`, `use-tokens-typography`, `use-tokens-shape`, `use-tokens-motion`, `use-primitives-text`, `use-latest-xcss-syntax`, `use-heading`. It also ships `no-html-button`/`-anchor`/`-checkbox`/`-heading`/`-select`/`-textarea`/`-text-input`, which flag native elements where a system component exists — [npm](https://www.npmjs.com/package/@atlaskit/eslint-plugin-design-system)
- **Primer**:
  - `eslint-plugin-primer-react`: `no-deprecated-props`, `no-deprecated-entrypoints`, `no-deprecated-experimental-components`, `new-color-css-vars`, `enforce-css-module-default-import`, `enforce-css-module-identifier-casing`, `no-wildcard-imports`, plus a11y rules (`a11y-explicit-heading`, `a11y-use-accessible-tooltip`, `a11y-no-duplicate-form-labels`…) — [rules](https://github.com/primer/eslint-plugin-primer-react/tree/HEAD/src/rules)
  - `@primer/stylelint-config` plugins: `colors`, `spacing`, `typography`, `borders`, `box-shadow`, `responsive-widths`, `no-display-colors` — [plugins](https://github.com/primer/stylelint-config/tree/HEAD/plugins)
- **Grafana**: `@grafana/eslint` rules include `theme-token-usage` ("Check for theme token usage"), `no-border-radius-literal`, `no-unreduced-motion`, `no-invalid-css-properties`, `consistent-story-titles` — [rules](https://github.com/grafana/grafana/tree/HEAD/packages/grafana-eslint-rules/rules)
- **Elastic EUI**: `@elastic/eslint-plugin-eui` rules include `no_css_color`, `no_static_z_index`, `no_restricted_eui_imports`, `href_or_on_click`, `require_href_for_link`, `callout_prefer_props_for_content`, a11y rules — [rules](https://github.com/elastic/eui/tree/HEAD/packages/eslint-plugin/src/rules)
- **IBM Carbon**: `stylelint-plugin-carbon-tokens` (repo pushed 28 Oct 2026) — [repo](https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens)
- **Bitwarden**: in-repo ESLint rules `no-bwi-class-usage`, `require-theme-colors-in-svg`, `no-icon-children-in-bit-button`, `require-label-on-biticonbutton`, `no-bit-dialog-wrapper`, `enforce-readonly-angular-properties` — [libs/eslint/components](https://github.com/bitwarden/clients/tree/HEAD/libs/eslint/components). Compact mode is reachable only through the `bit-compact` variant — [compact-mode.mdx](https://github.com/bitwarden/clients/blob/HEAD/libs/components/src/stories/compact-mode.mdx)
- **Fluent v9**: `eslint-plugin-react-components` rules are migration guards (`prefer-fluentui-v9`, `enforce-use-client`), not style guards — [rules](https://github.com/microsoft/fluentui/tree/HEAD/packages/react-components/eslint-plugin-react-components/src/rules)
- **Vibe**: no lint plugin among its packages (base, codemod, components, config, core, docs, hooks, icons, mcp, shared, storybook-blocks, style, testkit). It relies on **codemods** and a **testkit** — [packages/](https://github.com/mondaycom/vibe/tree/HEAD/packages)
- **Codemods for migrations** [DEV-OWNED]:
  - Canvas Kit: `modules/codemod`, plus Style Props, Tokens and Icon migration codemods documented in Storybook — [index.json](https://workday.github.io/canvas-kit/index.json)
  - Vibe: `packages/codemod` — [packages/](https://github.com/mondaycom/vibe/tree/HEAD/packages)

### Inferences
- The lead's model is "design owns the component code, developers import it to compose screens". The closest exemplar is Circuit's `owner-design-system` team, which ships components, tokens, an ESLint plugin and a Stylelint plugin, all documented in the same Storybook. Spectrum 2 is the strictest public form: a token-only build-time style macro, and a `styles` prop that allows layout properties only. Primer v38 (sx removed) and Canvas Kit (style props deprecated for "prescriptive, opinionated styling") show the trend in 2025–2026: escape hatches are closing, not widening.
- For govocal-ds, plain CSS on `--gv-*` variables already has the right shape for Circuit-style `no-invalid-custom-properties` / `prefer-custom-properties` stylelint rules, which flag any non-`--gv-` colour or spacing in a consuming app. The design side can author and own such a rule set even if developers pick the stack. Layout primitives typed to the spacing scale (Primer/Grafana/EUI pattern, not Vibe's `| number`) are what let screens need no custom CSS.
- An escape hatch named honestly (Spectrum's `UNSAFE_*`) is more credible to developers than "no overrides allowed". It gives them a way out and makes every exit visible and greppable. Pairing it with a public-API snapshot test (Carbon's `PublicAPI-test` owned by system admins) shows them that the component contract is guarded.

### Gaps
- Atlassian's xcss page renders client-side and could not be read, so its exact allowed and banned properties are taken only from the package and lint-rule names.
- Whether Sage Carbon, commercetools, Forma 36 or Garden ship consumer lint rules was not found.
- CODEOWNERS shows team names, not whether members are design engineers or product engineers. No public org-chart evidence was gathered.
- React Spectrum's ownership model is unverified: no CODEOWNERS file was found.
