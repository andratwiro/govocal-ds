import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

// Written before this test; take a name off as its component gets a doc comment.
const NOT_YET = ['Tooltip', 'Data table', 'List header', 'List header cell', 'Stat row', 'Button',
  'Compact button', 'Icon button', 'Number field', 'Rich text editor', 'Rich text toolbar button', 'Switch', 'Text field',
  'Volunteering row', 'Vote progress', 'Side nav'];

function undescribed() {
  let section = '';
  const out = [];
  for (const line of readFileSync('docs/COMPONENTS.md', 'utf8').split('\n')) {
    if (line.startsWith('## ')) section = line.slice(3);
    const m = line.match(/^- \*\*([^*]+)\*\*(?: `\w+`)?(?: \(not in Figma\))?(:)?/);
    if (m && !/^(Base|Not in)/.test(section) && !m[2]) out.push(m[1]);
  }
  return out;
}

describe('docs/COMPONENTS.md', () => {
  it('describes every component and pattern in one line', () => {
    const missing = undescribed().filter(name => !NOT_YET.includes(name));
    expect(missing, 'give each a doc comment above its export whose first sentence says what someone would ask for, ' +
      'then run `npm run components:index`').toEqual([]);
  });
  it('lists no described component as not yet described', () => {
    expect(NOT_YET.filter(name => !undescribed().includes(name))).toEqual([]);
  });
});
