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

describe('what a part reaches through the system\'s own parts', () => {
  const doc = readFileSync('docs/REACT-ARIA.md', 'utf8');
  const row = part => doc.split('\n').find(l => l.startsWith(`| ${part} |`)) ?? '';
  it('follows every local import, however deep, and names the part each comes through', () => {
    expect(row('Data display › List header')).toContain('through List header cell: `Button`');
    expect(row('Data display › List header')).toContain('through Checkbox: ');
    expect(row('Status & feedback › Banner')).toContain('`Link`; through Icon button: `Button`');
  });
  it('names parts, never file paths', () => {
    expect(doc).not.toMatch(/through `?(components|patterns)\//);
  });
});
