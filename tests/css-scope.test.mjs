import {describe, it, expect} from 'vitest';
import {spawnSync} from 'node:child_process';
import {readFileSync, readdirSync} from 'node:fs';

// Base's stylesheets paint only the elements the system renders: each carries its own `gv-base-<x>` beside React
// Aria's global `react-aria-X`, and src/components/*.css selects the former (`npm run css:scope`, the review's H3).
// A host app's own React Aria elements stay as the app paints them.
describe("Base's stylesheets select the system's own classes, not React Aria's global ones", () => {
  it('npm run css:scope has nothing to change and nothing it could not scope', () => {
    const run = spawnSync(process.execPath, ['scripts/scope-base-css.mjs', '--check'], {encoding: 'utf8'});
    expect(run.stderr, 'run `npm run css:scope` and commit what it writes').toBe('');
    expect(run.status).toBe(0);
  });
  it('a top-level rule names React Aria\'s global class only under, or holding, a part of the system', () => {
    const loose = [];
    for (const f of readdirSync('src/components').filter(f => f.endsWith('.css'))) {
      const css = readFileSync(`src/components/${f}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const open = []; // per open block: is it a rule (not an at-rule)?
      let buf = '';
      for (const ch of css) {
        if (ch === '{') {
          const sel = buf.split(/[;}]/).pop().trim();
          const rule = !sel.startsWith('@');
          if (rule && !open.includes(true))
            for (const part of sel.split(','))
              if (/\.react-aria-[A-Za-z]+(?![\w-])/.test(part) && !/\.gv-base-/.test(part)) loose.push(`${f}: ${part.trim()}`);
          open.push(rule);
          buf = '';
        } else if (ch === '}') { open.pop(); buf = ''; } else buf += ch;
      }
    }
    expect(loose).toEqual([]);
  });
});
