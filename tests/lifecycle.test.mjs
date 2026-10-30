import {describe, expect, it} from 'vitest';
import {STAGES} from '../scripts/lib/guide.mjs';
import {parts} from '../scripts/lifecycle.mjs';

// Every part carries its lifecycle stage (Overview/Lifecycle) as exactly one `status:<stage>` tag on its stories
// file's meta, and the stage is the one the rule in scripts/lifecycle.mjs gives from repo facts (Figma, back-office
// use, its own test, a developer's review). A part added later arrives tagged: `npm run lifecycle` writes the tag.
// e2e/component-page.spec.ts checks the tag reaches the built Storybook's index.json.
const all = parts();

describe('lifecycle', () => {
  it('finds the parts', () => {
    expect(all.length).toBeGreaterThan(90);
  });

  it('every part carries exactly one status tag, naming a stage', () => {
    const bad = all.filter(p => p.status.length !== 1 || !STAGES.includes(p.status[0].slice('status:'.length)));
    expect(bad.map(p => `${p.file}: ${p.status.join(', ') || 'no status tag'}`), 'run npm run lifecycle').toEqual([]);
  });

  it("every part's tag is the stage the rule gives", () => {
    const off = all.filter(p => p.status[0] !== `status:${p.stage}`);
    expect(off.map(p => `${p.file}: ${p.status[0]}, the rule says status:${p.stage}`), 'run npm run lifecycle').toEqual([]);
  });

  it('nothing is stable before a developer has reviewed it', () => {
    expect(all.filter(p => p.stage === 'stable' && !p.reviewed).map(p => p.title)).toEqual([]);
  });
});
