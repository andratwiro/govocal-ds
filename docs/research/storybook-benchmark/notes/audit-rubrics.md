# Design-system audit frameworks, maturity models and checklists → a 0–100 rubric for one Storybook

Scope note: the frameworks are inventoried first (Q1–Q5), then a proposed rubric (Q6). The rubric is split in two. (A) is DESIGN-OWNED, scored now, and stays valuable whatever stack developers pick. (B) is DEV-OWNED (packaging, test infrastructure, API mechanics, distribution), scored lightly as "ready for their decision", because those are the developers' decisions. Sources from 2025–2026 come first. Older canonical work is marked **[background/origin]**.

---

## Q1. What frameworks exist and what do they measure?

### Takeaway
About fifteen usable frameworks exist. They fall into four families:
- **Organisational maturity models**: Sparkbox, zeroheight, NN/G, Atomize, designsystems.one, the W3C accessibility model.
- **Artifact checklists**: designsystemchecklist.com, the EightShapes QA and documentation anatomy, Component Gallery.
- **Survey benchmarks**: the zeroheight reports for 2025 and 2026, Figma's metrics guidance.
- **Machine-checkable scorecards**: Open Design System Bench, the designsystems.one AI-ready index, OpenSSF Scorecard, CHAOSS.

Only the last family produces numbers from outside the organisation. The maturity models mostly need interviews.

### Cited Findings

