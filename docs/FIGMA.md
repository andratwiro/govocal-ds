# Figma and this repo

How the Figma file and the code talk to each other: what the file holds, how tokens and components travel, the way
back, the limits, and what is still missing. Researched 29 Oct 2026. Figma's plans, limits and plugins move, so check
Figma's own pages before paying for anything.

**Code wins** (docs/DESIGN.md). When Figma and the repo disagree, the repo is the truth. Tokens flow one way:
Figma → `tokens/` → `src/tokens.css`.

## The file

- **Go Vocal Design System.** Its key and the page names the scripts read are in `tokens/figma.config.json`.
- **Pages:** Cover · Foundations · Icons · Components · Patterns · Screens WIP. The Patterns page is added by the
  designer during the rename (the checklist in docs/NAMING.md).
- **Variables:** the colours, spacing, radius and type values. Components bind to them (about 10,000 bound uses).
- **9 text styles:** the type roles (Stat, Stat small, Title, Body strong, Body, UI strong, UI, Small strong, Small).
- **3 effect styles:** the shadows.
- **Components:** 32 on the Components page, 10 on the Patterns page (docs/NAMING.md lists them).
- **The Foundations page draws each variable** too: a swatch, a bar or a shape named after it. Today's token pull
  reads those drawings (below).

