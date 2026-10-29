import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';
import {FAULTS} from '../scripts/break-it.mjs';

// Overview/Checks lists every guard in plain words (src/overview/guards.json), the last `npm run check` and the last
// `npm run break-it`. A new guard needs its line there, so the page never hides one.
const guards = JSON.parse(readFileSync('src/overview/guards.json', 'utf8'));
const files = [...readdirSync('tests').filter(f => f.endsWith('.test.mjs')).map(f => `tests/${f}`),
  ...readdirSync('e2e').filter(f => f.endsWith('.spec.ts')).map(f => `e2e/${f}`)].sort();
const GROUPS = ['Tokens and paint', 'Structure and CSS', 'Public API and docs', 'Words and locale', 'Components behave',
  'Back office screens', 'Site and Storybook'];

describe('Overview/Checks', () => {
  it('says in plain words what every guard proves', () => {
    expect(files.filter(f => !guards[f]?.what?.trim()),
      'add a line for each to src/overview/guards.json: {"group": one of the page\'s groups, "what": what it proves, ' +
      'for a designer}').toEqual([]);
  });
  it('lists no guard that is gone', () => {
    expect(Object.keys(guards).filter(f => !files.includes(f))).toEqual([]);
  });
  it('puts every guard in one of the page\'s groups', () => {
    expect(Object.entries(guards).filter(([, g]) => !GROUPS.includes(g.group)).map(([f]) => f)).toEqual([]);
  });
  it('shows a break-it run in which every fault turned a check red', () => {
    const run = JSON.parse(readFileSync('src/overview/break-it.json', 'utf8'));
    expect(run.faults.map(f => f.name)).toEqual(FAULTS.map(f => f.name));
    expect(run.faults.filter(f => !f.caughtBy.length).map(f => f.name), 'run `npm run break-it`').toEqual([]);
  });
});
