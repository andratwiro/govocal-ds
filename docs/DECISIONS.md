# Decisions where the sources disagree

Where Figma and the prototype disagree, or the prototype disagrees with itself, the agent picks the better option,
builds it, and logs it here: what disagreed → what we built → why. The project lead and the designer review this
list; change any line and the agent follows. Newest first within each section.

## Component page fixes (30 Oct 2026)

Calls made fixing the bugs the component-page writers found (benchmark-gaps plan, overnight fixes).

- List header cell: the sorted column was a pressed toggle (`aria-pressed`), and a column with no `onSort` was still a
  button → **every cell is a column head (`role="columnheader"`), the sorted one carries `aria-sort` with a new
  `sortDirection` (`descending` by default, the arrow up for `ascending`), and a label or number cell is a button only
  with `onPress`; List header is the row (`role="row"`)** → `aria-sort` is only valid on a column head, which needs a
  row, which needs a table: the list a List header heads is now a table, as WAI-ARIA's sortable table example; a head
  that does nothing must not take focus.
- Stat row as a filter (the phase's Manage metrics: `isSelected` and `onPress`) was a link with `aria-current`, so Space
  did nothing and "current" said the wrong thing → **with `isSelected` passed at all (`true` or `false`) the row is a
  React Aria ToggleButton (`aria-pressed`); without it, a link as before** → the row turns a filter on and off, which
  is a toggle, not a navigation; keying the switch on whether `isSelected` is given keeps every linking row unchanged.
  The New dot's name comes through `labels` (rule 11).
- Banner's `role="note"` is never announced when a banner appears later → **an `isLive` prop: the banner is a status
  (`role="status"`, polite) and its words arrive just after it mounts; without it, a note as before** → a live region
  announces changes, not what it was born with, so filling it after mount is what screen readers reliably read; a
  banner on screen when the page opens must not interrupt, so announcing stays the page's call, not a guess from
  mount time.
- Access rights' password switch and group, Notification email's fields and Participant limit kept their own state,
  so a page couldn't read them → **controlled pairs beside the defaults: `requirePassword` / `onRequirePasswordChange`,
  `group` / `defaultGroup` / `onGroupChange` (the group's name, not its index), `fields` / `onFieldsChange` (one object
  for the five fields, a left-out field keeping its own), `limit` / `max` with the existing `onChange`** → rule 7's
  value trio, named for what each holds; the starting props keep working. A cleared maximum reports `NaN` from the
  Number field → **not a change: the last maximum stays and the field shows it again on blur**.
- Participant limit said "likes" while its doc comment said reactions → **"Number of reactions per participant",
  "Maximum reactions", and "reaction" in the word list** → the back office says Reactions (dashboards) and Reacting to
  inputs (the action), and the word list had no entry for it.
- Data table's stories formatted dates and counts in a fixed 'en-GB', so the Locale toolbar changed nothing → **the
  system's own formatters (`src/components/format.ts`, which gains `useDateFormatter`), the same React Aria locale the
  parts read** → React Aria's `useDateFormatter` lives in a package the system doesn't depend on (react-aria-components
  re-exports only `useLocale`), and format.ts already rebuilds its number and list formatters on it. The invented
  people no longer carry an English date label.
- Map card joined its meta line with a hard-coded " · " → **a `labels.meta` function given the parts, " · " by
  default** → a list format would put "and" before the last count; the dot is a separator the page may want to change,
  which is rule 11's "joins".
- docs/REACT-ARIA.md's "through" named a system file (`through components/gv/Checkbox`) and only the first file that
  brought each React Aria part, so List header showed nothing of its List header cell → **per system part it imports,
  the React Aria parts that part brings, followed however deep, named by its sidebar name (`through List header cell:
  `Button``)** → a reader looks for parts, not files; listing each part's own set keeps the attribution true where two
  parts bring the same React Aria part. Five guides named a React Aria part that doesn't exist under that name
  (Checkbox and Switch are CheckboxField/CheckboxButton and SwitchField/SwitchButton) and now follow the table.
- A recipe's line in docs/COMPONENTS.md took its component's Purpose (Form validation read as Form) → **a recipe's own
  comment above its meta wins**; a part's Purpose ends at the first sentence end (". ", "? ", "! "), never at a
  semicolon.

## Report parts (30 Oct 2026)

Calls made while building the report builder's missing parts (benchmark-gaps plan, Task 8d; the back office's deep
dive of the live report prototype against our report view, §4): a document's type, the page stage and zoom bar, the block frame, inline rich text,
the plain stat tile, figure, quote and sortable list.

