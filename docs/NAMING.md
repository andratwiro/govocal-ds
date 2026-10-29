# Naming and structure

One tree, one name per thing, the same in Storybook, Figma and code. Applied 29 Oct 2026 in one change with no aliases:
the old names and files no longer exist. Old Storybook links still open (a redirect in `.storybook/manager-head.html`,
to drop after a month).

## Principles

1. Name what it is (a noun), never where it's used. Go Vocal words (phase, method, project) only in Patterns.
2. React Aria / Spectrum names where they exist (Breadcrumbs, Badge, Avatar group, Segmented control item), else the
   common one.
3. **Components** are generic elements any admin could ship. **Patterns** are Go Vocal assemblies (their props speak
   phases, methods, projects) and compositions made for one place, grouped by that place. A pattern a second place
   needs, minus its Go Vocal words, moves up. Each layer builds only on the ones above it (DESIGN.md).
4. One name everywhere: the last segment of the Storybook title = the last segment of the Figma name = the export
   (PascalCase) = its file (`Components/Data display/Stat tile` = `Data display/Stat tile` = `StatTile` =
   `src/components/gv/StatTile.tsx`, with its `.css` and `.stories.tsx`). Prop types follow (`StatTileProps`). CSS
   classes keep their `gv-…` names: they are internal.
5. Two levels, `Group/Name`. Groups by purpose (Components) or by place (Patterns). A–Z in both tools, so Storybook and
   Figma's Assets panel list the same tree in the same order.
6. The last segment stands alone (instance layers, search and swap menus show only it): `Rail header`, not `Header`.
   `·` only in variant values (`Phase · Draft`), never in a name: it lands in the URL.
7. Status is a tag, never a word in a title (Status marks, below). Rename in place: the same Figma component, and old
   Storybook links redirect.

## What becomes a component

- **Component**: generic (no Go Vocal words) and used on 2+ screens, or drawn as a component in Figma. Imported, typed,
  in Storybook under Components.
- **Example, not a component**: a configuration of an existing component (a Select with a search field and icons, a
  Menu with submenus) is a story on that component ("Select · with search"), not a new entry.
