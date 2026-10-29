# Storybook benchmark (29 Oct 2026)

Research for the next audit of this Storybook: which public Storybooks are the best to compare it with, what each does
best, which work belongs to design whatever developers decide, and a 0–100 rubric to score it.

- **[report.md](report.md)**: the synthesis. Start here. A panel of six live Storybooks to score first, seven pieces of
  design-owned work, the four calls that stay with developers, and the rubric (85 points design-owned, 15 developer
  readiness).
- **notes/**: the research behind it, one file per angle, every claim with its source. Read them for the evidence, not
  the conclusions.
  - [product-exemplars.md](notes/product-exemplars.md): Storybooks from product companies (Canvas Kit, Vibe, EUI, Carbon,
    Grafana, Circuit, Bitwarden, Primer…), checked live.
  - [civic-and-react-aria-exemplars.md](notes/civic-and-react-aria-exemplars.md): public-sector systems (NL Design
    System, Designsystemet, Amsterdam…) and systems built on React Aria (Kaizen, React Spectrum S2, Hopper, B.C. Gov).
  - [tokens.md](notes/tokens.md): the token format, naming, enforcement, renames and theming.
  - [designer-bible-and-language.md](notes/designer-bible-and-language.md): component page anatomy, teaching structure,
    naming and UI copy.
  - [developer-trust-and-ai.md](notes/developer-trust-and-ai.md): what a designer-owned, agent-built library has to prove
    before developers import it.
  - [design-side-contract.md](notes/design-side-contract.md): what design delivers whatever stack developers choose.
  - [designer-owned-code-and-agents.md](notes/designer-owned-code-and-agents.md): designers owning component code with
    agents, the styling boundary, the agent interface, review of component changes.
  - [audit-rubrics.md](notes/audit-rubrics.md): existing maturity models and checklists, and how the rubric was built.

The model behind it: the design side owns this Storybook, component code included, built with AI agents; developers
import the components and compose screens; they keep the strategic calls (whether and how to adopt it, the base library
underneath, how it reaches their apps). The rubric's weights and its cap at 60 are proposals, to be tuned once after
the six panel Storybooks are scored.

What to do about it: [docs/plans/2026-10-30-benchmark-gaps.md](../../plans/2026-10-30-benchmark-gaps.md).
