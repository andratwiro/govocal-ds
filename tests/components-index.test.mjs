import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {purpose} from '../scripts/lib/doc-comment.mjs';

describe('docs/COMPONENTS.md and public/llms.txt', () => {
  it('matches the stories (run `npm run components:index` after changing a story or a doc comment)', () => {
    expect(() => execFileSync('node', ['scripts/component-index.mjs', '--check'], {stdio: 'pipe'})).not.toThrow();
  });
});

describe('a part\'s Purpose line', () => {
  it('is the first sentence: a semicolon goes on, a full stop ends it', () => {
    const src = '/** Check a form before it is sent; say what is wrong next to each field. Then send it. */\nexport const meta = {};';
    expect(purpose(src, 'meta')).toBe('Check a form before it is sent; say what is wrong next to each field.');
  });
  it('keeps a question or an exclamation as its own sentence end', () => {
    expect(purpose('/** Who can take part? Everyone. */\nexport function Who() {}', 'Who')).toBe('Who can take part?');
  });
});

describe('a recipe\'s line', () => {
  it('says what the recipe is for, from the comment above its meta, not its component\'s Purpose', () => {
    const line = readFileSync('docs/COMPONENTS.md', 'utf8').split('\n').find(l => l.startsWith('- **Form validation**')) ?? '';
    expect(line).toContain('a recipe: every field in its invalid state, and a form that checks itself on submit');
  });
});
