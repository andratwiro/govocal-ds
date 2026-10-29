import {readFileSync, readdirSync} from 'node:fs';

// lucide-react exports PascalCase ("ChevronRight", "Building2"); the Icons page names kebab-case ("chevron-right").
export const toKebab = name => name.replace(/(?<=[a-z0-9])([A-Z])|(?<=[A-Za-z])([0-9])/g, (_, a, b) => `-${a ?? b}`).toLowerCase();

// Every lucide icon the code imports (stories left out), kebab-case, with the files that use it.
export function iconsInUse(dirs = ['src', 'backoffice/src']) {
  const used = new Map();
  for (const dir of dirs) {
    for (const f of readdirSync(dir, {recursive: true})) {
      if (!/\.tsx?$/.test(f) || f.includes('.stories.')) continue;
      const text = readFileSync(`${dir}/${f}`, 'utf8');
      for (const [, list] of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g)) {
        for (const raw of list.split(',')) {
          const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0];
          if (!/^[A-Z]/.test(name) || /Props$|^Lucide/.test(name)) continue;
          const key = toKebab(name.replace(/Icon$/, ''));
          if (!used.has(key)) used.set(key, new Set());
          used.get(key).add(`${dir}/${f}`);
        }
      }
    }
  }
  return new Map([...used].sort(([a], [b]) => a.localeCompare(b)));
}
