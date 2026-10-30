# Changelog

Notable changes to govocal-ds, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/).

<!-- 0.1.0's counts were measured on main at 9f84f84 (29 Oct). Re-measure them once the public entry point, the token
rename and the new components land. -->

## Unreleased

### Changed

- **Figma caught up with code (30 Oct).** The token pull reports no difference: Figma's variables carry the code's
  names, the base-4 spacing and radius ladders, and the merges; `space/40` and `surface/inverse` now come from Figma
  (out of `tokens/semantic.tokens.json`). The Foundations page draws a Primitives row, read as primitives only.

## 0.1.0 — 2026-10-30

The system as it passes to the designer and the front-end team on 2 Nov 2026: React Aria Components 1.22 painted with
`--gv-*` tokens, shown in Storybook 10.6, with a back office built only from it. Not published as a package yet.

### Added

- **Tokens.** `src/tokens.css`, built from `tokens/` by `npm run tokens:build`:
  - 169 from Figma: 44 colour primitives, 73 semantic colours, 27 spacing steps, 13 radii, 9 type roles and
    3 shadows;
  - 22 written by hand, Not in Figma: 8 motion (4 durations, 4 easings, with reduced motion built in) and 14 sizes
    (icons, control heights, avatars).
- **Foundations** in Storybook, a page each: Colour, Typography, Spacing, Radius, Shadows, Motion, Icons,
  Illustrations and Size. Each token lists the components that use it.
- **Icons.** Lucide at a 1.75 stroke, as Figma and the prototype draw them: 126 in use; Figma's Icons page draws
  30.
- **Components** (`src/components/gv/`): 59 entries in 8 groups: Actions 5, Charts 5, Data display 12, Forms 16,
  Layout & containers 4, Navigation 3, Overlays 6, Status & feedback 8.
- **Patterns** (`src/patterns/`): 27 Go Vocal compositions in 8 places: App shell 2, Build tab 5, Lists 3, Manage
  tab 2, Pages & menu 1, Participation methods 5, Project page 6, Project rail 3.
- **Base** (`src/components/`): the React Aria starter the components build on, 57 parts with 40 story files
  (6 hidden from the sidebar because a component wraps them).
- **Illustrations:** 5 drawings in `src/illustrations/`, the Illustration and Empty state components, and a gallery.
- **Stories:** 579, each one in left to right and in Arabic right to left. Each story's Accessibility panel reports
  WCAG 2.2 AA findings; none blocks.
- **Back office** (`backoffice/`): the whole Go Vocal admin, shallow, with invented data, built only from the system
  by the back-office agent. The 11 pages of its main navigation (Dashboard, Projects, Input manager, Users,
  Messaging, Reporting, Community monitor, Inspiration hub, Tools, Pages & menu, Settings), plus a project's overview
  and its phase screens.
- **The Figma link:** `npm run tokens:pull` and `npm run figma:spec`; every story links to its Figma node.
- **Docs:** DESIGN, NAMING, DECISIONS, COMPONENTS (generated from the stories), FIGMA, ILLUSTRATIONS,
  OPEN-DECISIONS and HOW-TO, under `docs/`.
- **Tests:** 71 Vitest guards in 16 files (tokens only, paint, motion, no names, the illustration format, the
  components index and more), and 326 Playwright end-to-end tests in 34 files.
- **CI:** every push to `main` runs the typecheck, the guards, the build, the accessibility scan and the end-to-end
  tests, then publishes `/storybook/` and `/backoffice/` to GitHub Pages. A red run deploys nothing.
- **`.nvmrc`:** Node 24, as CI uses.

### Deprecated

- `CardRadio` and `CardRadioGroup`: use Choice card (`ChoiceCard` in a `RadioGroup`).
- Banner's `type` prop: use `tone` (with `linkLabel` for a trailing link).
- Common ground row's `reactionCount` and `visibleCount`: use `likes` and `reactions`.
