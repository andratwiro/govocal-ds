# Decisions where the sources disagree

Where Figma and the prototype disagree, or the prototype disagrees with itself, the agent picks the better option,
builds it, and logs it here: what disagreed → what we built → why. The project lead and the designer review this
list; change any line and the agent follows. Newest first within each section.

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
