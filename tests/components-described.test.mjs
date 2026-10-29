import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

// Every entry in docs/COMPONENTS.md says what it is for, Base included: the line is read from the doc comment above
// the part's export, and a name-only line is what an agent can't pick from the index.
// Not described yet; take a name off as its part gets a doc comment.
const NOT_YET = ['Side nav', 'Volunteering row', 'Vote progress'];

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
    expect(undescribed().filter(name => !NOT_YET.includes(name)), 'give each a doc comment above its export whose first sentence says what someone would ask ' +
      'for, then run `npm run components:index`').toEqual([]);
  });
  it('lists no described entry as not yet described', () => {
    expect(NOT_YET.filter(name => !undescribed().includes(name))).toEqual([]);
  });
});
