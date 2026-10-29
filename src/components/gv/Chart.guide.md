# Chart

## When to use

- **Line chart** (`LineChart`) for one or two counts over time, with dated x labels: participation and visitors over
  time on a phase's Insights, registrations and inputs per month on the Dashboard, the health score per quarter in
  Community monitor.
- **Sparkline** (`Sparkline`) for a trend with no axes where the shape matters more than the values: votes cast over
  a voting phase, or a 34-high line under a Stat tile.
- **Chart legend** (`ChartLegend`) under a chart with two or more series, or the square-swatch key for agree,
  disagree and pass over Statements.
- Inside a **Dashboard card**, which gives the chart its title and the legend its slot.

## When not to use

- To compare categories at one moment (statuses, projects, tags): use **Bar row**.
- For one number with its change: use **Stat tile** (it can carry a small sparkline).
- For the parts of one whole (agree, disagree, pass): use **Statement row**.
- For a key beside a chart that also carries values or counts: use **Legend row**.
- For more than two lines: split them into small charts, each in a **Dashboard card**; a third colour on one plot
  stops being readable.

## Anatomy

1. **Y axis**: from 0 in four round steps (0 · 3 · 6 · 9 · 12), or up to `max`.
2. **Plot**: hairline grid lines and one or two lines, brand (`line-primary`) then orange (`line-secondary`).
3. **X axis**: one label per point ("16 Feb"); the last one sits flush with the end rather than being cut.
4. **Value card** (Not in Figma): a guide line, a dot on each line and a card with the date and every value, at the
   point nearest the pointer or the keyboard.
5. **Legend** (with `showLegend`): a dot and a word per series, under the chart.

The plot is 141 high by default (the axis labels add 34); a Sparkline is 110, or 34 under a Stat tile.

## Behaviour

The plot is one tab stop that works as a slider over the points, after the WAI-ARIA
[Slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/); each point is read out as the keyboard reaches it
("09 Mar: Participants 10, Visitors 9"). Hovering does the same with the pointer and picks out the line under it. No
React Aria part: React Aria has no charts, so this is the system's own SVG with pointer and key events.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus to the plot and shows the first point's card. A legend item linked to the chart is the next stop. | `e2e/charts.spec.ts` |
| Right arrow, Left arrow | Moves to the next or the previous point; at the last point it stays put. | `e2e/charts.spec.ts` |
| Home, End | Jumps to the first or the last point. | `e2e/charts.spec.ts` |
| Esc | Hides the card; focus stays on the plot. With no card shown, Esc goes on to close the dialog the chart sits in. | `e2e/charts.spec.ts` |
| Tab (on a legend item) | Picks its series out: the other line dims. | `e2e/charts.spec.ts` |

The arrows follow the drawing, not the reading direction: time runs left to right in every language. A Sparkline
takes the card and the keys only when `xAxis` names its points; without dates, or with `isInteractive={false}`
inside something pressable, it is a picture.

## Content

- Name each series for what it counts, plural, sentence case: "Participants", "Votes cast", "Active admins". The
  name feeds the legend, the card and the spoken trend.
- X labels are short dates the reader expects: "16 Feb", "Mar", "Q3 2026". Pass them already written in the page's
  language; the chart doesn't format dates.
- Values are numbers, not strings: the chart writes them in the page's locale (1,284; 1.284 in German), up to two
  decimals.
- Say the unit in the card's title or subtitle ("Votes cast · cumulative", "People who answered · per quarter"), not on
  the axis.
- Give a fixed `max` when the scale is fixed (a score out of 5); otherwise let the chart round the ceiling.
- The chart names itself with a trend sentence ("Line chart, 16 Feb to 23 Mar. Participants rose from 1 to …"). Pass
  `labels` for the page's language, or `aria-label` when the point of the chart is something else.
- One series has no legend; two have one.

## Accessibility

**The chart gives you:** a trend sentence as the chart's name, one tab stop that reads every point, a value card that
follows focus as it follows the pointer, a legend that picks a series out on focus as on hover, and a focus ring.

**You still own:**
- The title around it (the Dashboard card's), so the trend sentence has a context.
- The trend words and the explorer's name in the page's language (`labels`).
- A table of the same numbers where readers need every value at once (the report or an export).
- Never relying on the line colours alone: two series always have a legend with their names.
- Holding back points built on very few people, the same in the card as on the line.

## Related

- **Dashboard card**: the card a chart sits in, with its title, legend slot and empty state.
- **Legend row**: a key beside the chart that picks a series out (`highlightedSeries`).
- **Stat tile**: a headline number with a small sparkline.
- **Bar row**: comparing categories instead of time.

## Provenance

- Built by agents from Figma ("Chart": Line · 1 series, Line · 2 series, Sparkline) and the designer's prototype; the
  value card, the keyboard explorer and the linked legend are Not in Figma (the project lead's call, 29 Oct: charts
  are interactive).
- Reviewed by a person: not yet.
- Known limits: at most two series are drawn in the brand and orange by default; dates are text the page writes; axis
  labels are 12px, a step above the prototype's (docs/DECISIONS.md, "Fidelity review"); no table view of its own.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: the chart's words come in through `labels`; numbers follow the locale.
- 29 Oct 2026: hover and keyboard value card on Line chart and Sparkline; the legend picks a series out; the last date
  is never clipped (docs/DECISIONS.md, "Charts are interactive").
- 29 Oct 2026: the x axis is `xAxis`, so `labels` always means words (docs/DECISIONS.md, "Words and locales").
- 29 Oct 2026: built from Figma and the prototype.
