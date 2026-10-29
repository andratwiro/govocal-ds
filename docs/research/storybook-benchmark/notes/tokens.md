# Design tokens: 2025–2026 state of the art, and checkable criteria for "token rigor"

Scope note: research date 29 Oct 2026. Sources are 2025–2026 unless marked *(background/origin)*. Where a claim
comes only from a search-result excerpt or a secondary blog, it is marked as such. Inferences that apply the
findings to govocal-ds (Figma variables → `tokens/` JSON → build → `src/tokens.css` with `--gv-*`; components
in plain CSS with only `var(--gv-*)`; motion/size tokens hand-written "Not in Figma"; some `color-mix()`
stand-ins; no per-city theming yet) are kept in the Inferences subsections.

Framing: developers decide the stack (component library, CSS variables vs their current styled-components theme,
packaging, migration). So the notes weight what the design side can own and deliver regardless of stack:
tool-neutral token definitions (DTCG), the naming grammar and tiers, theme/tenant rules, Figma variable hygiene
and code syntax, deprecation/rename discipline. Section 9 tags every criterion DESIGN-OWNED or DEV-OWNED.
Section 1 includes how exemplars ship one token source to several stacks.

## 1. Format and tooling: DTCG status, Style Dictionary, Terrazzo, Tokens Studio, Figma variables export/import, code syntax, Code Connect

### Takeaway
The DTCG format became stable on 28 Oct 2025 as edition "2025.10" (Format, Color and Resolver modules, all
Final Community Group Reports), and Figma shipped native DTCG import/export of variables in November 2025, but
only a strict subset (single-value types, px dimensions, seconds durations, no composites). "Use the standard"
now has a concrete, testable meaning: `$value`/`$type` JSON in `.tokens.json`, validated by a tool.

