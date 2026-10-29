// A part's guide: `<Name>.guide.md` beside its `<Name>.stories.tsx`, the one source of its usage guidance. Read by the
// docs page (.storybook/DocsPage.tsx), the components manifest (.storybook/main.ts, `experimental_manifests`),
// docs/COMPONENTS.md (scripts/component-index.mjs) and the guard (tests/component-pages.test.mjs). Plain Markdown, one
// `## ` heading per section, in the order below. No Node imports: the docs page bundles this file.

/** The page's thirteen sections, in order. */
export const SECTIONS = [
  'Purpose', 'Status', 'When to use', 'When not to use', 'Anatomy', 'Variants and states', 'Behaviour', 'Content',
  'Accessibility', 'Tokens', 'Related', 'Provenance', 'Changes'
];

/** Sections the page makes itself: Purpose (the doc comment), Status (the `status:` tag), Variants and states (the
 * stories), Tokens (the token usage file). A guide never writes them. */
export const MADE = ['Purpose', 'Status', 'Variants and states', 'Tokens'];

/** Sections a guide may leave out: the page says "Not yet recorded" (Task 7 fills Provenance in). */
export const OPTIONAL = ['Provenance'];

/** Sections a written guide must have, non-empty. */
export const WRITTEN = SECTIONS.filter(s => !MADE.includes(s) && !OPTIONAL.includes(s));

/** The stages a part's `status:<stage>` tag can name; no tag reads as the first. */
export const STAGES = ['draft', 'candidate', 'stable'];

export const APG = /https:\/\/www\.w3\.org\/WAI\/ARIA\/apg\/patterns\/[a-z-]+\/?/;

/** `{sections: {name: body}, order: [names as written]}`; text before the first `## ` (a `# ` title) is ignored. */
export function parseGuide(text) {
  const sections = {};
  const order = [];
  let name = null;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const h = line.match(/^## (.+?)\s*$/);
    if (h) { name = h[1]; order.push(name); sections[name] = ''; continue; }
    if (name) sections[name] += line + '\n';
  }
  for (const k of Object.keys(sections)) sections[k] = sections[k].trim();
  return {sections, order};
}

/** The words in bold: `**Link**` → `Link`. A part's name in bold is a reference to that part. */
export function boldNames(md) {
  return [...md.matchAll(/\*\*([^*]+)\*\*/g)].map(m => m[1].trim());
}

/** Bullets (`- …`), one string each. */
export function bullets(md) {
  return md.split('\n').filter(l => /^\s*[-*] /.test(l)).map(l => l.replace(/^\s*[-*] /, '').trim());
}

/** The keyboard table's rows: a Markdown table whose first header cell is "Key". Cells are trimmed strings. */
export function keyboardRows(md) {
  const lines = md.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  const cells = l => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const head = lines.findIndex(l => /^key$/i.test(cells(l)[0]));
  if (head < 0) return [];
  const rows = [];
  for (const l of lines.slice(head + 1)) {
    if (/^\|?\s*:?-{3,}/.test(l)) continue;
    rows.push(cells(l));
  }
  return rows;
}

/** Storybook's id for a title: `Components/Tables & lists/Data table` → `components-tables-lists-data-table`. */
export function titleToId(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** The first sentence of a doc comment, prototype asides dropped (as docs/COMPONENTS.md writes it). */
export function firstSentence(text) {
  const t = (text ?? '').replace(/\s+/g, ' ').replace(/\s*\([^)]*prototype[^)]*\)/gi, '').trim();
  return t.match(/^.*?[.;](?=\s+[A-Z`]|$)/)?.[0] ?? t;
}
