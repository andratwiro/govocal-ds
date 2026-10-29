# For developers

What govocal-ds is, what it isn't yet, and what using it from another app takes. Written 29 Oct 2026 for the
platform's front-end team. Every claim names the file or command that proves it; where something is landing as this
is written, it says so.

## What it is

- **React Aria Components, painted with tokens.** Every interactive part is a `react-aria-components` 1.22 part
  (`package.json`), so keyboard, focus, ARIA, right to left and locale come from React Aria. Paint comes only from
  `--gv-*` CSS variables (`src/tokens.css`), generated from DTCG token files in `tokens/` by `npm run tokens:build`.
  Plain CSS, one stylesheet per part; no CSS-in-JS (`tests/no-css-in-js.test.mjs`), no raw values
  (`tests/tokens-only.test.mjs`).
- **One public surface.** Three entry points in `package.json` `exports`:
  - `govocal-ds`: every Component and Pattern with its props type, plus React Aria's value types (`Key`,
    `Selection`, `SortDescriptor`, `DateValue`…) (`src/index.ts`);
  - `govocal-ds/base`: React Aria starter parts no Component covers yet (dates, list boxes, trees, popovers)
    (`src/base.ts`);
  - `govocal-ds/tokens.css`: the tokens, imported once at the root.

  Props follow one written convention (`docs/API.md`): `isX` booleans, `variant` / `tone` / `status` / `size`
  meaning one thing each, `value` / `onChange` for values, no aliases.
- **A demo back office built only from it.** `backoffice/` (35 routes, invented data) imports nothing but the three
  entries, React, React Router, Lucide and one story fixture it still borrows (`tests/system-first.test.mjs`). It
  shows what the system covers, and its `<Gap>` frames (`backoffice/src/Gap.tsx`) show what it doesn't.
- **Tested in CI.** On every pull request (`.github/workflows/checks.yml`): `tsc` strict, the Vitest guards in
  `tests/` (tokens, names, the public API, the docs index), and the Playwright suite in `e2e/` (keyboard and focus
  contracts per part, the back office's pages, and every story rendered without an error: `e2e/stories.spec.ts`;
  `npx playwright test --list` counts about 950). On `main`, an axe scan of every story in three shards feeds
  Storybook's Overview › Accessibility page (`scripts/a11y-scan.mjs`, `.github/workflows/deploy.yml`). Accessibility
  findings are reported, never blocking: the back office follows the design as drawn (`docs/DESIGN.md`).

## What it isn't (yet)

- **A published npm package.** `package.json` is `"private": true` at version 0.1.0 (`CHANGELOG.md`); there is no
  tag and no registry.
- **Wired into the platform.** Nothing in the platform imports it, and the platform has no `react-aria-components`
  dependency today (`front/package.json`).
- **A translation layer.** The system never translates. Every word a part says comes from the page: content as the
  part's own props (`title`, `label`, `aria-label`, `placeholder`, `emptyLabel`), and the part's own words (its
  buttons, states, counts) as a `labels` prop with English defaults, e.g.
  `<FilterChips labels={{clear: formatMessage(messages.clear)}} … />`; a phrase with a count takes a function
  `(count, formatted) => string`, so the host's ICU plurals apply. Numbers, dates and direction follow React Aria's
  locale (`AppProvider`'s `locale`). The platform's `react-intl` messages plug in as they are.
- **A form library.** No form state, no schema. Fields take React Aria's validation (`isRequired`, `validate`,
  `isInvalid`, `errorMessage`, `validationBehavior`) and work with react-hook-form (the recipe below) or plain
  `<form>` submission. A recipe story shows every field's invalid state: Patterns › Recipes › Form validation.
