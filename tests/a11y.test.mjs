import {describe, it, expect} from 'vitest';
import {summarize} from '../scripts/lib/a11y.mjs';

const v = (id, impact, nodes = 1) => ({id, impact, help: `${id} help`, helpUrl: `https://dequeuniversity.com/rules/axe/${id}`,
  nodes: Array.from({length: nodes}, (_, i) => ({target: [`#el-${i}`]}))});
const raw = [
  {title: 'Button', story: 'button--primary', direction: 'ltr', violations: []},
  {title: 'Select', story: 'select--example', direction: 'ltr', violations: [v('label', 'critical', 2)]},
  {title: 'Select', story: 'select--example', direction: 'rtl', violations: [v('label', 'critical'), v('target-size', 'serious')]},
];

describe('summarize', () => {
  const s = summarize(raw, '2026-10-29T12:00:00Z');
  it('groups by component and counts nodes, worst first', () => {
    expect(s.components.map(c => [c.title, c.violations])).toEqual([['Select', 4], ['Button', 0]]);
    expect(s.components[0].byRule).toEqual({label: 3, 'target-size': 1});
    expect(s.components[0].worst).toBe('critical');
    expect(s.components[0].stories).toBe(1);
  });
  it('keeps the DOM target of every occurrence, for the overview page to show (not just a count)', () => {
    const [first] = s.components[0].items;
    expect(first.targets).toEqual(['#el-0', '#el-1']);
  });
  it('says which palette the results hold for', () => {
    expect(s.palette).toMatch(/Go Vocal/);
  });
});
