import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, resolve, relative} from 'node:path';

const files = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : [p];
});
const src = files('backoffice/src');
const ALLOWED_PACKAGES = new Set(['react', 'react-dom/client', 'react-router', 'lucide-react']);

describe('back office uses only the system', () => {
  it('imports only components, tokens, allowed packages and its own files', () => {
    const bad = [];
    for (const f of src.filter(f => /\.(ts|tsx)$/.test(f))) {
      for (const m of readFileSync(f, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g)) {
        const spec = m[1] ?? m[2];
        if (spec.startsWith('.')) {
          const target = relative('.', resolve(f, '..', spec));
          const ok = target.startsWith('backoffice/src') || target.startsWith('src/components') ||
            target.startsWith('src/patterns') || target === 'src/tokens.css';
          if (!ok) bad.push(`${f}: ${spec}`);
        } else if (!ALLOWED_PACKAGES.has(spec)) bad.push(`${f}: ${spec}`);
      }
    }
    expect(bad).toEqual([]);
  });
  it('has one CSS file, layout only, tokens only', () => {
    const css = src.filter(f => f.endsWith('.css'));
    expect(css).toEqual(['backoffice/src/layout.css']);
    const text = readFileSync(css[0], 'utf8');
    expect(text).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\boklch\(/);
    expect(text).not.toMatch(/font-size:\s*\d|font:\s*\d/);
  });
});