- **Every hard screen.** What exists and what doesn't:

  | Screen | In the system |
  |---|---|
  | Data tables | Data table with sorting, bulk selection, an open row, a selection bar, pagination. A virtualised mode for long lists (`isVirtualized`, `rowLines`, `onLoadMore`): Tables & lists › Data table › Virtualized. |
  | Maps | Map view (pins, a card per pin, overlays, legend, clusters). The engine sits behind `MapEngine`; MapLibre with OpenFreeMap tiles is the default, loaded on demand (a lazy chunk; dependency `maplibre-gl`). The platform's ArcGIS is one adapter file. A site with a CSP needs `connect-src https://tiles.openfreemap.org` and `worker-src 'self'`. |
  | Multilingual text | Multilingual text field, Multilingual rich text editor and Locale switcher take the platform's Multiloc (`value` / `onChange(value, locale)`); Title field takes a language button (`localeSwitcher`, `lang`). The look waits for the designer's drawings. |
  | The form builder | Not built. Patterns › Build tab › Form field summary is a recipe of one field's summary. |
  | The page builder (Craft.js) | Not built. Section toggle (Patterns › Pages & menu) lists a page's sections. |
  | Drag and drop | Only file drop (Drop zone). No drag to reorder anywhere: React Aria's `useDragAndDrop` is not used in `src/`. |
  | Rich text | A toolbar over a plain text area (Rich text editor, Rich text toolbar): the look, no rich-text engine. |

- **Tenant theming.** Not built, but the tokens are shaped for it. A tenant's colour is a role, never a hue name
  (`docs/NAMING.md`, "Token names"), so a tenant overrides the brand roles on a wrapper and everything painted through
  `var()` follows:

  ```css
  [data-tenant='riverside'] {
    --gv-surface-brand-strong: #0b6e4f;     /* the primary Button, the current page, an avatar */
    --gv-surface-selected-strong: #0b6e4f;  /* a checked box, a selected option */
    --gv-surface-selected: color-mix(in srgb, #0b6e4f 10%, transparent);  /* a selected row */
    --gv-border-selected: #0b6e4f;
    --gv-border-focused: #0b6e4f;           /* the focus ring */
    --gv-text-link: #0b6e4f;
    --gv-text-link-hovered: #084f39;
    --gv-text-link-pressed: #0a5f44;
    --gv-text-brand: #0b6e4f;
    --gv-icon-brand: #0b6e4f;
    --gv-font-family: 'Lato', sans-serif;   /* the platform's theme.fontFamily */
  }
  ```

  Those are every token that points at the brand primitives today (`grep navy src/tokens.css`), plus the side nav's
  and the charts' own (`--gv-side-nav-surface`, `--gv-chart-bar`, `--gv-chart-line-primary`), which stay Go Vocal's
  unless the tenant wants them too. Nothing checks a tenant's contrast: the accessibility results hold for Go Vocal's
  own palette only (`docs/DESIGN.md`).

## How to adopt it

### Copy it, or consume it

| Road | How | For | Against |
|---|---|---|---|
| **A git dependency on a tag** (recommended) | `"govocal-ds": "github:andratwiro/govocal-ds#v0.1.0"` | One reviewed version; the designer's next change reaches the platform only when the platform bumps the tag. No registry needed. | Needs a tag (none yet) and a build that compiles the source (below). |
| An npm workspace | the repo as a folder of the platform's workspace | Edit both in one pull request. | Every designer change lands on the platform's `main` at once; the platform's lint and Jest run over it. |
| `npm pack` | `npm pack` here, then `npm i ./govocal-ds-*.tgz` there | Try it without a tag or a registry. | A file to carry by hand; nothing tracks the version. It packs the whole repo (639 files, about 800 kB: no `files` list yet). |
| Copy the folder | `src/` into `front/app/` | No dependency at all. | A fork: the designer's next change never reaches it. Only if the team absorbs the system whole and retires this repo. |

A published package (Vite library mode, `.d.ts`, Changesets, the GitHub registry) is the end state the architecture
review recommends; it isn't built. Until it is, a tag is the cheapest honest version.

### What the build needs

- **It ships source.** The entries point at `.ts` files; parts are `.tsx` and import their own `.css`
  (`"sideEffects": ["**/*.css"]` keeps them through tree-shaking). The host's bundler compiles TypeScript and JSX
  from the dependency and handles CSS imports.
- **Vite today.** The back office (`backoffice/vite.config.ts`) and Storybook (`.storybook/main.ts`) resolve the
  three entries with an alias read from `package.json` `exports`; a host that installs the package resolves them
  through `exports` itself. The platform already builds with Vite 8 (`front/package.json`).
