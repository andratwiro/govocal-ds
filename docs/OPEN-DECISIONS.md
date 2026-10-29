# Open decisions

The designer's queue: what the builders couldn't settle alone, gathered from their reports on 29 Oct 2026. Calls
already made are in docs/DECISIONS.md, not here. Change any line there and the agent follows.

Each line reads: *the question — what we built meanwhile — where to see it*. "See" gives a Storybook id: open
`?path=/story/<id>` in Storybook (`?path=/docs/<id>` for an id ending in `--docs`). Colours are named in words, because
a token rename is landing as this is written; the question stays the same under the new names.

When you decide one, tell the agent. It builds the answer, logs it in docs/DECISIONS.md (what disagreed → what we
built → why) and deletes the line here.

## Waiting on Figma

- Rename in Figma: code took the new names on 29 Oct, Figma still has the old ones? — `figma:spec` finds a component under either name, but one renamed only in code (Status badge) isn't found until Figma follows — see the checklist in docs/NAMING.md, "Figma mirror".
- Which Storybook-only parts should Figma draw? — 45 entries are built from the prototype alone: Menu, Link, Radio group, Checkbox group, Data table, File list, Illustration, Property list, Reaction counts, Table toolbar, Choice card, Date range field, Option list, Search field, Select, Tag picker, Panel, Pagination, Tabs, Alert dialog, Coachmark, Help popover, Side panel, Tooltip, Empty state, Skeleton, Toast, and every pattern of App shell, Build tab, Lists, Manage tab and Pages & menu, plus Action row, Panel section, Phone preview, Stat card and Phase timeline; parts of Card, Banner, Volunteering row and Rail phase too — see the sidebar's `not-in-figma` tag filter.
- States the code added that Figma could draw? — Stat row selected, Dashboard card empty, select-all and row checkboxes on list rows, Checkbox quiet (the dimmed select-all), Tooltip with a tail (step cards only) — see `components-data-display-stat-row--selected`, `components-charts-dashboard-card--empty`, `components-data-display-list-row--selectable`, `components-forms-checkbox--quiet`, `components-overlays-tooltip--all-variants`.
- Rich text toolbar button: what do its selected and disabled states look like? — drawn nowhere, so the builder's own look — see `components-forms-rich-text-toolbar-button--selected`, `components-forms-rich-text-toolbar-button--disabled`.
- Segmented control: a disabled look? — Figma has none; Project header paints its locked modes locally, with no tooltip (a disabled segment can't show one) — see `patterns-project-page-project-header--with-mode-switch`.
- Should Figma follow where code settled against it? — Modal radius 12 with no border, the Stat number on a 28 line (Figma's Stat style says 32), disabled at 45 % (Figma's Button says 50 %), Switch "on" near-black, Vote progress 96 wide, the Required marker's 6px gap on Embed URL — see docs/DECISIONS.md, "Fidelity review".
- Motion and size tokens live only in code: should Figma get them as variables? — hand-written in `tokens/motion.tokens.json` and `tokens/size.tokens.json`, marked Not in Figma — see `foundations-motion--docs`, `foundations-size--docs`.

## Colour

Figma has no variable for each of these. Each was painted with the nearest token or a `color-mix()` of tokens. The
question for each: add a Figma variable (code then names it), or keep the stand-in?

- Danger: a fill for the danger button and a surface for the Alert dialog's icon badge? — the red 500 primitive, and a mix — see `components-actions-button--danger`, `components-overlays-alert-dialog--destructive`.
- Warning: a surface and a border (Banner warning, the side panel's screening strip)? — mixes of the warning icon colour — see `components-status-feedback-banner--warning`, `components-overlays-side-panel--screening`.
- Neutral message surface? — Banner neutral uses the hover grey — see `components-status-feedback-banner--neutral`.
- Status green and red for small marks (a status dot, a downward trend)? — the chart's "agree" green and the notification red — see `components-navigation-tabs--with-status-dots`, `components-data-display-stat-tile--with-trend`.
- Phase states in the rail (the done dot, the live dot, the guide line after a done phase, the state word, the upcoming name's green-grey)? — the nearest chart greens, a mix for the light live dot, and the primary text colour for upcoming names — see `patterns-project-rail-rail-phase--all-variants`.
- A value badge's surface and text (the prototype's pale blue)? — the teal 75 and teal 700 primitives — see `components-status-feedback-badge--value`.
- A pill's hover surface? — the slate 200 primitive — see `components-forms-select--pill`.
- Project tile fills by method (teal, blue), perhaps in the chart palette? — the teal 400 and blue 400 primitives, through a `tone` prop — see `components-data-display-data-table--projects-list-cells`.
- Teal text (View option row's "Default")? — the accent text colour, plus the check and the word — see `patterns-build-tab-view-option-row--default`.
- The Coachmark's translucent white? — a mix — see `components-overlays-coachmark--example`.
- The prototype's grey 200 (#EBEDEF) and grey 50 block? — the pill surface for bar tracks, the strong divider for rules, the stage surface for the new-comment block — see `components-charts-bar-row--all-variants`, `components-overlays-side-panel--default`.
- A dropdown shadow? — the subtle shadow — see `components-actions-menu--all-variants`.

## Type

- A tracking token for capitals? — the Phone preview's countdown is uppercase Small strong with no extra tracking — see `patterns-project-page-phone-preview--countdown`.
- A monospace token? — token names on the Foundations pages use the browser's own monospace — see `foundations-typography--docs`.

## Components

- Avatar: a grey version for assignees and commenters, as the prototype draws? — the filled avatar; "Unassigned" has a dashed ring — see `components-data-display-avatar--all-variants`.
- Badge: should a dropdown card's pill turn teal once it holds a value? — Card passes a plain pill — see `components-layout-containers-card--review-pill-dropdown`.
- Breadcrumbs: rename the project from the breadcrumb? — not built — see `components-navigation-breadcrumbs--project`.
- Card: should it turn "To review" into "Reviewed" by itself when a value is picked? — the page passes `review` — see `components-layout-containers-card--reviewed`.
- Card: pills before or after the header's icon actions? — before (the prototype's Causes card puts the pill last) — see `components-layout-containers-card--all-variants`.
- Card: keep one variant per Figma "Type" value, or regroup them after the rename? — one per value — see `components-layout-containers-card--all-variants`.
- Compact button: a size of Button rather than its own entry? — its own entry — see `components-actions-compact-button--all-variants`.
- List header, List header cell, List row: keep them beside Data table, or deprecate them? — kept, not deprecated — see `components-data-display-list-row--all-variants`, `components-data-display-data-table--default`.
- Select: how does it look when it picks several? — the earlier look, unstyled beyond it; no story yet — see the back office's Settings page ("Select approvers", `backoffice/src/pages/Settings.tsx`).
- Stat card and Stat tile: one entry or two? — two (Stat card is a pattern) — see `patterns-project-page-stat-card--pressable`, `components-data-display-stat-tile--all-variants`.
- Status badge: only draft and live (its `state`), or more? — two states — see `components-status-feedback-status-badge--all-variants`.
- Title field: a slot for the content-language button at its reserved right end? — not built — see `components-forms-title-field--all-variants`.

## Patterns

- Notification row: show an email's preview on the phase stage? — the email opens as its own page in the list's place; no preview on the stage — see `patterns-build-tab-notification-row--email-open`.

## Illustrations

- The prototype's animation colours (mint, lilac, sky, sand, rose, peach and their inks), the map's land and water, the sticker teal and the bright bar teal: add them as tokens? — mixes of tokens; sand and mint come out greyer — see `foundations-illustrations--docs`.
- The seven direction-A scenes: retired with the prototype's move to direction B? — none converted — see docs/ILLUSTRATIONS.md, "Still to convert".
- The five classic method-detail scenes (`sc-*`): do they still show anywhere? — none converted — see docs/ILLUSTRATIONS.md.
- The publish dialog's loading and done motion: a drawing, or a state of the dialog? — neither built — see docs/ILLUSTRATIONS.md.
- The rail's five retired empty-timeline treatments: bring one back? — none converted — see docs/ILLUSTRATIONS.md.

## Storybook

- Brand colours: tokens for the Go Vocal mark's mint and coral? — the mark's exact colours live only in its SVG; the chrome uses the info surface and the red 450 primitive — see `.storybook/static/favicon.svg`, `overview-welcome--docs`.

## Contrast findings

Reported, never fixed on their own: the back office follows the design as drawn (docs/DESIGN.md). Each is the
designer's call.

- Chart axis labels, and the date in a chart's value card? — as drawn — see the Accessibility panel on `components-charts-chart--interactive`.
- Section label's text? — as drawn — see `components-layout-containers-section-label--default`.
- Participant action row's default grey and its "off" label? — as drawn — see `patterns-build-tab-participant-action-row--all-variants`.

## The token review: the designer's calls

The token review (it lands with the rename) leaves these to the designer. Spacing and radius were settled by the
project lead (base 4).

- When do Figma's variables take the new token names? — nothing in code waits on it; one script, run by the agent through the Figma MCP, renames each variable by its id and sets its code syntax and description — see `tokens/variable-ids.json` (the bridge by id).
- Merge colour primitives nobody can tell apart (slate 150 into 200, 650 into 600, 750 into 700 or 800; brand blue 650 into 700; neutral 25 into 0; teal 75 into 50)? — all kept — see `foundations-colour--docs`.
- Merge the segment text colour (slate 800) into the pill text colour (slate 700), ΔE 2.4? — two tokens — see `foundations-colour--docs`.
- Fold the slate 750 text in Tabs and Radio group into that same neutral text colour (ΔE 1.6)? — the slate 750 primitive — see `components-navigation-tabs--all-variants`, `components-forms-radio-group--all-states`.
- Border and track greys in Tag group and Meter's empty track: which token? — primitives — see `base-taggroup--example`, `base-meter--example`.
- Card's switch from slate 750 to near-black, matching Switch? — slate 750 — see `components-layout-containers-card--manage-toggle`.
- Tooltip on the inverse surface (it would darken one step)? — neutral 800 — see `components-overlays-tooltip--all-variants`.
- One success green for text, or two? — two (the live green and the reviewed green) — see `foundations-colour--docs`.
- One success look for Toast, with tokens for its light green and mint? — several greens in its stylesheet (green 400 and mixes) — see `components-status-feedback-toast--all-variants`.
- Link hover and pressed: the darkest brand blue (900) or the 700? — 900 for both — see `components-navigation-link--all-states`.
- Two small shadows (the subtle one and the selected segment's): fold them into one? — two — see `foundations-shadows--docs`.