- The deep dive's `--gv-type-report-*` vs the token grammar ("name what it is, never where it's used") → **`--gv-type-document-display` (44/52 Medium), `-heading` (28/36 Medium), `-lead` (19/28 Regular), `-body` (13/20 Regular), on a family of their own, `--gv-font-family-document` (the interface's family by default)** → a report is one document among others (a printed project page, an export); the four roles are themed together, apart from the interface's, by one line a platform's theme sets at `:root`. Not in Figma, in `tokens/semantic.tokens.json`; the font primitives 19, 44 and the 28, 36, 52 lines join the scales.
- Body 13/20 is the value of `--gv-type-ui` → **its own `document-body` anyway** → a platform's face must reach a document's paragraphs without changing the back office's rows.
- Weights: the prototype draws the title and headings 500, the subtitle 300 → **Medium and Regular** → the system has no Light; tokens win.
- A sheet surface token (white, shadow 1): an unreviewed draft said none (a sheet is `surface-panel`), the plan asks for one → **`--gv-surface-document` (white, the panel's value) with `--gv-shadow-raised`, on the `--gv-surface-tertiary` stage** → `document` is the word the type roles already use, so a platform's theme can set a document's paper (cream, say) with its face and leave every panel white; `sheet` would have been a component word. A new place role in the grammar; the pair with `surface-panel` is explained in the near-duplicate guard.
- The lead number "in the accent": `--gv-text-accent` is a retired name (renames.json splits it into link, brand and icon-brand) → **`--gv-chart-highlight` (teal 500, as `surface-accent-strong`)** → the earlier audit's "one rule (accent = named in the finding), one chart token": a highlighted bar and a highlighted figure are the same mark, and a retired name must never come back with a new meaning.

## The AI assistant (30 Oct 2026)

Calls made building Components › AI, the Activity feed, the Assistant panel and Side panel's new head options
(benchmark-gaps plan, Task 8c; the back office's deep dive of the report builder, §3).

- `wip/ai-parts` (unreviewed, mid-build) vs a fresh start → **kept its Item chip, Chat message, Chat progress and
  Prompt composer, reviewed**: words moved onto `mergeLabels` and phrase functions (`added`, `removed`), the
  "Who: " joins and the rename arrow out of JSX text, the composer's missing stylesheet written → the parts matched the
  deep dive's table and the prototype; only the words and the missing CSS were wrong.
- An accent mark had no semantic token (the spinner, the done tick, an added chip's edge, an assistant run's edge) →
  **two new semantic tokens, `--gv-icon-accent` (teal 500) and `--gv-border-accent` (teal 400)** → the prototype
  draws all four in the accent teal; painting with a primitive is not allowed, and `--gv-surface-accent-strong` is a
  fill.
- Prototype radii 16 (composer, your bubble) → **radius 14**, the nearest token; the openings' heading and Side
  panel's title at 15/22 → **Title 16/24**, the nearest type token (14 and 16 are equally near; Title is already the
  panel and modal title).
- Where the AI parts sit → **a new Components group, AI** (Item chip, Chat message, Chat progress, Chat thread, Prompt
  composer, Prompt suggestions) → generic: the survey editor and input analysis will draw the same parts; none speaks
  reports. The Activity feed goes to **Data display** (a version history, not an assistant part), the assembled
  assistant to **Patterns › Report builder › Assistant panel** (its words, Generate and the account manager, are the
  report builder's).
- Prompt suggestions' assistant-off look: a `variant` or a `kind` → **`kind="prompts" | "preview"`** (API rule 2: it
  changes what a row shows, a description and no press, not its fill).
- Side panel's titled head: a new `title` prop beside `label` vs a look switch → **`headingLevel`**: with it, the
  label renders as a heading in Title type → one string, no alias (rule 9), and a title is a heading where the context
  label isn't one; `icon` adds the 16 kind icon.
- Side panel head-less: hide the head of the same dialog vs a different element → **`showHead={false}` on an inline
  panel renders a named region, not a dialog: no ×, no Esc, no focus taken on load** → the assistant is the column's
  resting state; a dialog that grabs focus when the page loads and closes on Esc would fight the page.
- Chat message's Undo vs a Toast's → **Undo and Show what changed stay on the message for the whole thread; a used
  Undo turns off and stays** → the deep dive found two Undo toasts stacked over the panel; a Toast is global and
  short-lived.
- Focus when what had it goes away → **the composer's field takes it**: after a pressed opening hides the openings
  (Chat thread) and after the scope chip's × removes the chip (Prompt composer); a made choice keeps focus on its
  group → focus never drops to the page.
- A long thread → **Chat thread follows the latest turn while you read it (a ResizeObserver catches streaming) and
  shows "Jump to latest" once you scroll up** → the deep dive lists jump-to-latest as missing from the prototype.
- The assistant-off thread at 45% → **dimmed and `inert`** → the prototype's `pointer-events: none` left it reachable
  by keyboard.
- The Activity feed's prompt quote → **`<q>` inside a blockquote**: the browser draws the locale's quote marks, so no
  quote characters are stitched into the words; the "·" before "Showing now" is a drawn separator (CSS content with
  empty alt text).
- Activity feed changes → **all shown up to `changesPerPage` (10); past that, behind "Show N changes" with a
  Pagination** → the prototype's run lists 146 chips behind a pager.

## Proof anyone can rerun (30 Oct 2026)

Calls made while building `npm run check`, `npm run break-it`, Overview › Checks and Overview › AI assistance, and
describing every prop (the benchmark plan's Task 7).

- Where Overview › Checks gets its words and counts: read each test file's own comments at build time, or a list →
  **a hand-written plain-words line per guard in `src/overview/guards.json`; the counts in JSON written by the scripts
  (`checks-last-run.json` by `npm run check`, `break-it.json` by `npm run break-it`)** → the files' comments are
  written for developers and vary; `tests/checks-page.test.mjs` fails on a guard with no line, so the page never hides
  one, and rerunning either script refreshes the page.
- What `npm run break-it` runs: everything, or the cheapest check that catches each fault → **the typecheck and every
  unit guard, one after the other, on a copy (no build, no browser, about a minute and a quarter), after a clean run
  that leaves out any check already red** → each of the four faults is caught by one of them; running all of them shows
  every guard that bites, not only the one we expected. Side by side they raced for memory once and read as red.
- "A missing label" → **an icon-only button with its `aria-label` dropped** → the commonest unlabelled control in the
  back office; Icon button's types require the label, so the typecheck catches it before any browser.
- `npm run check` and the shared machine's lock → **the script takes no lock and honours `E2E_PORT`** → the lock is this
  machine's habit, not the repo's; the brief wraps the call.
- Props that pass a library's prop through under the same name → **described in our words, with a link to React
  Aria's page where its behaviour is React Aria's** → the plan allows the link; the report lists pure pass-throughs by
  name already.
- The index's name-only lines → **Base included: every Base part's doc comment says what it is for and which Component
  to use instead** → an agent searching docs/COMPONENTS.md reads Base lines too; the guard covers every entry.

## Developers' side and orientation (30 Oct 2026)

Calls made while building Overview's developer and orientation pages, the seam stories, Voice and tone, the Word list
and the copy check (benchmark-gaps plan, Tasks 4 and 5).

- Circuit's six lifecycle stages vs the plan's three → **draft · candidate · stable, plus deprecated as a mark**
  (Overview › Lifecycle) → three stages are enough for about 120 parts and one reviewer; nothing is stable until a
  developer has reviewed its API, and Not in Figma doesn't hold a part back.
- Where the seam stories live: an Overview page, or a recipe → **Patterns › Recipes › Integration seams, one story per
  seam with a play function, plus `e2e/seams.spec.ts`** → the story smoke test skips Overview entries, and Form
  validation already set the recipe shape; e2e waits for the state only a finished play function reaches.
- The seams' stand-ins (router, form library, translate function, server) vs real libraries → **a few lines each, in
  the story file** → no new dependency (AGENTS.md rule 8); react-hook-form's own recipe stays on For developers.
- The React Aria table written by hand vs read from the code → **generated into `docs/REACT-ARIA.md` by
  `scripts/react-aria-table.mjs`, run by `npm run components:index`, kept fresh by a test, shown as Overview › What
  comes from React Aria** → it follows every new part without anyone remembering to; a component page's "Behaviour from
  React Aria's …" line reads its row.
- CSS size per part from a build report vs from the files → **measured from the shipped source CSS when Questions for
  developers opens (size and gzip, per stylesheet and in all)** → the package ships source, so that is what a host
  bundles; a number written into a page would go stale with the next stylesheet change.
- "Citizen" vs "resident" → **resident, and "citizen" goes in the Word list's Avoid column** → the back office never
  says citizen (0 uses in `backoffice/src`) and calls the people of the place residents; not everyone who takes part
  is a citizen.
- Delete vs Remove → **Delete for gone for good, Remove for out of a group or role** → the Users page already uses them
  that way ("Delete user", "Remove from group").
- Title Case in headings: a list of allowed headings vs a rule → **a rule: every word after the first capitalised
  (small words aside) and one of them not a name fails** → part names and product names keep their capitals without a
  list per page.
- Test-only entries in the sidebar: none today → **a `test-only` tag hidden from the sidebar, and a guard on story names
  that say test, e2e, fixture, harness or debug** → the public tree stays clean when the first one lands; a Controls
  playground is for readers and stays.
- Spacing's "which token" table: semantic tokens only, but spacing has one tier → **the space scale itself, by job**
  → the space tokens are not primitives in the colour sense; there is no named spacing tier to point at.

## Compose without CSS (30 Oct 2026, benchmark gaps)

Calls made while adding Stack, Inline and Grid (Components/Layout & containers) and the guards around them: the
benchmark asks that a screen be composed from parts with no CSS of its own.

- Grid beside Tile grid ("never two grids") → **two parts with one line between them: Tile grid is many like tiles in
  as many equal columns as fit, wrapping to the width (`minTileWidth`); Grid is a page's distinct regions in columns you
  name (`columns`, `areas`, Grid item's `area` and `columnSpan`), kept at every width. Grid has no auto-fit, Tile grid
  no areas or spans** → the two answer different questions (how many fit vs where each region goes), as Amsterdam's
  Grid (a fixed column grid with cells) and the back office's Stat tile rows show; one part doing both would need
  modes that exclude each other. Each one's doc comment sends the other job to the other.
- Spacing props as numbers (Grafana's multiplier, our `size={32}`) or names (Amsterdam's short list) → **the token's
  step as a string: `gap="16"` is `--gv-space-16`; `gap={16}`, `gap={13}` and `gap="13px"` don't compile
  (`tests/types/layout.tsx`)** → it names the token rather than a pixel count, so the scale stays closed, and the
  type lists every step it takes.
- Inline's wrap as a boolean (`isWrapping`, true by default) or a value → **`wrap: 'wrap' | 'nowrap'`, `wrap` by
  default** → a boolean that is on by default reads as a negative to turn off (API rule 1); the value is CSS's word.
- Layout props as inline styles or data attributes → **the TSX sets `--gv-stack-*` / `--gv-inline-*` / `--gv-grid-*`
  from the props (each a `var(--gv-space-*)`) and the part's stylesheet reads them; alignment is a data attribute**
  → seventeen steps times six props as attribute rules would be a stylesheet of lists; a token reference in a custom
  property is still a token, and the caller's `style` merges after.
- "No outer margin" needs a line for what outer is → **the part's root: the element that takes the caller's
  `className` (or, for a part that takes none, its first `gv-` block); a margin other than 0 on a rule whose subject
  carries that class fails `tests/no-outer-margin.test.mjs`. A sub-part rooted on its parent's `__element` (Side
  panel's sections and actions) is the parent's inside, and so is a parent spacing its children** → the page owns the
  space around a part (a Stack's gap); the inside stays the part's. Two remain, listed in the test because removing
  them changes the look: Coachmark's 12 to its trigger (React Aria places the overlay, so it never meets a page's
  layout) and Phone preview's picture bleeding to the screen's edges.
- Grid on a narrow screen → **keeps its columns; tiles that should wrap are a Tile grid** → the back office is a
  desktop admin; responsive areas wait for a page that needs them.
- The back office's own paint with no part to carry it (the grey ground and body type, the white page bar and project
  columns, the Gap's dashed frame) vs keeping it in `layout.css` → **two parts: the App frame pattern (the Side nav's
  column and the page on `surface-app`, in UI type and the body colour; App frame panel for a white, rounded region
  with no border or head) and the Missing part component (the Gap's frame, "Missing: <name>", or a dashed outline
  inline)** → zero paint left in back-office CSS; both are what every back-office page already drew, now with a page
  each. Missing part follows the prototyping placeholders other systems ship (a named, dashed stand-in).
- A Modal or a floating Side panel took its type size from the page's `body` (portalled there) → **both set UI type on
  their root, as Popover and Dialog already do** → a host that sets no body type still gets the system's.
- Text inside a React Aria item that isn't one of its slots (a count at the end of a List box row) → **Text takes
  `slot={null}`** → React Aria's way out of a part's slots; the prop type said string only.
- The back office's page bar: a local bar with a body-strong title vs Page header → **Page header (Title type, the trail
  to the parents above it, the line about the page inside the head) in an App frame panel** → one page head; the bar
  keeps its white look.
- Back-office looks that no part paints, after its CSS went to zero paint → **dropped, not kept as page CSS: dates and
  statuses in table cells no longer `nowrap` (they may wrap in a narrow cell); report outline names wrap instead of
  ending in "…"; report zoom scales the sheet's box, not its text (`zoom` is paint-adjacent and only some engines
  honour it); the inspiration hub quote's and the report prompt's side rule; the settings side list's faint divider
  (Tabs' vertical list draws its own, in `border-default`); the tools' grey picture tile (a Missing part names the
  missing illustration); the inspiration hub's "Highlighted" stamp is a Badge in the tags row. Tile widths snap to Tile
  grid's steps (160, 220, 280, 360): community monitor stat tiles 180 → 160 and cards 420 → 360, project templates
  240 → 220, the messaging split 380 → 360, tool cards 320 → 280, webhook events 180 → 160, phase tiles 140 → 160** → a look the system can't carry
  is either a system part to add (as App frame and Missing part were) or a Missing part; keeping it in a page's CSS is
  what the benchmark counts against us.

## Words, locale and edge cases (30 Oct 2026)

Calls made while emptying the words guard's `TO_CONVERT` list, adding the Locale toolbar and the edge-case stories (benchmark-gaps plan, Task 6).

- Data table's `loadingLabel` prop vs a `labels` key → **`DataTableBody`'s `labels.loading` (`dataTableBodyLabels`, extending `LoadMoreLabels`), the prop removed** → API rule 11 has no one-off word props; nothing passed it. The default keeps its "…" ("Loading more…"), not the starters' "...".
- The multilingual fields' words → **one `MultilingualFieldLabels` (extending Locale switcher's and Required marker's; the switcher's marks are `mark…` keys so they never meet Required marker's `required`) for Multilingual text field and the hook every multilingual field shares; Multilingual rich text editor's extends it with the editor's** → a field hands the switcher and the Required marker its words, as rule 11's "a part that draws another's words hands them on". The joins ("EN, English, filled") and the "1/3" count are labels too, so a host can reorder them.
- Locale switcher's `new Intl.DisplayNames([inLocale])` read as a fixed locale → **the guard flags an Intl formatter only when its locale argument holds a literal** → the names follow the locale the part is handed (React Aria's), which is what rule 11 asks.
- A Data table's loading and error states: a part of their own vs stories that compose them → **stories (Components/Tables & lists/Data table: Empty · nothing yet, Empty · no results, 1 row, 1,000 rows, Loading · first load, Loading · refresh, Error · first load, Error · refresh, No permission) built from Empty state, Skeleton, Banner and Panel** → each is a composition of parts that exist; a `state` prop on Data table waits for a second use. First load draws Skeleton rows in the table's columns; a refresh keeps the rows (`aria-busy`), since swapping rows someone is reading for placeholders loses their place; a failed refresh keeps them under a Banner.
- Text field's help beside the counter ran a long German compound under the count → **the help and the error break inside their row (`overflow-wrap: anywhere`)** → seen in the new Long German labels story; a word that can't wrap must still not cover the count.
- The edge-case stories in both directions → **`e2e/stories.spec.ts` renders the ones named for an edge (Empty…, No rows, 1 row, 1,000 rows, Loading, Error, No permission, Long German labels, Arabic) a second time with `globals=direction:rtl`** → every story twice would double the smoke run; these are the ones the plan names.
- Overview › Accessibility's scan date in `toLocaleString('en-GB')` → **kept** → it is a docs page, not a part: nothing imports it, its prose is English, and a host never renders it. The guard reads parts (`src/components`, `src/patterns`) only.

