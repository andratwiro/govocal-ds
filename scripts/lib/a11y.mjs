const RANK = {minor: 1, moderate: 2, serious: 3, critical: 4};
export function summarize(raw, generatedAt = new Date().toISOString()) {
  const byTitle = new Map();
  for (const r of raw) {
    const c = byTitle.get(r.title) ?? {title: r.title, storyIds: new Set(), violations: 0, byRule: {}, worst: null, items: []};
    c.storyIds.add(r.story);
    for (const x of r.violations) {
      const n = x.nodes.length;
      c.violations += n;
      c.byRule[x.id] = (c.byRule[x.id] ?? 0) + n;
      if (!c.worst || RANK[x.impact] > RANK[c.worst]) c.worst = x.impact;
      const targets = x.nodes.map(node => (node.target ?? []).join(' ')).filter(Boolean);
      c.items.push({story: r.story, direction: r.direction, rule: x.id, impact: x.impact, help: x.help, helpUrl: x.helpUrl, nodes: n, targets});
    }
    byTitle.set(r.title, c);
  }
  const components = [...byTitle.values()]
    .map(({storyIds, ...c}) => ({...c, stories: storyIds.size}))
    .sort((a, b) => b.violations - a.violations || a.title.localeCompare(b.title));
  return {generatedAt, palette: "Go Vocal's own palette (no city colours yet)", components};
}
