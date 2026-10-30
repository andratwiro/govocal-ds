# Stat tile

## When to use

- For a headline number on a dashboard, a label over it: the Dashboard's totals with "Last 30 days: +46", "Active
  users", the visitors' figures, the representativeness score.
- In a band of tiles at the top of a phase's Insights tab: five or six side by side, the same height (`tall` lines a
  plain tile up with tiles that have a note).
- With a `note` under the number ("updating live", "Took part in the last 90 days"), a `trend` ("↑ 12% 7-day
  change"), a Sparkline in its slot, or `info` behind a help icon when the number needs explaining ("Representativeness
  score").
- With 0 when nothing is counted yet: the same tile, so the band keeps its shape and fills in place.

## When not to use

- For a count that leads somewhere or filters a list: use **Stat row**.
- For a stat with its sparkline that opens a detail on a project page: use **Stat card**.
- For a chart with a title, a legend and a footer: use **Dashboard card**.
- For how several numbers compare: use **Bar row** or a **Chart**.
- For a label and value about one record: use **Property list**.

## Anatomy

1. **Label**: what is counted, on top.
2. **Help icon** (with `info`): after the label; opens a **Help popover**.
3. **Value**: the number, large, on a 28 line.
4. **Trend** (optional): an arrow, the change and what it covers; green up, red down, grey flat.
5. **Note** (`with-note` layout): a line under the number.
6. **Slot** (optional): under the value and note, such as a Sparkline.

Layouts (Figma's Type): `default`, `tall`, `with-note` (picked for you when there is a note).

## Behaviour

The tile is display only, except its help
icon, a button that opens a popover dialog, after the WAI-ARIA
[Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Enter (on the help icon) | Opens the Help popover with what the number means. | `e2e/stat-tile.spec.ts` |
| Esc | Closes the Help popover. | `e2e/stat-tile.spec.ts` |

A tile with no `info` is not interactive.

## Content

- Label: what is counted, sentence case, a few words: "Visitors", "Active users", "Participation rate".
- Value: formatted by the page, in the page's locale: "1,284", "56.5%". Never round it into something else ("1.3k")
  unless the whole band does.
- Note: one short line that says what the number covers or how fresh it is: "updating live", "Last 30 days: +46".
- Trend: the change already formatted ("12%", "+46") and what it covers ("7-day change", "vs last month"). The
  direction is read in words ("Up 12%, 7-day change").
- Info: one or two sentences on what counts and what doesn't; the popover's heading is the label.
- "Up", "Down", "No change" and the help icon's name ("Help: Participation rate") come through `labels`.

## Accessibility

**The tile gives you:** a trend whose direction is said in words and drawn as an arrow, never by colour alone; a help
icon named for its tile that opens on press, not hover, so touch and keyboard reach it; and the arrow hidden from
screen readers.

**You still own:**
- A heading over a band of tiles, so people know what the numbers are about.
- Values formatted for the page's locale.
- A trend's colour that matches its meaning: up isn't always good (more complaints), so say it in the label or note.

## Related

- **Stat row**: the smaller count that leads somewhere.
- **Stat card**: the project page's stat with a sparkline.
- **Help popover**: what the help icon opens.
- **Tile grid**: lays a band of tiles out.
- **Dashboard card**: the chart tiles beside or under a band.

## Provenance

- Built by AI agents from Figma's Stat tile (Default, Tall, With note) and the prototype's KPI tiles; the trend, the
  empty phase and the help icon are Not in Figma.
- Reviewed by a person: not yet.
- Known limits: the trend's colour always reads up as green and down as red; the page formats every number itself.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its words come through `labels`.
- 29 Oct 2026: `type` became `layout`, Figma's values kept (docs/DECISIONS.md, "Public API and prop names").
- 29 Oct 2026: the trend under the number (direction in words), info through a Help popover, an empty phase story with
  zeros, no greyed state (docs/DECISIONS.md, "Built in the dashboards package").
- 29 Oct 2026: label over value everywhere, as Figma draws it; numbers on a 28 line.