### Cited Findings
**DTCG spec**
- The Design Tokens Community Group published v2025.10, "the first stable version" of the Design Tokens
  Format Module, on 28 Oct 2025; 24+ organisations listed as adopters/supporters (Adobe, Amazon, Google,
  Microsoft, Meta, Figma, Sketch, Salesforce, Shopify, Tokens Studio, etc.); a living draft continues at
  designtokens.org/TR/drafts — [designtokens.org](https://www.designtokens.org/);
  [designzig summary](https://designzig.com/design-tokens-specification-reaches-first-stable-version-with-w3c-community-group/)
- The Resolver Module 2025.10 is a "Final Community Group Report" dated 28 Oct 2025, published under the W3C
  Community Final Specification Agreement; it extends the Format module and exists to manage tokens "across
  multiple contexts—such as light and dark themes, responsive layouts, or accessibility modes" by deduplicating
  repeated values and enumerating permutations "without combinatorial explosion" —
  [W3C CG report: Resolver 2025.10](https://w3c.github.io/cg-reports/design-tokens/CG-FINAL-resolver-20251028/)
- Resolver concepts: **sets** (groups of token sources), **modifiers** with **contexts** (e.g. `theme: light|dark|darkHighContrast`),
  and a **resolutionOrder** array where later items override earlier ones; example chain foundation →
  typography → colour-theme modifier, input `{ "theme": "dark" }` — [Resolver draft](https://www.designtokens.org/tr/drafts/resolver/)
- The drafts page for the resolver (dated 08 Sep 2026 when fetched) carries "This is a preview draft of in
  progress changes. Do not refer to this document directly, and do not implement anything in this document" —
  i.e. implement the 2025.10 final report, not the draft — [Resolver draft](https://www.designtokens.org/tr/drafts/resolver/).
  (A search excerpt gave a 30 Jul 2026 date for an earlier draft; drafts move, the final report is fixed.)
- File conventions reported for 2025.10: plain JSON with `$value`, `$type`, `$description`; media type
  `application/design-tokens+json`; extension `.tokens` or `.tokens.json` — [cssdna explainer (secondary)](https://cssdna.com/blog/design-tokens-json-format/);
  [CODERCOPS (secondary)](https://blog.codercops.com/blog/design-tokens-2026-w3c-format-guide)
- 2025.10 colour values are objects (`colorSpace`, `components`, `alpha`, optional `hex`) and the Color module
  covers CSS Color 4 spaces (Display P3, OKLCH) — [designzig](https://designzig.com/design-tokens-specification-reaches-first-stable-version-with-w3c-community-group/);
  [civictheme PR fixing Figma emit to 2025.10 colour objects](https://github.com/civictheme/uikit/pull/1025)

**Figma**
- Figma's Schema 2025 recap: native import/export of variables aligned to DTCG "1.0" (Figma's name for 2025.10),
  shipping November 2025; Figma says it "held off on adding this feature" until the spec reached 1.0; modes per
  collection raised from 4 to 10 (Professional) and 20 (Organization); **extended collections** (a core
  collection that brands/sub-teams extend with their own values while inheriting core updates) November 2025;
  **Check Designs** (a linter that flags non-system values and "suggest[s] the right variable to use") in early
  access for Organization/Enterprise; **Code Connect UI** (map Figma components to GitHub code files, with AI
  suggestions) rolling out to Organization/Enterprise; Figma MCP server generally available, supporting design-system
  guidelines for AI agents — [Figma blog: Schema 2025 recap](https://www.figma.com/blog/schema-2025-design-systems-recap/)
- Extended collections reported as Enterprise-only by a secondary recap; Figma's own post does not state the plan
  — [Design Systems Collective TLDR (secondary)](https://www.designsystemscollective.com/schema-2025-tldr-the-we-promise-we-didnt-forget-about-design-systems-edition-ca5f2543deb5)
  vs [Figma blog](https://www.figma.com/blog/schema-2025-design-systems-recap/)
- Figma Help: imported tokens "must be in a JSON file and follow the DTCG format" (links 2025.10); supported types
  are Color, Dimension (unit "must be set to px. Other values are not supported"), Font family, Duration (unit
  "must be set to s"), Number (Boolean via `$extensions` `com.figma.type: "boolean"`); String is accepted though
  not a DTCG type; nested group names are normalised with slashes (`color.accent.light` → `color/accent/light`);
  "A new mode" is created "for each file you import"; cross-collection aliases use the `com.figma.aliasData`
  extension — [Figma Help: Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- Implementers report Figma's importer rejects legacy hex-string colour `$value`s, accepts only sRGB/HSL colour
  spaces (not OKLCH), single font family, and no composite tokens (typography, shadow) because a variable holds
  one value — [civictheme/uikit PR #1025](https://github.com/civictheme/uikit/pull/1025);
  [rafters issue #2891](https://github.com/rafters-studio/rafters/issues/2891);
  [ThalesGroup/quantum issue #49](https://github.com/ThalesGroup/quantum/issues/49) (third-party, not Figma docs)
- Variable **code syntax**: `variable.setVariableCodeSyntax('WEB', 'var(--color-bg-primary)')`, platforms WEB,
  ANDROID, iOS; this is what makes Dev Mode show `var(--…)` instead of a raw hex —
  [Figma plugin API: setVariableCodeSyntax](https://developers.figma.com/docs/plugins/api/properties/Variable-setvariablecodesyntax);
  [Figma Help: Variables in Dev Mode](https://help.figma.com/hc/en-us/articles/27882809912471-Variables-in-Dev-Mode)
- Figma's own MCP-server guide tells agents to set code syntax to "the exact token name from the codebase", else a
  mechanical transform (`color/bg/primary` → `var(--color-bg-primary)`) —
  [figma/mcp-server-guide: code-connect-setup](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-generate-library/references/code-connect-setup.md);
  [variable-patterns](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/variable-patterns.md)

**Build tools**
- Style Dictionary: v4 introduced "first-class support for the DTCG format"; its DTCG page says 2025.10 "does not
  have full support yet" and that v5 work is in progress — [styledictionary.com: DTCG](https://styledictionary.com/info/dtcg/).
  v5.7.0 adds DTCG 2025.10 duration values — [SD v5.7.0 release](https://github.com/style-dictionary/style-dictionary/releases/tag/v5.7.0).
  zeroheight's help centre says its tokens automation moved to SD v5 with DTCG JSON as default export and
  `.tokens.json` extension — [zeroheight: Migrating to SD v5](https://help.zeroheight.com/hc/en-us/articles/48049028236187-Migrating-to-Style-Dictionary-v5-in-tokens-automation).
  (Conflict: secondary posts say "SD v5 adopted 2025.10 as base format"; SD's own page says support is partial.)
- Terrazzo (formerly Cobalt UI): CLI generating CSS/Sass/JS/TS etc. from DTCG JSON, with `lint` and `check`
  (validate against the DTCG spec) commands — [Terrazzo GitHub](https://github.com/terrazzoapp/terrazzo);
  [Terrazzo docs](https://terrazzo.app/docs/). A secondary source claims Terrazzo 2.10.0 is "the only tool with full
  support for the DTCG v2025.10 spec, including resolvers" — [CODERCOPS (secondary, unverified)](https://blog.codercops.com/blog/design-tokens-2026-w3c-format-guide)
- Terrazzo's built-in lint rules (quoted names): `core/valid-*` per type; `core/colorspace`, `core/consistent-naming`,
  `core/descriptions`, `core/duplicate-values`, `core/max-gamut`, `core/required-children`, `core/required-modes`,
  `core/required-type`, `core/required-typography-properties`; accessibility `a11y/min-contrast`,
  `a11y/min-font-size` — [Terrazzo: Lint](https://terrazzo.app/docs/linting/)
- Tokens Studio: a Figma plugin with multi-set tokens, themes, aliases/maths, Git sync, which "speaks W3C DTCG"; a
  separate Tokens Studio web platform with plugin sync is in (open) beta — [atomize comparison (secondary)](https://atomize.tools/blog/figma-plugins-design-system-token-workflows/);
  [Palette Daddy guide (secondary)](https://palettedaddy.com/guides/design-tokens-figma-token-studio).
  Norway's Designsystemet uses Tokens Studio to sync tokens between Figma and its repo —
  [Designsystemet: Build your theme](https://designsystemet.no/en/fundamentals/start-here/own-theme)

**What exemplars actually use**
- GitHub Primer primitives: Style Dictionary with a custom build (`scripts/buildTokens.ts`), DTCG `$value`/`$type`
  source in `src/tokens`, `$extensions` carrying Figma collection/mode/scopes for Figma export, Changesets for
  versioning — [primer/primitives](https://github.com/primer/primitives)
- Adobe Spectrum: own token data repo (renamed `spectrum-design-data`) with tokens, component schemas and tooling
  — [adobe/spectrum-tokens redirect](https://github.com/adobe/spectrum-tokens); [Spectrum tools](https://opensource.adobe.com/spectrum-design-data/tools/)
- Designsystemet: own CLI (`designsystemet tokens create` / `tokens build`) from a `designsystemet.config.json`
  produced by its Theme Builder — [Designsystemet: Build your theme](https://designsystemet.no/en/fundamentals/start-here/own-theme)

**Shipping one token source to several stacks**
- Style Dictionary ships 40+ predefined output formats from one source: `css/variables`; `scss/variables`,
  `scss/map-deep`; LESS, Stylus; `javascript/es6`, `javascript/esm`, `javascript/module`, `javascript/object`;
  `typescript/es6-declarations`; `json/nested`, `json/flat`; Android resources, Compose (`compose/object`), iOS Swift,
  Flutter. `outputReferences` "keep[s] references (a -> b -> c) in the output", so aliases survive into CSS —
  [Style Dictionary: predefined formats](https://styledictionary.com/reference/hooks/formats/predefined/)
- Terrazzo official output plugins: `@terrazzo/plugin-css`, `-sass`, `-js` (JS/TS), `-tailwind`, `-swift`,
  `-vanilla-extract`, `-storybook`, plus a plugin API; CSS output supports modes via `modeSelectors` —
  [Terrazzo docs](https://terrazzo.app/docs/)
- Primer primitives builds DTCG JSON into per-theme CSS variable files and Figma-ready output from one source —
  [primer/primitives](https://github.com/primer/primitives)
- **The styled-components precedent.** Primer React v38 (27 Oct 2025) moved from styled-components to CSS Modules;
  "Support for theming in JavaScript has been removed"; advice: "prefer to use CSS modules over styled-components and
  css variables over javascript theming" — [primer/react discussion #7086](https://github.com/primer/react/discussions/7086).
  The migration guide maps old JS-theme keywords to CSS variables (`canvas.default` → `--bgColor-default`, spacing
  keyword `3` (16px) → `--base-size-16`, border widths → `--borderWidth-thin`/`--borderWidth-thick`) and offers a
  VS Code extension that replaces theme keywords with CSS variables —
  [Primer: Migrating to CSS variables](https://primer.style/product/primitives/migrating/)
- **The CSS-in-JS bridge.** Atlassian's `token()` function in JS emits CSS variables (`var(--ds-background-neutral)`)
  and its Babel plugin can add fallbacks at build time, i.e. one token set serves CSS and CSS-in-JS consumers —
  [Atlassian: Use tokens in code](https://atlassian.design/foundations/tokens/use-tokens-in-code). Fluent UI React v9
  does the same: `tokens.colorNeutralForeground1` "becomes `var(--colorNeutralForeground1)`" —
  [fluentui design-tokens.md](https://github.com/microsoft/fluentui/blob/master/docs/architecture/design-tokens.md)

### Inferences
- A Community Group "Final Report" is not a W3C Recommendation; headlines calling it "a real W3C standard"
  ([Medium, secondary](https://mohitphogat.medium.com/design-tokens-just-became-a-real-w3c-standard-heres-what-changes-952fa9eb31fb))
  overstate it. The accurate claim is "stable, versioned, vendor-backed community spec" (W3C CG reports carry the
  boilerplate that they are not on the W3C Standards Track; verify the exact wording on the report page).
- For govocal-ds: "Not in Figma" motion/size tokens are partly a tooling choice, not a necessity. Durations (in `s`)
  and px dimensions can now round-trip through Figma's native import; easing curves (`cubicBezier`), rem sizes,
  OKLCH colours and composites cannot. The audit should ask, token by token: could this live in Figma? If not,
  is the reason one of Figma's documented limits?
- A reviewer will accept "DTCG-conformant" only if a validator says so: run `tz check`/`tz lint`
  (Terrazzo) or an equivalent schema check over `tokens/` in CI, independent of the build script that agents wrote.
- Figma variable code syntax is the cheapest traceability lever: if every variable's WEB syntax is
  `var(--gv-…)` and matches `tokens.css`, Dev Mode and the Figma MCP server hand developers and AI agents the
  real token name.
- Stack neutrality: what the design side should hand over is the DTCG JSON (plus a resolver file for modes), not
  `tokens.css`. `tokens.css` is one output among several the developers can pick (Style Dictionary or Terrazzo can
  also emit a JS/TS object for a styled-components `ThemeProvider`, Sass maps, or a Tailwind theme). The exemplars
  show two routes that keep one source: (a) a JS theme whose values are the CSS variable strings (`var(--gv-…)`),
  Atlassian/Fluent style, so styled-components keeps working while values come from CSS variables; (b) a full move
  to CSS variables, Primer v38 style, with a keyword → variable mapping table and a codemod. Either way the token
  names and tiers, which are design-owned, do not change; only the output target does.
- Consequence for the audit: criteria that test the token source (format, grammar, tiers, modes, contrast pairs,
  Figma parity, deprecation) stay valid if developers drop React Aria or keep styled-components; criteria that test
  consuming code (lint, coverage) must be restated for whatever stack developers choose.

### Gaps
- Could not confirm from a primary source which Style Dictionary version/date fully supports 2025.10 (colour
  objects, resolver); SD docs say partial.
- Terrazzo's "only full 2025.10 + resolver implementation" claim is from a secondary blog; not verified on
  terrazzo.app.
- Code Connect concerns components, not tokens; found nothing tying Code Connect to variables beyond code syntax.
- No primary source found for Tokens Studio's 2026 product status (web platform GA date).

## 2. Naming taxonomies: tiers and grammars in leading systems; which is strongest

### Takeaway
Mature systems converge on 2–3 tiers (raw/primitive → semantic/functional/alias/system → optional component)
and on an ordered grammar whose last slot is a CSS-like property and whose middle slots are role, emphasis and
state. Primer's grammar (property always required) and Atlassian's `foundation.property.modifier` are the most
explicit published grammars; NL Design System's is the most relevant to multi-organisation civic use.

### Cited Findings
- **Primer (GitHub)**: three categories — base (`base-size-4`, `base-color-green-5`, `base-fontWeight-semibold`),
  functional (`bgColor-inset`, `borderColor-default`, `boxShadow-inset-thick`) and component/pattern
  (`control-danger-borderColor-rest`, `button-primary-bgColor-hover`, `text-codeInline-fontSize`). Ordered parts:
  prefix (optional, e.g. `brand`), namespace (`base`), pattern, variant, **property (required; "usually matches a
  CSS property")**, scale/state. Modifiers `default`/`muted`/`emphasis`; sizes t-shirt; density
  condensed/normal/spacious. Component/pattern tokens "should only be used in component CSS" —
  [Primer: Token names](https://primer.style/product/primitives/token-names/)
- **Atlassian**: `foundation.property.modifier`, e.g. `color.icon.success`; modifier optional (`color.text` is
  default body text); CSS output `--ds-` prefixed, e.g. `var(--ds-background-neutral)`, `var(--ds-space-200)` —
  [Atlassian: Design tokens](https://atlassian.design/foundations/tokens/design-tokens);
  [Atlassian: Use tokens in code](https://atlassian.design/foundations/tokens/use-tokens-in-code)
- **Salesforce SLDS 2**: global styling hooks `--slds-g-{category}-{property}-{variant}` (e.g.
  `--slds-g-color-surface-3`); colour hooks form a "Semantic UI Color System" (surface, on surface, container,
  accent, feedback, plus palettes); guidance: map backgrounds to `--slds-g-color-surface-container-1`, "not utility
  variables like `--slds-g-color-neutral-base-100`"; global hooks are the source values that component hooks
  reference — [SLDS 2: Global Styling Hooks](https://www.lightningdesignsystem.com/2e1ef8501/p/777f5a-global-styling-hooks);
  [SLDS 2: Styling Hook Index](https://www.lightningdesignsystem.com/2e1ef8501/p/98b493)
- **Material 3**: token classes reference (`md.ref`), system (`md.sys`), component (`md.comp`); names go general →
  specific, e.g. `md.sys.color.on-primary`; Material Web exposes `--md-sys-color-*` —
  [M3: Design tokens](https://m3.material.io/foundations/design-tokens);
  [Material Web theming](https://material-web.dev/theming/material-theming/)
- **Fluent 2 (Microsoft)**: publishes "alias" colour tokens (e.g. `colorNeutralForeground1`) over global values;
  in Fluent UI React v9 `tokens.colorNeutralForeground1` "becomes `var(--colorNeutralForeground1)`"; themes
  `webLightTheme`, `webDarkTheme`, Teams light/dark/high-contrast via `FluentProvider` —
  [Fluent 2: Web alias color tokens](https://fluent2.microsoft.design/color-tokens);
  [fluentui design-tokens.md](https://github.com/microsoft/fluentui/blob/master/docs/architecture/design-tokens.md)
- **NL Design System (Dutch public sector)**: three levels — brand (an identity's options; free naming), common
  (semantic, reusable, e.g. heading font-family, error feedback colour; NL offers a standard "Basis-tokens" set),
  component (all tokens a component needs, from common or directly from brand). Each municipality writes its own
  theme with **identical component token names** so components are "easily interchangeable between
  organizations"; example `voorbeeld.button.primary-action.focus.background-color` —
  [NL Design System: Design tokens intro](https://nldesignsystem.nl/handboek/huisstijl/design-tokens/)
- NL Design System grammar: `prefix.component.element.state.property`, lowercase-hyphenated, never starting with a
  digit (`level-1` not `1`), ending with a CSS property name so the type can be inferred, prefer logical properties
  (`padding-block`, `margin-inline`); organisation prefix letters only (`utrecht`, `denhaag`), `nl` reserved for the
  core team; values should be platform-independent (`24px`, `#FF0000` good; `1ch`, `2em`, `cornflowerblue`, `auto`,
  `currentColor` poor) — [NL Design System: Design token conventie](https://nldesignsystem.nl/handboek/developer/design-token-conventie/);
  [NL Design System: intro](https://nldesignsystem.nl/handboek/huisstijl/design-tokens/)
- **Designsystemet (Norway)** semantic colour names: `background-default`, `base-default`, `base-contrast-default`,
  `text-subtle` — [Designsystemet: Build your theme](https://designsystemet.no/en/fundamentals/start-here/own-theme)
- Nathan Curtis's "Naming Tokens in Design Systems" is the widely cited origin of the namespace/object/base/modifier
  grammar *(background/origin, 2016)* — [Nathan Curtis (Substack repost)](https://nathanacurtis.substack.com/p/naming-tokens-in-design-systems-9e86c7444676).
  His later EightShapes piece "Reimagining a Token Taxonomy" exists but could not be fetched (403) —
  [EightShapes on Medium](https://medium.com/eightshapes-llc/reimagining-a-token-taxonomy-462d35b2b033)
- Adobe ships `@adobe/token-naming-audit`, which "reports on token naming debt and overloaded values" — evidence
  that a leading system treats naming as a measured, auditable property —
  [Spectrum design data: Tools](https://opensource.adobe.com/spectrum-design-data/tools/)

### Inferences
- "Strongest naming" has no single published winner. The common traits of the explicit grammars (Primer, Atlassian,
  NL, SLDS) are: (1) a fixed slot order, (2) a required property slot, (3) role words (surface/on-surface,
  default/muted/emphasis, subtle) rather than colour words in the semantic tier, (4) state as its own slot
  (`rest`/`hover`/`focus`/`disabled`), (5) a system prefix in CSS (`--ds-`, `--slds-g-`, `--md-sys-`). A govocal-ds
  audit can test all five mechanically.
- Tier count: Primer 3, Material 3, NL 3, SLDS 2–3 (palette/utility vs semantic globals vs component hooks), Fluent
  2 publicly (global + alias). "Three tiers" is the norm, but component tokens are optional; the rule that matters is
  directional: components consume semantic (or component) tokens, never primitives (SLDS states it explicitly).
- NL Design System is the closest exemplar for a civic SaaS serving many cities: one component token vocabulary,
  one theme file per organisation.

### Gaps
- No 2025–2026 primary source comparing grammars head-to-head; "strongest" is synthesised.
- IBM Carbon's and Shopify Polaris's naming grammars were not fetched in this pass (Carbon tokens appear only via
  its Stylelint plugin, section 3).
- Atlassian's full token count per tier and whether its palette tier is public were not verified.

## 3. Enforcement: lint rules, tests, CI gates, coverage metrics

### Takeaway
Leading systems enforce tokens with autofixing lint rules per token domain (colour, space, type, shape, motion)
plus rules against deprecated and unknown tokens; Stylelint now has a core `no-unknown-custom-properties` rule.
No exemplar system publishes a token-coverage percentage; the only public coverage number found is a
vendor study (40.4% average across 375 sites).

### Cited Findings
- Atlassian `@atlaskit/eslint-plugin-design-system`: `ensure-design-token-usage` (hard-coded values → tokens;
  recommended, autofixable, configurable `domains: ['color','spacing']`), `ensure-design-token-usage/preview`,
  `no-deprecated-design-token-usage` (autofixable), `no-unsafe-design-token-usage` (usage must stay "statically
  and locally analyzable"), `use-tokens-motion` (not autofixable), `use-tokens-space`, `use-tokens-typography`,
  `use-tokens-shape`; plus a Stylelint plugin for CSS —
  [Atlassian ESLint plugin usage](https://atlassian.design/components/eslint-plugin-design-system/usage)
- Atlassian recommends the `token()` function because it gives "proper prefixes, type checking, and linting so
  you'll know if a token ever changes, is deleted, or is used incorrectly"; fallback values "were mostly used
  historically for large app migrations and are not recommended anymore" —
  [Atlassian: Use tokens in code](https://atlassian.design/foundations/tokens/use-tokens-in-code)
- Primer `@primer/stylelint-config` custom rules: `primer/colors`, `primer/spacing`, `primer/typography`,
  `primer/borders`, `primer/box-shadow`, `primer/responsive-widths` (errors on widths > 320 px min viewport) —
  [primer/stylelint-config](https://github.com/primer/stylelint-config)
- Carbon `stylelint-plugin-carbon-tokens` v5 (TypeScript rewrite, Carbon v11+): `carbon/theme-use` (color,
  background-color, border-color, outline-color, fill, stroke incl. shorthands and gradients), `carbon/layout-use`,
  `carbon/type-use`, `carbon/motion-duration-use`, `carbon/motion-easing-use`; autofix; presets Strict /
  Recommended / Light touch — [carbon-design-system/stylelint-plugin-carbon-tokens](https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens);
  [npm](https://www.npmjs.com/package/stylelint-plugin-carbon-tokens)
- Stylelint core rule `no-unknown-custom-properties`: flags `var(--foo)` when `--foo` is not defined in the same
  source or in configured `referenceFiles`; a `var()` with a fallback or an `@property`-registered property counts
  as known — [Stylelint: no-unknown-custom-properties](https://stylelint.io/user-guide/rules/no-unknown-custom-properties/).
  The older csstools plugin did the same and notes an undefined custom property "silently compute[s] to unset" —
  [csstools/stylelint-value-no-unknown-custom-properties](https://github.com/csstools/stylelint-value-no-unknown-custom-properties/).
  (A search excerpt says the core rule arrived in Stylelint 17; the rule page did not state the version.)
- Token-file linting: Terrazzo `core/required-modes`, `core/descriptions`, `core/duplicate-values`,
  `core/consistent-naming`, `a11y/min-contrast` lint the token source itself, not the consuming CSS —
  [Terrazzo: Lint](https://terrazzo.app/docs/linting/)
- Figma-side enforcement: Check Designs flags non-system values in designs and suggests the variable (early access,
  Organization/Enterprise) — [Figma blog: Schema 2025](https://www.figma.com/blog/schema-2025-design-systems-recap/)
- Coverage: OverlayQA (21 May 2026) audited 375 production sites: average token coverage 40.4%, median 38%, 7.5%
  at ≥ 90%, 17,731 hard-coded values (47/site); CSS-custom-property sites 39.5%, Tailwind 44.1%. The study does not
  disclose which properties count or the denominator, and the vendor sells the audit tool —
  [OverlayQA: Design token drift study](https://overlayqa.com/blog/design-token-drift-study/)
- A secondary article defines "token usage rate" as the share of colour, spacing and typography values that go
  through tokens instead of hard-coded or arbitrary values, alongside component coverage and a count of active
  exceptions — [Mironsoft (secondary)](https://www.mironsoft.de/en/blog/design-system-adoption-audit-metrics)

### Inferences
- govocal-ds's "a test refuses raw values" matches the exemplars' intent, but a reviewer will ask for the same
  breadth: per-domain coverage (colour, space, radius, type, shadow, motion, z-index, breakpoints), an
  unknown-token check (core Stylelint rule with `referenceFiles: ['src/tokens.css']`), a deprecated-token check,
  and a published escape-hatch count. A custom test written by the same agents that wrote the CSS is weaker
  evidence than a stock, widely used linter configured strictly.
- Because no exemplar publishes a coverage number, govocal-ds can differentiate by publishing one (with the
  denominator defined) on its Foundations page, generated in CI.
- `var(--x, fallback)` passes `no-unknown-custom-properties`; Atlassian discourages fallbacks. A strict audit should
  ban raw fallbacks (or require the fallback to be another token).

### Gaps
- `stylelint-declaration-strict-value` was not fetched; its current maintenance status is unverified.
- Found no exemplar system (Primer, Atlassian, Carbon, Spectrum) that publishes token-coverage or adoption
  percentages publicly.
- Methodology for measuring coverage is not standardised; the one public study does not disclose it.

## 4. Change management: deprecation, renames, versioning, changelogs

### Takeaway
Best practice is a staged lifecycle (deprecated → still working with lint errors → removed in a major), renames
done as "new token + old name kept as a deprecated alias", lint/codemods that migrate usages, and machine-made
token diffs between releases.

### Cited Findings
- Atlassian: tokens move through active → deprecated (in a minor) → soft-deleted ("functional but will raise
  errors", following minor) → deleted (next major); codemods ship in the tokens package; example: removed
  `font.body.UNSAFE_small` replaced by `font.body.small` — [Atlaskit tokens changelog (seen as a search excerpt;
  the page did not render for fetching)](https://atlaskit.atlassian.com/packages/design-system/tokens/changelog).
  Lint `no-deprecated-design-token-usage` is autofixable —
  [Atlassian ESLint plugin](https://atlassian.design/components/eslint-plugin-design-system/usage)
- Adobe Spectrum: `@adobe/token-diff-generator` detects "added, deleted, renamed, deprecated, and updated tokens
  across different schema versions" (CLI/JSON/Markdown output); detects renames via each token's uuid; renamed
  tokens are marked deprecated and become an alias of the new token, with `deprecated`, `deprecated_comment`,
  `renamed` fields — [Spectrum tools](https://opensource.adobe.com/spectrum-design-data/tools/);
  [npm @adobe/token-diff-generator](https://www.npmjs.com/package/@adobe/token-diff-generator)
- Spectrum releases are Changesets "Version Packages" PRs; e.g. a PR adding static + theme-aware transparency
  tokens (36 + 108 tokens) and deprecating the legacy ones —
  [spectrum-design-data PR #1382](https://github.com/adobe/spectrum-design-data/pull/1382);
  [release 15.6.0](https://github.com/adobe/spectrum-design-data/releases/tag/%40adobe/spectrum-tokens%4015.6.0)
- Primer primitives uses `.changeset/` and a CHANGELOG — [primer/primitives](https://github.com/primer/primitives)

### Inferences
- Checkable for govocal-ds: (a) a token diff per release (added/removed/renamed/value-changed) in the changelog;
  (b) no token disappears without first existing as a deprecated alias for ≥ 1 minor release; (c) a lint rule fails
  on deprecated names in component CSS; (d) renames in Figma and code happen in the same change (a stable ID, like
  Spectrum's uuid or Figma's variable ID in `$extensions`, makes a rename detectable as a rename, not a delete+add).
- DTCG 2025.10 has a `$deprecated` property (per the format module); Figma import support for it is unverified.

### Gaps
- Could not render Atlassian's lifecycle page directly; the version steps are from a search excerpt of its changelog.
- `$deprecated` in DTCG 2025.10 is from memory of the spec, not fetched in this pass; verify in the Format module.
- No source found on how Figma's native export represents deprecation.

## 5. Theming: dark mode, density, multi-brand/multi-tenant, and Storybook exposure

### Takeaway
Exemplars theme by swapping a set of semantic values under stable names, scoped by attributes on a root
(`data-color-mode`, `data-color-scheme`, `data-size`), with dark, high-contrast and often colour-blind and density
modes. Multi-organisation theming in the public sector (NL Design System, Designsystemet) works by keeping
component token names identical and giving each organisation its own theme file/config. Storybook exposure is a
toolbar switcher (`@storybook/addon-themes`).

### Cited Findings
- Primer outputs CSS per theme: light, dark, dark-dimmed, high contrast, colour-blind and tritanopia variants —
  [primer/primitives](https://github.com/primer/primitives)
- Atlassian: light, dark and high-contrast are colour themes; "non-color themes" include "cozy/comfortable/compact
  views, reduced motion, or custom typography" — [Atlassian: Design tokens](https://atlassian.design/foundations/tokens/design-tokens);
  setup with `setGlobalTheme()` and `<html data-theme="light:light dark:dark…" data-color-mode="light">` —
  [Atlassian: Use tokens in code](https://atlassian.design/foundations/tokens/use-tokens-in-code)
- SLDS 2 has documented colour modes (dark mode) over its semantic hooks —
  [SLDS 2: Color Modes](https://www.lightningdesignsystem.com/2e1ef8501/p/5826e4-color-modes);
  [Trailhead: Activate SLDS 2 and dark mode](https://trailhead.salesforce.com/content/learn/modules/dark-mode-ready-components-in-slds-2/activate-slds-2-and-preview-dark-mode)
- Material 3 tokens cover light/dark, density and contrast levels — [M3: Design tokens](https://m3.material.io/foundations/design-tokens)
- Designsystemet: Theme Builder generates colour scales from brand colours and a `designsystemet.config.json` kept
  in Git; `designsystemet tokens create` then `tokens build`; multiple themes in one repo; light/dark colour schemes
  and size modes; CSS scoped by `data-color-scheme`, `data-color`, `data-size` —
  [Designsystemet: Build your theme](https://designsystemet.no/en/fundamentals/start-here/own-theme);
  [Theme Builder](https://theme.designsystemet.no/); [Designsystemet: Setup](https://designsystemet.no/en/fundamentals/code/setup).
  Predefined organisation themes reportedly include digdir, altinn, uutilsynet, portal —
  [@digdir/designsystemet-theme on npm](https://www.npmjs.com/package/@digdir/designsystemet-theme) (from a search
  excerpt); other agencies build on it, e.g. [Norwegian Red Cross](https://github.com/norwegianredcross/DesignSystem),
  [Brønnøysund Register Centre tokens](https://github.com/brreg/designsystemet)
- NL Design System: components carry no built-in branding; each organisation applies its brand through tokens, with
  the same component token names — [NL Design System: intro](https://nldesignsystem.nl/handboek/huisstijl/design-tokens/)
- DTCG Resolver: modifiers/contexts are the spec's way to express theme × density × contrast combinations without
  duplicating files — [Resolver 2025.10](https://w3c.github.io/cg-reports/design-tokens/CG-FINAL-resolver-20251028/)
- Figma: extended collections let a core collection be extended with per-brand values that inherit core updates
  (Nov 2025) — [Figma blog: Schema 2025](https://www.figma.com/blog/schema-2025-design-systems-recap/)
- Storybook: `@storybook/addon-themes` adds a toolbar theme switcher, per-story/meta overrides via `globals.theme`,
  recipes for class/data-attribute switching; ~5 M weekly downloads; a separate addon, not core —
  [@storybook/addon-themes](https://storybook.js.org/addons/@storybook/addon-themes)

### Inferences
- govocal-ds has no per-city theming. A cheap, checkable readiness test that a reviewer will accept: create a
  throwaway second theme that changes only brand/primitive values (one file), build, and run visual regression across
  all stories — every component should change colour, none should break, and no component CSS should need editing.
  Count component CSS selectors that branch on theme/mode (`[data-…="dark"] .x`); the target is 0 (themes live only in
  token files).
- Go Vocal's cities resemble NL Design System's municipalities: the NL model (shared component token names; tenant
  sets only at brand/common level; tenant prefix not needed when only Go Vocal ships components) is the nearest
  published precedent.
- Contrast must be re-checked per tenant palette: Designsystemet's builder generates scales from brand colours,
  which is how it keeps contrast pairs valid for arbitrary brand inputs.

### Gaps
- No primary source found on Salesforce multi-brand theming specifics (e.g. Cosmos theme) beyond colour modes.
- Did not verify whether Storybook 10 bundles any theme switcher in core (the addon page shows it as separate).

## 6. Traceability Figma ↔ code: one name in both, IDs, sync direction, drift detection

### Takeaway
The traceable pattern in 2025–2026 is: one token name transformed mechanically between Figma (`a/b/c`) and code
(`--prefix-a-b-c`), Figma variable code syntax set to the real CSS variable, Figma metadata (collection, mode,
scopes, IDs) kept in `$extensions`, and a diff that runs on every change. Code-as-truth (Primer, Designsystemet
config in Git) and Figma-as-truth (export from variables) both exist; what matters is one declared direction.

### Cited Findings
- Figma import normalises nested names to slashes (`color.accent.light` → `color/accent/light`) — [Figma Help](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- Code syntax per platform (WEB/ANDROID/iOS) links a variable to its code name and is what Dev Mode shows —
  [Figma plugin API](https://developers.figma.com/docs/plugins/api/properties/Variable-setvariablecodesyntax);
  [Figma Help: Variables in Dev Mode](https://help.figma.com/hc/en-us/articles/27882809912471-Variables-in-Dev-Mode)
- Primer keeps Figma collection, mode and scope in token `$extensions` and transforms them for Figma export (code is
  the source; Figma is generated) — [primer/primitives](https://github.com/primer/primitives)
- Designsystemet keeps the config in Git as "single source of truth" and syncs Figma via Tokens Studio —
  [Designsystemet: Build your theme](https://designsystemet.no/en/fundamentals/start-here/own-theme)
- Spectrum detects renames via per-token uuid, so a rename is not a delete + add —
  [npm @adobe/token-diff-generator](https://www.npmjs.com/package/@adobe/token-diff-generator)
- Cross-collection aliases survive native import only via `com.figma.aliasData` —
  [Figma Help](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables); community plugins exist
  specifically to preserve alias links on export/import — [tokenhaus plugin](https://www.figma.com/community/plugin/1578065513743190845/tokenhaus-variable-import-export-with-links);
  [TokensBrücke](https://github.com/tokens-bruecke/figma-plugin)
- Figma's Check Designs closes the design-side drift (non-variable values in files) —
  [Figma blog: Schema 2025](https://www.figma.com/blog/schema-2025-design-systems-recap/)

### Inferences
- For govocal-ds (Figma → JSON → CSS, i.e. Figma as truth for most tokens, code as truth for motion/size): the audit
  should check that (a) every Figma variable maps to exactly one `--gv-*` and vice versa, except a listed set of
  code-only tokens with a reason; (b) every variable's WEB code syntax equals its `var(--gv-…)`; (c) the export is
  regenerated in CI and `git diff --exit-code` is clean (no hand edits to generated CSS); (d) aliases are preserved
  (a semantic token in CSS should be `var(--gv-primitive)`, not a resolved hex, if Figma has it as an alias).
- `color-mix()` stand-ins are by definition code-only and have no Figma variable (Figma variables cannot express a
  mix). Each is drift waiting to happen; list them with the Figma variable that should replace each.

### Gaps
- Found no off-the-shelf tool dedicated to Figma-variables-vs-CSS drift detection; the comparison is a custom script
  over Figma's native export or REST API.
- Did not verify whether Figma's native export includes variable IDs/keys in `$extensions`.

## 7. CSS specifics: prefixes, scoping, @layer, color-mix() and relative colour, contrast-pair tokens

### Takeaway
Every exemplar prefixes its custom properties (`--ds-`, `--slds-g-`, `--md-sys-color-`, NL organisation prefixes);
modern colour functions (`color-mix()`, relative colour syntax, `light-dark()`, OKLCH, `@property`) are Baseline and
used to derive state variants; contrast is guaranteed by pairing tokens (`on-*`, `*-contrast-*`) and by linting
the pairs.

### Cited Findings
- Prefixes: Atlassian `--ds-` ([Use tokens in code](https://atlassian.design/foundations/tokens/use-tokens-in-code)),
  SLDS `--slds-g-` with `g` = global scope ([SLDS 2 global hooks](https://www.lightningdesignsystem.com/2e1ef8501/p/777f5a-global-styling-hooks)),
  Material Web `--md-sys-color-` ([Material Web theming](https://material-web.dev/theming/material-theming/)),
  NL Design System organisation prefixes "like a vendor prefix in CSS"
  ([NL convention](https://nldesignsystem.nl/handboek/developer/design-token-conventie/)); Fluent v9 is the
  outlier with unprefixed `--colorNeutralForeground1`
  ([fluentui design-tokens.md](https://github.com/microsoft/fluentui/blob/master/docs/architecture/design-tokens.md))
- web.dev (11 Dec 2025) builds colour themes from a few custom properties using relative colour syntax, `oklch()`,
  `color-mix()` (e.g. in `oklab`), `light-dark()`, `color-scheme` and `@property`, all presented as Baseline features —
  [web.dev: Color themes with Baseline CSS features](https://web.dev/articles/baseline-in-action-color-theme)
- Hover/active variants via relative colour, e.g. `oklch(from var(--color-primary) calc(l * 0.9) c h)`, or
  `color-mix(in oklch, var(--brand), black 10%)` — [OpenReplay (secondary)](https://blog.openreplay.com/css-relative-color-syntax/);
  [colorpick guide (secondary)](https://colorpick.app/blog/modern-css-color-oklch-guide)
- Contrast pairing: Material's `on-*` roles pair with their base (`primary` / `on-primary`) —
  [M3: Design tokens](https://m3.material.io/foundations/design-tokens); a secondary article states "this pairing is
  how Material guarantees contrast" ([Medium, secondary](https://medium.com/@kasiabiernat/2-3-modern-angular-material-theming-how-to-pick-the-right-system-token-8a8a72719ce4));
  SLDS "on surface" colours ([SLDS 2 global hooks](https://www.lightningdesignsystem.com/2e1ef8501/p/777f5a-global-styling-hooks));
  Designsystemet `base-contrast-default` ([Designsystemet](https://designsystemet.no/en/fundamentals/start-here/own-theme))
- Linting contrast in the token source: Terrazzo `a11y/min-contrast` — [Terrazzo: Lint](https://terrazzo.app/docs/linting/)
- Figma's importer reportedly accepts only sRGB/HSL colours, so OKLCH-authored tokens cannot round-trip —
  [rafters issue #2891 (third-party)](https://github.com/rafters-studio/rafters/issues/2891)

### Inferences
- `color-mix()` in govocal-ds is defensible as modern CSS, but as a *token* practice it has three checkable risks:
  (1) the mixed value is not in Figma (traceability), (2) its contrast is not checked by token-level linters (the value
  exists only at runtime), (3) it can be inlined in component CSS, bypassing the semantic layer. Rigor = every mix is
  a named semantic token defined in the tokens layer, never inside a component rule; each has a computed value checked
  for contrast in every mode; each is listed as a stand-in with its replacement plan.
- If a component paints text on a background, both should come from one declared pair (role + on-role), so a contrast
  test can enumerate pairs rather than guess them.

### Gaps
- Found no 2025–2026 exemplar documentation on using `@layer` to order token, theme and component styles; no source
  for best practice there.
- No primary source found for Baseline "widely available" dates of `color-mix()`/relative colour (web.dev calls them
  Baseline; exact tier not extracted).

## 8. Documentation: how exemplars document tokens (search, copy, usage maps, contrast pairs)

### Takeaway
The strongest public token docs are generated from the token data and add structure beyond a swatch list: a
browsable viewer with values per mode (Spectrum S2 tokens viewer), and a dependency graph showing which tokens
alias which (Spectrum S2 visualizer). In Storybook, the common path is the `storybook-design-token` addon
(doc blocks from stylesheets) plus `@storybook/addon-themes`.

### Cited Findings
- Adobe publishes an "S2 Tokens Viewer" (browse/inspect values) and an "S2 Visualizer" — "interactive dependency
  graph showing ancestor/descendant relationships with search and filtering" —
  [Spectrum design data: Tools](https://opensource.adobe.com/spectrum-design-data/tools/)
- `storybook-design-token`: generates token documentation from stylesheets, card or table view, a
  `DesignTokenDocBlock` for MDX docs pages; v5 supports Storybook 10+ (ESM-only), v4 Storybook 9 —
  [storybook-design-token (GitHub)](https://github.com/UX-and-I/storybook-design-token);
  [Storybook addon page](https://storybook.js.org/addons/storybook-design-token)
- Atlassian publishes an `llms.txt` index of its design system docs (machine-readable docs for AI agents) —
  [atlassian.design/llms.txt](https://atlassian.design/llms.txt)
- Figma's MCP server now carries design-system guidelines for AI agents —
  [Figma blog: Schema 2025](https://www.figma.com/blog/schema-2025-design-systems-recap/)

### Inferences
- A docs page a developer trusts is generated from the same JSON that builds `tokens.css` (so docs can't
  drift), shows every token with: CSS name (copyable), value in each mode, description, its alias target, and
  "used by" (which components reference it, from a grep of component CSS). Usage maps also expose dead tokens.
- For a designer as owner, the docs must also answer "which token do I use for X" (a role table), which no
  generated swatch grid does.

### Gaps
- Did not fetch Atlassian's, Primer's or Carbon's token pages to confirm search/copy/usage features.
- Found no exemplar that shows a per-token "used by components" map in Storybook specifically.

## 9. Checkable criteria for "token rigor" (the brief's closing list)

### Takeaway
"Cemented in tokens, with consistent variables" becomes checkable when each claim is a measurement with a number
and a threshold. Because govocal-ds is a design-side proposal, the criteria split in two: DESIGN-OWNED ones test the
token source, its names, tiers, modes, contrast pairs, Figma parity and change discipline, and stay valid whatever
stack developers choose; DEV-OWNED ones test consuming code (which output, which linter, coverage) and must be
restated for the stack developers pick. The design side can prove the first group on its own, today.

### Cited Findings
- Exemplar sources for the criteria: DTCG 2025.10 + Terrazzo lint/check ([Terrazzo lint](https://terrazzo.app/docs/linting/));
  resolver for modes ([Resolver 2025.10](https://w3c.github.io/cg-reports/design-tokens/CG-FINAL-resolver-20251028/));
  Figma native import limits and code syntax ([Figma Help](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables),
  [setVariableCodeSyntax](https://developers.figma.com/docs/plugins/api/properties/Variable-setvariablecodesyntax));
  naming grammars ([Primer](https://primer.style/product/primitives/token-names/),
  [NL Design System](https://nldesignsystem.nl/handboek/developer/design-token-conventie/),
  [Adobe token-naming-audit](https://opensource.adobe.com/spectrum-design-data/tools/));
  enforcement ([Atlassian ESLint](https://atlassian.design/components/eslint-plugin-design-system/usage),
  [Carbon Stylelint](https://github.com/carbon-design-system/stylelint-plugin-carbon-tokens),
  [Stylelint no-unknown-custom-properties](https://stylelint.io/user-guide/rules/no-unknown-custom-properties/));
  change management ([Spectrum tools](https://opensource.adobe.com/spectrum-design-data/tools/),
  [Primer migration map](https://primer.style/product/primitives/migrating/));
  theming ([Designsystemet](https://designsystemet.no/en/fundamentals/start-here/own-theme),
  [NL intro](https://nldesignsystem.nl/handboek/huisstijl/design-tokens/));
  multi-stack output ([Style Dictionary formats](https://styledictionary.com/reference/hooks/formats/predefined/),
  [Terrazzo plugins](https://terrazzo.app/docs/));
  coverage baseline ([OverlayQA study](https://overlayqa.com/blog/design-token-drift-study/)).

### Inferences
Each criterion: **tag** · **what** · **how to measure** · **pass**. Tag rule: DESIGN-OWNED = the design side defines
and delivers it and can run the check against the token source, Figma or Storybook alone; DEV-OWNED = it lives in
the developers' codebase and stack. Where design defines a rule that developers enforce, the tag follows who owns
the deliverable, and the note says where the check runs.

**A. Tool-neutral source (DESIGN-OWNED)**
1. **DESIGN-OWNED · Standard source.** Token definitions are DTCG 2025.10 JSON (`$value`, `$type`, colour objects),
   the handover artefact, not a CSS file. · `tz check` / `tz lint` (Terrazzo `core/valid-*`, `core/required-type`) over
   `tokens/`, independent of the in-house build script. · 0 errors.
2. **DESIGN-OWNED · Every token in the source.** Hand-written motion/size tokens are in the same JSON, marked
   code-only with a reason in `$extensions`, not only in `tokens.css`. · Set-diff of custom properties in the built
   CSS vs token names in JSON. · 0 tokens that exist only in an output file.
3. **DESIGN-OWNED · Modes as data.** Light/dark (and later per-city brands, density) expressed as DTCG resolver
   sets/modifiers or one file per mode, not as CSS selectors written by hand. · A resolver (or mode files) exists and
   every semantic token resolves in every context (Terrazzo `core/required-modes`). · 0 missing values.
4. **DESIGN-OWNED · "Not in Figma" is justified.** · For each code-only token, name the Figma import limit it hits
   (dimension px only, duration s only, sRGB/HSL only, no composites such as easing or typography). · Every code-only
   token cites a limit; durations (in s) and px sizes move into Figma variables.
5. **DESIGN-OWNED · Stack-neutral demonstration.** · Build the same JSON to at least two targets (CSS variables and a
   JS/TS theme object usable by styled-components) with Style Dictionary or Terrazzo, no hand edits. · Both build
   from one source; names match 1:1; this proves the proposal does not force a stack.

**B. Naming grammar and tiers (DESIGN-OWNED)**
6. **DESIGN-OWNED · Written grammar that parses.** Ordered slots with a required property slot (Primer, NL Design
   System), role words in the semantic tier, state as its own slot. · A test parses every token name; Terrazzo
   `core/consistent-naming`; an audit like Adobe's token-naming-audit for overloaded names. · 100% parse; 0 colour
   words (`blue`, `grey`) in semantic names.
7. **DESIGN-OWNED · Tier direction in the source.** Semantic tokens alias primitives; component tokens alias
   semantic ones; no semantic token holds a raw value where a primitive exists. · Walk the alias graph in the JSON.
   · 0 semantic or component tokens with literal values (outside a listed set).
8. **DESIGN-OWNED · Tier direction in use (rule defined by design, checked in dev CI).** Components consume semantic
   or component tokens, never primitives (SLDS rule). · Grep component styles for primitive names. · 0, or a listed
   allowlist.
9. **DESIGN-OWNED · Owner-readable naming.** A one-page grammar plus a "which token for which job" table a
   designer can apply. · Ask someone new to name three new tokens; check they parse (criterion 6) and land in the
   right tier. · 3/3.

**C. Figma variable hygiene and traceability (DESIGN-OWNED)**
10. **DESIGN-OWNED · One name in both.** · Figma native DTCG export → mechanical transform (`a/b/c` → `--gv-a-b-c`) →
    set-diff with the token source. · 0 unmatched, except listed code-only tokens.
11. **DESIGN-OWNED · Code syntax set.** · Read each variable's `codeSyntax.WEB` (plugin API or REST). · 100% of
    published variables carry `var(--gv-…)` equal to their code name (Dev Mode and the Figma MCP server then hand the
    real name to developers and AI agents).
12. **DESIGN-OWNED · Aliases kept.** · Compare alias links in the Figma export with the JSON. · 100% of Figma aliases
    survive as aliases (not resolved values).
13. **DESIGN-OWNED · Scopes and descriptions.** Variables scoped to their use (a text colour not offered for fills);
    descriptions on semantic variables (Terrazzo `core/descriptions` on the JSON). · Count. · 100% of semantic
    variables scoped and described.
14. **DESIGN-OWNED · Design-side drift.** · Figma Check Designs (where the plan allows) or a library audit for
    unbound values in published components. · 0 raw values in library components.

**D. Contrast and colour derivation (DESIGN-OWNED)**
15. **DESIGN-OWNED · Declared contrast pairs.** Every foreground/background role pair (text on surface, on-accent,
    focus ring on surface) is data, not implied. · Terrazzo `a11y/min-contrast` or a script over pairs × modes. · 0
    failures at WCAG 2.2 AA (4.5:1 text, 3:1 non-text).
16. **DESIGN-OWNED · Stand-in register.** Each `color-mix()`/relative-colour stand-in is a named semantic token with
    its computed value per mode, a contrast check, and the Figma variable that will replace it. · Count stand-ins;
    each has an entry. · Count published; trend falling.

**E. Theme and tenant rules (DESIGN-OWNED)**
17. **DESIGN-OWNED · Tenant boundary written down.** Which tiers a city may override (brand/primitive and perhaps a
    few semantic roles) and which never (component tokens, contrast pairs), as NL Design System does with one
    component vocabulary across municipalities. · A written rule plus a schema that rejects tenant files touching
    forbidden tokens. · Rule exists; validator rejects a bad tenant file.
18. **DESIGN-OWNED · Tenant swap test.** · Make a throwaway second brand by changing only allowed values; rebuild;
    visually check all Storybook stories (visual regression if available). · Every story re-themes; 0 contrast
    failures (criterion 15 rerun per tenant); 0 component edits needed.
19. **DESIGN-OWNED · Storybook shows every mode.** · Toolbar theme switcher (`@storybook/addon-themes`) covers every
    mode; each story renders in each. · 100% stories × modes.

**F. Change discipline (DESIGN-OWNED)**
20. **DESIGN-OWNED · Token diff per release.** · Diff added/removed/renamed/value-changed between tags (Spectrum
    token-diff-generator pattern), attached to the changelog. · Present for every release.
21. **DESIGN-OWNED · Deprecate before delete.** · From the diff: every removed token was a deprecated alias for ≥ 1
    earlier minor (Atlassian lifecycle, Spectrum alias-on-rename). · 0 removals without a window.
22. **DESIGN-OWNED · Renames are traceable.** · Stable ID per token (Figma variable ID in `$extensions`, or a uuid as
    Spectrum does), so a rename shows as a rename. · 100% of tokens carry an ID.
23. **DESIGN-OWNED · Migration map for the current stack.** A table from today's styled-components theme keys to
    the proposed token names (Primer's keyword → variable map is the precedent). · Every theme key in the developers'
    current theme has a target or a "dropped" reason. · 100% mapped.

**G. Documentation (DESIGN-OWNED)**
24. **DESIGN-OWNED · Docs generated from source.** · Tokens on Storybook Foundations pages vs tokens in JSON. · Equal;
    each shows copyable name, value per mode, description, alias target.
25. **DESIGN-OWNED · Usage map.** · Each semantic token lists the components that use it (Spectrum's dependency
    visualizer is the exemplar). · 100% of semantic tokens; unused tokens listed.

**H. Consuming code (DEV-OWNED; design proposes, developers decide)**
26. **DEV-OWNED · Output target(s).** Which outputs ship (CSS variables, JS theme with `var()` values, Tailwind theme,
    Sass) and how they are packaged. · Built from the DTCG source in CI; `git diff --exit-code` clean. · No hand-edited
    output.
27. **DEV-OWNED · No raw values, all domains.** Colour, space, size, radius, border, type, shadow, motion, z-index,
    breakpoints. · The linter that fits their stack: Stylelint strict-value/Carbon-style rules for CSS, Atlassian-style
    ESLint rules for CSS-in-JS. · 0 violations; covered property list published.
28. **DEV-OWNED · No unknown tokens.** · Stylelint core `no-unknown-custom-properties` with `referenceFiles`, or
    TypeScript types generated from the source for a JS theme. · 0 errors.
29. **DEV-OWNED · No raw fallbacks.** `var(--gv-x, #fff)` or `theme.x ?? '#fff'` banned (Atlassian: fallbacks "not
    recommended anymore"). · Lint/grep. · 0.
30. **DEV-OWNED · Coverage number.** Share of declarations in token-able properties using a token or an allowed
    keyword (`0`, `none`, `inherit`, `currentColor`, `transparent`), denominator published. · Script over styles. ·
    Target set by developers; the only public industry figure is a vendor study's 40.4% average over 375 sites.
31. **DEV-OWNED · Theme logic only in tokens.** · Grep components for mode selectors or JS theme branches. · 0.
32. **DEV-OWNED · Deprecated tokens blocked.** · Lint fails on deprecated names (Atlassian
    `no-deprecated-design-token-usage`), fed by the design-owned deprecation list (criterion 21). · 0 uses.

Note on today's govocal-ds: its "a test refuses raw values" and `var(--gv-*)`-only CSS is evidence for 27–28 in the
proposal's own reference implementation; it does not bind developers' stack. It strengthens the proposal most if the
same check is a stock linter rule developers would recognise, not a custom test.

### Gaps
- Thresholds (100%, 0) are proposed, not published industry standards; no exemplar publishes its own coverage or
  escape-hatch numbers to calibrate against.
- WCAG thresholds are standard knowledge, not re-fetched in this pass.
- No source found on Figma variable-scope coverage benchmarks, or on how many component-tier tokens a system should
  have.
- Whether Figma's native export carries variable IDs (needed for criterion 22 without a plugin) is unverified.
