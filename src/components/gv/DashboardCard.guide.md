# Dashboard card

## When to use

- To hold one figure on a dashboard: a chart, a list or a breakdown with its title, as on a phase's Insights tab, the
  back-office Dashboard and Community monitor.
- With a body part made for it:
  - `DashboardStatements`: Common Ground statements with their agree, disagree and pass bars.
  - `DashboardBars`: Status breakdown, one Bar row per status with "share · count".
  - `DashboardRanking`: Live ranking of a vote's options, the leader in green.
  - `DashboardTopics`: Topic breakdown, rows that open a topic view.
  - `DashboardList`: Most liked, the inputs with the most reactions.
  - `DashboardDemographic`: who took part by age group, commute and the like, a stacked bar over its legend rows.
- Around a **Chart** (`kind="participation-over-time"`, `"visitors-over-time"`, `"votes-over-time"`) or a row of Stat
  tiles.
- With an Empty state in the body when there is no data yet ("No participation yet").

## When not to use

- For a single headline number: use **Stat tile** (several of them in a **Tile grid**).
- For a section of a settings or editing page: use **Panel**.
- For a pressable tile or a choice: use **Card** or **Choice card**.
- For a table of records: use **Data table** inside a **Panel**.
- For one number with its sparkline that opens a detail when pressed: use **Stat card**.

## Anatomy

1. **Header**: the icon (optional, decorative), the title, the grey subtitle under it ("By votes · updating live")
   and, at the end, `actions` for the whole card (Daily / Weekly).
2. **Body**: the chart, list or breakdown.
3. **Legend** (optional): a Chart legend under the body.
4. **Footer** (optional): the foot row, its ends pushed apart ("1 / 34" and Explore).

`kind` sets the spacing each Figma type uses; the card takes the width its column gives it (the prototype stacks them
14 apart, 764 wide, or two 375 halves).

## Behaviour

The card itself takes no focus; what's inside does. Topic rows are buttons, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), and a demographic card's legend rows each take a
tab stop that picks their share out of the stacked bar. A chart inside keeps its own keys (see Chart).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the next topic row, then to each legend row of a demographic card. | `play: Keyboard` |
| Enter, Space (on a topic row) | Opens that topic (`onAction`). | `play: Keyboard` |
| Tab (on a demographic legend row) | Picks its share out: the other rows and segments dim. | `play: Keyboard` |

Hovering a legend row or a segment picks that share out too (`e2e/charts.spec.ts`).

## Content

- The title names what is measured, in sentence case and a few words: "Participation over time", "Status breakdown",
  "Live ranking", "Most liked". A question is fine for the AI summary ("What are people saying?").
- The subtitle says how to read it or where it comes from: "Votes cast · cumulative", "By votes · updating live",
  "These ideas got the most traction". A middle dot joins two facts.
- Shares and counts are numbers; the body parts write them in the page's locale ("18% · 6", "214 votes").
- The parts' own words come in through `labels`: the ranking's "N votes", the statements' "% agree" and share names.
- Demographic cards have no title; their label sits in the body ("Age group"). Give the card an `aria-label` when a
  page lists several (Community monitor does).
- An empty card says what will appear and when: "No demographic data yet" / "It appears once participants fill in
  their profile."

## Accessibility

**The card gives you:** a region named by its title, a real heading (`headingLevel`, h3 by default), topic rows that
are buttons, focusable legend rows, and body parts that read each row as one sentence (the Most liked list reads each
input with its reactions).

**You still own:**
- The heading level that fits the page's outline (`headingLevel`).
- An `aria-label` on a card with no title.
- Who took part before what they said: put the demographics where a reader finds them before the findings.
- Not printing shares of very small groups (say "fewer than 5"), the same in every card and export.
- The words of the body parts in the page's language (`labels`).

## Related

- **Chart**: the line chart and sparkline most cards hold.
- **Bar row**: one row of Status breakdown.
- **Statement row**: one row of Statements.
- **Legend row**: the rows under a demographic bar.
- **Empty state**: the body when there is no data yet.
- **Stat tile**: the headline numbers above the cards.

## Provenance

- Built by AI agents from Figma ("Dashboard card", ten types) and the designer's prototype; the Most liked list, the
  empty card and the hover and focus emphasis are Not in Figma.
- Reviewed by a person: not yet.
- Known limits: the kinds and body parts speak Go Vocal's dashboards (statements, votes) though the card is a
  Component (docs/DECISIONS.md, "Public API and prop names"); demographic legend rows are always tab stops, one per
  share; the status colours borrow chart tokens until status tokens exist.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: the body parts take their words as `labels`; numbers and shares follow the locale.
- 29 Oct 2026: the ranking counts items rather than votes; `action` became `actions`, a slot.
- 29 Oct 2026: an empty card holds an Empty state, not the prototype's muted line (docs/DECISIONS.md, "Built in the
  dashboards package").
- 29 Oct 2026: built from Figma and the prototype.