## Back office: the project lead's asks (30 Oct 2026)

- Users: "Pagination on every admin table" (below, prototype review) vs the project lead's virtualised Users tab → **the Users list is one virtualised table (5,012 people, the twelve and 5,000 invented residents), no pages; the header's select-all ticks every row the list and search leave (`toKeySet`), the table as tall as its rows up to 70% of the window** → a real platform's users run to thousands; the Data table's "Virtualized" story is the recipe. The other admin lists keep their pages.
- Manage tab, Map: the story's map has a fixed centre and zoom, the page's ideas spread wider → **the page's map has no `center`, so it opens fitted to every idea with a place; a List / Map Segmented control in the toolbar; in Map the whole filtered list sits beside the map in one column (no pages, no checkboxes; the selection made in List stays); no add-by-click Banner** → every pin in view on arrival; the page has no "add an input here" flow behind a click yet, so it doesn't promise one.
- Manage tab, Map: the open idea opens the Side panel in List, but the floating panel would cover the map's list → **in Map an open idea is its pin's card and its row's mark; the card's "Open idea" opens the Side panel** → the list stays usable for hover and picking; one open idea for the map, the list and the panel.
- Multilingual call sites: a new title in every language vs the one the list shows → **the platform's four languages (Settings' list) on every title and name the plan names: the platform name, the phase title (Title field with a `LocaleSwitcher kind="menu"`) and its description (Multilingual rich text editor, the same menu drives it), the project, event and new phase titles, the new project from a template, the custom page title, the group name; the report block heading takes the page's editing-language Select (`showLocaleSwitcher={false}`)** → as the platform's Multiloc. Add phase, Create project, Save group and Save custom page need only the first language (the one lists and the slug show), and the switcher marks the others as still to fill: a language left empty shows the English, as the navbar names already say. The navbar item's name keeps its one-field-per-language form (not on the list).

