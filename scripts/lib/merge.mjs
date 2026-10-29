// The Figma tokens (tokens/foundations.tokens.json, rewritten by every `npm run tokens:pull`) and the hand-authored
// ones Figma has no variables for yet (tokens/motion.tokens.json and tokens/size.tokens.json, Not in Figma) live in
// separate files, so a pull can never wipe the hand-authored ones; the build merges them here. A group comes from one
// file only: if Figma gains the group, delete it from the hand-authored file instead of letting one silently win.
export function mergeTokens(figma, ...handAuthored) {
  const merged = {...figma};
  for (const file of handAuthored)
    for (const [group, tokens] of Object.entries(file)) {
      if (group.startsWith('$')) continue; // the file's own $description
      if (group in merged) throw new Error(`token group "${group}" is in two token files: keep one`);
      merged[group] = tokens;
    }
  return merged;
}
