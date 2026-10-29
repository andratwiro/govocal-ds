# Bar row

## When to use

- To compare a handful of shares or counts, one row each, ranked or in a fixed order: ideas by status in Status
  breakdown, inputs per project and per tag on the Dashboard, scores by category in Community monitor, visits by
  source.
- In a report block that shows answers to one question as bars (the Report view).
- With `labelLines={2}` and no `value` in a narrow column of longer names, such as the AI summary's top themes.
- With `detail` when the row prints only a count or only a share and a reader needs both ("822 of 3,410 inputs · 24%").

## When not to use

- For a share that changes over time: use **Chart** (a line chart or a sparkline).
- For the parts of one whole side by side (agree, disagree, pass): use **Statement row**, or a **Dashboard card**'s
  demographic stacked bar for age groups and the like.
- For one headline number: use **Stat tile**.
- For progress towards a goal or a threshold of votes: use **Vote progress**.
- For a list of rows that open something: use **List row** or **Data table**; a bar row does nothing when pressed.

## Anatomy

1. **Label**: the category's name, one line (or two with `labelLines={2}`), then cut off.
2. **Track**: the thin grey bar across the middle.
3. **Fill**: the share, in `--gv-chart-bar` or the chart colour of a status (`barColor`).
4. **Value** (optional): the words at the end, such as "18% · 6"; a dash when the row has no data.
5. **Detail card** (with `detail`, Not in Figma): the exact count and share over the fill's end, on hover.

Rows stack 4 apart in a card; the track takes whatever width the label and value leave.

## Behaviour

Not interactive: a bar row takes no focus and no keys. Hovering it darkens the fill a step and shows the detail card;
the same words reach screen readers with the label, so nothing is lost to the keyboard (docs/DECISIONS.md, "Built in
the dashboards package"). Behaviour from React Aria's VisuallyHidden (the detail read with the label).

## Content

- The label is the category as people know it, in sentence case: "Under consideration", "Riverside Park".
- `percent` is the bar's length, 0–100. Rank against the largest row (`value / max × 100`) when the rows are counts,
  as the Dashboard does; use the real share when they are parts of one whole, as Status breakdown does.
- The value says the unit once: "18% · 6" (share, then count), "1,284" (a count), "3.8" (a score out of 5). Pick one
  form for every row of a card.
- Write numbers in the page's language: format them with the locale (`Intl.NumberFormat`, or Dashboard card's
  `DashboardBars`, which does it for you). Never paste "1,284" as text in a page that may run in German.
- `detail` gives both numbers and what they count: "822 of 3,410 inputs · 24%".
- No data yet: leave out `percent`; the row shows its dash. Don't draw a 0% bar for "not asked".
- Keep a card to about eight rows; more and the eye stops comparing (fold the rest into "Other").

## Accessibility

**The bar row gives you:** the label and `detail` read together ("Green Corridors, 822 of 3,410 inputs · 24%"), the
value as text, and a fill that is never the only carrier of the number.

**You still own:**
- A heading for the group (the Dashboard card's title), so the rows have a context.
- Printing the number in `value` or `detail`; a bar alone is length and colour only.
- Not showing shares built on very few people: say "fewer than 5" instead of a precise share of a tiny group.
- A status colour (`barColor`) always next to the status's name, never instead of it.

## Related

- **Dashboard card**: the card bar rows sit in; `DashboardBars` builds one row per status.
- **Legend row**: the key under a stacked bar, a swatch instead of a bar.
- **Statement row**: three or four shares of one whole in a single bar.
- **Chart**: the same data over time.

## Provenance

- Built by agents from Figma ("Bar row") and the designer's prototype; the two-line label, the row without a value
  and the hover card come from the prototype, not Figma.
- Reviewed by a person: not yet.
- Known limits: the caller writes `value` and `detail` as text, so their number format is the page's job; the label
  colour follows Figma's body text rather than the prototype's grey (docs/DECISIONS.md, "Fidelity review").

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: two-line label, a row with no value cell, hover darkens the bar and `detail` gives the exact numbers.
- 29 Oct 2026: chosen over a second chart library for the Audience bars: no pie charts, one chart system
  (docs/DECISIONS.md, "Building from the prototype review").
- 29 Oct 2026: built from Figma and the prototype.
