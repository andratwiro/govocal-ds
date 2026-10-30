// A prop's default as the Props table shows it. Parts write a default that comes from their words as
// `@default \`labels.field\` ("Description")` (docs/API.md, rule 11). Storybook JSON-quotes the default of a string prop,
// so the table read `"\`labels.field\` (\"Description\")"`: quotes around it, the backticks and escaped quotes inside.
// Used by .storybook/preview.tsx (an argTypes enhancer); no Node imports, the preview bundles it.

/** `"\`labels.field\` (\"Description\")"` → `labels.field ("Description")`; any other default is left as it is. */
export function readableDefault(summary) {
  if (typeof summary !== 'string') return summary;
  let s = summary;
  if (/^".*"$/s.test(s)) {
    try {
      const inner = JSON.parse(s);
      // Unquote only what Storybook quoted around a written expression; a bare word keeps its quotes ("Description").
      if (typeof inner === 'string' && /[`'"]/.test(inner)) s = inner;
    } catch { /* not JSON: leave it */ }
  }
  return s.replace(/`([^`]+)`/g, '$1');
}
