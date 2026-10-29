# Decisions where the sources disagree

Where Figma and the prototype disagree, or the prototype disagrees with itself, the agent picks the better option,
builds it, and logs it here: what disagreed → what we built → why. The project lead and the designer review this
list; change any line and the agent follows. Newest first within each section.

## Structure: one place for each part (29 Oct 2026, architecture review)

Calls made while reshaping the tree (the review's structure moves). Newest first.

- Stylesheets reaching into other parts' classes (22 files, 55 classes) vs a rule with no guard → **`tests/own-block.test.mjs`: a gv or pattern stylesheet selects only the `gv-…` blocks its own TSX writes, plus states and elements; the remaining 54 in 21 files are an allow-list that fails both ways (a new one, or one that is gone), so it only shrinks. One fixed: List header places its cells with its own `gv-list-header__cell`** → a placing class is the className contract, so no restyle. The others need a prop or a custom property on the child (a disabled segment, a quiet checkbox, a compact badge) or a starter class the wrapper doesn't expose yet (H3), and stay listed. The New dot's two placements wait: the strings builder is editing those lines.
- Story fixtures inside the Components folder (`gv/story-data`, `gv/story-images`), one of them imported by a back-office page → **`src/stories/data` and `src/stories/images`; a guard keeps every Component and Pattern off them and the back office off story data; the phase page's pictures stay the one borrowed path until the back office has its own (a follow-up for its author)** → story data is not system API, and the folder says so; copying the pictures into the back office is its author's call, not a call-site change.
- Section label in Layout & containers, though it is a text role, beside the new Text and Visually hidden → **Components/Text/Section label; the rename table's "Figma new" says `Text/Section label`, so the designer's pending Figma pass (30 Oct) types the new group once** → Polaris' "Typography and content" and Atlassian's "Text and data display" keep labels with text; the Figma checklist hasn't run yet, so moving it now costs no second Figma rename. Old links redirect.
- The list page's kit spread over Data display (Data table, Table toolbar) and Patterns/Lists (Filter chips, Filter menu, Selection bar), though the three have no Go Vocal words and every list page uses them → **one group, Components/Tables & lists, by story title only; Patterns/Lists is gone; no file moves (the folder codemod comes later), old links redirect** → one obvious place for a list page's parts, as Carbon and Primer keep filter controls in Components. List header, List header cell and List row stay in Data display: they are Figma components, and their fate waits for Figma (deferred).
- Link, Radio group and Checkbox group: Base parts that pages import most (5, 5 and 4 pages) → **Components (Navigation › Link; Forms › Radio group, Checkbox group), exported from `govocal-ds` and no longer from `govocal-ds/base`, tagged `not-in-figma`; files stay in `src/components/` until the folder codemod** → promote on the second use (docs/NAMING.md); Choice card already sits inside a Radio group. Their story ids moved (`base-link` → `components-navigation-link`, …) and old links redirect.
- Base hidden from the sidebar vs Base shown as a second menu of parts → **shown, last, as primitives: an Introduction page first, and the same one line on every Base entry's docs page (one `docs.page` in `.storybook/preview.tsx`, not a note per story file); docs/COMPONENTS.md lists Base last, each line marked `(primitive)`** → pages still need a few of them (dates, colour fields, list boxes, disclosures), so hiding them would send a designer to code to find them; the line tells them to reach for a Component first.
- The review counted 22 dead starter parts; on today's main 5 of them are used (Separator through the barrel; Disclosure group, Toolbar and Tree by the Report view; the starter Segmented control was already gone) → **17 deleted: Breadcrumbs, Colour area, Colour picker, Colour slider, Colour swatch picker, Colour thumb, Colour wheel, Combo box, Command palette, Drop zone, Input group, Navigation tree, Progress bar, Sheet, Slider, Toggle button group, Token field; their `govocal-ds/base` exports go with them** → a part nothing reaches but its own story is a sidebar entry the product never uses. Old links open the docs of the entry that replaces it (Breadcrumbs, Segmented control, Side panel) or a page about Base.

## Composition contracts in code (29 Oct 2026, architecture review)

Calls made while putting the review's invisible contracts into the parts themselves (rv-contracts).

- Data table's bulk selection and an open record fought (React Aria turns a row press into a tick once anything is ticked, so the Input manager could not open a record while ideas were ticked) → **a press opens the row (`onRowAction`), the checkbox, Space and Shift / ⌘ / Ctrl clicks tick; `openKey` marks the open row (`aria-current`); `selectionBehavior` leaves the props; `toKeySet(selection, allKeys)` turns React Aria's `'all'` into keys** → the prototype's table does both at once; one behaviour, so no prop to pick it. Its props follow the convention (`isFramed`, `showChecksOnHover`, `showSelectAll`, `showLabel`, `isMuted`, `isStrong`, Tags `items`); the thumbnail's `tone="teal" | "blue"` is **`color`**: a hue that says nothing is not a tone.

- Side panel open by default (`isOpen = true`) vs a dialog that is closed until opened → **floating: closed unless `isOpen` / `defaultOpen`; inline: shown** → a floating panel is an overlay (React Aria's overlays start closed); an inline one is a column of the page, which the page renders or not. Uncontrolled, × and Esc hide either one by themselves (React Aria's uncontrolled state); a page that decides what follows a close (the report view swaps the assistant back in) passes `isOpen`.
- Side panel width hard-coded at 560 → **`width="default" | "narrow"` (560, 440)**, floating at that width, inline up to it → a width preset is `width` (as Modal); 440 is the Input manager's preview column. Its pager's `position` stays controlled-only (no `defaultPosition`): the page picks the record to show, so a pager walking by itself would move without its record.
- Each page drew a record's words, "Posted by" and date by hand → **`SidePanelRecordHead`** (title as a heading, words, author and role, date, an `actions` slot for `SidePanelActions`) → the drawer head is the same on every record; `SidePanelActions` takes `items` (convention 8).
- Date range field's six props per part (`start`, `defaultStart`, `onStartChange`, … for the end and both times) → **one `value` / `defaultValue` / `onChange` holding `{start, end, startTime, endTime}`, each part a React Aria value or an ISO string ("2026-11-02", "18:30", read with `parseDate` / `parseTime`)** → a range is one value (React Aria's `RangeValue`), and pages hold dates as strings; `onChange` hands back React Aria values, which `String()` turns back into the same strings.
- File list's rows kept the Delete handler of their first render (React Aria caches a row per item object), so a page reading its list in the handler brought deleted files back → **the rows redraw when `onDelete` changes (`dependencies`)** → a handler that reads the page's state is how pages write it; the back office's updater-function workaround still works. Its `addButton` slot is **`footer`**, as Panel's and Side panel's → it holds a Drop zone as often as a button.
- Selection bar's `actions` data array, whose plain buttons all went through one `onAction(id)` switch → **`items`, each a menu button or a plain button with its own `onPress`; the bar's `onAction(id)` stays** → a data array is `items` (convention 8), shaped as Side panel actions' items; React Aria has both levels too (MenuItem's and Menu's `onAction`).
- Menu's "Multiple with a footer action" said the menu stays open while ticking, but Enter closed it (React Aria closes a menu on Enter, ticks included) → **its pick-several section sets `shouldCloseOnSelect={false}`: click, Space and Enter tick and keep it open; Esc and the footer action close it** → the back office's Copy to phase already does this; the story now teaches it.
- Tabs' `TabPanels` requirement lived only in a back-office e2e test (React Aria allows a loose `TabPanel`; the system's fade needs `TabPanels`) → **a development-only console warning from a `TabPanel` outside `TabPanels`, and the rule in Tabs' JSDoc** → a warning names the fix where the mistake is made; making `TabPanels` optional would mean a second fade for loose panels. Tabs' parts now add a caller's class to `react-aria-*` instead of replacing it, so the Project settings dialog's side list (its class dropped the system's look) gets the vertical tabs' paint back.
- `ToastRegion` "at the root of your app" but mounted on every back-office page, and the 1.75 icon stroke every app had to remember → **`AppProvider` (Components/Layout & containers): the one `ToastRegion`, Lucide at 1.75, the locale (I18nProvider) and an optional router (React Aria's RouterProvider); `toast(title, description?, {action, onAction, icon, timeout})`, 5 s unless told** → one wrap at the root, one call per toast; a page's leftover `ToastRegion` inside it draws nothing, so pages drop theirs one at a time. It is a Component, not a Pattern: no Go Vocal words, and every app needs it. The SideNav widths stay in Side nav.
- Toast's `body`, a second name for `description` → **removed; call sites say `description`** → no aliases (convention 9).
- Alert dialog's contract was unwritten (both buttons close it), its focus JSDoc said Cancel always, and Esc closed it without `onCancel` → **JSDoc states it (both buttons close; focus on Cancel for danger, on the field for type-to-confirm, else the dialog); `onCancel` runs for Cancel, Esc and a click outside, in a `DialogTrigger` too** → "Esc acts as Cancel" is now true in code. Its tones take the one value set: `neutral | danger` (was `default`), impact rows `danger | warning | success` (were `caution`, `safe`; same paint).
- Card's `tone="build" | "manage"`, a Go Vocal tab used as a colour word → **`variant="outlined" | "filled"`** → it is the card's fill (a border on white, the panel fill on the grey stage), and `tone` is colour intent only. `review` → **`status`** (one word for the status axis); the menu card's `selectedKey` → **`value` / `defaultValue` / `onChange`** (one value). Call sites renamed in the same change.
- No picture slot on Card, so the Inspiration hub's project card and the template gallery drew Gaps → **`media`: a picture on top, edge to edge under the border, its top corners the card's; an `<img>` fills the width at 2:1, cropped** → the prototype's project card; Choice card's `media` is an inset icon, a different thing, and keeps its name.
- The back office's local page head (16 pages), `.bo-note` / `.bo-section-title` (121 and 19 uses), two visually hidden copies and seven `auto-fit` grids → **four Components: Page header (title, actions, description, breadcrumbs), Text, Visually hidden, Tile grid** → each is generic and used on two or more screens (promote on the second use). Text and Visually hidden open a group of their own, Components/Text; Page header and Tile grid join Layout & containers.
- A typographic Text vs the starter's `Text` (React Aria's slot text, in Content) → **one `Text`, gv's: React Aria's Text underneath, so it still fills a slot (`slot="description"`), plus `kind` (title, body, ui, small, stat), `isStrong` and `color` (primary, secondary, meta, tertiary); with neither it draws exactly as React Aria's** → one name for words on screen; the barrel exports gv's, and Content's stays the starter files' own. The type style is `kind` (what the words are), not `variant` (a shape or fill) nor `size` (Figma names type styles by role, not by pixels).
- Tile grid's widths as free numbers vs presets → **`minTileWidth={160 | 220 | 280 | 360}`, `layout="row" | "gallery"` (stretch across the row, or keep the columns), `density="compact"` (12 apart)** → the back office's grids use these few widths; raw px stay in one CSS file until layout size tokens exist. Page header's title is `h1` unless `headingLevel` says otherwise (convention 6 allows 1 here: a page's title is its first heading).