- **One Vite-only line.** `src/components/gv/Illustration.tsx:43` inlines the illustrations with
  `import.meta.glob`. Vite runs it; Jest, webpack and Babel can't. The platform tests with Jest (`front/package.json`
  `"test": "jest"`): mock `Illustration` in Jest until a library build inlines it.
- **The font.** `--gv-font-family` names Public Sans; the system loads no font. The host links it (the back office
  does in `backoffice/index.html`).

### Versions

| | This repo | The platform (`front/package.json`) |
|---|---|---|
| React, React DOM | 18.3.1 | 18.3.1 |
| TypeScript | 5.9, strict | 5.9.3 |
| Vite | 8 | 8 |
| Node, npm | `engines`: node >=24.14.0, npm >=11.11.0 | the same |
| react-aria-components | ^1.22.1 | none yet |
| lucide-react | ^1.64.0 | |

React, React DOM, react-aria-components, lucide-react and clsx sit in `dependencies` today; in a package they become
`peerDependencies`. `react-router` is the back office's alone, not the system's.

## CSS: the scoping caveat

**Importing one part could repaint the host page** (fixed for Base on 30 Oct, below). React Aria puts a `react-aria-X` class on every element that gets
no `className`. The starter stylesheets under the system's Base parts selected those bare names (53 files in
`src/components/*.css`, e.g. `src/components/Button.css:10`, `.react-aria-Button {…}`), and each part imports its
stylesheet. So once any system part was imported, every unclassed React Aria element on the page, the host's own
included, took the system's look. And 134 of the 143 stylesheets in `src/` import `src/components/theme.css`, whose
`:root` rule sets `color-scheme`, `font-family` and `letter-spacing` on the whole page (`theme.css:3-7`).

**Fixed for Base (30 Oct):** `npm run css:scope` gave each Base wrapper its own `gv-base-*` class and rewrote its
stylesheet onto it, so no bare `.react-aria-*` selector is left (`tests/css-scope.test.mjs` keeps it so). The `:root`
rules in `theme.css` and the missing cascade layers below still apply.

**No cascade layers yet.** Only `src/components/utilities.css` is layered (`@layer utilities`). The proposed contract,
from the architecture review:

- The system wraps its CSS in `@layer gv.tokens, gv.base, gv.components, gv.patterns`, and its `:root` rules move to
  an opt-in `global.css`.
- The host declares `@layer reset, gv;` before anything else and moves its global reset into `reset`. The system then
  beats the reset by layer order, and the host's own component styles, unlayered, still win where they mean to.
- Both sides together, or neither: the system in a layer while the host's reset stays unlayered would let the reset
  win, focus rings included.

**What will fight it in the platform** (`front/app/global-styles.ts`, a styled-components `createGlobalStyle`,
unlayered):

| Lines | Rule | Effect on the system |
|---|---|---|
| 37–41 | `* { &:not(.focus-visible) { outline: none } }` | The system draws focus as an `outline` on `[data-focus-visible]`. Unlayered system rules win on specificity today; the layered `utilities.css` rings lose outright. |
| 44–47 | `*:focus-visible, *.focus-visible` → the platform's black ring with a white `box-shadow` | Lands on system parts too: a second ring around the system's. |
| 73–76 | `font-family: … !important` on `button`, `input`, `h1`–`h5`, … | Overrides `--gv-font-family`. Harmless while both are Public Sans; wrong once either changes. An `!important` reset beats the system even from a lower layer, so it has to go or skip the system's parts. |
| 83–86 | `p, label { line-height: 1.5em }` | Every field label and paragraph inside a part takes 1.5em instead of its type token's line height. |

Until the contract lands, mount the system where these rules can't reach (a page of its own), or scope them away from
`.react-aria-*` and `.gv-*`.

## Providers

