# The public API

How a page imports the system, what every part accepts from it, and how props are named. Written 29 Oct 2026, when
every Component and Pattern was brought to these rules in one pass, with no aliases left behind (the old names no
longer compile). `tests/system-first.test.mjs` guards the imports and the entry points, `tests/words.test.mjs` the
words (point 11); review guards the names.

## Import from the entry points

Three entry points, declared in `package.json` `exports` (the one list; tsconfig `paths`, the back office's Vite alias
and Storybook's alias all read it):

| Import | What it carries |
| --- | --- |
| `govocal-ds` | Every Component and Pattern with its props types and, for a part with words, its `XLabels` type and `xLabels` English defaults (point 11); the content parts (`Heading`, `Text`, `Header`, `Keyboard`, `Separator`); `PlacementProps`; React Aria's value types (`Key`, `Selection`, `SortDescriptor`, `DateValue`, `TimeValue`, `RangeValue`). |
| `govocal-ds/base` | Primitives: starter React Aria parts no Component covers yet (`Calendar`, `DatePicker`, `Table`, `Tree`, `Dialog`, `Popover`, `ListBox`, `Toolbar`, …). Use one only when `govocal-ds` has nothing for the job. |
| `govocal-ds/tokens.css` | The `--gv-*` tokens. Import once, at the app's root. Each part imports its own CSS. |

```tsx
import 'govocal-ds/tokens.css';
import {Button, EmptyState, Panel, type PanelProps} from 'govocal-ds';
import {DatePicker, Popover} from 'govocal-ds/base';
```

- Never import a file path (`../../src/components/gv/Panel`). The guard fails on it.
- Each name is exported once, across both entry points. Where a Component replaces a starter part under the same name
  (`Checkbox`, `Modal`), only the Component is exported.
- A page that still has deep imports: `npm run api:imports` (or `node scripts/use-public-api.mjs <dir>`) rewrites them
  in place, one import per entry point, names sorted, local names and `type` marks kept. It is re-runnable;
  `--check` exits 1 when a file would change. It leaves (and lists) anything no entry point exports.
- A new exported part goes in `src/index.ts` beside its Storybook group (or `src/base.ts` for a starter part). The
  guard fails until it is there, or listed as internal with its reason.

## className and style place, never paint

Every exported part that renders an element takes `className` and `style` (`PlacementProps`) and merges the class with
its own. Use them to place a part: grid area, width, margin, alignment. Never to paint it: colour, type, padding,
radius and borders come from the part's props and the tokens.

```tsx
<Panel title="Projects" className="projects__list" style={{gridArea: 'list'}}>…</Panel>  // places it
<Button className="red-button">Delete</Button>                                          // never: tone="danger"
```

- A part over React Aria keeps `react-aria-X` and adds the caller's class, and the function form still works:
  `className={({isFocused}) => …}`. Inside the system, `keepClass` (starter parts) and `ownClass` (parts painted with
  their own `gv-…` class) in `src/components/className.ts` do this.
- Base's stylesheets paint only the system's own elements. Each Base part also carries `gv-base-<x>`
  (`react-aria-TextField` → `gv-base-text-field`), and `src/components/*.css` selects that, never React Aria's global
  `react-aria-X`, so a host app's own React Aria elements are left as the app paints them. `npm run css:scope` writes
  both halves (the TSX class, the CSS selector) and is safe to re-run after a merge; `tests/css-scope.test.mjs` runs
  its `--check`. `react-aria-X` stays on every element for tests and queries.
- No part sets a margin on its own root (the element that takes `className`): the space around a part belongs to the
  page that places it, through a Stack's or Grid's `gap` or its own `className`. `tests/no-outer-margin.test.mjs`
  guards it; its short list of exceptions only shrinks.
- A part that must not be restyled (`Coachmark`), or that renders no element of its own (triggers, an item's content),
  takes no `className`: TypeScript refuses it rather than dropping it.
- Inside the system the same holds between parts: a stylesheet selects only its own block (`tests/own-block.test.mjs`).
  A part that needs to place a child passes it a class of its own (List header gives each cell
  `gv-list-header__cell`); one that needs a child to look different asks for a prop or a documented custom property.
  Today's reach-ins are listed in the test, and the list only shrinks.

## The convention

### 1. Booleans are `isX`, `hasX` or `showX`

As React Aria's `isDisabled`. Never a bare adjective, never `hideX`: a negative flips to `showX` with the same default.

```tsx
<Button isFullWidth isIconOnly aria-label="Close"><X /></Button>
<Panel isFlush />                 {/* was flush */}
<Popover showArrow={false} />     {/* was hideArrow; the arrow still shows by default */}
<ListRow hasWarning />            {/* was warning */}
<SideNav isFolded />              {/* was folded */}
```

### 2. `variant` is a shape or fill; `kind` is what a part shows

`variant` picks a look: primary, secondary, quiet, pill, outlined, dot or square. `kind` picks content: a number
column, a threshold vote, a chart card.

```tsx
<Button variant="secondary">Cancel</Button>
<Skeleton variant="circle" />                      {/* was shape */}
<ListHeaderCell kind="number">Votes</ListHeaderCell> {/* was variant */}
<VoteProgress kind="threshold" … />                {/* was variant */}
<DashboardCard kind="live-ranking" … />            {/* was type */}
```

### 3. `tone` is a colour intent from one set

`neutral | info | success | warning | danger | ai`. A part takes the subset it draws (Button `neutral | danger`,
Banner `info | neutral | warning | success | ai`); no part adds a value outside the set.

- Not an intent, not a tone. A colour weight is `emphasis` (IconButton `default | strong`). A chart series' colour is
  `color` (a `ChartColor`). A Go Vocal context such as a tab is neither: name it for what it is.

```tsx
<Button variant="primary" tone="danger">Delete project</Button>
<Banner tone="warning" title="This phase has ended" />
<IconButton emphasis="strong" aria-label="More"><Ellipsis /></IconButton>
<Sparkline data={weekly} color="line-primary" />
```

### 4. One word for the status axis: `status`

It replaces `state`, `review`, `type` and `phaseState` wherever they name a status. The CSS reads `data-status`.

```tsx
<StatusBadge status="live" />          {/* was state */}
<ReviewStatus status="reviewed" />     {/* was state */}
<Breadcrumbs variant="editor" status="draft" items={trail} />
<PhaseTimeline phases={[{…, isCurrent: true, status: 'in-progress'}]} />
```

### 5. `size` is a pixel height; `width`, `density` and `layout` name the other presets

- `size` is the height as a number literal type wherever Figma names sizes in pixels: Button `32 | 36`, IconButton
  `24 | 28`, Avatar `16 | 24 | 28`, SegmentedControl `30 | 36`. Where a size is valid only for some variants, the type
  says so: Select's pill is `22 | 28`, its field and quiet looks `32 | 36`, and a pill at 36 does not compile.
- A width preset is `width` (Modal `default | wide`). Density is `density` (`default | compact`: Banner, DropZone).
  A layout preset is `layout` (EmptyState and VolunteeringRow by where they sit, StatTile by how it arranges its lines).
- A type size stays a word (Link `small | medium`): it is not a height.

```tsx
<Select variant="pill" size={22} aria-label="Status" …/>
<Modal title="Settings" width="wide" …/>        {/* was size */}
<Banner density="compact" tone="neutral" …/>    {/* was compact */}
<EmptyState layout="panel" title="No ideas yet" />
```

### 6. `headingLevel` sets a heading's level

2–6 (a page owns its h1), wherever a prop sets the level of a heading the part renders. `level` never means a heading
level; where it remains it is something else (ProjectHeader's `project | phase`).

```tsx
<Panel title="Participants" headingLevel={3} />
<SectionLabel headingLevel={4}>Visibility</SectionLabel>  {/* was level */}
```

### 7. Values are `value`, `defaultValue` and `onChange`

- A single value or a list of strings takes the field trio, controlled or not. With no `value`, the part keeps its own
  from `defaultValue`.
- A React Aria collection keeps its own names: `selectedKeys`, `defaultSelectedKeys`, `onSelectionChange` (Menu,
  ListBox, SegmentedControl, DataTable).
- Select takes React Aria's current `value` / `defaultValue` / `onChange`, never the deprecated `selectedKey`.
- A controlled position is fine under its own name with its `defaultX`: Pagination `page` / `defaultPage` /
  `onPageChange`.

```tsx
<TagPicker aria-label="Tags" items={tags} defaultValue={['Cycling']} />           {/* was options, selected */}
<OptionList aria-label="Areas" items={areas} value={chosen} onChange={setChosen} isSearchable />
<Select label="Folder" value={folder} onChange={k => setFolder(String(k))}>…</Select>
<Menu selectionMode="multiple" selectedKeys={phases} onSelectionChange={setPhases}>…</Menu>
<Pagination pageCount={12} defaultPage={1} />
```

### 8. `actions` is a slot; a data array is `items`

- `actions` is always a ReactNode: the part's buttons, placed where the part puts its controls.
- A data array is `items`. A part with a second array names it `<thing>Items` (`menuItems`, `whoItems`).
- Words a part says when empty are `emptyLabel`.

```tsx
<EmptyState title="No projects" actions={<Button>New project</Button>} />  {/* was action */}
<Banner tone="info" actions={<Button variant="quiet">Undo</Button>} />
<AccessRights whoItems={who} … />                                           {/* was options */}
<NotificationList items={notes} emptyLabel="Nothing new" />                 {/* was emptyText */}
```

### 9. No aliases

A prop is renamed once, every call site updated in the same commit, never kept under two names. A value that said two
things is split into two props.

```tsx
<Banner linkLabel="Go to project" linkHref={url} linkPlacement="inline">…</Banner>  {/* was type="info-link" */}
```

### 10. Go Vocal words live in Patterns

Phase, ideation, method, build, manage and review are Pattern words. A Component carrying one either generalises the
prop or moves to Patterns, decided by its use: generic and used on two or more screens stays a Component.

```tsx
<Breadcrumbs variant="editor" status="live" … />   {/* was level="phase" phaseState="live" */}
<DashboardRanking items={[{title: 'Bike lanes', count: 42}]} />  {/* was votes */}
<ProjectHeader level="phase" status="draft" … />   {/* a Pattern: phase is its word */}
```

### 11. Words come from the page

The system never translates. Go Vocal's platform runs in about 30 locales and keeps its messages in its own i18n, so a
part says only words the page gives it, with English defaults so a story or a prototype reads without any. One rule
for every Component, Pattern and painted starter part:

- **Content is a prop, as before.** What belongs to this instance (`title`, `label`, `aria-label`, `placeholder`,
  `description`, `emptyLabel`, `children`, `confirmLabel`, `selectionLabel`, …) stays a prop. Where one has a default,
  the default lives in the part's labels and the prop wins when given.
- **The part's own words are `labels`.** A part that says a word of its own (a control's name, a state, a count, a
  join) takes `labels?: Partial<XLabels>` and exports two names beside it: the interface `XLabels` and the object
  `xLabels`, its English defaults. The part merges the page's words over the defaults (`mergeLabels`); a key left out
  keeps its default.
- **Counts and phrases are functions.** A count is a `CountLabel`, `(count: number, formatted: string) => string`: the
  count for the host's plural rules, then the number as the locale writes it, which the English defaults print. Other
  values arrive already formatted as strings (a name, "42%", "3 of 124"). A phrase around markup takes and returns a
  `ReactNode` (`postedBy: author => <>Posted by {author}</>`).
- **A part that draws another's words hands them on.** Its labels extend the other part's and go to it
  (`FilterMenuLabels extends OptionListLabels`, `CardLabels extends RequiredMarkerLabels, ReviewStatusLabels`). Parts
  drawn as one family share one object (`phonePreviewLabels`, `officialUpdateLabels`).
- **Flat keys.** `Partial` is shallow, so a key is never an object.
- **No one-off word props.** `closeLabel`, `cancelLabel`, `itemName` and the like are `labels` keys (point 9).
- **Numbers, lists and dates follow the locale:** React Aria's, set by `AppProvider`'s `locale` (the browser's
  language when nothing sets one). Never a fixed locale, never `toLocaleString()`. Inside the system,
  `src/components/format.ts` (`useNumberFormatter`, `usePercentFormatter`, `useListFormatter`) does it.

```tsx
import {AppProvider, FilterChips, type FilterChipsLabels} from 'govocal-ds';

// The host's i18n fills the words; the system never sees a message id.
const chips: Partial<FilterChipsLabels> = {
  clear: formatMessage(messages.clear),
  remove: name => formatMessage(messages.removeFilter, {name}),
  operator: count => formatMessage(messages.operator, {count}) // {count, plural, one {is} other {is any of}}
};

<AppProvider locale="nl-BE">
  <FilterChips facets={facets} value={value} onChange={setValue} labels={chips} />
  <Modal title={formatMessage(messages.title)} labels={{close: formatMessage(messages.close)}}>…</Modal>
</AppProvider>
```

`tests/words.test.mjs` guards it: no fixed locale, and no JSX text or word literal outside a `…Labels` object but for a
short list of symbols and dying starter parts, which may only shrink. Its comment names what it can't see (words kept
in a variable or a table, a lowercase one-word default, words a function returns); review reads for those.

## Adding a part

1. Props follow the eleven points above; a prop type is `<Part>Props` and extends `PlacementProps` when the part
   renders an element.
2. Merge `className` (`clsx('gv-part', className)`, or `keepClass` / `ownClass` over React Aria) and pass `style`.
3. Every word it says itself goes in `<part>Labels` (point 11), taken as `labels`; numbers through `format.ts`.
4. Export the part, its props type and its labels from `src/index.ts`: the part in its Storybook group, the labels in
   the Words block.
5. `npm run typecheck && npm test`.
