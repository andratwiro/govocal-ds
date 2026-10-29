import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

// Every entry in docs/COMPONENTS.md says what it is for, Base included: the line is read from the doc comment above
// the part's export, and a name-only line is what an agent can't pick from the index.

function undescribed() {
  const out = [];
  for (const line of readFileSync('docs/COMPONENTS.md', 'utf8').split('\n')) {
    const m = line.match(/^- \*\*([^*]+)\*\*(?: `\w+`)?(?: \([^)]*\))?(:)?/);
    if (m && !m[2]) out.push(m[1]);
  }
  return out;
}

describe('docs/COMPONENTS.md', () => {
  it('describes every entry in one line', () => {
    expect(undescribed(), 'give each a doc comment above its export whose first sentence says what someone would ask ' +
      'for, then run `npm run components:index`').toEqual([]);
  });
});
