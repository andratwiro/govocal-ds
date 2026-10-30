# Illustrations

How the system's drawings are made, used and added, and which of the prototype's scenes are still to convert. Not in
Figma: the drawings come from the prototype (https://govocal.augur.page/ux-ui-audit/design/), and the designer owns
them.

## What an illustration is

Content, not a component.

- **One file per drawing:** `src/illustrations/<kebab-name>.svg`.
- **Listed by name** in `src/illustrations/names.ts`. The list must equal the files.
- **Drawn by `Illustration`** (`src/components/gv/Illustration.tsx`, Components/Data display/Illustration). It imports
  every file as text and draws it inline, so the file's `var(--gv-*)` resolve against the page's tokens.
- **Used by `EmptyState`** (its `illustration` prop) and by any page that needs a picture.
- **The gallery** is Foundations/Illustrations (`foundations-illustrations--docs`): every drawing, playing, its name
  to copy, the motion it is drawn for and the widths it is meant for.
- **`tests/illustrations.test.mjs`** holds every file to the rules below and checks `names.ts` against the folder.

## Using one

```tsx
<Illustration name="ideation-map" />                         // plays when on screen, rests on its still
<Illustration name="survey-pages" size={320} height={168} />  // a method scene cropped to its cover
<EmptyState illustration="empty-notebook" title="Ideas will appear here" />
```

| Prop | What it does |
|---|---|
| `name` | Which drawing (a file in `src/illustrations/`). |
| `size` | Width in px; the height follows the drawing. Default: the drawing's own width. |
| `height` | Crops to this height around the middle. A method picker card at rest: `size={320} height={168}`. |
| `motion` | When it moves (below). Default `auto`. |
| `paused` | Freezes it where it is, for a pause button. |
| `alt` | What the picture says, only when the words around it don't. Leave it out for decoration. |

**How it moves.** A drawing's still is its resting picture (for a method scene, the picker's cover). Its story plays
from the still and ends on it, so it can stop at any time.

- `auto` (default): plays once it is on screen and rests within 5 s. A story longer than 5 s (every method scene)
  rests until hovered: nothing moves on its own for more than 5 s.
- `hover`: plays while the pointer is over the nearest `[data-illustration-host]` (a card) or focus is inside it.
- `once`: plays the story one time. `loop`: plays until paused, only next to a pause control.
- `still`: never moves. Reduced motion always shows the still.

## The file

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" class="gvi-<name>"
  data-group="Method scenes" data-motion="hover" data-sizes="320 400"
  data-source="where it comes from in the prototype"
  aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice" direction="ltr">
  <style>
    /* What it shows. Still: … Story (N s): … */
    .gvi-<name> { --gvi-cycle: calc(var(--gv-motion-duration-loop) * N); font-family: var(--gv-font-family); }
    .gvi-<name> .stage { fill: var(--gv-surface-stage); }
    /* …base styles = the still… then the animation rules… */
    @keyframes gvi-<name>-… { … }
    @media (prefers-reduced-motion: reduce) { .gvi-<name> * { animation: none !important; } }
  </style>
  <rect class="stage" width="320" height="320"/>
  …