Code has things Figma doesn't, marked "Not in Figma":
- the motion and size tokens (`tokens/motion.tokens.json`, `tokens/size.tokens.json`, written by hand);
- every story or entry tagged `not-in-figma` (the sidebar's tag filter lists them).

## Tokens: Figma → code

### What the code does today

1. **`npm run tokens:pull`** (`scripts/figma-pull.mjs`) downloads the whole file through Figma's REST API. That is one
   call, made with your own token. It reads two pages and writes three files:
   - `tokens/foundations.tokens.json`: colours (the primitives, then the semantic roles that point at them),
     spacing, radius, the type roles and the shadows, in DTCG form;
   - `tokens/variable-ids.json`: each Figma variable's id → its CSS name (`figma:spec` uses it to name tokens);
   - `tokens/icons.json`: the icons drawn on the Icons page.

   It reads the **drawings** on the Foundations page, not the Variables themselves: Figma's Variables REST API is
   Enterprise-only. What it recognises (`scripts/lib/foundations.mjs`):
   - a frame named `group/role` holding a rectangle called "Swatch" → a colour;
   - a frame named `primitive/<family>-<step>` (the Primitives row) → that colour primitive only, so a primitive no
     semantic swatch points at (a tab's slate 750, an illustration's teal 75) still reaches code;
   - `space/<n>` with a "Bar" → a spacing step;
   - `radius/<n>` with a "Shape" → a radius;
   - `shadow/<name>` with a "Sample" → a shadow;
   - the roles inside the "Typography" frame → the type roles.

   A variable that isn't drawn there never reaches code.
2. **`npm run tokens:build`** (`scripts/build-tokens.mjs`) merges `foundations.tokens.json` with the two hand-written
   files (motion and size) and writes `src/tokens.css`. A group may live in one file only: the build stops if two
   files define it. The file list sits at the top of `build-tokens.mjs`; check there if this page drifts.
3. **Never edit `src/tokens.css` by hand.** `npm test` fails when it isn't exactly the build of the token files.

### The Variables export (the road to take)

Two exporters write DTCG JSON from the Variables themselves, so names, modes, aliases and descriptions come along.

- **TokensBrücke** (a free, open-source Figma plugin, from Figma Community). **Pick this one.**
  - It exports variables **and** text and effect styles, with modes and aliases, as DTCG 2025.10. It covers all
    three kinds of thing the file holds.
  - "Download JSON" needs no account. Pushing straight to GitHub (a commit or a PR) needs a GitHub personal access
    token, set inside the plugin.
  - Its user base is small but its code was active on 28 Oct 2026. Note the plugin version you use. If it goes quiet
    for months, Tokens Studio's free tier also syncs token sets to GitHub.
- **Figma's own export** (right-click a variables collection → Export). Figma announced it in November 2025 and rolled
  it out account by account. It isn't confirmed on the designer's Professional plan: look for the menu item. It
  exports variables only (no text or effect styles), one JSON file per mode.
- **Dev Mode can't export.** It shows one variable at a time.

Where the export goes: commit it into `tokens/` (the token review plans a `tokens/figma/` folder), then ask the agent
to bring it into the build and show the diff of `src/tokens.css`. **Today nothing reads an export as is**:
`build-tokens.mjs` reads `foundations.tokens.json` in the shape `tokens:pull` writes (Known gaps, below).

## Components: Figma → code

The designer's agent reads Figma through the **Figma MCP server**: Claude Code on the designer's own machine, signed
in to Figma with the designer's Full seat.

- **Servers:** the remote one, `https://mcp.figma.com/mcp`, needs no desktop app and has the most tools. The desktop
  app's local one is `http://127.0.0.1:3845/mcp`.
- **Adding it once**, in a terminal: `claude mcp add --transport http figma https://mcp.figma.com/mcp`. Then type
  `/mcp` in Claude Code and sign in to Figma in the browser. It needs no token.
- **Budget:** on a Professional plan, a Full or Dev seat gets about **200 calls a day, 10 a minute**. A View or
  Collab seat gets about 20 a month (one source says 6): too few to work with.
- **The tools the agent uses:**
  - `get_design_context`: a frame's structure and values;
  - `get_variable_defs`: the variables a frame uses (with nothing selected, the whole file's);
  - `get_screenshot`, `get_metadata`, `get_code_connect_map`.
- **How to ask:** in Figma, right-click the frame → Copy link to selection. Paste it to the agent: "apply this to
  <component>". The agent first lists what it reuses and what is new, then edits (docs/DESIGN.md, "The designer's
  loop").
- **`npm run figma:spec -- "<Name>"`** prints a component from the cached file: its properties, sizes, gaps,
  padding, and the token each value is bound to. It makes no network call. Good for a quick check; use the MCP for
  anything new. It finds a name before and after the Figma rename (`Rail header` or `Project rail/Rail header`).

## Back to Figma

- **The agent draws in Figma** through the same MCP (`use_figma`, in beta since 24 Mar 2026, free during the beta).
  It needs Claude Code (or another code client) and a Full seat; a Dev or Collab seat writes drafts only. Figma says
  it builds with the file's own components and variables: check the bindings after, raw values may land instead.
- **claude.ai on the web can't do this.** Its Figma connector reads; it draws only FigJam diagrams.
- **Or redraw by hand** (docs/DESIGN.md).
- **Links from code to Figma:** each story links to its Figma node (the Design tab in Storybook). The link uses the
  `node-id`, which survives a rename and a move to another page.
- **Links from Figma to code** (a Storybook link on the layer): none set up yet. The options found:
  - Dev Resources, in Dev Mode: by hand per layer, or a small script with your own token (not built).
  - Storybook Connect: needs the Storybook published to Chromatic as well; Chromatic's free plan covers it.
  - story.to.design (paid, $149 a month and up) and html.to.design (10 free imports a month; it makes frames, not
    components bound to your variables).
  - Code Connect works on a Professional plan, but its Storybook integration is deprecated.

## The REST API, its limit, and the cache

- **Who calls it:** `npm run tokens:pull` (always) and `npm run figma:spec` (only with `--fresh`). Both fetch the whole
  file, about 9 MB.
- **The limit:** Figma limits REST calls by the plan and the seat of the token's owner. A View or Collab seat gets the
  lowest limit. On 29 Oct 2026 a burst of calls from a view-seat token got "429 Too Many Requests" for about 4.6 days,
  and every call during the lock made it worse. A Full seat's limit is higher; its exact figure wasn't measured here.
- **So `figma:spec` reads a local copy:** `.cache/figma-<file key>.json`. `.cache/` is gitignored: the copy is not in
  the repo. Without it, `figma:spec` stops and says so; it never downloads quietly.
- **`--fresh`** downloads the file (one call) and rewrites the copy: `npm run figma:spec -- "Button" --fresh`. Use it
  when the Figma file has changed. `tokens:pull` rewrites the copy too.
- **Worktrees:** copy or link `.cache/` from the main checkout rather than downloading again.
- **The MCP has its own budget** (above). Use it for day-to-day work; keep REST calls for a token pull.

## Your own Figma token

- **Each person uses their own** personal access token, never a shared one. (Tokens owned by a plan exist only on
  Organization and Enterprise.)
- **To make one:** in Figma, open Settings → Security → Personal access tokens → Generate new token. Give it read
  access to file content (`file_content:read`). Add write access to dev resources only if you'll link layers to
  stories. Figma shows the token once.
- **To give it to the scripts:** set `FIGMA_TOKEN` in your shell, for example a line
  `export FIGMA_TOKEN=<your token>` in `~/.zshrc`.
- **Never** commit it, paste it into a chat, a story or an issue, or print it in a log. If it leaks, revoke it on the
  same Settings page and make a new one.

### What `scripts/lib/figma.mjs` reads today

| Setting | What it is | Default today |
|---|---|---|
| `FIGMA_TOKEN` | Your personal access token. | The file `~/.creds/figma_token` (see Known gaps). |
| `FIGMA_API` | The API's base address. When set, the scripts talk to a gateway that adds the token itself, and `FIGMA_TOKEN` isn't sent. | `https://api.figma.com/v1` |
| `FIGMA_CERT`, `FIGMA_KEY`, `FIGMA_CA` | The gateway's client certificate, key and certificate authority. Read only when `FIGMA_API` is set. | `~/.gateway/cert.pem`, `~/.gateway/key.pem`, `/etc/clankers/gateway-ca.pem` (see Known gaps) |
| `--fresh` | Download instead of reading `.cache/`. | Off for `figma:spec`; `tokens:pull` always downloads. |
| `tokens/figma.config.json` | The file key and the page names: Foundations, Components, Patterns, Icons. | (tracked) |
| `tokens/variable-ids.json` | Variable id → CSS name, written by `tokens:pull`. | (tracked) |

With plain Figma, set `FIGMA_TOKEN` and nothing else.

## Known gaps

1. **Token fallback file, to remove.** `scripts/lib/figma.mjs:12` falls back to `~/.creds/figma_token`, one
   machine's convention. `FIGMA_TOKEN` alone should do.
2. **Gateway defaults, to remove.** `scripts/lib/figma.mjs:23-25` default to certificate paths on the project lead's
   home server (`~/.gateway/…`, `/etc/clankers/gateway-ca.pem`). Drop the defaults, or the gateway branch.
3. **No cache in the repo.** On 29 Oct the cached file existed on one machine only. A fresh clone's first `figma:spec`
   needs `--fresh` (one call). Option: commit a slim, components-only copy.
4. **No importer for the Variables export.** `build-tokens.mjs` reads the shape `tokens:pull` writes. Until an importer
   exists, the agent maps an export into `foundations.tokens.json` by hand and the CSS diff is checked.
5. **The pull reads drawings, so some variables are lost.** 18 bound variables have no name in code: the 14 type
   variables, two stroke widths (1px and 2px) and two sizes (28 and 24).
6. **Type role descriptions are copied.** The names and one-line uses on Foundations/Typography were copied by hand
   from the cached file; they won't follow a Figma edit.
7. **Code syntax unconfirmed.** docs/DESIGN.md says each variable's code syntax in Figma is `var(--gv-…)`, so the MCP
   hands the agent real token names. The cached file can't show code syntax, so this is unchecked.
8. **Not confirmed:** Figma's native export on the designer's plan; whether `get_variable_defs` returns modes and
   aliases; how reliably `use_figma` binds variables rather than raw values.