## Component pages (30 Oct 2026)

Calls made while building the component page (the benchmark plan's Task 1: usage guidance on every part).

- Where a part's guidance lives: the Docs tab (an MDX page per part), the doc comment, or a file of its own → **one Markdown file per part, `<Name>.guide.md` beside its stories, read by the docs page, the components manifest and docs/COMPONENTS.md** → a designer can read and edit plain Markdown; one file per part lets writers work on different groups at once without touching the same file; MDX pages would replace the autodocs page and mix JSX into the words. The doc comment keeps the one-line Purpose.
- "Use X instead" where agents see it: the plan says the doc comment, since the manifest reads doc comments and props, not the Docs tab → **the Storybook build adds each guide to its component's manifest entry (`experimental_manifests` in `.storybook/main.ts`): the whole guide as a doc (the MCP's `docs-show` prints it under Docs) and "When not to use" under the description; `npm run components:index` adds a "Not for" line under the part in docs/COMPONENTS.md** → the same file reaches the page, the manifest and the index, with no copy in the doc comment to drift. The hook is Storybook's experimental API; if it changes, docs/COMPONENTS.md still carries the line.
- The "not written yet" list: a hand-kept list in the guard vs derived → **derived: a part with no guide is not written; a guide that exists must be complete; `WRITTEN_LATER` freezes the 98 parts missing on 30 Oct, so a new part must arrive with its page** → parallel writers never edit a shared list; deleting the frozen list is the last step.
- What counts as a part: the plan's 83 (57 Components + 26 Patterns, 29 Oct) vs today's tree → **one docs page under Components/ or Patterns/ (one stories file), Patterns/Recipes/ left out: 101 parts, 77 Components and 24 Patterns (Stack, Inline and Grid landed the same night)** → a recipe is markup to copy with no "use instead"; Base is primitives with their own one-line page.
- Which parts owe a keyboard table: a hand list vs the code → **the guard reads the part's code: it handles presses or keys, renders a React Aria part that takes focus, or renders one of the system's parts that does (followed through local imports); App provider is the one exception (its toast region's keys are Toast's)** → 74 of 101 parts are interactive; the call can't drift from the code.
- Keyboard tables that claim more than is tested → **every row names its proof, an e2e spec or a story's play function, and the guard checks it exists; `e2e/play.spec.ts` runs every play function** → the table is a spec a rebuild on another base library could be accepted against (rubric D4). Button, Data table and Side panel each gained a `Keyboard` story.
- Panel read as interactive by the guard (its count Badge can draw a ×) → **Panel joins the guard's `NOT_INTERACTIVE` list; its page says "Not interactive"** → Panel never passes `onRemove`, so the Badge it draws takes no focus; its actions and body keep their own keys on their own pages.
- Status before Task 5 tags the parts → **the page reads a `status:<stage>` tag and shows "Draft" without one** → nothing is stable until a developer has reviewed its API.
- Data table's stories named no component, so its page had no Purpose or props and its index line no export → **`component: DataTable` on the stories, and the doc comment moved onto the export with a first sentence saying what it's for**; Button got its first doc comment.
- Provenance's shape, which each writer would otherwise invent → **three bullets: "Built by agents from …" (Figma's
  part, the prototype, or both, with what is Not in Figma), "Reviewed by a person: not yet" (no review of a part is
  recorded in the repo), "Known limits: …"** → the same three facts on every page, honest by default.