- **Pattern**: a Go Vocal composition worth showing (the phase rail, a method's row). Importable only once 2+ pages use
  it; until then it is a recipe: a story plus its code, and the page keeps its own copy.
- **One-off**: anything used once stays in its page, built from components and tokens.
- Promote on the second use; never build ahead for one use. Figma may draw more as components than code does.

## The tree

`storySort` is alphabetical below the top level (`.storybook/preview.tsx`), as Figma's Assets panel is. Inside an
entry, stories keep their file order.

```
Overview                Welcome · Accessibility
Foundations             Colour · Typography · Spacing · Radius · Shadows · Motion · Icons · Illustrations · Size (a page each)
Components              src/components/gv/
  Actions               Button · Compact button · Icon button · Menu · Segmented control (with Segmented control item)
  Charts                Bar row · Chart · Dashboard card · Legend row · Statement row
  Data display          Avatar (with Avatar group) · File list · Illustration · List header · List header cell · List row
                        · Map view (with Map pin, Map card, Map overlay, Map chip, Map legend; recipe: In the Manage tab)
                        · Property list · Reaction counts · Stat row · Stat tile
  Forms                 Checkbox · Checkbox group · Choice card · Date range field · Drop zone · Locale switcher
                        · Multilingual rich text editor · Multilingual text field · Number field · Option list
                        · Radio group · Required marker · Rich text editor · Rich text toolbar · Rich text toolbar button
                        · Search field · Select · Switch · Tag picker · Text field · Title field
  Layout & containers   App provider · Card · Divider · Page header · Panel · Tile grid
  Navigation            Breadcrumbs · Link · Pagination · Tabs
  Overlays              Alert dialog · Coachmark · Help popover · Modal · Side panel · Tooltip
  Status & feedback     Badge · Banner · Empty state · New dot · Review status · Skeleton · Status badge · Toast
  Tables & lists        Data table · Filter chips · Filter menu · Selection bar · Table toolbar (the list page's kit;
                        Filter chips, Filter menu and Selection bar still live in src/patterns/)
  Text                  Section label · Text · Visually hidden
Patterns                src/patterns/
  App shell             Notification list · Side nav
  Build tab             Access rights · Form field summary (recipe) · Notification row · Participant action row
                        · View option row
  Manage tab            Comment thread · Official update
  Pages & menu          Section toggle
  Participation methods Common ground row · Proposals row · Vote progress · Volunteering row · Voting row
  Project page          Action row · Panel section · Phone preview · Project header · Setup step · Stat card
  Project rail          Phase timeline · Rail header · Rail phase
Back office             (empty: the whole-page stories DESIGN.md plans land here)
Base                    Introduction first (what Base is), then src/components/: the React Aria starter, primitives the
                        Components build on (not for pages), A–Z, React Aria's names (Calendar · CheckboxGroup ·
                        ColorField · … · Toolbar · Tree). Off the sidebar, tagged `covered`: Checkbox · Dialog · Modal
                        · Table (a Components entry wraps each; URLs still open). A starter part nothing uses but its
                        own story is deleted, not kept (29 Oct 2026: 17 went)
```

## Status marks

Tags on a story file's meta, never on one story (`.storybook/main.ts` declares them; the sidebar's tag filter lists
them, and `.storybook/manager.ts` writes the mark after the entry's name):

- `not-in-figma`: Figma doesn't draw it yet (Coachmark, Skeleton, Data table and every Storybook-only pattern). Shows
  "no Figma".
- `deprecated`: on its way out; the export carries JSDoc `@deprecated` too, and both leave with the code. No whole
  entry today. Inside the Card entry, `CardRadioGroup` and `CardRadio` carry `@deprecated` (→ Choice card); the entry
  stays untagged because Card itself stays.
- `covered`: a Base entry a Components entry wraps or replaces, hidden from the sidebar. A Components entry that wraps
  a Base entry tags it `covered` in the same commit.
- `test-only`: an entry that exists only so a test can open it (a fixture, a harness, a stress case nobody would copy),
  hidden from the sidebar so the public tree shows only what a reader can use. It still builds, so e2e opens it by id.
  None today; `tests/sidebar-public.test.mjs` fails on a story file or story whose name says test, e2e, fixture,
  harness or debug without the tag.

## Story names inside an entry

1. `AllVariants` first: every Figma variant, laid out as the Figma set. Then one story per variant, its property values
   verbatim in Figma's order, joined by ` · ` (`Phase · Draft`, `Ghost · Strong`); a Yes/No property reads `With icon`
   / `Without icon`.
2. Then the states Figma doesn't draw, in React Aria's words (Hovered, Pressed, Focused, Selected, Indeterminate,
   Disabled, Invalid, Pending, Empty; where Figma draws one, its value wins: Stat row's `Hover`). Last, examples named
   for the place (`In a table`, `Rail`). `Default` only where Figma says Default (or draws a single variant);
   Storybook-only patterns start with the back office's `Default`.
3. Sentence case. Rename with `name:` (or `storyName`), never the export: a story's id is its title + its export.

## Rename table

Figma "new" is exactly what to type. Exports, files and stories changed in code on 29 Oct; Figma follows (checklist
below). Rows without a rename say "same".

**Components page** (32 in Figma):

| Figma now | Figma new | Storybook now | Storybook new | Export now → new | File (`src/components/gv/`) |
|---|---|---|---|---|---|
| Button | Actions/Button | Base/Button | Components/Actions/Button | Button (same) | stories moved from `src/components/` |
| Button · compact | Actions/Compact button | Components/Button · compact | Components/Actions/Compact button | CompactButton (same) | same |
| Icon button | Actions/Icon button | Components/Icon button | Components/Actions/Icon button | IconButton (same) | same |
| Segmented control | Actions/Segmented control | Components/Segmented control | Components/Actions/Segmented control | SegmentedControl (same) | same |
| Segment | Actions/Segmented control item | (stories of Segmented control) | (same) | Segment → SegmentedControlItem | SegmentedControl.tsx |
| Bar row | Charts/Bar row | Components/Bar row | Components/Charts/Bar row | BarRow (same) | same |
| Chart | Charts/Chart | Components/Chart | Components/Charts/Chart | LineChart, Sparkline, ChartLegend (same) | same |
| Dashboard card | Charts/Dashboard card | Components/Dashboard card | Components/Charts/Dashboard card | DashboardCard, Dashboard* (same) | same |
| Legend row | Charts/Legend row | Components/Legend row | Components/Charts/Legend row | LegendRow (same) | same |
| Statement row | Charts/Statement row | Components/Statement row | Components/Charts/Statement row | StatementRow (same) | same |
| Avatar | Data display/Avatar | Components/Avatar | Components/Data display/Avatar | Avatar, + AvatarGroup (was AvatarStack in PhonePreview.tsx) | Avatar.tsx |
| List header | Data display/List header | Components/List header | Components/Data display/List header | ListHeader (same) | same |
| List header cell | Data display/List header cell | Components/List header cell | Components/Data display/List header cell | ListHeaderCell (same) | same |
| List row | Data display/List row | Components/List row | Components/Data display/List row | ListRow (same) | same |
| Stat row | Data display/Stat row | Components/Stat row | Components/Data display/Stat row | StatRow (same) | same |
| KPI | Data display/Stat tile | Components/KPI | Components/Data display/Stat tile | Kpi → StatTile | Kpi.* → StatTile.* |
| Checkbox | Forms/Checkbox | Components/Checkbox | Components/Forms/Checkbox | Checkbox (same) | same |
| Drop zone | Forms/Drop zone | Components/Drop zone | Components/Forms/Drop zone | DropZone (same) | same |
| Required | Forms/Required marker | Components/Required | Components/Forms/Required marker | Required → RequiredMarker | Required.* → RequiredMarker.* |
| Editor | Forms/Rich text editor | Components/Editor | Components/Forms/Rich text editor | Editor → RichTextEditor | Editor.* → RichTextEditor.* |
| Editor toolbar | Forms/Rich text toolbar | Components/Editor toolbar | Components/Forms/Rich text toolbar | EditorToolbar → RichTextToolbar | EditorToolbar.* → RichTextToolbar.* |
| Editor tool | Forms/Rich text toolbar button | Components/Editor tool | Components/Forms/Rich text toolbar button | EditorTool → RichTextToolbarButton | EditorTool.* → RichTextToolbarButton.* |
| Title field | Forms/Title field | Components/Title field | Components/Forms/Title field | TitleField (same) | same |
| Card | Layout & containers/Card | Components/Card | Components/Layout & containers/Card | Card, CardSwitch (same); CardRadioGroup, CardRadio deprecated → ChoiceCard | same |
| Divider | Layout & containers/Divider | Components/Divider | Components/Layout & containers/Divider | Divider (same) | same |
| Breadcrumb | Navigation/Breadcrumbs | Components/Breadcrumb | Components/Navigation/Breadcrumbs | Breadcrumb → Breadcrumbs | Breadcrumb.* → Breadcrumbs.* |
| Modal | Overlays/Modal | Components/Modal | Components/Overlays/Modal | Modal (same) | same |
| Pill | Status & feedback/Badge | Components/Pill | Components/Status & feedback/Badge | Pill → Badge | Pill.* → Badge.* |
| Banner | Status & feedback/Banner | Components/Banner | Components/Status & feedback/Banner | Banner (same) | same |
| New dot | Status & feedback/New dot | Components/New dot | Components/Status & feedback/New dot | NewDot (same) | same |
| Review notice | Status & feedback/Review status | Components/Review notice | Components/Status & feedback/Review status | ReviewNotice → ReviewStatus | ReviewNotice.* → ReviewStatus.* |
| Status | Status & feedback/Status badge | Components/Status | Components/Status & feedback/Status badge | Status → StatusBadge | Status.* → StatusBadge.* |

**Patterns page** (10 in Figma, moved there; files moved from `src/components/gv/` to `src/patterns/`):

| Figma now | Figma new | Storybook now | Storybook new | Export now → new | File (`src/patterns/`) |
|---|---|---|---|---|---|
| Header | Project page/Project header | Components/Header | Patterns/Project page/Project header | Header → ProjectHeader | ProjectHeader.* |
| Setup card | Project page/Setup step | Components/Setup card | Patterns/Project page/Setup step | SetupCard → SetupStep | SetupStep.* |
| Rail header | Project rail/Rail header | Components/Rail header | Patterns/Project rail/Rail header | RailHeader (same) | RailHeader.* |
| Rail phase | Project rail/Rail phase | Components/Rail phase | Patterns/Project rail/Rail phase | RailPhase (same) | RailPhase.* |
| Section label | Text/Section label | Components/Rail section label | Components/Text/Section label | RailSectionLabel → SectionLabel | src/patterns/RailSectionLabel.* → src/components/gv/SectionLabel.* |
| List row · Common ground | Participation methods/Common ground row | Components/List row · Common ground | Patterns/Participation methods/Common ground row | ListRowCommonGround → CommonGroundRow | CommonGroundRow.* |
| List row · Proposals | Participation methods/Proposals row | Components/List row · Proposals | Patterns/Participation methods/Proposals row | ListRowProposals → ProposalsRow | ProposalsRow.* |
| List row · Voting | Participation methods/Voting row | Components/List row · Voting | Patterns/Participation methods/Voting row | ListRowVoting → VotingRow | VotingRow.* |
| Cause row | Participation methods/Volunteering row | Components/Cause row | Patterns/Participation methods/Volunteering row | CauseRow → VolunteeringRow | VolunteeringRow.* |
| Vote progress | Participation methods/Vote progress | Components/Vote progress | Patterns/Participation methods/Vote progress | VoteProgress (same) | VoteProgress.* |

**Storybook only** (nothing in Figma yet, tagged `not-in-figma`; names kept unless said):

| Storybook now | Storybook new | Export change |
|---|---|---|
| Components/Coachmark · Skeleton · Data table | Components/Overlays/Coachmark · Components/Status & feedback/Skeleton · Components/Data display/Data table | none |
| Patterns/Help popover · Notification list · Side nav | Patterns/App shell/… (same names) | none |
| Patterns/Filter chips · Filter menu · Filter options · Selection bar | Patterns/Lists/… (same names; the back office's lists: the phase Manage tab, Projects, Input manager, Users); 29 Oct: Components/Tables & lists/… | none |
| Patterns/Section toggle | Patterns/Pages & menu/Section toggle | none |
| Patterns/Action row · Panel section · Stat card | Patterns/Project page/… (same names) | none |
| Patterns/Phone preview | Patterns/Project page/Phone preview | PhoneFrame → PhonePreview; AvatarStack → AvatarGroup, now in Avatar.tsx |
| Patterns/Phase timeline | Patterns/Project rail/Phase timeline | none |
| Components/Data display/Data table · Table toolbar, Patterns/Lists/Filter chips · Filter menu · Selection bar | Components/Tables & lists/… (same names; one place for the list page's kit; no file moves) | none |
| Base/Link · RadioGroup · CheckboxGroup | Components/Navigation/Link · Components/Forms/Radio group · Components/Forms/Checkbox group (29 Oct: pages use them; files stay in `src/components/`) | none; imported from `govocal-ds`, no longer `govocal-ds/base` |

Kept for a later pass (after Figma mirrors this): Compact button stays its own entry (not yet a Button size), Stat card
stays apart from Stat tile, Status badge keeps `state` (draft/live) and Card keeps its Figma Type values, List header,
List header cell and List row stay undeprecated.

## Figma mirror

Pages: Cover · Foundations · Icons · Components · **Patterns** (new) · Screens WIP. The Assets panel groups by page,
then by slash, so Components › Actions › Button is Storybook's `Components/Actions/Button`. Icons stay
`Icon/<name>/<size>`. Storybook's Figma links use `node-id`, which survives a rename and a move to another page, so
code and Figma can land in either order.

- **Components** (32): a row per group, A–Z (Actions, Charts, Data display, Forms, Layout & containers, Navigation,
  Overlays, Status & feedback, Text), a text heading per row, components A–Z inside. No section or frame around them: the
  Assets panel groups by those too, which would add a level (Actions › Actions › Button).
- **Patterns** (10): rows Participation methods, Project page, Project rail (App shell, Pages & menu: nothing drawn
  yet).

The checklist (the designer, alone, in order):

1. File › Save to version history: "Before names, 30 Oct". Add a page "Patterns" after Components.
2. Select the ten components of the Patterns table → right-click › Move to page › Patterns. Never duplicate or paste a
   copy (that makes a new component; instances stay on the old one).
3. In the Layers panel, rename each component (double-click its name) to the "Figma new" column, slash included. Rename
   the component set, never its variants.
4. Check: the Assets panel shows Components › Actions › Button and Patterns › Project rail › Rail header; on Screens
   WIP, an instance of Card, Status badge and Voting row names the new component, nothing detached.
5. Canvas: set each "Label" text to the last segment; lay the rows out by group.
6. Publish the library update if the file is published ("Names only"), then tell the agent.

`npm run figma:spec -- "<Name or Group/Name>"` looks a component up on the Components and Patterns pages by its last
slash segment, so it finds a component before and after the rename (`Rail header`, `Project rail/Rail header`); a
component renamed in code but not yet in Figma (`Status badge`) is not found until Figma follows.

## Token names

Every token is a CSS custom property, `--gv-` plus its DTCG path joined with `-` (`surface.brand-strong` →
`--gv-surface-brand-strong`). A group is one segment and a name inside a group may hold dashes; the groups whose own
name has a dash (`side-nav`, `border-width`) are listed in `scripts/lib/names.mjs`. Figma's name is the same path
joined with `/` (`surface/brand-strong`). The whole set, with values, descriptions and Figma ids, is `public/tokens.json`
(published as `dist/tokens.json`), built with `src/tokens.css` by `npm run tokens:build`: that file is the closed set
to pick from.

**Tiers**

| Tier | Pattern | Who uses it |
|---|---|---|
| Primitive | `--gv-color-{hue}-{step}`, `--gv-color-alpha-{hue}-{percent}` | semantic tokens only (`tests/paint.test.mjs`) |
| Scales | `--gv-space-{px}`, `--gv-radius-{px\|full}`, `--gv-size-{icon\|control\|avatar}-{px}`, `--gv-font-size-{px}`, `--gv-font-line-height-{px}`, `--gv-font-weight-{regular\|medium}`, `--gv-font-family`, `--gv-font-tracking`, `--gv-border-width-{px}`, `--gv-motion-{duration\|easing}-{role}`, `--gv-opacity-{role}`, `--gv-layer-{role}` | components |
| Semantic | colour `--gv-{property}-{role}[-strong][-{state}]`; `--gv-type-{role}`; `--gv-shadow-{raised\|raised-strong\|overlay}`; `--gv-focus-ring[-offset[-inset]]` | components |
| Component | `--gv-side-nav-{property}[-{state}]` | the side nav only: the one dark surface |

**The colour grammar:** `--gv-{property}-{role}[-strong][-{state}]`.

- property: `surface` (fills) · `text` · `icon` · `border` (borders, outlines, rings). `chart-*` is its own data-viz
  namespace.
- role, neutral ladders: text and icon `primary` · `secondary` · `tertiary` (icon also `quiet`); surface `app` ·
  `panel` · `secondary` · `tertiary`; border `subtle` · `row` · `default` · `strong` · `control`.
- role, intents: `neutral` · `brand` · `accent` · `info` · `success` · `warning` · `danger` · `selected` · `inverse`.
- role, special: `body` · `placeholder` · `link` · `backdrop`.
- emphasis: none (on a surface, the tint) or `strong` (the solid fill).
- state: `hovered` · `pressed` · `selected` · `disabled` · `focused`, React Aria's words: `[data-pressed] { background:
  var(--gv-surface-pressed) }`.

Rules (`tests/token-names.test.mjs`):

1. The property comes first. Where a `text-X` exists, an `icon-X` exists with the same value unless its description
   says otherwise.
2. No hue word outside `color-*` and `chart-*`; no component word outside the side nav's tier; no Go Vocal word
   (`live`, `reviewed`) anywhere.
3. Every token has a description (`$description`, or `tokens/descriptions.json` for the ones Figma pulls); it says
   what the token is for, and tokens.css carries it as the line's comment.
4. Two tokens of one property under ΔE 2 merge, or the guard's list says why they stay two.
5. A new token needs a role no token covers, and is written where its tier lives: Figma's ones come from
   `npm run tokens:pull`, the rest are **Not in Figma**, by hand in `tokens/semantic.tokens.json` (colour, focus,
   opacity, layers, font), `tokens/size.tokens.json` or `tokens/motion.tokens.json`. When Figma gains one, it leaves the
   hand-written file (the build refuses a path defined twice).

**Scales:** named by their value. Spacing is base 4: `0 · 2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48
· 56 · 64 · 104`; radius `2 · 4 · 6 · 8 · 10 · 12 · 14 · 22 · full`. A 1px or 3px offset on a position (`top`,
`inset`, `translate`, a nudging `margin`) is written raw; padding, gap and radius never take one
(`tests/tokens-only.test.mjs`).

**Type:** a role sets everything, `font: var(--gv-type-<role>)`; a weight override is
`font-weight: var(--gv-font-weight-medium)`, never a number. Letter spacing is `--gv-font-tracking`, once, on `:root`.

**Named by Figma variable id.** `tokens/variable-ids.json` maps each Figma variable id to its CSS name, so the code can
rename before Figma does and a pull keeps the code's name; `tokens/figma-report.json` lists where Figma's name still
differs (the Foundations pages show it as "Figma: surface/stage (to rename)").

**Renames:** `tokens/renames.json` is the map, `npm run tokens:rename` rewrites every stylesheet, story, page and e2e
spec by it (`-- --check` says what would change), and it is idempotent: run it again on a newer branch and only the
new uses move. There are no aliases: an old name is no token, and `tests/tokens-defined.test.mjs` fails on it with its
replacement. A raw value that must stay (colour-picker chrome, a mask, a one-off opacity) carries
`/* raw: why */` right after its declaration.
