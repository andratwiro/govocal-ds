import {execFileSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';

describe('docs/COMPONENTS.md and public/llms.txt', () => {
  it('matches the stories (run `npm run components:index` after changing a story or a doc comment)', () => {
    expect(() => execFileSync('node', ['scripts/component-index.mjs', '--check'], {stdio: 'pipe'})).not.toThrow();
  });
});