- Map view has no WAI-ARIA pattern to link → **the Button pattern for its pins, and "one Tab stop, arrows inside" as a
  composite widget, in words** → the guard needs an APG link; the pins are buttons, and the shared Tab stop is React
  Aria's composite behaviour (docs/DECISIONS.md, "Maps").
- `e2e/component-page.spec.ts` showed Avatar as "a part with no guide", which stops being true as guides land → **the
  test finds an unwritten part from the files and skips when none is left; Avatar's written Provenance gets its own
  check** → the test keeps proving the unwritten page without naming a part that a writer is about to write.
- Forms pages (Task 2): a plain text input (Text field, Search field) has no WAI-ARIA APG pattern, but the guard asked
  every interactive part to link one → **the page says "No WAI-ARIA APG pattern covers a plain text field…" and the
  guard takes that sentence in place of a link; a text part with a list or toolbar in it (Title field, the rich text
  editors) links that pattern** → linking an unrelated pattern would mislead; saying there is none is the honest page.
- Forms pages: Select's popup cited as the APG Listbox pattern, not the Select-only combobox → React Aria's Select is a
  button that opens a list box, which is what the keys do.

## Maps (29 Oct 2026)

Calls made while adding the Map view (Components/Data display): an external review found maps uncovered, and the ideation phase's Manage tab shows ideas on one.