</svg>
```

### The rules (the test checks each one)

- **Name:** kebab-case. The root's `class` is `gvi-<name>`.
- **Root:** `viewBox="0 0 w h"`, `aria-hidden="true"`, `focusable="false"`.
- **What the gallery reads from the root:**
  - `data-group`: `Empty states`, `Method scenes` or `Other` (the gallery's sections);
  - `data-motion`: what it is drawn for: `auto`, `once`, `loop`, `hover` or `still`;
  - `data-sizes`: the widths it is meant for, in px;
  - `data-source`: its anchor in the prototype.
- **Self-contained:** real shapes and `<text>` only. No `foreignObject`, `<image>`, `<script>`, `<title>` (the `alt`
  prop names it), `href`, `url()`, `id=`, event handlers or `@import`. No ids means two copies on a page never clash,
  and also no clip paths, masks or gradients (see "What SVG can't do" below).
- **Colour only through tokens,** set in the `<style>`:
  - a real token, `var(--gv-…)`, defined in `src/tokens.css`;
  - or the file's own `--gvi-…`, defined in the same file from tokens (usually a `color-mix()`).
  - No hex, `rgb()`, `hsl()`, `lab()`/`lch()`/`oklch()` or named colours. A `fill` or `stroke` attribute may only say
    `none` or `currentColor`.
- **Scoped:** every selector starts with `.gvi-<name>`; every keyframe is named `gvi-<name>-…`.
- **Motion only through tokens** (the same rule as `tests/motion.test.mjs`):
  - durations and delays are `var(--gv-motion-duration-…)` or `calc(var(--gv-motion-duration-loop) * N)`;
  - easings are `var(--gv-motion-easing-…)`: standard, enter, exit or move;
  - no `linear`, `ease-in-out`, `cubic-bezier()` or raw `9s`.
- **A file that animates** declares `--gvi-cycle: calc(var(--gv-motion-duration-loop) * N)` on its root rule and has
  the reduced-motion block. A still file has neither.
- **Under 60 KB.**

## Drawing a method scene

### Geometry

- `viewBox="0 0 320 320"`. The picker card's art is 320 wide. At rest it shows the middle 168 (y 76 to 244): the
  cover. The component crops with `size={320} height={168}`.
- The prototype positions with `calc(50% ± X)`. The centre is (160, 160), so `left: calc(50% - 57px)` is x 103. A rest
  position given from the top of the cover (`top: 30px`) is y 76 + 30.
- A stage taller than 320 on hover still centres on 160. Check nothing falls outside.
- Each scene draws its own `.stage` rectangle (the stage surface).
- Cards: a `rect` at x + .5 with width − 1, so the 1px card border is crisp; `rx="12"`.

### Transforms (the part that bites)

- **Static placement:** the `transform` attribute on an outer `<g>`. **Animation:** the CSS properties `translate`,
  `rotate`, `scale` and `opacity` on an inner `<g>`. They compose; `transform` in CSS would replace the attribute.
- Never set `transform-origin` or `transform-box` on an element that has a `transform` attribute.
- To scale or rotate about its own centre: `transform-box: fill-box; transform-origin: center` on the inner group.
  About a fixed point of the drawing: `transform-box: view-box; transform-origin: 160px 160px`. About the outer
  group's origin (a hanging note's pin): leave the defaults.
- A pop (`scale: 0` → 1) on a group whose outer `<g>` sits at the pivot: draw the shape around (0, 0).
- The prototype's cursor is a 22px box with a 24-unit path:
  `<g transform="translate(ox oy)"><g class="cur"><g transform="scale(.9167)"><path d="M4 2.5l15 8.6-6.7 1.6-3.6 6.2z"/></g></g></g>`.
  (ox, oy) is the origin of the element the prototype positions it in (its padding box: card left/top + 1). Then copy
  its `translate` keyframes as they are.

### Timeline: still, story, back to the still

- **The still is the base styles,** and it is the cover. Elements that appear only during the story have base
  `opacity: 0`, on the element the animation drives, not on a parent it never touches.
- **The prototype's cover/live pattern:** the cover fades up and out at 0 to 1.8 %, the live layer fades in at 1.5 to
  4 %. Add the way back: the live layer fades out and the cover returns by 100 %, so every cycle ends on the still.
  Don't overlap the two fades much, or the cover's text shows through the fading card (survey: live out at 92.5 to
  95.5 %, cover in at 95 to 100 %).
- **A story the prototype runs once, ending on a result:** hold the result before returning. Survey went from 11 s to
  12 s by scaling every keyframe percentage by 11/12, except 0 % and 100 %. Keep 100 % where it was: a keyframe list
  without it interpolates back to the base style.
- **The cycle** is `calc(var(--gv-motion-duration-loop) * N)`. With the loop token at 1.6 s, 9 s is × 5.625 and 12 s is
  × 7.5. The component reads N from the file and the token from the page to time `once` and `auto`, so a change to the
  token needs no edit here.
- **Overshooting curves** (the prototype's pops and drops) have no token: use the enter easing and put the overshoot in
  the keyframes, at 60 % of the segment (`scale: 1.12` for a dot from .2, `1.06` from .7, `1.03` from .85; a drop
  lands at `translate: 0 2px; scale: .98` first).
- **Sweeps that follow the cursor:** give them the move easing, the cursor's, between the same keyframes, and they stay
  in step. Opacity swaps 0.1 % apart: standard (the easing doesn't show).

### What SVG can't do the prototype's way

- **Clipping** (`overflow: hidden` on a map, a bar's shine): precompute the visible shape. The survey's river is the
  stroked curve's band clipped to the map's rounded box, saved as one path. Streets: shorten the lines to the box.
- **A shine over a bar:** three white rectangles at .25 / .55 / .25 opacity, moved only within the bar's length.
- **Counters** (`@property` integers) don't render in SVG text: crossfade one `<text>` per value
  (proposal-threshold does this).
- **Photos** (`background-image`) aren't allowed: draw a flat block in a palette colour, or a simple shape.
- **Text:** `<text>` sits on its baseline. In Public Sans, a 12/16 line's baseline is the line's top + 12.2; a 13/20
  line's is + 14.5. Centre with `text-anchor: middle`.

### Palette

| Prototype | In the files |
|---|---|
| #1E1E1E / #596B7A text | primary text / secondary text |
| #EBEDEF hairline | the card border |
| stage grey | the stage surface |
| #F4F6F8 face | slate 50 |
| #B9C1C9 star outline | slate 300 |
| #22D1C2 bar | teal 400 (darker: no token for the bright teal) |
| #C0EEC3 mint | green 400 at 35 % with neutral 0 (white) |
| #374B39 / #587D5B mint ink / edge | green 400 at 40 % with neutral 900 / green 400 at 65 % with neutral 800 |
| #ADA2E3 lilac | red 500 at 35 % with slate 300 |
| #B5D9F2 sky | blue 300 at 45 % with neutral 0 |
| #F1ED99 sand | olive 500 at 35 % with neutral 0 (greyer: no light yellow can be mixed) |
| #7A7432 sand ink | olive 500 at 75 % with neutral 900 |
| #E9A4D6 rose, #EAB387 peach | see `ideation-map.svg` |
| #F3F2EE map land | (olive 500 at 10 % with neutral 200) at 30 % with neutral 25 |
| #AAD7EE river | blue 300 at 45 % with teal 50 |
| #AFE6EB sticker / done | teal 400 at 25 % with teal 75 (sticker); teal 400 at 35 % with neutral 0 (done) |

Each mix is `color-mix(in oklch, <first> <share>, <second>)`, named in the file as a `--gvi-*` property. Check a mix's colour in the browser (Chrome), not with a script's own oklch
maths: they disagreed.

**Missing tokens:** the prototype's "animation - colors" palette (mint, lilac, sky, sand, rose, peach and their inks),
the map's land and water, the sticker teal and the bright bar teal. When they exist, replace the `--gvi-*` mixes with
them (docs/OPEN-DECISIONS.md, Illustrations).

## Adding one

1. **Ask the agent:** "Convert the prototype's <scene> into an illustration, following docs/ILLUSTRATIONS.md." Name
   the scene by its stage class (the list below), or point at it in the prototype.
2. **What it does:**
   - reads the scene's CSS and markup in the prototype and takes frames of it on hover;
   - writes the still first and compares it with the prototype at rest;
   - adds the story and compares frames at the prototype's times;
   - adds the name to `src/illustrations/names.ts` (A–Z);
   - raises the tile counts in `e2e/illustrations.spec.ts` (the gallery expects one tile per drawing).
3. **Check:**
   - `npx vitest run tests/illustrations.test.mjs` (or the whole `npm test`);
   - `npm run storybook`, then Foundations/Illustrations: the new tile plays, its Still switch stops it, and the
     system's reduced-motion setting shows the still;
   - the Illustration entry's stories (`components-data-display-illustration--hover` and the rest) with the new
     `name`.

The tools used for the first five (frame renders, contact sheets, a text measurer, a colour-mix checker, the river
clip, the survey generator, a Storybook check) were kept outside the repo and are not part of the hand-over. The agent
can rebuild what it needs with Playwright.

## Done (5)

| File | From the prototype | Notes |
|---|---|---|
| `empty-notebook` | the empty notebook (`.pj-emptyart`) | Still. Empty Manage and Insights tabs, the side panel. |
| `ideation-map` | `.ia-stage` | 9 s. |
| `proposal-threshold` | `.pp-stage` | 9 s. The shine is a soft band; the vote counters crossfade. |
| `survey-pages` | `.sv-stage` | 12 s (11 s and a held ending). The river is precomputed. |
| `document-annotation` | `.dc-stage` (with the shared `x-*` rules) | 9 s. |

## Still to convert (24)

**Method picker scenes, live in the prototype.** They share the `x-*` rules (`.x-card`, `.x-cover` / `.x-live`,
`.x-cur`, `.x-btn`, `.x-av`, `.x-bar`; keyframes `xCover`, `xLive`).

- `voting-methods`: Voting: the three methods (one vote, multiple votes, budget), then results online and offline.
  `.vt-stage`, 44 keyframes, 14 s. The biggest; it holds the voting progress card of the results.
- `common-ground-statements`: statements one by one, Agree / Unsure / Disagree, then Results. `.cg-stage`, 12 s.
- `polling-questions`: two quick questions on one page, Submit, "Answers submitted". `.pl-stage`, 8 s.
- `report-sharing`: Sharing: the project report ("What we heard") built block by block. `.sh-stage`, 9 s.
- `volunteer-causes`: Recruiting: causes pass, "I want to help". `.rc-stage`, 9 s. Its cards use photos: draw blocks.

**Method detail scenes** (the classic `sc-*` ones; one-shot entrances of .2 to .38 s, not loops). The picker now maps
every method to a newer scene, so first check where these still show (`.pj-mdetail__art`):
`forum-posts` (`.sc-post`), `proposal-chips` (`.sc-prop`), `common-ground-chips` (`.sc-ground`), `survey-rows`
(`.sc-survey`), `voting-bars` (`.sc-voting`).

**Direction A scenes.** The prototype's picker settled on direction B, so these are probably retired: confirm before
converting. `ideas-rising` (`pjRise`), `vote-plus-one` (`pjPlus`), `survey-slides` (`.pj-sslide`), `statement-stack`
(`.pj-cgcard`), `report-blocks` (`.pj-iblock`), `proposal-goal` (`.pj-proparrow`), `volunteer-check` (`.pj-volchk`).

**Other.**
- `spotlight-timeline`: the Spotlight survey's mini timeline (`.spx`). Group Other.
- The publish dialog's loading and done motion (`.pj-pubload`, `.pj-pubok`): probably a component state rather than a
  drawing. Decide before converting.

**Retired in the prototype.** The rail's empty-timeline treatments (`#proj-rail .pj-es--1` to `--5`). Convert only if
the designer brings one back; their names would be `rail-draw`, `rail-breathe`, `rail-dates`, `rail-cycle` and
`rail-landing` (5).