**Maturity models (organisational, mostly self-assessed)**
- **NN/G Design-System Maturity framework** (Huei-Hsin Wang, 10 Jul 2026). It has six dimensions, each rated 1–5: Organizational Alignment, Team Effectiveness, Infrastructure Robustness, Governance, Support, Adoption. The level labels are 1 Absent ("No intentional structure or ownership is in place"), 2 Emerging, 3 Functional ("a defined approach supports routine needs, but the system remains fragile"), 4 Strong ("consistent, clearly owned, and reliably applied") and 5 Exceptional ("mature, continuously improving based on measured outcomes"). — [NN/G](https://www.nngroup.com/articles/design-system-maturity/)
  - Infrastructure Robustness sub-criteria: "Component coverage, consistency across platforms, and parity between design and code"; "The structure and scalability of foundations and design tokens"; "The completeness, clarity, and usability of documentation"; "Tooling quality and overall developer experience"; "Content standards and baked-in accessibility practices". — [NN/G](https://www.nngroup.com/articles/design-system-maturity/)
  - Governance sub-criteria: "Contribution models", "Deviation management and decision making", "Flexibility philosophy", "Versioning and release strategy", "Prioritization frameworks". Support: onboarding and learning, responsive support, communication and visibility, advocacy and champions. Adoption: "Usage," "Conformance," and "Trust." — [NN/G](https://www.nngroup.com/articles/design-system-maturity/)
- **zeroheight Design System Maturity Model** (online self-assessment, 29 questions, about 8 minutes, date not shown). It has six independent axes:
  - Foundations: "Tokens, components, and the reliability of the substrate consumers build on".
  - Documentation & Knowledge: "How much of the system's knowledge lives outside people's heads".
  - Governance & Team.
  - Adoption.
  - Measurement & Impact: "Whether you can answer 'is this system worth it?'".
  - AI Readiness: "Whether your design system is the default context that AI tools build from".

  Each axis runs four stages (V1 → Growing → Teenage → Healthy Product). The page says it is "built on the four-stage design system maturity model by Sparkbox, extended into six independent axes." — [zeroheight maturity](https://zeroheight.com/maturity/)
- **Sparkbox Design System Maturity Model** (Ben Callahan, 23 Feb 2021) **[background/origin]**. Four stages: "Building Version One", "Growing Adoption", "Surviving the Teenage Years", "Evolving a Healthy Product". It assesses priorities, challenges and measurement per stage, and separates a grassroots origin from a top-down one. — [Sparkbox](https://sparkbox.com/foundry/design_system_maturity_model)
- **Atomize "Design System Maturity: 5 Levels + Scorecard"** (11 May 2026, updated 18 Jun 2026; a tool vendor's blog).
  - Levels: UI Kit → Design Library → Design System → Scaled System → Public System.
  - Scorecard: six dimensions scored 0–2 (Governance, Documentation, Tokens, Code Sync, Adoption, Ownership).
  - Tokens anchors: 0 = "Raw styles or hex only", 1 = "Primitives without semantic layer", 2 = "Semantic tokens bound in Figma Variables".
  - Code Sync anchors: 0 = design-only, 1 = "Tokens exported but rarely used in production", 2 = "Production apps consume token CSS or equivalent".
  - Documentation 2 = "Guidelines, status, release notes maintained". Governance 2 = "Published contribution and release process".
  - Total mapping: 0–2 → L1, 3–5 → L2, 6–8 → L3, 9–11 → L4, 12 → L4+.

  — [Atomize](https://atomize.tools/blog/design-system-maturity/)
- **designsystems.one Maturity Model** (date not shown). Five stages: Ad hoc → Managed → Defined ("Tokens serve as source of truth; adoption is measured quarterly") → Optimized → Adaptive ("Multi-brand capability; themes are runtime-swappable"). Nine yes/no questions place a system: the first "no" marks its stage. Results are read as a heatmap, not one score, and "The lowest dimension caps the system". — [designsystems.one](https://www.designsystems.one/foundations/maturity-model)
  - A search-engine summary described the same site's tool as covering "governance, adoption, technical implementation, design quality, and operations". The fetched page shows stages, not those named dimensions, so treat the five-dimension description as unverified. — [search summary of designsystems.one](https://www.designsystems.one/foundations/maturity-model)
- **W3C Accessibility Maturity Model** (W3C Group Note, 4 Nov 2025, APA Working Group).
  - Seven dimensions: Communications; Oversight and Culture; ICT Development Lifecycle; Knowledge and Skills; Personnel; Procurement; Support.
  - Four levels: Inactive, Launch, Integrate, Optimize ("Incorporated into the whole organization, consistently evaluated, and actions taken on assessment outcomes").
  - Scoring rests on "proof points": criteria "supported by evidence". Progression is cumulative, and an experimental assessment spreadsheet exists.

  — [W3C](https://www.w3.org/TR/maturity-model/)
- **Supernova, "The Problem With Design System Maturity Models"** (Nezar Mansour, 8 Jun 2023) **[background]**. It criticises linear progression, an unclear impact and ignored organisational context. It proposes three principles (Alignment, Iteration, Impact) in place of a universal model, says "no size fits all", and publishes no rubric. — [Supernova](https://www.supernova.io/blog/the-problem-with-design-system-maturity-models)
- A five-stage model named after star types ("Nebula" to "Supernova") was presented as a conference talk by Joran Quinten. I saw only the search snippet, not the talk. — [GitNation](https://gitnation.com/contents/from-nebula-to-supernova-design-system-maturity-models)

**Artifact checklists (what a system should contain)**
- **Design System Checklist** (designsystemchecklist.com; open source; the repo's last commit is 26 Aug 2026, a translation merge; README lists Arda Karacizmeli plus a second maintainer as contacts; no LICENSE file in the repo). It has four categories:
  - **Design language**. Brand: Vision, Design principles, Tone of voice, Terminology, Brand assets. Guidelines: Accessibility, Writing guidelines, Microcopy guidelines, Terminology, Internationalisation.
  - **Foundations**:
    - Color: Accessibility, Semantic colors, Dark mode, Guidelines.
    - Layout: Units, Grid, Breakpoints, Spacing.
    - Typography: Responsiveness, Grid relation, Readability, Performance, Guidelines.
    - Elevation: Shadows, Background colors, Z-index.
    - Motion: Easing, Duration, Accessibility.
    - Iconography: Accessibility, Style, Naming, Relation with grid, Keywords, Reserved icons, Guidelines.
  - **Core components**. 29 components with 3–10 items each: Accordion, Alert, Avatar, Badge, Button, Breadcrumbs, Calendar, Card, Carousel, Checkbox, Divider, Dropdown, Icon, Image, Link, List, Loading indicator, Modal, Pagination, Progress bar, Radio, Select, Skeleton, Switch, Tabs, Text area, Text field, Toast, Tooltip. Example: Button = Colors, Variants, Sizes, Icon support, Hover state, Active state, Loading state, Disabled state, Accessibility role, Focus indicator. Modal = composition, actions, close, positioning, sizes, Focus trapping, Keyboard navigation, Title labeling. Toast includes Timeout, Stacking, Focus management, Reduced motion.
  - **Maintenance**:
    - Documentation: Design system principles, Getting started, Design best practices, Development best practices, Component anatomy, Component properties, Component composition examples, Sandbox product example, Browser/OS support, Release cycle.
    - Local libraries.
    - Team processes: Decision-making log, Roadmap, Stakeholder mapping, Analytics, Support shifts, SLA.
    - Community support: Support channels, Templates, Regular updates, Open hours.
    - Contribution: House rules, Contribution guidelines, Feature proposal template, Engagement.
  - The README's rule for adding an item: it must be "a standard for at least multiple well-known design systems".

  — [repo](https://github.com/ArdaKaracizmeli/design-system-checklist) (data in `src/translations/en/*.js`), [site](https://www.designsystemchecklist.com/)
- **EightShapes Component QA** (Nathan Curtis; original date not verified, the page timed out) **[background/origin]**. QA categories: Visual Quality ("applying style using appropriate variable tokens"), Sufficient States & Variations, Responsiveness, Content Resilience, Composability, Functionality. I read only the search summary. — [EightShapes](https://eightshapes.com/articles/component-qa-in-design-systems.html)
- **EightShapes Design System Tiers** **[background/origin]**:
  - "Within Group" tier: browser checks, code linting, accessibility challenges addressed.
  - "Across Groups" tier adds: responsive, semantically versioned, log changes, "encapsulate design tokens", unit and visual-regression tests.
  - Core tier adds: comprehensive accessibility review, sizing options, works on different backgrounds, custom theming and internationalisation.

  Read via search summary; Medium returned 403. — [Medium/EightShapes](https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1)
- **EightShapes Component Specifications** (20 Feb 2023) **[background]**. A spec has seven sections: Anatomy, Properties, Layout and Spacing (text wrapping, responsiveness, sizing, touch targets), Behavior and Animation (events → state changes), Accessibility (screen-reader format, focus order, announced order, alt text), Component Tokens (semantic → component mapping, aliases, defaults), Version History. Its first audience is "the people building what you've designed". — [Nathan Curtis](https://nathanacurtis.substack.com/p/component-specifications-1492ca4c94c)
- **EightShapes Component Design Guidelines** (15 Jun 2018) **[background]**.
  - Sections: Use When / Don't Use When, Visual Style, Behavior, Editorial, Accessibility.
  - Writing rules: imperatives, "Omit needless words", "Always"/"Never" for non-negotiables, "Consider"/"Avoid" for judgment calls, "Limit guidelines length to two sentences or less", and "Favor specific, quantitative advice".
  - Do/Don't pairs go side by side. Don't repeat coded examples.

  — [Nathan Curtis](https://nathanacurtis.substack.com/p/component-design-guidelines-eca706100e7c)
- EightShapes **Documenting Components** model: Introduction (name, purpose), Examples (variations, states), Design Reference (Use Whens, Do's and Don'ts). Read via search summary; Medium 403. Related, newer: "Components as Data" (neutral YAML/JSON definitions: anatomy, props, styles, layout) and "Naming Tokens in Design Systems". — [Medium](https://medium.com/eightshapes-llc/documenting-components-9fe59b80c015), [Components as Data](https://nathanacurtis.substack.com/p/components-as-data-2be178777f21), [Naming Tokens](https://nathanacurtis.substack.com/p/naming-tokens-in-design-systems-9e86c7444676)
- **Component Gallery** (component.gallery, Iain Bean). It lists **76 component types** with "other names". Examples: Modal = Dialog, Popup; Toast = Snackbar; Combobox = Autocomplete, Autosuggest; Toggle = Switch, Lightswitch; Badge = Tag, Label, Chip; Alert = Notification, Banner, Callout. Its own caveat: "Don't assume that an opinion or technique is correct, just because it's popular." — [components](https://component.gallery/components/), [about](https://component.gallery/about/)
- **Adele (UXPin)**: "The repository of publicly available design systems and pattern libraries". It covers 60+ systems on about 30 attributes, including design tokens, accessibility guidelines, voice & tone, Storybook integration, TypeScript, testing frameworks, linters and distribution method. — [Adele](https://adele.uxpin.com/)
- **Brad Frost governance** (no 2025 checklist found) **[background]**. Every request triages into a design-system component, a recipe (a product-owned composition) or a one-off. True bugs are patched "with extreme urgency". — [bradfrost.com](https://bradfrost.com/blog/post/a-design-system-governance-process/), [bugs/discrepancies/recipes](https://bradfrost.com/blog/post/design-system-governance-bugs-design-discrepancies-features-and-recipes/)
- **Storybook "Design Systems for Developers"** **[background/origin]**: a free 9-chapter guide, peer-reviewed by developers at Auth0, NYT, Shopify and Squarespace. Workflow: Build → Review (stakeholders comment before release) → Test (visual regression per commit, accessibility per WCAG, interaction tests) → Distribute (versioned npm packages, release tooling such as Auto). It is **no longer listed** on storybook.js.org/tutorials, which today shows Intro to Storybook, UI Testing Handbook and Visual Testing Handbook. — [search summary/Chromatic](https://www.chromatic.com/blog/introducing-storybook-design-system/), [Storybook tutorials index](https://storybook.js.org/tutorials/)

**Survey benchmarks**
- **zeroheight Design Systems Report 2026** (fifth edition, 147 respondents; survey dates not stated). Detailed numbers are in Q2. — [report.zeroheight.com/2026](https://report.zeroheight.com/2026), [landing](https://zeroheight.com/resource/design-systems-report-2026/)
- **zeroheight Design Systems Report 2025** (294 respondents, surveyed Sep–Nov 2024):
  - 84% include tokens (up from 56%).
  - 68% document in several places.
  - "Over 50%" have minimal or no automation; visual regression testing is "underdeveloped".

  — [zeroheight](https://zeroheight.com/how-we-document/), [PDF](https://othr.zeroheight.com/hubfs/zeroheight%20-%20Design%20System%20Report%202025%20-%20release%20version.pdf)
- **zeroheight State of AI in Design Systems 2026**: "67% of practitioners think AI is overhyped. 82% are using it anyway." From zeroheight's social post; I did not read the report itself. — [zeroheight](https://zeroheight.com/resources/state-of-ai-in-design-systems/report/), [X post](https://x.com/zeroheight/status/2054590670594036220)
- **Figma, "Design Systems 104: Making Metrics Matter"** (Carly Ayres, 11 Feb 2025). Recommended metrics: library and component usage (components, variables, styles), documentation effectiveness (popular pages, search queries), consistency (detachment rates, style overrides). "If someone is detaching a component, I want to know why." Figma's research: designers with a design system finish tasks 34% faster. — [Figma blog](https://www.figma.com/blog/design-systems-104-making-metrics-matter/)
- Figma Library Analytics added variables and styles to component analytics on 11 Feb 2025, for Organization and Enterprise plans (search summary). — [Figma help](https://help.figma.com/hc/en-us/articles/360039238353-View-and-explore-library-analytics)

**Machine-checkable scorecards**
- **Open Design System Bench** (Christoph Hellmuth, 25 Aug 2026, MIT). Details in Q3 and Q5. — [article](https://christophhellmuth.com/open-design-system-bench/), [repo](https://github.com/christophhdesign/open-design-system-bench)
- **designsystems.one Agent-Ready Design Systems Index** (re-audited 4 Sep 2026). 37 systems, scored 0–5, one point per signal published at a first-party URL: MCP server, llms.txt, W3C/DTCG tokens, a shadcn-style registry, Figma Code Connect. — [index](https://www.designsystems.one/ai-ready/systems)
- **OpenSSF Scorecard**. 20 checks scored 0–10, for example CI-Tests, Code-Review, Branch-Protection, Maintained, License, Pinned-Dependencies, Dependency-Update-Tool, Signed-Releases, Packaging, SAST and Vulnerabilities. The aggregate is a "weight-based average… weighted by risk": Critical 10, High 7.5, Medium 5, Low 2.5. — [checks](https://github.com/ossf/scorecard/blob/main/docs/checks.md), [README](https://github.com/ossf/scorecard)
- **CHAOSS Starter Project Health model**. Four metrics: Time to First Response, Change Request Closure Ratio, Contributor Absence Factor ("the smallest number of people that make 50% of contributions"), Release Frequency. — [CHAOSS](https://chaoss.community/starter-project-health-metrics-model/)
- **Smashing, "How To Make Your Design System AI-Ready"** (Vitaly Friedman, 3 Jun 2026):
  - Design decisions written down as spec files (structured Markdown with spacing, colour and usage rules).
  - A token layer, so AI does not invent values.
  - Audit scripts that catch hard-coded values, detached instances, missing interactive states and accessibility issues (FigmaLint named).
  - A sync routine that flags stale spec files.

  — [Smashing](https://www.smashingmagazine.com/2026/06/how-make-design-system-ai-ready/)
- **Awesomic, "How to Run a Design System Audit in 2026"**:
  - An audit compares three things: what the system documents, what the design files contain, and what production renders.
  - Objective checks: searches for hard-coded colours and spacing; token coverage "as a proxy for system adoption"; Figma↔code parity; an inventory with duplicates and orphans flagged; doc coverage with last-reviewed dates.
  - Severity scale: minor / moderate / significant / severe.

  — [Awesomic](https://www.awesomic.com/blog/design-system-audit)

### Inferences
- No framework scores a **Storybook** 0–100 as such. The closest is Open Design System Bench, but it scores "AI-readiness" through generated code, not human documentation quality. The rubric therefore has to be assembled from these sources.
- NN/G's Infrastructure Robustness dimension and zeroheight's Foundations, Documentation and AI Readiness axes are the parts of the organisational models that can be judged from public artifacts. The rest (alignment, team, support, adoption, ROI) needs insiders.

### Gaps
- Knapsack: no public maturity model or rubric found. A search summary said Knapsack's focus has moved to "measuring whether AI output conforms to the design system", but I found no primary source. — [knapsack.cloud](https://www.knapsack.cloud/) (unverified)
- UXPin: nothing beyond Adele and listicles. Brad Frost: no 2025–2026 scoring checklist found.
- I could not open Into Design Systems, Config or Clarity 2025–2026 talks on audits or scoring within budget.
- EightShapes originals on Medium returned 403, so their content comes from search summaries. The Substack mirrors were readable.

---

## Q2. Which criteria recur across frameworks?

### Takeaway
Seven criteria recur in almost every source:
- foundations and tokens with a semantic layer
- component coverage with states and variants
- documentation with usage guidance (when / when not / do-don't)
- accessibility built into components
- design–code parity
- versioning and release notes
- governance and contribution

Content and language guidance, testing and automation, and machine-readability for AI show up in fewer frameworks, but the 2026 data shows they are exactly where most systems are weak. That makes them good differentiators.

### Cited Findings
- **Tokens / foundations** appear in:
  - Atomize (Tokens: semantic tokens bound in Figma Variables) — [Atomize](https://atomize.tools/blog/design-system-maturity/)
  - zeroheight Foundations axis — [zeroheight](https://zeroheight.com/maturity/)
  - NN/G ("structure and scalability of foundations and design tokens") — [NN/G](https://www.nngroup.com/articles/design-system-maturity/)
  - designsystemchecklist Foundations — [repo](https://github.com/ArdaKaracizmeli/design-system-checklist)
  - EightShapes tiers ("encapsulate design tokens") — [EightShapes](https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1)
  - designsystems.one ("Tokens serve as source of truth") — [designsystems.one](https://www.designsystems.one/foundations/maturity-model)
- **2026 token practice**:
  - 86% of teams have tokens; 90% have tokens in design tools and 82% in code.
  - Only 66% document their tokens.
  - 40% have automated pipelines (29% design-to-code, 5% bi-directional).

  — [zeroheight 2026](https://report.zeroheight.com/2026)
- **Token standard**: the DTCG Design Tokens Specification reached its first stable version (2025.10) on 28 Oct 2025, with theming and multi-brand support, modern colour spaces and aliases. It is a Community Group Report, not a W3C Recommendation. — [W3C DTCG](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- **Component coverage and states**: designsystemchecklist gives per-component state lists — [repo](https://github.com/ArdaKaracizmeli/design-system-checklist); EightShapes QA lists "Sufficient States & Variations", "Content Resilience" and "Composability" — [EightShapes](https://eightshapes.com/articles/component-qa-in-design-systems.html); NN/G lists "Component coverage" — [NN/G](https://www.nngroup.com/articles/design-system-maturity/)
- **Docs with usage guidance**:
  - EightShapes guidelines and spec anatomy — [guidelines](https://nathanacurtis.substack.com/p/component-design-guidelines-eca706100e7c), [specs](https://nathanacurtis.substack.com/p/component-specifications-1492ca4c94c)
  - Atomize "Guidelines, status, release notes maintained" — [Atomize](https://atomize.tools/blog/design-system-maturity/)
  - Polaris is cited as exemplary because a component page "tells you when to use the component, when not to, and what to use instead". "Polaris, GOV.UK, and Carbon all spend more words on usage guidance than on visual specs" (secondary, a 2026 roundup). — [themasterly via search](https://www.themasterly.com/blog/design-system-examples)
- **What 2026 systems contain**: Foundations 93%, Documentation 92%, Design libraries 91%, Tokens 86%, Code libraries 78%, **Accessibility guidelines 59%**, **UX patterns 56%**, **UX copy guidelines 38%**. — [zeroheight 2026](https://report.zeroheight.com/2026)
  - The 2025 report put UI patterns at 64%, per a secondary source. 56% (2026, "UX patterns") and 64% (2025, "UI patterns") may differ in wording or sample (294 vs 147 respondents), so they are not directly comparable. — [Awesomic citing 2025](https://www.awesomic.com/blog/design-system-audit)
- **Documentation location**: Figma 69%, Storybook 61%, zeroheight 32%, Confluence 18%, custom 16%, Supernova 7% (2026). — [zeroheight 2026](https://report.zeroheight.com/2026)
- **Accessibility tooling in practice** (2026): Axe-family tools 21%, Storybook/Chromatic a11y plugins 20%, contrast checkers 14%, screen readers 12%, manual testing 8%. — [zeroheight 2026](https://report.zeroheight.com/2026)
- **Accessibility, the dissenting note**: EightShapes, "'Accessible' Design Systems Don't Guarantee Accessible Products" (title only; not fetched) — [EightShapes](https://eightshapes.com/articles/accessible-design-systems-dont-guarantee-accessible-products.html). axe-core "automatically catches up to 57% of WCAG issues" — [Storybook docs](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- **Automation and testing** (2026): only 37% of teams have automation; 31% have no plans; 31% are satisfied with what they have. Among teams that automate: delivery 80%, documentation 51%. — [zeroheight 2026](https://report.zeroheight.com/2026). Storybook's workflow names visual, accessibility and interaction tests per commit — [Chromatic](https://www.chromatic.com/blog/introducing-storybook-design-system/). EightShapes tiers require unit and visual regression at the "Across Groups" tier — [EightShapes](https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1)
- **Governance and release** (2026): release notes 56%, roadmap 48%, office hours 33%; open contribution 65%. — [zeroheight 2026](https://report.zeroheight.com/2026). NN/G "Versioning and release strategy", "Deviation management and decision making" — [NN/G](https://www.nngroup.com/articles/design-system-maturity/). designsystemchecklist: Decision-making log, Roadmap, Contribution guidelines, Release cycle — [repo](https://github.com/ArdaKaracizmeli/design-system-checklist)
- **Design–code parity**: NN/G ("parity between design and code") — [NN/G](https://www.nngroup.com/articles/design-system-maturity/); Atomize Code Sync — [Atomize](https://atomize.tools/blog/design-system-maturity/); Awesomic three-way comparison — [Awesomic](https://www.awesomic.com/blog/design-system-audit); Figma Code Connect as an AI-ready signal (3 of 37 systems) — [designsystems.one](https://www.designsystems.one/ai-ready/systems)
- **Content / language**: designsystemchecklist "Design language" (tone of voice, terminology twice, writing, microcopy, internationalisation) — [repo](https://github.com/ArdaKaracizmeli/design-system-checklist); NN/G "Content standards" — [NN/G](https://www.nngroup.com/articles/design-system-maturity/); Adele tracks voice & tone — [Adele](https://adele.uxpin.com/); Curtis "Editorial" guideline section — [Curtis](https://nathanacurtis.substack.com/p/component-design-guidelines-eca706100e7c)
- **Naming consensus**: Component Gallery's 76 types plus aliases — [Component Gallery](https://component.gallery/components/). Open Design System Bench's "Vocabulary convention-distance" check — [ODSB repo](https://github.com/christophhdesign/open-design-system-bench)
- **Machine-readability / AI**:
  - zeroheight AI Readiness axis — [zeroheight](https://zeroheight.com/maturity/)
  - Five signals (MCP 12/37, llms.txt 10/37, DTCG 6/37, registry 1/37, Code Connect 3/37) — [designsystems.one](https://www.designsystems.one/ai-ready/systems)
  - 2026 AI use: 10% built into processes, 46% experimenting; code generation 71% and documentation generation 60% among users — [zeroheight 2026](https://report.zeroheight.com/2026)
  - Smashing: spec files plus token layer plus audit scripts — [Smashing](https://www.smashingmagazine.com/2026/06/how-make-design-system-ai-ready/)
- **Theming / multi-brand**: designsystems.one top stage, "themes are runtime-swappable" — [designsystems.one](https://www.designsystems.one/foundations/maturity-model); EightShapes core tier, "custom theming and internationalization" — [EightShapes](https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1); DTCG 2025.10 theming and multi-brand — [W3C DTCG](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)

### Inferences
- The differentiators for a top score are where the field is weak in 2026: documented tokens (66%), accessibility guidelines (59%), UX patterns (56%), UX copy guidelines (38%), automation (37%) and machine-readable signals (≤ 12 of 37). govocal-ds has 27 patterns, which already puts it in a less common group. Copy/language guidance and token documentation are the cheapest places to stand out.
- For developers, the recurring criteria that answer "cemented in tokens, consistent variables and language" are token coverage in component CSS, a semantic token layer, naming consistency, and Figma↔code parity. All four are measurable from the repo.

### Gaps
- No source gives cross-framework frequency counts. The "recurs in almost every source" claim is my own tally of the sources listed above.

---

## Q3. How do frameworks define levels or scores, and how are dimensions weighted?

### Takeaway
The maturity models deliberately avoid a single weighted score: NN/G, zeroheight and designsystems.one all use independent per-dimension levels, shown as a radar chart or heatmap. The machine-checkable scorecards do weight and aggregate:
- Open Design System Bench: explicit weights, a 0–100 composite, and a worst-dimension gate.
- OpenSSF: weights by risk.
- Atomize: an equal-weight 0–12 sum.

A 0–100 score is therefore defensible only with published weights and a cap tied to the weakest dimension.

### Cited Findings
- NN/G: 1–5 per dimension, "without weighted calculations"; all six dimensions equal; plotted on a hexagonal radar chart, not a composite. Scored by 4–8 people (DS team, product teams, sponsors), each alone first, then together. — [NN/G](https://www.nngroup.com/articles/design-system-maturity/)
- zeroheight: four stages per axis, each axis scored on its own, "Stage 4 in components but Stage 1 in another area" allowed. — [zeroheight](https://zeroheight.com/maturity/)
- designsystems.one: the first "no" sets the stage; heatmap not a single score; "The lowest dimension caps the system"; warns against treating the assessment as a one-time audit and against using the stage as an identity. — [designsystems.one](https://www.designsystems.one/foundations/maturity-model)
- Atomize: 0–2 per dimension (0 missing, 1 "started but inconsistent", 2 "documented and routinely practiced"), six dimensions summed to 0–12, then mapped to levels. — [Atomize](https://atomize.tools/blog/design-system-maturity/)
- W3C AMM: four levels per dimension. Each proof point needs evidence; levels are cumulative; organisations may customise or omit proof points if they document why. — [W3C](https://www.w3.org/TR/maturity-model/)
- **Open Design System Bench**:
  - Generation dimension weights: imports 0.10, apiFidelity 0.25, tokenDiscipline 0.15, a11yStatic 0.10, compile 0.10, judgment 0.30 (LLM-judged task rubrics).
  - Composite AI-Readiness Score 0–100 with tiers Emerging < 40, Invested 40–70, AI-native ≥ 70.
  - "Gate logic uses worst-dimension scoring, not averages, treating 'ignored the design system' as a critical failure."
  - Seven Tier-0 static checks need no LLM.

  — [repo](https://github.com/christophhdesign/open-design-system-bench), [article](https://christophhellmuth.com/open-design-system-bench/)
- OpenSSF: 0–10 per check, with tiered or proportional scoring inside a check (e.g. Branch-Protection steps at 3/6/8/9/10). Aggregate = risk-weighted average (Critical 10 / High 7.5 / Medium 5 / Low 2.5). — [checks](https://github.com/ossf/scorecard/blob/main/docs/checks.md), [README](https://github.com/ossf/scorecard)
- designsystems.one AI index: 0–5, one point per signal, and a signal counts only if "the maintainers themselves publish the artifact at a first-party URL". — [index](https://www.designsystems.one/ai-ready/systems)
- Awesomic: four-level severity per finding (minor / moderate / significant / severe), paired with effort estimates. — [Awesomic](https://www.awesomic.com/blog/design-system-audit)
- Supernova argues against universal linear models and for tailoring to context. — [Supernova](https://www.supernova.io/blog/the-problem-with-design-system-maturity-models)

### Inferences
- Five scoring rules for our rubric:
  - Anchor 1/3/5 per criterion, borrowing NN/G's labels (Absent, Functional, Exceptional), and allow 2 and 4 between them.
  - Require evidence per score, as with W3C proof points.
  - Publish explicit weights, as Open Design System Bench does.
  - Add a cap or gate: no dimension below level 2 for a total above about 60, following "lowest dimension caps the system" and the worst-dimension gate.
  - Show the radar chart alongside the total, so the 0–100 doesn't hide an uneven profile, as NN/G and zeroheight do.
- Practitioners do not publish a consensus weighting. Weights in Q6 are my proposal, tilted toward what designers and developers each need from the Storybook.

### Gaps
- No source gives empirically validated weights (e.g. dimension scores correlated with adoption outcomes).

---

## Q4. Which criteria can be measured objectively from outside, and which need interviews?

### Takeaway
A public Storybook already exposes a lot of machine-readable data:
- `/index.json`, every story and docs entry with tags.
- In Storybook 10.6, `/manifests/components.json` (props, descriptions, examples) and `/manifests/docs.json`; these manifests are still in preview.
- A rendered DOM that axe can test.

Together with the repo (CSS, token files, workflows, changelog, decision log), that covers tokens, coverage, docs completeness, a11y, API consistency, testing, parity and AI signals objectively. Adoption, trust, team, support, alignment and ROI need people.

### Cited Findings
- `index.json`: "The index can be read at the /index.json route of your Storybook". Entries include `type` (story or docs), `title`, `tags`, `importPath`, `exportName`. A component gets an autodocs page only if at least one story carries the `autodocs` tag. — [Storybook indexers](https://storybook.js.org/docs/api/main-config/main-config-indexers), [tags](https://storybook.js.org/docs/writing-stories/tags), [autodocs](https://storybook.js.org/docs/writing-docs/autodocs)
- Manifests: "JSON objects that describe the contents of your Storybook in a concise, structured way". The components manifest holds names, descriptions, props, usage examples and API, built by static analysis of CSF files plus react-docgen / react-docgen-typescript plus JSDoc. A docs manifest covers MDX. Both are served at `/manifests/components.json` and `/manifests/docs.json` in dev and in a built Storybook, with a debugger at `/manifests/components.html`. Available in 10.6, "preview status". — [Storybook manifests](https://storybook.js.org/docs/ai/manifests)
- Storybook MCP addon (`@storybook/addon-mcp`) gives agents the component list, props and example stories. — [Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview)
- a11y addon: axe-core; `parameters.a11y.test` = `'error'` (fails in UI and CI), `'todo'` (warns), `'off'`. It runs with the Vitest addon in CI. Results come as violations, passes and incomplete (needs a manual check). Default rules: WCAG 2.0/2.1 A and AA plus best practices; AAA is opt-in. — [Storybook a11y](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- Open Design System Bench's static checks run with no LLM: enablement surface (AGENTS.md, llms.txt), catalog quality, export hygiene, vocabulary convention-distance, token machine-readability (CSS foundations parsing), deprecation legibility, docs greppability. Inputs: a package path or source checkout, the component source dir, a catalog strategy (`docgen` / `catalog-json` / `stencil`), an optional CSS foundations file, and AGENTS.md/docs. It can run in source mode, so no published package is needed. — [ODSB repo](https://github.com/christophhdesign/open-design-system-bench)
- Hard-coded value scans and token coverage as an objective audit measure; component parity between design files and code. — [Awesomic](https://www.awesomic.com/blog/design-system-audit); Smashing audit scripts (hard-coded values, missing interactive states) — [Smashing](https://www.smashingmagazine.com/2026/06/how-make-design-system-ai-ready/)
- Repo-health signals any public repo can be checked for: CI-Tests, Code-Review, Branch-Protection, License, Maintained, Pinned-Dependencies, Dependency-Update-Tool, Packaging, Signed-Releases — [OpenSSF](https://github.com/ossf/scorecard/blob/main/docs/checks.md). CHAOSS release frequency, time to first response, contributor absence factor — [CHAOSS](https://chaoss.community/starter-project-health-metrics-model/)
- Figma-side metrics (library analytics, detach rates, variable usage) need Organization/Enterprise access to the Figma org — [Figma help](https://help.figma.com/hc/en-us/articles/360039238353-View-and-explore-library-analytics), [Figma blog](https://www.figma.com/blog/design-systems-104-making-metrics-matter/)
- Interview or insider-only items: NN/G's Organizational Alignment, Team Effectiveness, Support and Adoption ("Usage," "Conformance," "Trust"), scored by 4–8 internal people — [NN/G](https://www.nngroup.com/articles/design-system-maturity/); zeroheight's Measurement & Impact ("is this system worth it?") — [zeroheight](https://zeroheight.com/maturity/). How teams measure in 2026: Figma analytics 56%, surveys/user tests 50%, code-repo analytics 37%, ROI tracked by 5% — [zeroheight 2026](https://report.zeroheight.com/2026)

### Inferences
- Measurable from outside (public Storybook plus repo):
  - Component and docs counts per component: `index.json` titles and types.
  - Props with descriptions, and prop-name consistency: `components.json`.
  - Guideline pages: `docs.json` / MDX.
  - a11y violations on every story: run the test-runner or a Playwright + axe sweep against the static URL.
  - Token coverage: grep component CSS for literal colours, px and rem outside `var(--gv-*)`; find undefined and unused tokens by cross-referencing definitions and uses.
  - Semantic layering: token file structure.
  - DTCG export: does it exist.
  - Naming against Component Gallery.
  - Interaction tests: count stories with `play` functions.
  - CI workflows; CHANGELOG / DECISIONS.md / status tags; AGENTS.md / llms.txt / MCP / manifests.
- Needs partial insider access: Figma↔code parity (needs the Figma file or a variables export; can be checked from outside only if the export is committed to the repo) and Figma detach rates.
- Needs interviews: adoption and trust among developers, support, team capacity, organisational buy-in. Since govocal-ds is unpublished, "adoption" can be approximated only by dogfooding in the demo back office: the share of its UI built from DS components and of its CSS using tokens.

### Gaps
- Not verified whether the static (GitHub Pages) build of a Storybook 10.6 serves `/manifests/*.json`. The docs say the "Built Storybook" serves the same routes, but that needs checking on the target Storybook, which I did not probe (the brief excludes researching it).

---

## Q5. Published audits or scorecards of real design systems (calibration examples)

### Takeaway
Only a few public, numeric scorecards exist, and all of them measure AI or agent readiness: Open Design System Bench (0–100) and the designsystems.one AI-ready index (0–5). For human-facing quality, calibration has to come from consensus exemplars (Polaris, GOV.UK, Carbon, Spectrum, the Storybook showcase list) scored with our own rubric, not from published scores.

### Cited Findings
- **Open Design System Bench scores**: Aurora (Nord Security) 63.4 "Invested"; three anonymised systems at 60.0, 56.2 and 52.2. "Nobody is AI-native yet." — [ODSB article](https://christophhellmuth.com/open-design-system-bench/)
- **designsystems.one AI-ready index**:
  - Carbon (IBM) 4/5 is top; Primer (GitHub) and shadcn/ui 3/5; "none reaches 5/5".
  - 19 of 37 systems score 0/5.
  - "brand and enterprise design systems lag by twelve to twenty-four months on every signal except llms.txt."
  - Polaris ranks #17 of 37 at 1/5, missing DTCG, registry and Code Connect.

  — [index](https://www.designsystems.one/ai-ready/systems), [Polaris page](https://www.designsystems.one/design-systems/polaris)
  - Inconsistency: a search-engine summary of the same site said "3 have DTCG tokens… 2 have Figma Code Connect", but the fetched index page says 6 and 3 (after the 4 Sep 2026 re-audit). I use the fetched page.
- **Storybook showcase** ("the best public Storybook projects"): Chakra UI, Orbit (Kiwi.com), drei, Elastic Charts, Wix Style React, React-Dates (Airbnb), fundamental-styles (SAP), Grafana UI, Ring UI (JetBrains), Fluent UI Web Components (Microsoft), with more behind "Load more". — [Storybook showcase](https://storybook.js.org/showcase)
- Qualitative exemplars from 2026 roundups (secondary, editorial):
  - Polaris and GOV.UK have "the best documentation… explain when and why".
  - Carbon is "the broader system, with multi-framework support and serious data viz".
  - Spectrum is "best for evolving a live system with versioned token contracts".

  — [themasterly](https://www.themasterly.com/blog/design-system-examples), [aidesign.guide](https://www.aidesign.guide/compare/polaris-vs-carbon/)
- Adele offers a dataset of 60+ systems with attribute flags (tokens, a11y guidelines, voice & tone, Storybook, TypeScript, testing, distribution) for coverage comparisons. — [Adele](https://adele.uxpin.com/)

### Inferences
- Suggested calibration set: score 4–6 public Storybooks with the same rubric before scoring govocal-ds, to anchor what 90+ and 60 look like.
  - **Doc and usage leaders**: Polaris, GOV.UK (not React/Storybook-first, so docs dimensions only).
  - **Storybook leaders**: from the Storybook showcase, Orbit, Fluent UI Web Components, SAP fundamental-styles, Grafana UI.
  - **AI/token leaders**: Carbon (4/5 on the AI index), Primer.
  - **Same stack**: Adobe React Spectrum, built on the same React Aria base. This is my suggestion; no source above scores it.
- Open Design System Bench can be run on govocal-ds in source mode (MIT, no published package needed) to get an outside, reproducible number. Its scale (best public system about 63) shows a "good" system will not land in the 90s on AI readiness.

### Gaps
- I found no published teardown that scores a public Storybook's human documentation on a numeric scale. Most "best design system" articles are listicles without method.

---

## Q6. Proposed rubric: dimensions, criteria, level anchors, measurement, weights, readers (split A design-owned / B dev-owned)

### Takeaway
The proposal is a 100-point rubric:
- **90 points in (A) design-owned dimensions**, stack-agnostic: they keep their value if developers drop React Aria or change the styling technology.
- **10 points in (B) dev-owned dimensions**, scored only as "ready for their decision": does the proposal illustrate options and leave the decision open, without making it for them?

Each criterion is scored 1–5 on evidence (anchors at 1/3/5), and dimension score = mean criterion level ÷ 5 × weight. A gate limits the total: any A dimension below level 2 caps the total at 60. The total is reported with a radar chart of the A dimensions.

### Cited Findings (anchors the rubric is built on)
- Level labels and the radar presentation: NN/G 1–5 Absent / Emerging / Functional / Strong / Exceptional — [NN/G](https://www.nngroup.com/articles/design-system-maturity/)
- Evidence per score: W3C proof points — [W3C](https://www.w3.org/TR/maturity-model/)
- Cap on the weakest dimension: "lowest dimension caps the system" — [designsystems.one](https://www.designsystems.one/foundations/maturity-model); worst-dimension gate — [ODSB](https://github.com/christophhdesign/open-design-system-bench)
- Token anchors (raw → primitives only → semantic bound to Figma variables → consumed by production) — [Atomize](https://atomize.tools/blog/design-system-maturity/); DTCG 2025.10 as the vendor-neutral format — [W3C DTCG](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- Spec anatomy (anatomy, properties, layout and spacing, behaviour, accessibility, component tokens, version history) — [Curtis specs](https://nathanacurtis.substack.com/p/component-specifications-1492ca4c94c); guideline sections and writing rules — [Curtis guidelines](https://nathanacurtis.substack.com/p/component-design-guidelines-eca706100e7c)
- Per-component state checklists and design-language items — [designsystemchecklist repo](https://github.com/ArdaKaracizmeli/design-system-checklist)
- Content resilience, composability, theming and i18n at the top tier — [EightShapes QA](https://eightshapes.com/articles/component-qa-in-design-systems.html), [EightShapes tiers](https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1)
- Naming consensus and aliases — [Component Gallery](https://component.gallery/components/)
- a11y measurement and its 57% ceiling — [Storybook a11y](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- Machine-readable surfaces — [Storybook manifests](https://storybook.js.org/docs/ai/manifests), [designsystems.one AI index](https://www.designsystems.one/ai-ready/systems)
- Repo health signals — [OpenSSF](https://github.com/ossf/scorecard/blob/main/docs/checks.md), [CHAOSS](https://chaoss.community/starter-project-health-metrics-model/)
- Field baselines for what is rare (documented tokens 66%, a11y guidelines 59%, UX patterns 56%, copy guidelines 38%, automation 37%, release notes 56%, roadmap 48%) — [zeroheight 2026](https://report.zeroheight.com/2026)

### Inferences (the proposed rubric; my synthesis, not a published framework)

**Scoring mechanics**
- Each criterion is scored 1–5 on evidence; 2 and 4 sit between the anchors. 0 = no evidence found, and counts as 1 with a flag.
- Dimension score = (mean criterion level ÷ 5) × weight.
- Total = Σ A + Σ B, out of 100.
- Gate: if any A dimension averages below 2, the total is capped at 60. Report the radar chart alongside the number.
- Every score cites a URL, story ID, file path or command output, as W3C proof points do.

#### (A) DESIGN-OWNED, 90 points (scored now, survives any stack choice)

**A1. Foundations & tokens as the source of truth (20)**: the first test, "cemented in tokens".
- Criteria:
  1. A tiered token architecture (primitive → semantic → component) is written down, with a naming grammar.
  2. Component styles reference semantic tokens, not primitives or raw values.
  3. Undefined or unused tokens: none.
  4. Tokens can be exported in a stack-neutral format (DTCG JSON or equivalent) generated from the Figma variables, not hand-kept CSS.
  5. Foundations pages exist for colour (semantic plus contrast-checked pairs), type, spacing, elevation, motion, iconography and layout/breakpoints.
  6. Theming is designed in: modes and tenant brands swap by token sets.
- L1: raw hex/px in component CSS; tokens only listed in a swatch page.
- L3: a semantic layer exists; ≥ 80% of colour, spacing, radius and type declarations in component CSS use `var(--gv-*)`; foundations pages cover the main categories.
- L5: ≥ 98% tokenised and enforced by a lint in CI; zero undefined or unused tokens; a DTCG export generated from Figma variables; token docs generated from source with usage do/don'ts; light/dark plus a tenant theme demonstrated by swapping tokens only.
- How to measure: grep or stylelint over the repo CSS (literal colours, px/rem, `var(--` not defined); cross-reference token definitions against uses; check the token source for DTCG `$value`/`$type`; open the Foundations stories in `index.json`; swap a theme in the Storybook toolbar.
- Readers: devs (primary), designer (owns the decisions).

**A2. Naming & language consistency (10)**: "consistent variables and language".
- Criteria:
  1. Component names match Component Gallery consensus, or the alias is documented ("also known as").
  2. One vocabulary for the same concept across Figma properties, Storybook args and docs (e.g. `variant`/`tone`/`size` values identical in Figma and code).
  3. Token names follow one grammar.
  4. Voice and tone, a terminology glossary, microcopy rules, and civic-domain terms (participant, input, project, phase) are defined and used consistently in docs and story content.
  5. Writing style follows Curtis-style rules: imperatives, two sentences or fewer, Always/Never vs Consider/Avoid.
- L1: names drift (Modal and Dialog both used; `kind` here, `variant` there); no copy guidance.
- L3: names match consensus or carry aliases; one prop vocabulary with few exceptions; a voice-and-tone page and a glossary exist.
- L5: one shared vocabulary enforced (a prop-name lint over the components manifest; a docs linter such as Vale for terms); every exception has a logged rationale; microcopy patterns per component (error, empty, confirm).
- How to measure: compare `index.json` titles with Component Gallery; take the set of prop names per concept from `/manifests/components.json` or react-docgen and count synonyms; grep docs for competing terms.
- Readers: designer (owns the language), devs (consistency test).

**A3. Coverage, states & behaviour specs (15)**: stack-agnostic, so the specs survive if React Aria is dropped.
- Criteria:
  1. Coverage of the components the product needs: map Go Vocal's existing UI inventory against Component Gallery's 76 types and designsystemchecklist's 29 core components.
  2. Every component shows all states and variants as stories: hover, focus-visible, active, disabled, loading, error, indeterminate, selected, read-only, per the checklist items.
  3. Behaviour specs are written independently of the library: keyboard map, focus order and trapping, announcements, timing (toast timeout), reduced motion.
  4. Per-component anatomy, properties, and layout and spacing (touch targets, wrapping).
  5. Patterns (the 27) are composed only from DS components.
- L1: happy-path stories only; behaviour implied by the library.
- L3: all checklist states present for most components; keyboard behaviour stated for the interactive ones.
- L5: each component carries a spec page (anatomy, properties, layout, behaviour, a11y, component tokens, version history) that a developer could reimplement in another library without reading the React code; patterns cover the product's key flows.
- How to measure: count stories per component and state names in `index.json`; tick the designsystemchecklist items per component; read the docs MDX for keyboard and behaviour tables; check whether behaviour text names React Aria-specific APIs (a portability smell).
- Readers: designer (bible), devs (implementation contract).

**A4. Documentation & guidance, the "design bible" (15)**: the designer's core.
- Criteria:
  1. Every component has a docs page.
  2. Use when / Don't use when / use X instead.
  3. Paired do/don't visuals.
  4. Editorial / content guidance.
  5. Accessibility guidance for designers and consumers.
  6. Related components; status label (alpha/beta/stable/deprecated).
  7. Getting started, principles, and how to read the Storybook.
  8. Information architecture and search: findable in two clicks.
  9. Docs are machine-readable for agents as plain Markdown/MDX (the stack-agnostic part of AI readiness).
- L1: autodocs props tables only.
- L3: usage guidance on most components; principles and getting started exist.
- L5: every component and pattern page has the full guideline set, written to Curtis's rules; status on every page; guidance argues from the product's own users (residents, city admins); the docs manifest is complete; an AGENTS.md or llms.txt points to it.
- How to measure: the share of components with a docs entry (`index.json` `type: docs`) and with hand-written MDX (`/manifests/docs.json`); a sample of 10 pages scored against the guideline checklist; status tags in `index.json`.
- Readers: designer (primary), devs (onboarding).

**A5. Accessibility as a design specification (10)**.
- Criteria:
  1. WCAG 2.2 AA requirements are written into the specs: contrast pairs from tokens, focus indicator, target size, error identification, reduced motion.
  2. Automated evidence: axe with `test: 'error'` on every story, with violations listed.
  3. Manual evidence: a screen reader and keyboard pass, recorded for the complex widgets (combobox, date picker, table, dialog).
  4. Guidance on what the consumer must still do. Accessible components don't guarantee accessible products.
- L1: no a11y notes; axe violations present.
- L3: axe clean on most stories; a11y section on interactive components.
- L5: zero axe violations on all stories in CI; incomplete axe items reviewed; manual screen-reader notes per complex component; contrast proofs generated from tokens; consumer checklist.
- How to measure: run test-runner or Playwright + axe over every story ID from `index.json` against the public URL; read the a11y parameters in stories; read the docs.
- Readers: both. Measured on the reference build, but the specs are design-owned.

**A6. Figma ↔ Storybook parity (8)**.
- Criteria:
  1. The same component set and names in Figma and Storybook.
  2. The same variant and property names and values.
  3. Figma variables equal the CSS tokens (names and values).
  4. A drift check is automated, or at least dated.
  5. Links both ways (Storybook → Figma node; Figma → story).
- L1: Figma and code diverge; no links.
- L3: a manual parity table, mostly matching; variables exported to code by a script.
- L5: a parity report generated from both sides at every change, with zero unexplained diffs; Code Connect or an equivalent mapping.
- How to measure: diff a committed Figma variables export against the CSS custom properties; compare Figma component property names with manifest props. This needs the Figma export in the repo or access to the Figma file.
- Readers: designer (owns Figma), devs (trust).

**A7. Governance of design decisions (5)**.
- Criteria:
  1. A decision log with rationale (designsystemchecklist "Decision-making log").
  2. Design changelog and release notes.
  3. Component status lifecycle and deprecation path.
  4. Contribution / proposal path (component, recipe or one-off triage).
  5. Roadmap; named ownership without naming individuals in public; contributor absence factor (bus factor).
- L1: no log; changes invisible.
- L3: DECISIONS.md and a changelog kept; statuses used.
- L5: every token or component change traceable to a decision; deprecations dated with migration notes; a proposal template; CHAOSS-style responsiveness visible (time to first response on issues).
- How to measure: repo files (DECISIONS.md, CHANGELOG), git history cadence, status tags, issue response times.
- Readers: designer (owner of decisions), devs (predictability).

**A8. Awareness of developer constraints (7)**: proof the design side thought like an implementer.
- Criteria:
  1. i18n: text expansion, RTL, plurals, locale dates and numbers, multilingual content (civic tenants run in many languages).
  2. Multi-tenant theming: city branding through tokens only, with contrast guarantees per tenant palette.
  3. Data extremes / content resilience: long names, empty, loading, error, zero / one / thousands of rows, missing images.
  4. Responsive and breakpoints; browser support statement.
  5. Migration scope: inventory of the current platform UI mapped to DS components, gaps, and what changes for existing screens.
  6. Performance notes (fonts, icon sets).
- L1: none considered.
- L3: stories for long text and empty states on key components; one tenant theme demo; a browser support note.
- L5: extreme-data stories on every data-bearing component; RTL and long-language toggles in the Storybook toolbar; tenant theme switcher with per-tenant contrast checks; a migration map with effort sizing left to developers.
- How to measure: story names and args in `index.json` (e.g. "Long text", "Empty", "RTL"); Storybook globals/toolbar; repo docs.
- Readers: devs (primary test), designer.

#### (B) DEV-OWNED, 10 points (scored as "ready for their decision", not as maturity)

Scale for every B criterion:
- **1** = the decision was taken silently or is blocked: the design layer is locked to one stack.
- **3** = illustrated with one working option.
- **5** = options and trade-offs written down as open questions for developers, the reference shows one, and the design layer (tokens, specs, docs) does not depend on the choice.

- **B1. Packaging & distribution (2)**: npm package or not, semver, tree-shaking, CSS delivery. Ready = tokens and CSS consumable without the React layer; versioning options listed. Measure: package.json, build outputs, docs "Open questions". OpenSSF Packaging and Signed-Releases apply only once developers choose to publish.
- **B2. Test infrastructure (3)**: interaction tests (`play`), visual regression, a11y in CI, type-check and lint on the reference build, as illustration of what is possible. Measure: count stories with a `play` function; `.github/workflows`; OpenSSF CI-Tests.
- **B3. Component API mechanics (3)**: typing, controlled vs uncontrolled, composition and slots, refs, how much React Aria's API leaks into the public API. Ready = the API is consistent and documented in the components manifest, so developers can evaluate it, and the spec (A3) does not depend on it. Measure: `/manifests/components.json` completeness (share of props with descriptions); export hygiene (ODSB static check).
- **B4. Tooling & agent surfaces (2)**: Storybook MCP and manifests, AGENTS.md, Code Connect, registry, plus repo hygiene (License, Dependency-Update-Tool, Pinned-Dependencies, Code-Review). Measure: the designsystems.one 5-signal check; ODSB Tier-0 static audit run in source mode; a subset of OpenSSF.

Weights sum: A = 20 + 10 + 15 + 15 + 10 + 8 + 5 + 7 = **90**; B = 2 + 3 + 3 + 2 = **10**; total **100**.

**Reader map (who reads which dimension as "their" proof)**

| Dimension | Designers (owners of the bible) | Developers |
|---|---|---|
| A1 Tokens | owns the decisions, foundations pages | main test: "cemented in tokens" |
| A2 Naming & language | owns voice, terms, names | test: "consistent variables and language" |
| A3 States & behaviour specs | specs designers defend in review | the implementation contract, portable off React Aria |
| A4 Docs & guidance | their primary tool | onboarding |
| A5 A11y specs | writes the requirements | evidence (axe, manual notes) |
| A6 Figma↔Storybook parity | Figma side | trust that design = code |
| A7 Decision governance | logs the why | predictability |
| A8 Dev-constraint awareness | proves the design accounts for real constraints | strongest signal that "AI-built" ≠ naive |
| B1–B4 | illustrate only | theirs to decide |

**Mapping to the source frameworks (for the report's credibility table)**
- A1 ← Atomize Tokens and Code Sync, zeroheight Foundations, NN/G Infrastructure, DTCG.
- A2 ← designsystemchecklist Design language, Component Gallery, ODSB vocabulary check, Curtis writing rules.
- A3 ← designsystemchecklist per-component items, Curtis specs, EightShapes QA.
- A4 ← Curtis guidelines and documentation model, Atomize Documentation, zeroheight Documentation & Knowledge.
- A5 ← Storybook a11y, W3C AMM (lifecycle), zeroheight 2026 a11y data.
- A6 ← NN/G parity, Atomize Code Sync, Awesomic three-way audit.
- A7 ← NN/G Governance, designsystemchecklist Team processes, Brad Frost triage, CHAOSS.
- A8 ← EightShapes tiers (theming, i18n), EightShapes QA (content resilience), designsystems.one Adaptive stage.
- B ← Storybook DS-for-developers workflow, OpenSSF, ODSB, designsystems.one AI index.

**Out of scope for an outside score (interview-only; report as "not scored")**: NN/G Organizational Alignment, Team Effectiveness, Support and Adoption/Trust, and zeroheight Measurement & Impact. A proxy for adoption: the demo back office's share of UI built from DS components and of CSS using tokens.

### Gaps
- The weights, the gate at 60, and the B "readiness" scale are my proposals. No source validates them empirically, so they should be tuned after scoring the calibration set (Q5).
- The A3 portability check (behaviour specs that don't depend on React Aria) has no published precedent. It follows from the premise that React Aria may be dropped.
- A6 depends on access to Figma or a committed variables export; I don't know whether govocal-ds has one.
