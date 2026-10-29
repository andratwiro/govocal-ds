import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {report} from '../scripts/api-report.mjs';

// docs/API-REPORT.md is the public API as TypeScript reads it: every exported name and each component's props. It is
// regenerated with every API change, so the change shows up as a diff developers review.
describe('docs/API-REPORT.md', () => {
  it('is current', () => {
    const fresh = report();
    const stale = readFileSync('docs/API-REPORT.md', 'utf8') !== fresh;
    expect(stale, 'run `npm run api:report` and review the diff in docs/API-REPORT.md').toBe(false);
  }, 120_000);
  it('describes every prop the govocal-ds entry point declares itself', () => {
    // Base's props (govocal-ds/base) are React Aria's starter parts; a library's props are listed by name only.
    const own = readFileSync('docs/API-REPORT.md', 'utf8').split('## `govocal-ds/base`')[0];
    let heading = '';
    const bare = [];
    for (const line of own.split('\n')) {
      if (line.startsWith('### ')) heading = line.slice(4);
      else if (line.endsWith('(no description)')) bare.push(`${heading} ${line.slice(2, -17)}`);
    }
    expect(bare, 'give each a doc comment (/** … */ above the prop), then run `npm run api:report`').toEqual([]);
  });
});
