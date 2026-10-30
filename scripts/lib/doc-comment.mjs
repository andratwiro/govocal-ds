// The first sentence of the JSDoc (or the // comment block) right above `export function|const <Name>`, prototype
// asides dropped: a part's Purpose in docs/COMPONENTS.md and public/llms.txt. A sentence ends at ".", "!" or "?" before
// a capital, a backtick or the end; a semicolon goes on (it joins two halves of one sentence).
export function purpose(source, name) {
  const m = source.match(new RegExp(`/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\s*export (?:function|const) ${name}\\b`)) ??
    source.match(new RegExp(`((?:^//.*\\n)+)export (?:function|const) ${name}\\b`, 'm'));
  if (!m) return '';
  const text = m[1].replace(/^\s*(?:\*|\/\/)\s?/gm, ' ').replace(/\s+/g, ' ').replace(/\s*\([^)]*prototype[^)]*\)/gi, '').trim();
  const first = text.match(/^.*?[.!?](?=\s+[A-Z`]|$)/)?.[0] ?? text;
  return first.length > 160 ? first.slice(0, 157).trimEnd() + '…' : first;
}
