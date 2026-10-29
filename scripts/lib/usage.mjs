import {basename} from 'node:path';

export function scanUsage(files) {
  const map = {};
  for (const {path, text} of files) {
    const name = basename(path) === 'layout.css' ? 'Back office' : basename(path, '.css');
    for (const [, v] of text.matchAll(/var\(\s*(--gv-[a-z0-9-]+)/g)) (map[v] ??= new Set()).add(name);
  }
  return Object.fromEntries(Object.entries(map).map(([k, s]) => [k, [...s].sort()]));
}
