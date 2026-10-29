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
});
