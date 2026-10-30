# Figure

## When to use

- Around every chart, table, set of quotes or map on a report's page, so they all read the same way: the finding,
  what is measured, the body, the legend, then one foot.
- When a chart needs to say what it leaves out ("Showing the top 5 of 12"), a note on the data, or its source.

## When not to use

- For a chart card on a dashboard: use **Dashboard card**.
- For one number with its label: use **Stat tile**.
- For a section of settings with a title: use **Panel**.

## Anatomy

1. **Finding** (optional): one sentence, a heading in Document lead (19/28); it names the figure.
2. **Measure** (optional): what is counted, Body strong, secondary.
3. **Body**: the chart, table, quotes or map you put in.
4. **Legend** (optional): a Chart legend.
5. **Foot** (optional): what is left out, a note, "Source: …", one line each, Small secondary; the figure's caption.

## Behaviour

Not interactive: a `figure` named by its finding. The chart inside keeps its own keys.

## Content

- The finding says what the data shows, in a sentence, with the number when it helps ("Cycling leads in every
  district"); not a title ("Votes per route").
- The measure says what is counted and of whom ("Share of votes per route, 3,600 participants").
- The source line's words come from `labels.source` ("Source: Go Vocal, Cycle lanes 2026").
- Highlight in the chart only what the finding names; everything else stays grey.

## Accessibility

**The part gives you:** a `figure` named by its finding heading, the heading in the document's outline
(`headingLevel`), and the foot as its caption.

**You still own:**
- A text alternative for the chart itself (a table, or values on the bars).
- A heading level that fits the page's outline.

## Related

- **Bar row**: the bars of a ranked chart.
- **Chart**: line charts and the Chart legend.
- **Quote**: participants' words as the body.
- **Page stage**: the sheets figures sit on.

## Changes

- 30 Oct 2026: built (finding, measure, body, legend, truncation, note, source), with this page.
