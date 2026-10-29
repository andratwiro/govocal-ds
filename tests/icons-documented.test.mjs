import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {iconsInUse} from '../scripts/lib/icons-in-use.mjs';

describe('Icons page', () => {
  it('lists every lucide icon the components and the back office import', () => {
    const listed = JSON.parse(readFileSync('tokens/icons-in-use.json', 'utf8')).used;
    const missing = [...iconsInUse().keys()].filter(name => !listed.includes(name));
    expect(missing, 'run `npm run icons:in-use` so the Icons page shows them').toEqual([]);
  });
});