Wrap the app once in `AppProvider` (`src/components/gv/AppProvider.tsx`). It renders the one toast region (pages call
`toast()` and mount nothing), draws Lucide icons at the system's 1.75 stroke, passes the locale to every React Aria
part and, given `navigate`, routes every system link, menu item and tab with an `href` through the host's router
(React Aria's `RouterProvider`). It renders no element of its own.

```tsx
import 'govocal-ds/tokens.css';
import {AppProvider, toast} from 'govocal-ds';

// TanStack Router: React Aria's RouterProvider takes the router's navigate and an href builder.
function Root() {
  const router = useRouter();
  return (
    <AppProvider locale={locale} navigate={(to, options) => router.navigate({to, ...options})}
      useHref={to => router.buildLocation({to}).href}>
      <Outlet />
    </AppProvider>
  );
}

// anywhere below it:
toast('Idea archived', 'Moved to the archive.', {action: 'Undo', onAction: restore});
```

Set `lang` and `dir` on `<html>` to match `locale` (`ar-SA` lays every part out right to left). The back office does
not use `AppProvider` yet (`backoffice/src/main.tsx`).

## Forms with react-hook-form

React Aria fields validate natively by default. With react-hook-form, let it own the state and the rules, and
hand each field its result through `Controller`: `isInvalid` and `errorMessage`, with `validationBehavior="aria"` so
the browser's own validation stays out of the way. The prop names below are the system's (checked with `tsc`
against `TextField`, `Select` and `Checkbox`); react-hook-form is not a dependency of this repo.

```tsx
import {Controller, useForm} from 'react-hook-form';
import {Button, Checkbox, Select, SelectItem, TextField, type Key} from 'govocal-ds';

type Values = {title: string; folder: Key | null; terms: boolean};

export function ProjectForm({onSave}: {onSave: (values: Values) => void}) {
  const {control, handleSubmit} = useForm<Values>({defaultValues: {title: '', folder: null, terms: false}});
  return (
    <form onSubmit={handleSubmit(onSave)} noValidate>
      <Controller control={control} name="title" rules={{required: 'Give the project a title.'}}
        render={({field, fieldState}) => (
          <TextField label="Title" isRequired validationBehavior="aria"
            name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur}
            inputRef={field.ref} isInvalid={fieldState.invalid} errorMessage={fieldState.error?.message} />
        )} />
      <Controller control={control} name="folder" rules={{required: 'Pick a folder.'}}
        render={({field, fieldState}) => (
          <Select label="Folder" isRequired validationBehavior="aria"
            name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur}
            isInvalid={fieldState.invalid} errorMessage={fieldState.error?.message}>
            <SelectItem id="parks">Parks</SelectItem>
            <SelectItem id="mobility">Mobility</SelectItem>
          </Select>
        )} />
      <Controller control={control} name="terms" rules={{validate: v => v || 'Accept the terms to publish.'}}
        render={({field, fieldState}) => (
          <Checkbox validationBehavior="aria" name={field.name} isSelected={field.value}
            onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref}
            isInvalid={fieldState.invalid} errorMessage={fieldState.error?.message}>
            I accept the terms
          </Checkbox>
        )} />
      <Button type="submit">Save</Button>
    </form>
  );
}
```

- `inputRef` lets react-hook-form focus the first invalid field on submit (TextField, TextArea, Checkbox and Switch
  take it). Select and NumberField take no ref yet, so focus skips them.
- The other fields follow the same shape: `NumberField` (`value: number`), `Switch` (`isSelected`), `RadioGroup` and
  `CheckboxGroup` (`value`), `SearchField`, `TitleField`. Date range field validates itself (an end before the start)
  and takes no `isInvalid` yet.
- Without react-hook-form, React Aria's own validation does it: `isRequired` and `validate` on the fields, a submit
  button, and React Aria shows the errors and moves focus to the first invalid field. The recipe story's
  "Submit to validate" is that form.

## Where to look next

- `docs/API.md`: the entries, the `className` contract (it places, never paints) and the prop convention.
- `docs/COMPONENTS.md`: every entry, what it is for, its stories. Storybook's MCP serves the same with props.
- `docs/DESIGN.md`: why it is built this way; `docs/DECISIONS.md`: calls made where Figma and the prototype disagreed.
- `CONTRIBUTING.md`: the pull request road and how CI deploys.
