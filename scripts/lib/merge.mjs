// The Figma tokens (tokens/foundations.tokens.json, rewritten by every `npm run tokens:pull`) and the hand-authored
// ones Figma has no variables for yet (Not in Figma: tokens/semantic.tokens.json, motion.tokens.json and
// size.tokens.json) live in separate files, so a pull can never wipe the hand-authored ones; the build merges them here,
// by token path. A hand-written token may join a Figma group (`surface.danger` beside Figma's `surface.*`), but one path
// comes from one file only: when Figma gains a token, delete it from the hand-authored file instead of letting one
// silently win.
const isToken = node => node !== null && typeof node === 'object' && '$value' in node;

function into(target, source, path) {
  for (const [key, node] of Object.entries(source)) {
    if (key.startsWith('$')) { if (path.length && !(key in target)) target[key] = node; continue; }
    const at = [...path, key].join('.');
    if (!(key in target)) { target[key] = node; continue; }
    if (isToken(node) || isToken(target[key])) throw new Error(`token "${at}" is in two token files: keep one`);
    target[key] = into({...target[key]}, node, [...path, key]);
  }
  return target;
}

export function mergeTokens(figma, ...handAuthored) {
  return handAuthored.reduce((merged, file) => into(merged, file, []), {...figma});
}

/**
 * Lays tokens/descriptions.json over the merged tree: `$description` for the Figma tokens, whose drawing carries none.
 * Keyed by CSS name; a key ending in `-*` describes every token under that prefix (a primitive ramp). A key that
 * names no token, or a token that already has a description, is refused (one place says what a token is for).
 */
export function describe(merged, descriptions, nameOf) {
  const tokens = structuredClone(merged);
  const byName = new Map();
  const walk = (node, path) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (isToken(child)) byName.set(nameOf([...path, key]), child); else walk(child, [...path, key]);
    }
  };
  walk(tokens, []);
  // Single tokens first, so a ramp's text only fills what no line of its own describes.
  const entries = Object.entries(descriptions).sort(([a], [b]) => Number(a.endsWith('-*')) - Number(b.endsWith('-*')));
  for (const [name, text] of entries) {
    if (name.startsWith('$')) continue;
    if (name.endsWith('-*')) {
      const ramp = [...byName].filter(([n, t]) => n.startsWith(name.slice(0, -1)) && !t.$description);
      if (!ramp.length) throw new Error(`tokens/descriptions.json describes ${name}, which matches no token`);
      for (const [, t] of ramp) t.$description = text;
      continue;
    }
    const token = byName.get(name);
    if (!token) throw new Error(`tokens/descriptions.json describes ${name}, which is no token`);
    if (token.$description) throw new Error(`${name} has a $description in its own file and in tokens/descriptions.json`);
    token.$description = text;
  }
  return tokens;
}
