import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('docs/REACT-ARIA.md (Overview › What comes from React Aria)', () => {
  it('matches the code (run `npm run components:index` after adding a part or changing its React Aria imports)', () => {
    expect(() => execFileSync('node', ['scripts/react-aria-table.mjs', '--check'], {stdio: 'pipe'})).not.toThrow();
  });
  it('has a row for the parts a page reaches for most', () => {
    const doc = readFileSync('docs/REACT-ARIA.md', 'utf8');
    for (const part of ['Actions › Button', 'Forms › Select', 'Tables & lists › Data table', 'Overlays › Modal'])
      expect(doc).toContain(`| ${part} |`);
  });
});
