# Legend row

## When to use

- As the key beside or under a chart when each series also carries its value: the age groups under a demographic
  stacked bar ("18–24 · 16%"), respondents in Community monitor.
- With `count` for a count and a share in two columns: the Common Ground "Where people stand" (Agree 21 · 3%).
- Linked to a chart (`onHighlightChange` with the chart's `highlightedSeries`), so hovering or focusing a row picks
  its series out.

## When not to use

- For the plain key under a line chart (a swatch and a word): use **Chart**'s legend (`showLegend` or `ChartLegend`).
- For a figure with no chart beside it: use **Stat row**.
- To compare categories by length: use **Bar row**.

## Anatomy

1. **Swatch**: a square in the series' chart colour.
2. **Label**: the series' name.
3. **Count** (optional): a number in its own column, in the primary text colour.
4. **Value**: the share or figure at the end, in the secondary colour, right-aligned so stacked rows line up.

Rows stack 8 apart; Figma draws them 341 wide.

## Behaviour

Not focusable on its own. Linked to a chart (`onHighlightChange`), the row becomes one tab stop: focusing or hovering
it picks its series out and the other rows dim with their series.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab (when linked) | Moves to the row and picks its series out; the other line dims. | `e2e/charts.spec.ts` |

## Content

- The label is the group or series as people know it: "25–34", "Public transport", "Agree".
- `value` is text you write: a share ("16%") or a figure with its unit ("9 active"). Format it with the page's
  locale; "16 %" is right in French and German.
- `count` as a number is written in the locale for you (1,284; 1.284 in German).
- The values of a set should add up (shares to 100%); say "Not seen yet" or "Other" for the rest rather than leaving
  a gap.

## Accessibility

**The row gives you:** the label, count and value as text in reading order, a decorative swatch hidden from screen
readers, and, when linked, a tab stop with a focus ring.

**You still own:**
- A name for the set: the list it sits in, labelled by the chart's label (Dashboard card's demographic does this).
- Distinct names; the swatch colour never carries the meaning alone.
- A swatch from the chart tokens (`--gv-chart-*`), the same colour the series has in its chart.

## Related

- **Chart**: the line chart a linked row picks a series out of.
- **Dashboard card**: `DashboardDemographic` puts legend rows under its stacked bar.
- **Statement row**: the bar the Count and percent rows explain.
- **Stat row**: a label and a figure with no swatch.

## Provenance

- Built by AI agents from Figma ("Legend row", the demographic age legend) and the designer's prototype; the count
  column and the link to a chart are Not in Figma.
- Reviewed by a person: not yet.
- Known limits: `value` is a string, so its number format is the caller's; `color` takes any token name, not only a
  chart one (nothing checks it).

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: counts follow the locale.
- 29 Oct 2026: a count column; hovering or focusing the row picks its series out (docs/DECISIONS.md, "Built in the
  dashboards package").
- 29 Oct 2026: one legend look on the Dashboard: Internal adoption's figures became Stat rows (docs/DECISIONS.md,
  "Back office redesign on the current components").
- 29 Oct 2026: built from Figma and the prototype.