- Map engine: the prototype draws MapLibre with OpenFreeMap's tiles, the platform uses ArcGIS → **a `MapEngine` interface (project, unproject, view, zoom, credits, events) behind the Map's `engine` prop; MapLibre + OpenFreeMap's positron style is the default (`maplibreEngine()`), imported on demand from `map/maplibre.ts`, the one file that names it** → pins, card, zoom buttons, overlays, legend and credits are the system's and know no engine, so the front-end team swaps in ArcGIS (MapView's toScreen, toMap, goTo) by writing one file; the engine and its stylesheet load only when a map draws (a lazy chunk, not in the main bundle).
- The name `Map` shadows JavaScript's global Map in every file that imports it (Map.tsx itself had to write `globalThis.Map`) → **`MapView`** (title Map view, file MapView.tsx; its parts keep `MapPin`, `MapCard`, `MapOverlay`, `MapChip`, `MapLegend`) → a page that imports the map and builds a `new Map()` would get "not constructable" from TypeScript, a trap no name is worth; the steward's call at the merge, overriding the builder's `Map`. Lucide's map icon is still imported as `MapIcon`.
- Selection: `value` / `onChange` vs `selectedKey` / `onSelectionChange` → **`value` / `defaultValue` / `onChange(key | null)`** → the open pin is one value (API rule 7); React Aria's collection names stay with the parts that pass through to a React Aria collection (Tabs, Menu, Data table), which the map is not. The list beside it marks the same item with Data table's `openKey`. The steward's call at the merge, overriding the builder's `selectedKey`.
- `center` / `zoom` as a lock vs a starting view → **the first view, and a move when the page changes them; never held: people pan and zoom freely and `onViewChange` reports where they stopped; with no `center` the map fits its items** → a map that snaps back fights people; the configure screen's "Save zoom" reads `onViewChange`.
- Pins as the engine's symbol layers vs elements over the canvas → **engine-free buttons over the canvas (`MapPin`), placed on every camera frame without a React render** → focusable, named by their label, painted with tokens, and the same on any engine.
- 120 pins, 120 Tab stops → **one Tab stop for the pins (the last focused, else the open one, else the first in view); the arrow keys go to the nearest pin within 45° of that direction; Enter opens, Esc closes and keeps focus on the pin** → React Aria's composite pattern (one stop, arrows inside); arrows keep screen directions right to left, since a map is not mirrored. Tab order: the map canvas (arrows pan it), the pins, the zoom buttons, the credits.
- Pin states → **default: a 14 dot in its tone (`tone`, the system's tone set) with a white ring; hot (hovered, or `hoveredKey` from a list): 18, near black (the prototype's); open: 18 in the selected accent with a wider ring; a cluster: a 28 disc with its count, pressing it zooms in** → the prototype's states, in tokens.
- Clustering on vs off → **opt-in `isClustered`, off by default (the prototype at city zoom shows every pin); the open and the hot pin never fold** → cheap (a grid on the Mercator world, stable while panning), useful for a city-wide project, wrong when the list beside it needs every pin in view.
- The prototype's info banner draws over the open card → **the card rises above the overlays** → it is what the person just asked to see.
- A click on the ground with a card open: close the card or add an input → **close the card first; the next click adds (`onMapPress`)**, and Enter on the focused map adds at its centre → a click that dismisses must not also create; the keyboard needs a way to add.
- The tiles' credits as the engine's HTML control vs the system's → **read as text (`parseCredits`: words and http(s) links only) and drawn by the Map, always visible at the bottom end** → the licence asks for it, and no markup from a tile server reaches the page.
- The "N ideas without a location" note and a legend → **`MapOverlay` (a corner: top-start, top-end, bottom-start, bottom-end, mirrored right to left) holding a `MapChip` (a count, a button when it lists them) or a `MapLegend` (static pins with their words; no items = "No legend", as the configure screen)** → engine-free parts the page places; a Banner goes in an overlay as it is.
- The Manage tab's list + map → **a story recipe, "In the Manage tab", on the Map entry; not a Pattern** → one page uses it so far (NAMING: a Pattern once two pages share it).
- A pin under the pointer marking its row → **not drawn yet: Data table's rows take no hovered state from the page** → a follow-up for Data table (a `hoveredKey` beside `openKey`); the row → pin direction works (`hoveredKey`).
- Sizes with no token → **the card's 280 width and the map's 240 least height stay raw, each with a note** → no layout size tokens yet (as Tile grid's widths).
- Rotation and pitch → **off: a flat, north-up map** → the back office's maps are for placing inputs, and a turned map loses people.
- Strings → **fixed English labels (Zoom in, Zoom out, the cluster's "N pins: zoom in", "The map can't be shown here.")** → as the other components' built-in words today.

## Long lists (29 Oct 2026)

Calls made while making Data table virtualise (an external review: nothing supported the admin's users and inputs lists, which run to thousands of rows).

- A second component for long lists (React Aria ships a `Virtualizer` around the same Table) vs a switch on the one table → **`isVirtualized` on DataTable: the same parts, look, keyboard, sorting, bulk selection, open row and `toKeySet`** → a page turns it on past ~200 rows without rewriting its table; two tables would drift apart.
- A pixel `rowHeight` prop vs the table's own row → **`rowLines={1 | 2}` (one line, or a line over a sub-line), the heights the stylesheet's (tokens) for each density** → a page names what its rows hold, not a number that goes stale when the tokens move; every row one height is what the layout needs.
- The layout needs numbers, the look lives in tokens → **the stylesheet sums the row, header, check and "…" sizes into four registered `--gv-data-table-*` lengths, and the table reads them in px before its first paint; `virtualMetrics()` holds the same sums as a fallback, and a unit test keeps the two equal** → one source (the tokens) for both tables, with no second set of constants to keep in step.
- `:first-child`, `:last-child` and the selected run's corners need siblings in order, which a virtualised table's reused, absolutely placed rows and cells aren't → **the table marks its own edges, last row and run ends in the page (`data-edge`, `data-last`, `data-run`, from `aria-colindex` / `aria-rowindex`), and the stylesheet reads those when virtualised** → the plain table's rules stay as they were (its computed styles unchanged); the marks are kept in step as rows scroll in.
- Grid columns from CSS vs React Aria's layout → **the layout places the columns: evenly, or by a column's `width` (`200`, `"30%"`, `"2fr"`); the check, "…" and "+" columns get their stylesheet widths** → the virtualised rows are positioned boxes, not a CSS grid, so the layout has to know each width.
- The open row as a prop each row reads → **the table marks it in the page (`data-open`, `aria-current`) from `openKey`, both modes** → with 5,000 rows, opening one rebuilt every row (about 300 ms); now about 70–110 ms, and the mark survives the row scrolling away and back.
- React Aria moves focus on Page Up / Down, Home and End but left the browser's own scroll on (1.22, a table without selection-follows-focus), so the view jumped a second time, past the row and under the pinned header → **the table keeps those keys (outside a text field), in both modes; a focused row stops below the header (`scroll-padding`)** → one move per key, as in a list; the plain table's page no longer scrolls under a Page Down either.
- Window scrolling (React Aria can virtualise against the page) vs a bounded height → **the table scrolls inside itself with its header pinned; it needs a height (`style`, or a parent with one) and warns once in development without one** → the admin's lists sit in panels under a toolbar, where a pinned header is the point.
- A virtualised table has no content width of its own → **it fills its container's width; noted in the recipe** → the plain table grows to fit its rows; a positioned layout can't, so a shrink-to-fit parent collapses it.
- A framed table's border made the layout measure itself without end (a `width: 100%` block 2px wider than its box) → **the virtualised table is border-box, as a plain table's width already is** → the same outer size in both modes.
- Cells of any height vs one height per row → **each virtualised cell keeps to its line and clips with an ellipsis (`__fit`, 4px of room for a focus ring)** → a taller cell would spill over the next row.
- Paging as a separate pattern vs infinite loading → **`DataTableBody`'s `onLoadMore`, `isLoading` and `labels.loading` ("Loading more…"), on React Aria's load-more row** → it was cheap: React Aria fires it as the last row nears the view, in either mode; the page passes `onLoadMore` only while more remain.
- Rows by `.map()` vs `items` with a function → **the recipe and stories use `items`** → React Aria reuses the rows it has built for unchanged items; `.map()` rebuilds all of them on every change.
- Right to left by the page's `dir` vs React Aria's locale → **the virtualised layout follows the locale (`I18nProvider`)** → React Aria places the columns from the locale's direction, as every other component's keyboard already does.
## Structure: one place for each part (29 Oct 2026, architecture review)

Calls made while reshaping the tree (the review's structure moves). Newest first.

- The scaffold plan in `docs/plans/` (a plan whose Task 7 never landed as written, with an instruction to execute it) vs current docs → **`docs/history/`, with a line on top saying it is history; DESIGN.md's deploy, `.storybook/` and Back office lines and NAMING's "deprecated: None today" now say what the repo does** → an agent reads a plan as work to do; a folder named history doesn't invite that.
- Base's stylesheets selecting React Aria's global classes (`.react-aria-Button`: any unclassed React Aria element on the page, a host app's included) vs scoping them → **`npm run css:scope` (scripts/scope-base-css.mjs): every element the system renders that a Base stylesheet styles gets `gv-base-<x>` beside `react-aria-X` (keepClass's extra, the class string, or a className on a bare element), and the stylesheets select `.gv-base-<x>`; the five names no system element carries (React Aria renders them by itself, or nothing renders them yet) are scoped by their part (`:where(.gv-base-tree) .react-aria-TreeLoader`, `.react-aria-ModalOverlay:where(:has(> .gv-base-modal))`). 87 names, 86 files; screenshots of all 581 stories before and after match (the two that differ are a spinner turning)** → a script, not a hand edit, so it can be re-run on a newer main after the other packages land; `:where` keeps every selector's specificity, so the cascade between Base and the Components is unchanged. Utilities' generic classes (`.indicator`, `.track`, `.inset`, `.button-base`) are still global: a follow-up.
- Stylesheets reaching into other parts' classes (22 files, 55 classes) vs a rule with no guard → **`tests/own-block.test.mjs`: a gv or pattern stylesheet selects only the `gv-…` blocks its own TSX writes, plus states and elements; the remaining 54 in 21 files are an allow-list that fails both ways (a new one, or one that is gone), so it only shrinks. One fixed: List header places its cells with its own `gv-list-header__cell`** → a placing class is the className contract, so no restyle. The others need a prop or a custom property on the child (a disabled segment, a quiet checkbox, a compact badge) or a starter class the wrapper doesn't expose yet (H3), and stay listed. The New dot's two placements wait: the strings builder is editing those lines.
- Story fixtures inside the Components folder (`gv/story-data`, `gv/story-images`), one of them imported by a back-office page → **`src/stories/data` and `src/stories/images`; a guard keeps every Component and Pattern off them and the back office off story data; the phase page's pictures stay the one borrowed path until the back office has its own (a follow-up for its author)** → story data is not system API, and the folder says so; copying the pictures into the back office is its author's call, not a call-site change.
- Section label in Layout & containers, though it is a text role, beside the new Text and Visually hidden → **Components/Text/Section label; the rename table's "Figma new" says `Text/Section label`, so the designer's pending Figma pass (30 Oct) types the new group once** → Polaris' "Typography and content" and Atlassian's "Text and data display" keep labels with text; the Figma checklist hasn't run yet, so moving it now costs no second Figma rename. Old links redirect.
- The list page's kit spread over Data display (Data table, Table toolbar) and Patterns/Lists (Filter chips, Filter menu, Selection bar), though the three have no Go Vocal words and every list page uses them → **one group, Components/Tables & lists, by story title only; Patterns/Lists is gone; no file moves (the folder codemod comes later), old links redirect** → one obvious place for a list page's parts, as Carbon and Primer keep filter controls in Components. List header, List header cell and List row stay in Data display: they are Figma components, and their fate waits for Figma (deferred).
- Link, Radio group and Checkbox group: Base parts that pages import most (5, 5 and 4 pages) → **Components (Navigation › Link; Forms › Radio group, Checkbox group), exported from `govocal-ds` and no longer from `govocal-ds/base`, tagged `not-in-figma`; files stay in `src/components/` until the folder codemod** → promote on the second use (docs/NAMING.md); Choice card already sits inside a Radio group. Their story ids moved (`base-link` → `components-navigation-link`, …) and old links redirect.
- Base hidden from the sidebar vs Base shown as a second menu of parts → **shown, last, as primitives: an Introduction page first, and the same one line on every Base entry's docs page (one `docs.page` in `.storybook/preview.tsx`, not a note per story file); docs/COMPONENTS.md lists Base last, each line marked `(primitive)`** → pages still need a few of them (dates, colour fields, list boxes, disclosures), so hiding them would send a designer to code to find them; the line tells them to reach for a Component first.
- The review counted 22 dead starter parts; on today's main 5 of them are used (Separator through the barrel; Disclosure group, Toolbar and Tree by the Report view; the starter Segmented control was already gone) → **17 deleted: Breadcrumbs, Colour area, Colour picker, Colour slider, Colour swatch picker, Colour thumb, Colour wheel, Combo box, Command palette, Drop zone, Input group, Navigation tree, Progress bar, Sheet, Slider, Toggle button group, Token field; their `govocal-ds/base` exports go with them** → a part nothing reaches but its own story is a sidebar entry the product never uses. Old links open the docs of the entry that replaces it (Breadcrumbs, Segmented control, Side panel) or a page about Base.

## Words and locales (29 Oct 2026, strings)

Calls made while taking every fixed English word and fixed locale out of the parts (docs/API.md point 11).

- A translation layer in the system (message ids, its own provider) vs words handed in by the page → **no translation
  layer: every part takes its words from the page, as content props or `labels` over English defaults (`xLabels`),
  and numbers, lists and dates follow React Aria's locale (`AppProvider`'s `locale`)** → the platform's own component
  library already works this way: `front/app/component-library/components/SearchInput/index.tsx` takes its words as
  plain string props (`ariaLabel`, `a11y_closeIconTitle`), and nothing in `front/app/component-library` calls
  `formatMessage`. The platform owns its messages and its translation pipeline (about 30 locales); the system owns
  none, so a part never goes stale against them.
- Where a word goes: a prop or `labels` → **what belongs to the instance stays a prop (`title`, `label`,
  `aria-label`, `placeholder`, `emptyLabel`, `children`), its English default moves into `xLabels`; the part's own
  words (a control's name, a state, a count, a join) are `labels` keys** → a page sets its content where it uses the
  part and its labels once, from its i18n. The one-off word props (`closeLabel`, `dismissLabel`, `cancelLabel`,
  `backLabel`, `togglePanelLabel`, `addLabel`, `removeLabel`, `searchLabel`, `deleteLabel`, `openLabel`, `maxLabel`,
  `submitLabel`, `postedByLabel`, `passLabel`, `statusLabel` on Tab, `itemName`, Help popover's `label`, the ranking's
  `unit`) fold into `labels`, call sites renamed in the same commit (no aliases).
- A count's words → **`CountLabel = (count, formatted) => string`**: the host's plural rules need the number, and the
  English defaults print the locale's "1,284" / "1.284". Other values arrive formatted (names, "42%", "3 of 124"); a
  phrase around markup is a `ReactNode` function (Alert dialog's "Type **Reset** to confirm", which now names the
  field by `aria-labelledby`; the record head's "Posted by").
- LineChart's and Sparkline's `labels` (the x axis) vs `labels` (words) everywhere else → **the axis is `xAxis`** →
  one meaning for `labels` across the system; the back office's call sites renamed.
- React Aria's `useNumberFormatter` lives in `react-aria`, which the system doesn't depend on (only
  `react-aria-components`) → **`src/components/format.ts` rebuilds the number, percent and list formatters on
  `useLocale`, cached per locale** → no new dependency, the same locale React Aria lays parts out in.
- `ACCESS_WHO_VALUE` (the participant action row's "Sign-in required"…) is a word table the page reads, not words a
  part says → **kept, in English, documented as such**: the page that speaks another language passes its own `value`.
- Symbols drawn as text (–, /, ·, …, the "#" of a rank) → **stay, listed in the guard's allow-list** → punctuation
  between values, not words; the list may only shrink.

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

## Multilingual fields (29 Oct 2026)

- The designer's drawings for multilingual fields aren't in the design-system Figma file (no locale or language frame) → **built from the platform's fields and the prototype's language button; the whole look lives in LocaleSwitcher.css and MultilingualTextField.css, tokens only** → the drawings are pending; the CSS follows them when they land.
- An earlier call (the build plan): no locale switcher, but Tabs with status dots, a quiet Select and the Title field's slot → **one Locale switcher for fields; the top bar's content-language Select stays a Select, Tabs' dots stay for tabbed panels** → about 50 admin files use the platform's switcher; this supersedes the earlier call for fields.
- InputMultilocWithLocaleSwitcher, TextAreaMultilocWithLocaleSwitcher, QuillMultilocWithLocaleSwitcher (the platform) vs "Multiloc" (its data word) → **Multilingual text field (`isMultiline` for the text area), Multilingual rich text editor, Locale switcher; the value's type keeps the name `Multiloc`** → names say what a part is in common words; the platform's word stays on its data, so a value drops in.
- A ToggleButtonGroup (arrows move focus, Space picks) or Tabs (the field as a tab panel) vs a radio group → **a React Aria RadioGroup: Tab lands on the shown language, arrows move and pick, Tab again enters the field** → it picks one value and the field follows; it works alone when one switcher drives several fields.
- The shown chip: the platform's navy, its back-office variant's teal, the Segmented control's white on grey → **the primary fill with white text, the others on the pill grey, 24 tall, wrapping** → the starter's selected toggle and the platform's own look; a segmented track can't wrap for ten languages.
- Marks: red or green on every language (the platform), a dotted circle and no colour (the prototype's menu), Tabs' three dots → **Tabs' 8 dot and colours: green filled, grey empty and optional, amber empty and required, red once invalid** → the prototype's colour rule (amber = needed before publishing, red = wrong or blocking now, grey = optional); red on every empty language cried wolf on optional fields.
- Empty: the platform counts a space as text, the prototype trims → **blank text, or HTML with only tags, is empty; an image or an embed is content** → a title of spaces shows nothing, and descriptions arrive as HTML.
- Required: the platform checks every language or at least one, in its forms → **`isRequired` means every language; "at least one" stays the page's call through `isInvalid` and `errorMessage`; the field never blocks a native submit (aria validation)** → the browser can't check a language that isn't on screen.
- Errors: the platform's `errorMultiloc` shows its first error and jumps to that language → **`errorMessage` takes one message or a Multiloc of them; the field shows the first language that needs work when it turns invalid or a language gains an error, never while errors shrink** → the platform's jump, without moving the field away mid-word.
- A required field's error with no message: none (the platform) vs "Add the title in Dutch and 1 more language" (the prototype) → **"Add the text in French (Belgium) and 1 more language"** → the prototype's wording, for any field.
- Disabled: the platform disables only the input → **`isDisabled` locks the text; the switcher still shows each language** → built-in names are read in every language.
- The platform's `valueMultiloc`, `onChange(value, locale)`, `initiallySelectedLocale`, `onSelectedLocaleChange`, `hideLocaleSwitcher` → **`value` / `defaultValue` / `onChange(value, locale)`, `locale` / `defaultLocale` / `onLocaleChange`, `showLocaleSwitcher`** → the API convention (values, booleans), the platform's shapes kept.
- The switcher's shown language as `value` (the convention's single value) vs `locale` → **`locale` / `defaultLocale` / `onLocaleChange` on the switcher too; `values` are the Multilocs its marks read** → one name for the shown language across the family, so props pass straight through.
- Direction: the platform's input follows the interface → **the input takes the shown language's `lang` and `dir`: Arabic runs right to left in an English page** → Arabic in a left-to-right box breaks its punctuation, and `lang` gives screen readers the right voice.
- Codes only on the platform's chips → **the code shows; its name ("Dutch (Belgium)", Intl.DisplayNames in the interface's language) and its mark are read, and the input is named "Title, Dutch (Belgium)"** → codes suit admins who know them; the name tells everyone else.
- One language: the platform hides its switcher → **the same: no switcher, and no language in the input's name** → nothing to switch.
- The Rich text editor takes no `lang`, `dir`, `isInvalid` or description → **the Multilingual rich text editor turns its text area right to left from its own stylesheet, names it by `aria-label`, and says its error in an alert under it** → a stopgap until the editor takes them (a follow-up for its owner).
- Title field: a slot for the content-language button in the end Figma keeps clear (open decision) vs a Multilingual text field over titles → **the Title field takes `localeSwitcher` (a Locale switcher `kind="menu"`: language icon, code, "1/3" while languages are empty, chevron, the languages in a menu) and `lang`; the end becomes a row, Required marker then the button, and the text stops before it** → where Figma and the prototype put it; the prototype's one button also drives the description under the title.

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
### App shell: notifications and account menu

- The account menu's "Language: English" as one label (its icon fell after the words) vs Menu's submenu checklist (Area) → **Language, the current language as its description line, a check on the chosen one in the submenu; Sign out after a separator** → Menu's own shape; the leaving item sits apart, as Users' removing items.
- The real admin's "Load more…" under its notifications vs our six rows → **a quiet "Show older notifications" under the Notification list; following a notification closes the list** → the older ones on demand; a link that leaves the popover open hides the page it opened.

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

**Not built yet:** a grey avatar variant for assignees and commenters; the chosen-value teal on a dropdown card's pill;
renaming the project from the breadcrumb.