## Public API and prop names (29 Oct 2026, evening)

The architecture review's API pass: two entry points, the className contract and one naming convention (docs/API.md).

**Entry points**
- Starter parts and Components side by side in one barrel vs starter parts hidden → **`govocal-ds` for Components and Patterns, `govocal-ds/base` for the starter parts no Component covers yet** → a page reaches for a Component first; the fallback stays importable and visible.
- Breadcrumbs, Checkbox, Drop zone and Modal each a starter part and a Component under one name → **the Component takes the name; the starter part is in neither entry** → one name, one part.
- Heading, Text, Header, Keyboard and Separator re-exported by Menu, List box, Grid list, Dialog, Sheet and Drop zone → **one home each (Content, Separator), exported once** → a second path to the same part is an alias.
- The back office's aliases written by hand in Vite, Storybook and tsconfig → **Vite and Storybook compute theirs from `package.json` `exports`** → one list to change.
- Deep imports in the back office → **`npm run api:imports` rewrites them; `theme.css` imports go (each part's CSS imports it), `tokens.css` becomes `govocal-ds/tokens.css`** → one road for every consumer, re-runnable.
- The phase page's story pictures (no entry exports them) → **left as the one borrowed path the guard allows** → story data is not system API; the back office gets its own pictures.

**Props**
- Popover `hideArrow`, Modal `padBody` (true = padded) → **`showArrow` (default true), `isFlush` (default false)** → no `hideX`; Panel and Dialog already said `isFlush`.
- A chart series' `tone` (a palette slot) and IconButton's `tone` (Figma's name for an icon's weight) → **`color` (a ChartColor) and `emphasis`** → `tone` means a colour intent and nothing else; Figma keeps its property name.
- Button `tone="default"` → **`neutral`** → the one tone set's word.
- ListHeaderCell `variant` (label, number, add column) and VolunteeringRow `variant` (the tab it sits in) → **`kind` and `layout`** → neither is a fill: one says what it shows, the other where it sits.
- Skeleton `shape`, DashboardCard `type`, StatTile `type` → **`variant`, `kind`, `layout`**, Figma's values kept → the three axes the convention names.
- Breadcrumbs `level="phase"` and `phaseState` (Go Vocal words on a Component every back-office page uses) → **`variant="editor"` and `status`** → generalised, not moved: a page header needs it everywhere.
- ProjectHeader `level` project | phase-draft | phase-live beside `publishState` → **`level` project | phase plus one `status`** → one status axis; phase stays, it is a Pattern.
- Select's `size` open to every look → **a union: pill 22 | 28, field and quiet 32 | 36** → a pill at 36 no longer compiles. SegmentedControl default | small → **36 | 30**. Link keeps small | medium → a type size, not a height.
- Modal `size`, DropZone `size`, Banner `compact`, EmptyState `size` → **`width`, `density`, `density="compact"`, `layout`** → a size is a height; the rest say which preset they are.
- SectionLabel `level` 1–6 → **`headingLevel` 2–6** → a page owns its h1.
- OptionList and TagPicker `options` / `selected`, controlled only → **`items` / `value`, plus `defaultValue`** → they keep their own value when not controlled, as a field does. Pagination gains `defaultPage` beside `page`.
- Banner, Empty state and Dashboard card `action` → **`actions`** (a slot, as Panel and Card); Phone preview keeps `action` → it is one data object for the phone's own pill, not a slot.
- Banner `type="info-link"` (the info tone plus where the link sits) → **`linkPlacement="inline"`**, default trailing → one prop per meaning.
- Dashboard ranking `votes` → **`count`** (`unit` still says votes by default) → the card counts any option; voting is the page's word.
- ReviewStatus and DashboardCard's Figma kinds stay Components though their values speak Go Vocal → **kept** → Card composes the first, three back-office screens the second, and a Component can't build on a Pattern.
- NotificationRowList painted with the bell list's class → **its own `gv-notification-row-list`** → both lists on one page took one look.

## Token names (29 Oct 2026)

The token review (one grammar, the missing intents, base 4; docs/NAMING.md "Token names"). The codemod is
`npm run tokens:rename` over `tokens/renames.json`; before/after shots of 95 stories showed only these moves.

**Names**
- Three vocabularies in the semantic colours (roles, component names such as `action`, `control`, `avatar`, Go Vocal words such as `live`, `reviewed`) → **one grammar, `--gv-{surface|text|icon|border}-{role}[-strong][-{state}]`, with React Aria's state words** → a name can be worked out instead of looked up; `tests/token-names.test.mjs` holds it.
- The starter's second set of names (`--spacing-*`, `--radius*`, `--focus-ring-color`, `--highlight-*`) beside ours → **deleted; the codemod moved every use onto `--gv-` names** → one namespace; theme.css keeps only `--background-color` and `--border-color`, which a stylesheet also sets as its own variables.
- Danger, warning, success, selected and inverse painted with 47 primitives and 26 colour mixes → **intent tokens (`surface-danger`, `-danger-strong`, `-danger-pressed`, `border-warning`, `surface-success-strong`, `surface-selected`, `surface-inverse`, …), Not in Figma, in `tokens/semantic.tokens.json`** → components paint with roles; the values are what they already painted.
- `brand-*` primitives → **`navy-*`** → a primitive is named by its hue; brand is a role.
- Shadows `subtle` / `segment-selected` / `dialog` → **`raised` / `raised-strong` / `overlay`** → named by elevation.
- 214 zero letter-spacing lines and a size, line, weight and tracking token per role → **one `--gv-font-tracking` on `:root`; the font primitives `--gv-font-size-*`, `-line-height-*`, `-weight-*` (Figma's own variables)** → a role is one `font:`; an override takes a primitive.
- `surface-hover-strong` → **`surface-pressed`**, though 11 of its 25 uses are a selected, current or open state or an image placeholder → same value; the codemod flags those uses, the designer may give them their own token.
- Same-value and near-white pairs (`text-tertiary`/`text-placeholder`, `surface-hovered`/`surface-tertiary`, `border-focused`/`border-selected`, the panel → app ladder) → **kept two, each reason listed in the guard** → merging a token is the designer's call; the guard fails when one stops being a near-duplicate.

**Base 4** (the project lead's call)
- 27 spacing steps, among them Figma's 5, 7, 9, 11, 14, 15, 18, 22, 25 and 44 → **0 · 2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64 · 104; snaps 5→4, 7→8, 9→8, 11→12, 14→16, 15→16, 18→16, 22→24, 25→24, 44→40** → one ladder to pick from; each snap moves a box by 1 or 2px (a dashboard card's padding 14 → 16, a drop zone's 22 → 24, an empty state's 44 → 40).
- Radius 3, 5, 7, 9 → **4, 6, 8, 8; the ladder is 2 · 4 · 6 · 8 · 10 · 12 · 14 · 22 · full** → 22 stays for the phone preview's frame.
- `space-1` and `space-3` → **a raw 1px or 3px on a position, an offset or a stroke; 2 or 4 anywhere else (padding, gap, a size)** → an offset is not spacing, and a size computed from a padding must move with it (the Segmented control's segment: 30 tall in a 3-padded track → 28 in a 4-padded one, the track still 36). The date field's segments gain 1px a side (1 → 2).
- Comments that quote Figma's or the prototype's number ("padding 14") → **left as the source drew it, except where the code computes with it** → the comment records the source; the ladder holds the code.

**Merges the codemod made by value**
- The selected tint at 5, 8 and 10% of the brand → **`surface-selected` (10%)** → one selected fill; the 5% and 8% rows get a shade deeper.
- Red tints at 10 and 12% → **`surface-danger` (12%)**; 16% → **`surface-danger-pressed`** → one danger tint and its press.
- Amber tints at 9% (the side panel's strip) and 14% (Banner) → **`surface-warning` (14%)**; 30% → **`border-warning`** → one warning tint.
- Teal 75 (`surface-ai`, the info Badge) → **`surface-info` (teal 50)**, ΔE 1.4; `text-segment` → **`text-neutral`**, ΔE 2.4 → tokens win.

**By hand**
- The side nav's Support icon in green-400 and its focus ring in teal-400 → **`side-nav-icon-accent`, `side-nav-border-focused` (component tier)** → no semantic role fits a mark on the one dark surface.
- The coachmark's white focus ring, drop targets' 2px outlines (in `border-focused` or `border-selected`) → **`var(--gv-border-width-2) solid var(--gv-border-inverse)` on a dark fill, `… var(--gv-border-selected)` for a drop target** → only focus draws `--gv-focus-ring`; a drop target is a selected edge.
- A dimmed series at 0.4 in three components; one-off opacities (a dimmed chart line 0.25, a chevron 0.75, read-only rules 0.62, the quiet select-all 0.55, the skeleton's pulse) → **`--gv-opacity-dimmed`; a `raw:` note on each one-off** → only a shared meaning becomes a token.
- A selected toggle button's border and fill from one starter alias → **the border reads the button's own fill (`--button-color`)** → the split would have given them two tokens that could drift apart.
- The phone preview's inner radius `calc(22 - 1px)` → **`calc(var(--gv-radius-22) - var(--gv-border-width-1))`** → arithmetic on tokens.
- Storybook's chrome hovered in teal 75, which `surface-info` replaced → **the chrome theme reads the teal-75 primitive** → the manager is not a component and keeps its look.
- Primitives no semantic token fits yet (the Tooltip's fill, slate-750 tab and radio labels, slate-250 tracks, the tag's slate-500 edge, the kbd hint's teal-500, the Data table's tile hues, the Toast's greens) → **allowlisted in `tests/paint.test.mjs`, each with its reason** → the designer names them (phase 3); a fixed one must leave the list.
- Size's page said Figma has no size variables → **it has two, control 24 and 28 (`1:127`, `1:129`)** → corrected.
- The Foundations pages name Figma's `Tokens` and `Primitives` collections from the token review → **taken as written** → the REST API that would confirm them is off limits; the pull reads only the drawing.

## Back office redesign on the current components (29 Oct 2026)

**Dashboard**
- Dashboard filters: Project as a field Select, the date preset as a Menu button, the dates as the starter DateRangePicker → **Select pill with search ("Project:"), Select quiet for the preset, the Date range field only on Custom** → the selector calls above; a preset already says which dates.
- A card's metric picker as a field Select in the card head → **Select quiet** → the toolbar sorts' look; a field belongs in a form.
- Series named two ways (Legend rows over Representativeness bars and Internal adoption, the Chart legend under line charts) → **the Chart legend, in the Dashboard card's legend slot; Internal adoption's figures as Stat rows, like Emails** → one legend look; a Legend row carrying a figure was a Stat row drawn another way.
- "Go to Input Manager" as a centred link in the card body → **the Dashboard card's footer** → the slot Figma draws for it.
- Participation and Management feeds as a bare starter Table under a Segmented control or a field Select → **list pages: Panel, Table toolbar, Data table, Pagination; the Action filter as the Filter menu and chips; Mark as viewed at once with Undo, ticked rows through the Selection bar; Empty state when nothing is left** → one list shape on every admin table.

### Projects

- New folder beside New project on every tab (ours) vs one action per tab (the real admin) → **the page head's action follows the tab: New project, New folder, New space** → the action belongs to the list it adds to.
- Search in the tab row over every view (both) vs the Table toolbar's search → **each tab is a Panel with its own count and search in the toolbar row** (Search projects, folders, spaces); the sort is a quiet Select ("Sort: Recently viewed") → one list shape, as Users and Messaging.
- Template gallery: Cards with a missing image and a button each → **Choice cards in a radio group, the method's tile in the media slot, one Use template in the foot** → one pick, one confirm, like every dialog; the "Template image" gap is gone.
- Calendar and Arrange as a hand-built month list and order list → **Panels with Data tables** (month as the Panel title, its arrows in the head; position, project, visibility and ↑↓ for the order), Empty state for an empty month → the timeline and drag-and-drop stay gaps.
- Move, duplicate and delete changed the list silently → **a Toast with Undo for each; Delete still confirms first** → "This cannot be undone" leaves the confirm.

### Project overview

- Project setup as a bare column with its own head row → **a Panel, the settings cog in its head actions; its parts Panel sections** → one panel shape on every admin screen.
- Project details as a page-made definition list → **the Property list** → the system's label · value rows, as in the Side panel.
- The Participation rail drawn twice (the overview's own head with hide and add; the phase screen's with empty Spotlight and Events labels) → **one rail: Rail header (hide on the overview), the timeline, Spotlight only when something runs there** → one rail; an empty label tells nothing.
- "Link copied" and "Invitation sent" as a status line in the header bar → **a Toast** → one feedback channel; the status change says itself in one too.
- The bar's own View menu and status pill → **Project header's bar: its panel toggle, Share ▾, Publish ▾ / ● Live ▾, one Save while the setup has changes; the View menu went** → the prototype's bar has no View menu (the rail hides itself, the preview is the stage); an archived project, which the header can't show, says so in a Banner and Publish ▾ restores it.
- Next actions as plain rows → **an Action row list; Create report runs in its row (working, then Report ready)** → Action row's story.
- The phone on a bare grey stage → **Phone stage (caption) and the phone's own action, Edit project page** → Phone preview's stories.

### Phase

- Build's stage held a Gap for the phone → **the Phone preview, with the phase's dates, a line and its call to action** → the overview's phone, one preview.
- Build's setup as a bare column with page-made section heads → **a Panel "Setup" (cog in the head), "Before you publish" and the method's setup as Panel sections** → the overview's setup column, the same parts.
- Manage and Insights of a phase that hasn't started as a note or an empty table → **the Empty state (the notebook) on the stage, its panel size beside it** → the prototype's empty tabs, one look for every method.
- Insights as a note → **the prototype's phase dashboard on Stat tiles and Dashboard cards: a vote shows its results (tiles with notes, live ranking, who is voting, the AI Banner), ideas and proposals the ideation dashboard, other methods their visitors; Recommended actions as the Manage tab's cards in a Panel** → each piece is a story already; six tiles sit 3 + 3, not 4 + 2.
- Voting and Proposals Manage as a note → **a Panel over the method's List header and rows (Voting row, Proposals row)** → the Figma rows for those methods; other methods keep a note until drawn.
- The rail sent a non-ideation Manage to Build → **the rail keeps the tab it is on** → every method has a Manage tab now.
- The page-made bar (mode switch, Share, Save) → **Project header's bar with modes, people and Save on hasChanges** → one header on the phase and the project; a phase has no Share (the header gives it none).
- Project settings' flat side tabs → **Grouped tabs under Project, Participation, Inputs** → Tabs' "Vertical with group headings".
- Idea form, participation and emails as stub cards → **Form field summary (recipe), Participant actions with Access rights modal, Available views, Notifications with the email in the setup's place; a volunteering phase's Causes card** → each pattern's "In a card" story.
- Insights' Recommended actions as Manage cards → **an Action row list, each action's icon at the end** → Action row's "Recommended actions" story.
- Phases could not leave the rail → **Rail phase's delete on every phase but the one on screen, undone from a Toast** → drawn as Rail phases since Phase timeline takes no delete.

### Messaging

- Automated emails as Cards of Switch rows with a pencil each (ours) vs the Build tab's Notification rows (a phase's emails) → **Notification rows in a Panel per recipient group, a Section label per kind; an open email takes the list's place (Notification email, ← back) and shows on a Preview Panel beside it, with the test send** → one way to list and edit an email that sends itself, here and on a phase.
- Custom emails, SMS campaigns and a sent email's recipients drawn three ways (Data table in a Panel, List rows in a Card, Data table in a Card) → **Panel, Table toolbar (the count; the Filter menu and search on emails and recipients), Data table, Pagination for all three** → one list shape on every admin table.
- The SMS composer as a Card with its buttons inline vs the email composer's Panel → **both Panels, Cancel (secondary) and the sends in the foot; the recipient count as the To Select's description** → one composer.
- Switching an automated email, duplicating an email and deleting a draft changed things silently → **a Toast with Undo for each; Delete still confirms first** → "This cannot be undone" leaves the confirm.
### Users

- Add a new group's two kinds as a stacked Card with its radio list (CardRadio, deprecated) → **Choice cards in a RadioGroup, a smart group's rule picker in the chosen card's `revealed` slot** → the rules belong to the smart kind, so they open under it.
- An empty list as an empty table reading "No users here." → **an Empty state in the Panel body, by list (no members yet, nobody meets the rules, no banned emails, no bounces, a role nobody holds, no match), with no table or Pagination under it** → the shape every admin list uses.
- Admin rights, add to group and the rest changed silently or with a plain toast → **instant with an Undo toast: admin rights (row and profile), add to group (row and Selection bar), remove from group, unblock, delete invitation; Block and Delete user still confirm in an Alert dialog** → Undo where it can be taken back, a confirm where it can't.
- Row menus as bare words → **icons in Menu's icon slot, the removing items (Block, Delete) after a separator; Unblock user under Banned emails, Remove from group in a manual group's list and its Selection bar** → each list offers the way back out of it.
- A smart group's page looked like a manual one → **an info Banner in the Panel saying its list fills itself; no Remove from group there** → a hand edit would be undone by the rules.
- Invite by email as a stacked Card with Send inside → **a Panel with the address count and Send invites in its foot; Role a Select with descriptions (what each role may do, which seat it takes)**; the invitation status as a project Status badge (draft/live) → **a Badge, outlined while Pending**, with Resend and Delete in the row menu.
- The profile as a Card with a hand-built `dl` → **a Panel with a Property list (email, role, joined, last active, groups as value Badges), participation as Stat tiles in a second Panel**; seats' tiles take a month's trend and an info popover on what counts.

### Tools

- Tools' sub-pages as bare starter Tables under the page head, the create button in the page head → **a Panel each (title, count, description, the create action in its head) over a Data table; an Empty state with the create action when the list is empty** → the list shape of every admin screen.
- Delete token and Delete webhook removed a row at once (the real admin asks first) → **an Alert dialog, then a Toast** → a token or webhook gone breaks an integration; there is nothing to undo.
- Edit and Delete webhook as two icon buttons in the row vs the "…" row menu of Projects and Reports → **Data table options, Menu items with their icons** → one row-actions look.
- "Copied!", "API key saved" and "Report template ready" as status lines beside the button → **a Toast for saves and downloads; inside a dialog the button turns to a disabled "Copied!"** → one feedback channel, the Inspiration hub's copy.
- Esri key, Widget settings and Power BI templates as Cards → **Panels, the save or download in the foot; Esri's connection as a Status badge in the head; Power BI's API note a Banner linking to the tokens** → forms sit in Panels, as Settings.

### Reporting

- Report tabs over a bare Data table, one search above the tabs for all three → **each tab a Panel (title, description), its count and search in the Table toolbar, Pagination in the foot; the tab's count as Tab `count`** → one list shape, as Projects' tabs.
- Create a report as two stacked Cards opening under the list (template as Choice cards, contents as checkbox cards) → **a wide Modal: title, the template as Choice cards with icons in a RadioGroup, the contents under their group headings, Length; Cancel and Create report in the foot** → a start screen is a dialog, as New project; the list stays where it was.
- Delete removed a row silently, Duplicate added one silently → **Delete confirms in an Alert dialog, then a Toast with Undo; Duplicate a Toast with Undo; the row menu's icons in Menu's icon slot, Delete after a separator** → Projects' row actions.
- No match as an empty table row ("No reports match your search.") → **the Empty state in the Panel body; an empty tab offers Create a report** → the shape every admin list uses.
### Pages & menu

- The navigation bar as a GridList of bordered rows with a "Reorder" menu (Move up / Move down) vs the Projects "Arrange projects" table with arrow buttons → **a Panel over a Data table, Position column, the grip as the drag-and-drop Gap, ↑/↓ Icon buttons; Edit and Remove from menu in the row's "…" menu** → one way to reorder a list; Home keeps a lock and only Edit homepage.
- Custom pages as a hand-made list with an In menu / Not in menu Status badge beside a Show in menu switch → **a Data table, the Switch alone with the state as its label; Edit, View and Delete page in the "…" menu** → the badge said what the switch already showed.
- Remove from menu, Show in menu and New menu item changed things silently; Delete page removed a page at once → **a Toast with Undo for the menu changes; Delete page confirms in an Alert dialog, then a Toast** → a deleted page breaks its links, so it asks.
- Saves said as a status line beside the button (homepage, menu item names, custom page) → **a Toast; the forms are Panels with Save in the foot; the custom page's one Save sits in the page head beside View page** → it saves both tabs; one feedback channel.
- "Provide a title for all languages" as a grey note → **a warning Banner naming the missing languages**; the terms and policies note → **an info Banner linking to Settings**; no custom pages → **an Empty state with New custom page**; an unknown item or page → **a page Empty state with the way back**.

### Settings

- General's sections as Cards, each with its own Save and a "… saved" status line → **a Panel per section; Platform configuration and Project approval save from the Panel foot, said in a Toast; Content moderation, Statistics and User name display apply at once (the real admin has no Save there), each change in a Toast with Undo; the name styles as Choice cards in a RadioGroup** → forms in Panels, instant changes undoable.
- Tags, Areas and Statuses as hand-made lists with an Edit button per row, Statuses behind an index of two Cards and a back link → **a Panel each (count, Add in the head) over a Data table, Edit and Delete in the row's "…" menu with icons; input and proposal statuses as two Panels on one tab (Add input status, Add proposal status), the colour as the row's leading swatch and the category a Badge; Delete confirms in an Alert dialog, then a Toast with Undo; an emptied list shows the Empty state** → one list shape on every admin table.
- Policies as rows that unfold an editor inline → **a Panel over a Data table, the text opening in a wide Modal with the Rich text editor and Save in its foot** → Add and Edit open a dialog on every Settings list.
- The chosen logo and banner as a "Selected: …" line → **the File list under the Drop zone, removable with Undo** → the system's way to show an attachment.

## Building from the prototype review (29 Oct 2026)

Calls made while planning the build of the review's findings (selectors, tables, side panel, feedback, forms,
dashboards, Build tab).

- Five names for one pill selector (Property picker, Select with search, Pill select, Selector, Option row with description) → **Select** with pill/field triggers and search, icon, avatar and description options as stories → React Aria's name; the reviewers saw one popover body.
- Filter options' body is also what Select with search, Tag picker, Topic tags and Area need → **it moves up as Option list**; Filter menu uses it → a pattern a second place needs moves up, and components can't build on patterns.
- "A Base entry moves up when Figma draws it" (the naming plan) vs "generic and used on 2+ screens = a component" (docs/NAMING.md) → **a Base entry used on 2+ screens moves up to Components** (Select, Menu, Search field, Tabs, Toast, Tooltip, Switch, Text field, Number field) → the newer rule wins; Figma can draw them after.
- Drawer modal (one reviewer) vs non-modal (another) → **non-modal Side panel**: focus moves in, Esc closes back to the row, the table stays usable → the pager and row clicks walk the list while it's open.
- Record pager as its own entry vs part of the drawer → **part of Side panel** (`position` prop) → it lives nowhere else.
- Inline alert (new) vs Banner (in Figma), plus a phase status strip → **Banner** gains neutral, warning, success and AI tones, icon, title, action and dismiss; phase status is a Banner story → one message box, Figma's name.
- Sort mark chevron (Storybook) vs arrow + "Order by X" tooltip (prototype) → **arrow ↑/↓ on the sorted column and on hover of a sortable one, no tooltip** → arrows mean order, chevrons mean open; `aria-sort` says the rest.
- Select-all in the header (Manage) vs a "Select" checkbox in a toolbar (Audience) → **header only**, shown on hover, indeterminate when partial → React Aria Table's selection column, one place.
- "Scroll down to load more" (Projects list) vs numbered pages (Audience) → **Pagination on every admin table** → stable positions, bulk selection of a known page; the back office already marks Pagination gaps.
- Three table card heads (Audience card, Messaging panel, card head with count) → **one Panel** (title, count Badge, description, actions, footer); Data table `framed` stays for a bare table.
- Search icon missing (Space), leading (Topic tags), trailing (Projects list, Audience) → **leading magnifier, clear × at the end, everywhere** → React Aria SearchField's convention.
- ApexCharts bar and pie charts (Audience) vs hand-drawn Bar rows (phase Insights, back-office Dashboard) → **Bar rows and Dashboard card bodies, no pie, no second chart library** → bars compare 3–8 shares better than slices; one chart system.
- Info icon with a hover tooltip vs Help popover → **Help popover** (moves to Components/Overlays) → a tooltip on a non-focusable icon can't be reached by touch or keyboard.
- Locale switcher as one new component → **none**: Tabs with status dots (field languages), Select quiet (top bar "EN ▾"), Title field's language slot → three configurations of existing parts.
- Section labels sentence case vs UPPERCASE tracked → **sentence case** (Rail section label's look, moved up as Section label) → easier to read and to translate.
- Stat tile label over value (Figma) vs value over label (AI modal, 360 view) → **Figma's order everywhere**; trend, empty and info are additions → one tile.
- Offline votes' round − n + stepper vs Number field's square buttons → **square** → every icon-only button is square, radius 8.
- Danger buttons filled, text and outlined → **`tone="danger"` on primary (confirm) and quiet (inline Delete), no outlined** → two looks cover every case.
- Confirms with and without ×, type-to-confirm on one → **Alert dialog: no ×, Esc = Cancel, quiet Cancel + primary or danger; type to confirm only where data is lost for good** → friction only where it protects.
- Two toasts (title + body + Undo vs a white one-liner) → **one Toast**; the one-liner is a Toast without a body, same look → one feedback channel.
- Settings needs a tall modal, the method picker and gallery a bigger one → **widths stay 420 and 866; Modal gains a fixed height (640, body scrolls) for tabbed dialogs; galleries reflow in 866** → the fidelity widths stand.
- Side nav folded with hover peek and no tooltips (prototype) vs Open state + tooltips (Storybook) → **Storybook's, no hover peek** → an edge that opens on hover catches stray pointers and no keyboard reaches it.
- Comment thread as a Component (one reviewer) vs a Pattern (another) → **Pattern, Manage tab** → team replies, internal notes and content warnings are Go Vocal moderation.
- Volunteering Manage in an older layout (no table, search, filter, panel) → **built like the other Manage tabs** → one Manage.
- Open-ended dates ("Add end date") → **Date range field from two DatePickers**, not the starter DateRangePicker → it can't leave the end empty.
- Phone preview's Before · Open · Ended switch (two reviewers unsure) → **treated as demo tooling, not built** → other methods show a caption in that slot; the designer can say otherwise.
- Build tab rows (notifications, participant actions, access, views) had no place in Patterns → **new place "Build tab"**, beside "Manage tab" → patterns grouped by place.

**Built in the feedback package**
- Phase status strip vs the full Banner → **`Banner compact`**, one row, no card padding → one message box, two
  densities.
- "Ended" phase status has no icon in the prototype → **the clock, neutral tone**, as Not started.
- Alert dialog as a Modal variant vs its own component → **its own component** (no head row, no ×, an icon badge) →
  Modal would need five props just to switch parts off.
- Modal's side tabs grouped under overline labels ("Project", "Inputs") → **a flat list for now** → Tabs gains group
  headings in the dashboards package.
- Danger hover: no darker red token → **the fill brightens slightly**, as primary does.
- Candidates for new Figma tokens: danger action (Button uses red-500), danger surface (Alert dialog's icon badge),
  warning surface (Banner warning), neutral surface (Banner neutral uses the hover grey).

**Built in the side panel package**
- The drawer has a scrim and a Save footer → **no scrim, no Save; an optional "Changes are saved as you make them" with
  Done** → the list stays usable, and the line answers "did it save?".
- Comments as a grid (plan) → **a list of articles with plain buttons** → a grid stops screen readers reading a long
  comment word by word.
- The drawer slides in and out → **slides in (slow, enter), leaves at once** → a closing panel shouldn't hold the list up.
- Panel radius 18, no token → **14**. Panel type: labels and meta Small 12, comment words UI 13, record words Body 14.
- Quick-action and pager buttons 30 with 18 icons → **the Icon button's 28 with 16** → one icon-button size.
- Comment tabs with their own look (24 gap, 3px teal line) → **the system's Tabs** → one tab look.
- Publish on an empty update focuses the field → **Publish stays off until there are words**.
- Esc closes the drawer even mid-sentence → **Esc in a field with words keeps them and leaves the field; the next Esc
  closes** → a half-written update isn't lost to one key.
- Focus is lost on close → **back to the open record's row** (the pager may have walked away from the opener).
- Reply does nothing → **it points the composer at the comment ("Replying to …")**; replies go one level deep.
- Candidates for new Figma tokens: warning surface and border (screening strip), radius 18, grey-50 block.

**Built in the forms package**
- Choice card's selected border → **2px drawn inside the tile** → the tile never changes size when chosen.
- Choice card's revealed fields (Budget → Min/Max) → **beside the radio, not inside its label** → a label around
  fields breaks clicking into them.
- Date range field's time zone → **shown as text, no picker** → nothing in the prototype picks one; a picker is a later
  entry if a Build tab needs it.
- Text field prefix/suffix → **a border on the whole group**; Number field's "€" → **plain text inside the field** →
  one glyph needs no seam, and Voting's Min/Max widths stay as measured.

**Built in the selectors package**
- Single picks drawn with a checkbox in the drawer, a check at the end in New project → **pick several = a box at the
  start, pick one = a check at the end**, in Menu, Option list and Select alike → the box says "tick more", the check
  says "this one".
- In a pick-several list Enter ticks and closes every menu → **Enter ticks and the list stays open; Esc or Done
  closes** → otherwise the keyboard can't tick two tags through a search. Applies in the Filter menu too.
- "No matches" (Option list) vs "No results" (Select) → **"No results"** for both.
- Done in brand-blue text, "+ Add tag" in brand blue → **quiet Buttons** → blue text is the Link's.
- Pill selects in two sizes (New project 28, drawer properties 22) → **Select `variant="pill"` with `size` 22 or 28**;
  a third look, quiet, for toolbar sorts ("Sort: Newest ▾").
- Pill with icon and prefix → **the icon leads: "✱ Space: City parks"**.
- New project's search has no magnifier → **a leading magnifier**, as every search field.
- Removable tag's 0.5px hairline → **1px** (no half-pixel strokes).
- Setup step's value badge radius 6 vs the round Badge → **radius 6 kept on the Setup step** (its own look in Figma).
- Option list is a Menu, not a list box (the plan) → **a Menu with selection** → it has to work as a Filter menu
  submenu; Select keeps the list box. Both draw the same rows.
- Candidates for new Figma tokens: a value badge surface/text pair (teal), a pill hover surface (slate-200).

**Built in the tables package**
- Pager buttons at radius about 4 → **28 squares at radius 8** → like every other button. Long lists → **seven fixed
  slots with ellipses**, so the pager keeps its width; one page → **the pager shows with both arrows off**.
- Collapsible search 28 tall (the prototype) vs fields at 36 → **28 × 180** → it opens in place of a 28 icon button
  without the row jumping.
- Assignee as tooltip-only initials → **Avatar and name; "Unassigned" with a dashed ring** → readable without hovering.
- Header select-all dimmed to .55 → **hidden until the table is hovered or focused, or something is ticked**.
- Sort mark 12px arrow → **quiet on hover, strong when sorted**.
- Projects list visibility as a colour bar and a word → **a Status badge over who can see it** → no bespoke colour bar.
- Toolbar count in Title weight vs regular in the prototype → **Title size, body weight**, as drawn.
- Export: an icon with no items → **an Export menu: all ideas, all comments, selected ideas (off until something is
  ticked)**, the real admin's three exports.
- A Panel head count and a toolbar count saying different numbers → **one count, in the toolbar**, following search,
  filters and quick views (also fixes "the count ignores the search").
- Key-only metric chip labelled "Remove this filter" → **"Remove the X filter"** → every chip says what it removes.
- Token snaps: the 16 avatar's initials 11 → 12px; compact table rows' 18px line → 20 (UI line).
- Candidates for new Figma tokens: project tile fills by method (teal, blue).

**Built in the dashboards package**

- Tabs' group headings vs React Aria's TabList (headings would take focus) → **a single-select ListBox with sections drives the panel**, same look → headings stay out of the focus order and name their groups.
- Settings dialog at 420 (the story) vs 866 (the prototype) → **`size="wide"`** → a 200 side list leaves a usable panel only at 866.
- Tab count with a 7 gap vs the prototype's plain space → **one space ("All reports (18)")** → it reads as one label.
- Value card as a React Aria Tooltip vs drawn inside the chart → **drawn inside** (hidden from screen readers; the explorer's value text says the same) → it follows the pointer point by point, needs no portal and can't leave the chart.
- Keyboard explorer: a button per point vs one slider → **one slider** → one tab stop; arrows, Home and End are what a slider already means to screen readers.
- Sparkline interactive always vs with dates → **on when `labels` are given** → a card has to name its point.
- Bar and Statement row cards: focusable rows vs hover only → **hover only, the card's words also in the accessible text** → a dashboard of bars would be a long run of tab stops; nothing is lost to the keyboard or screen readers.
- Legend rows linked to a chart: static vs focusable → **focusable when linked** → the keyboard reaches the emphasis too.
- Hover on bars: brighten vs darken → **darken toward the primary text colour** → visible on the dark brand bar and the light grey alike.
- Last x label: centred and clipped (the prototype's "23 Ma") → **centred while it fits, else flush with the chart** → never cut.
- Dashboard card empty: the prototype's muted line vs Empty state → **Empty state** → one empty state across the system.
- Stat tile empty as a greyed state vs the prototype's zeros → **a story with zeros, no prop** → the prototype shows 0 in the normal colour.
- Status dot green and trend-down red have no tokens → **`--gv-chart-agree` and `--gv-state-notification` for now** → the nearest drawn colours; named status tokens come with the token review.
- List / Map switch: white track and grey selected (the prototype) vs the small Segmented control → **the small Segmented control** → one small look.
- Statement row: Figma's three shares vs the Manage panel's four with gaps → **`unseenPercent`, gaps only with four shares** → Figma's bar stays as drawn.

**Built in the project package**

- A rail-only label vs a general one → **Section label in Layout & containers**, with an optional heading `level` and a 16 icon → it heads groups in the rail, Access rights and Choice card groups (Choice card's own heading now renders it).
- Next actions and Insights rows drawn differently → **one Action row**; Done = the tinted tile with the brand border; Working = a busy group with a progress ring, nothing to press.
- The prototype's full project bar vs Figma's levels → **the bar is built into Project header**, switched on by `modes`, `people`, `onSave`, `publishState` or `shareMenu`; the Figma-level API still works.
- Figma's dark bezel vs the prototype's light device → **the light device (343×683, radius 22)**; one hover/focus look for project and phase (lift, ring, dim, a smoked pill); the eye and caption moved out to Phone stage, so the phone stays reusable.
- The prototype's 26-wide switch in notification rows → **the system Switch (36)** → one switch in forms.
- Default vs set-for-this-phase values → **grey vs dark, and different words** → colour is never the only signal.
- Read-only before Override → **`isReadOnly` on the radios and switches, the body faded once** → `isDisabled` everywhere faded twice and took it out of reach. Revert sits in the footer and asks first.
- The prototype's disabled "Default" button → **a pressed toggle that ignores presses** → disabling it dropped focus to the page.
- Form field summary: a GridList (the plan) vs a static list → **a static list** → its rows do nothing, so a grid only adds tab stops; six rows, then "N more".
- A disabled action that explains itself → **with a `tooltip`, Card's `isDisabled` uses `aria-disabled`** (focusable, no press) → a disabled button can't be hovered, so it can't say why. Card radios are deprecated in favour of Choice card.
- The rail's delete shown only on hover (`display: none`) → **faded in, always in the tab order** → keyboard users can reach it.
- Volunteering row in Build → **`variant="build"`** (thumbnail, "No sign-ups yet" / "N signed up", Edit and Delete) → the content differs, which args can't express.
**Redesign: Community monitor** (on the current components)
- Reports as Cards with an open chevron vs every other admin list → **a Panel (Create report in the head) over a Data table, row menu and Pagination**; a row opens the report → one list shape.
- Managers as Badges with "Add a manager" beside them vs the person cells of Users and Projects → **a Data table with person cells in a Panel; remove from the row menu, with an Undo toast** → people read the same everywhere.
- Settings as Cards with a card switch vs forms in Panels (Messaging) → **a Panel per sub-tab; on/off as a Switch with its description; Popup's Save in the Panel foot**; access as Choice cards; instant changes say so in a Toast with Undo; anonymizing asks first in an Alert dialog → it changes what is stored.

**Redesign: Inspiration hub** (on the current components)
- Four filter Selects, a tag row and "Reset filters" vs the Filter menu and Filter chips of every other list → **the Filter menu (Method, Country, Population, Topic; any of within a facet) with Filter chips, the count in the Table toolbar, search beside it** → one way to filter a list, now a gallery too.
- "Seems like there are no more projects" at the end vs Pagination on every list → **Pagination, six cards a page; no matches is an Empty state with one Clear action**.
- "Copied to your drafts" as a Status badge on the card vs instant changes elsewhere → **the button turns to a disabled "Copied", and a Toast with Undo** → one feedback channel.
- Highlighted's country and the sort as labelled field Selects vs pill and quiet Selects in panel heads → **"Country: …" pill and "Sort: …" quiet Select in the Panel heads**; the preview's facts as a Property list.


**Tokens everywhere** (the project lead, 29 Oct: every spacing, radius, type and shadow value is a token; a design value with no token snaps to the nearest, guarded by `tests/tokens-only.test.mjs`)

- Sizes had no tokens → **a Not-in-Figma size set** (`--gv-size-icon-12…24`, `control-24…40`, `avatar-16…28`; Foundations/Size), like motion → icons, controls and avatars repeat a handful of sizes; naming them keeps the next screen on them.
- Toast padding: the prototype's 13 → **12** → no 13 token; the card is 2px shorter.
- Toast tick and ×: the prototype's 11 and 15 → **icon-12 and icon-16** → no 11 or 15 size; the × matches the 16 the component already asked for.
- Icon button 24's icon: the prototype's 15 → **16**, the same as the 28's → one icon size in every button.
- Coachmark padding: the prototype's 15 / 17 / 13 → **16 / 16 / 12** → no 13 or 17 token; each side moves 1px.
- Empty state padding: the prototype's 40 → **44** → no 40 token, 44 is nearest; 4px more above and below where the panel isn't a fixed height.
- Title field's Required marker: Figma's 52.5 from the end → **56** → nearest token, still inside Figma's 104 clear zone.
- Folded side nav count: the prototype's 10/14 text in a 14 badge → **the unfolded count (Small strong 12/16)** → 10px text has no type role; the badge is 2px taller.

**Charts are interactive** (the project lead, 29 Oct; Figma draws them static)

- Figma's charts are static → **hover and keyboard value cards on every chart, a legend row that emphasises its series, hover states on bar and statement rows** → the prototype's dashboards have them, and a back-office reader needs exact values. React Aria has no charts and the system keeps one chart system (no chart library): our own SVG with pointer and key events, a slider as the keyboard explorer, and `:focus-visible` rings.

**Prototype bugs found on the way** (not copied into the system):
- Space and Folder search: an empty popover with no "No results" text, arrow keys don't move, no search icon.
- Ideation Manage: with every column on, columns run into the "+" column; the count heading ignores the search.
- Report builder: any click, the AI tab included, opens "Download the results (PDF)" (the body carries `[data-pj-report]`); the project rail covers the widget palette.
- Content builder: the locale select collapses to 16px. Share popover: the role menu is clipped by the popover.
- Charts: last x label clipped ("23 Ma"); the report builder clips its right y-axis labels; the "92" label overlaps its bar; status-bar tracks don't line up across rows.
- Common ground "Where people stand": numbers fall back to a monospace font.
- Audience: scrolled content runs under the breadcrumb. Insights: the 6-tile grid leaves "Participation rate" alone on a second row.
- Poll Build shows Ideation's setup and has no question editor; Survey, Poll and Volunteering Insights show the generic ideation dashboard.
- Volunteering Manage is an older layout; "Add a cause" opens a "Coming soon" placeholder.
- Dead controls: side-nav entries (all but Projects), Projects list tabs and row "…", template "More details", form-builder rows and menus, tag tree expand and Add tag, floating rail Hide panel, Daily/Weekly, Audience select-all and row ⋯, Stats overview / User insights, the AI card pager, Messaging "Automated emails".

## Prototype review (29 Oct 2026)

- Projects filters: the real admin's "Add filter" adds a Select per filter, the prototype's lists filter through a
  funnel menu and chips → **the Filter menu and Filter chips** (Visibility, Folder, Manager) → one way to filter a list,
  as on the phase Manage tab.
- Bulk-action bars: the Input manager and Users each had their own (chevrons, quiet Delete and Export), the prototype
  one `.pj-inbar` → **the Selection bar on all three lists**: secondary buttons, no chevrons, a × that clears.
- Single-choice pickers mark the chosen value with a checkbox in some places, a check in others → **a check mark** →
  a checkbox means "pick several"; React Aria's single-select draws a check.
- The detail drawer has a Save button although every change applies at once → **no Save button; changes apply at once
  with an Undo toast** → as everywhere else in the prototype.
- "Clear all filters" is red in the prototype's CSS, dark on screen → **plain (dark)** → red means destroying
  something; clearing filters destroys nothing.
- Filter submenus differ per method (ideation vs voting, proposals, common ground) → **all follow ideation**: counts as
  "48 ideas", an icon per option only where it adds meaning, avatars for assignees → one behaviour everywhere.
- Bulk "Official update" opens a popover in one place, a modal elsewhere → **a modal** → it is a long-text form.

## Fidelity review against Figma and the prototype (29 Oct 2026)

Where the prototype and Figma disagree on the look, the prototype wins; names and variants come from Figma.

**Colour and type**
- Bar row, legend row and AI summary text: Figma `text/body` (#333) vs the prototype's #43515d → **Figma's
  `text/body`** → no token for the prototype's value.
- Status colours on charts (Viewed, Rejected, Implemented) have no chart tokens → **blue-3, chart-disagree,
  chart-green**; the leader green is the token's #04884c, not the prototype's #08833a.
- "Reviewed" green: the prototype's green-500 has no token → **green-600** (a shade darker).
- Checkbox checked colour: the prototype's link blue (#4183C4) has no token → **Figma's `action/checked`**.
- Switch "on": Figma's slate-750 vs the prototype's near-black → **the prototype's near-black**.
- Rail phase greens (completed, live) have no tokens → **the nearest tokens, a colour mix for the light live dot**;
  upcoming phase names stay black (the prototype's green-grey has no token).
- Stat numbers (Stat tile, Stat row): Figma's Stat style says 32 line height, the prototype 28 → **28**.
- Chart axis labels: the prototype ≈10.6px, no token → **12px (the Small role)**.
- Shadows: the tokens are lighter than the prototype's dialog and switch-knob shadows → **the tokens**.
- Dropdown shadow, the Toast's light green and mint, the Coachmark's translucent white, the prototype's lighter grey:
  no tokens → **nearest tokens or colour mixes**. Candidates for new Figma tokens.

**Shape and size**
- Modal: Figma radius 14 with a thin border vs the prototype's radius 12, no border → **the prototype's**. Widths:
  Figma 420 and 866 vs the prototype 560, 760, 920 → **Figma's 420 and 866**.
- Card switch: 26×16 (Figma's Manage toggle and the prototype's card switch), not the form toggle's 36×20.
- Fields: the prototype's heights vary 32–40 → **36 everywhere**, to line up with the default Button and Select.
- Vote progress bar: Figma 112/108/158 by frame vs the prototype's fixed 96 → **96**.
- Icon-only buttons: **square, radius 8** (Figma and the prototype), no longer round.
- Icons: **1.75 stroke** everywhere (Figma and the prototype), Lucide's default is 2.
- Disabled: Figma's Button says 50% opacity, the prototype 45% → **45%**.
- Required marker on Embed URL: the prototype has the 6px gap, Figma none → **6px, everywhere**.

**Behaviour and states**
- Focus ring: the prototype's near-black with a white halo vs the system's brand colour → **the brand colour** (one
  token, high contrast on white and grey).
- Quiet button: the prototype has an older tertiary style and a newer one (blue text, no padding) → **the older
  tertiary style**; blue text is the Link's job.
- Link: **the blue text link**; the prototype's grey text button is a quiet Button.
- Two "pick one" looks: the joined, framed toggle group (prototype) and Figma's sliding Segmented control → **Segmented
  control everywhere**; the starter's toggle group stays as the base only.
- Chosen tab: **bold**, as in the prototype (the row shifts slightly).
- Skeleton: **a gentle pulse**; the prototype's is static.
- Menu: **no danger item**, as in the prototype; destructive actions go through a confirm dialog.
- Meter: the 70%/90% warning thresholds suit storage, not progress → **kept for Meter; progress uses ProgressBar**.
- The open phase in the rail has no highlight (the prototype's 15 Oct change) → **none; the breadcrumb and
  `aria-current` mark it**.
- Rich text toolbar buttons: selected and disabled looks are not drawn anywhere → **the builder's look, until Figma
  draws them**.
- Divider: Figma has no margin; five back-office pages rely on the browser's 8px → **kept for now**, dropped page by
  page.

**Built, not in Figma** (Figma could add them): Stat row selected state, the empty dashboard card, select-all and row
checkboxes on list rows, Checkbox quiet (dimmed select-all), Tooltip with a tail (step cards only).

**Not built yet:** a grey avatar variant for assignees and commenters; a language button slot in Title field; the
chosen-value teal on a dropdown card's pill; renaming the project from the breadcrumb.
