import {describe, it, expect} from 'vitest';
import {findComponent, lastSegment} from '../scripts/lib/figma.mjs';

// figma:spec looks a component up on the Components and Patterns pages by its last slash segment (docs/NAMING.md).
const set = (name, variants = []) => ({type: 'COMPONENT_SET', name, children: variants.map(v => ({type: 'COMPONENT', name: v}))});
const components = {name: 'Components', children: [
  {type: 'TEXT', name: 'Actions'},
  {type: 'FRAME', name: 'Row', children: [set('Actions/Button', ['Style=Primary']), set('Actions/Compact button')]},
  set('Status & feedback/Badge', ['Icon=Yes', 'Icon=No'])
]};
const patterns = {name: 'Patterns', children: [set('Project rail/Rail header'), {type: 'COMPONENT', name: 'Project page/Project header'}]};
const names = matches => matches.map(m => `${m.page}:${m.node.name}`);

describe('findComponent', () => {
  it('takes the last slash segment', () => {
    expect(lastSegment('Project rail/Rail header')).toBe('Rail header');
    expect(lastSegment('Badge')).toBe('Badge');
  });
  it('finds a component by its last segment on either page', () => {
    expect(names(findComponent([components, patterns], 'Button'))).toEqual(['Components:Actions/Button']);
    expect(names(findComponent([components, patterns], 'Rail header'))).toEqual(['Patterns:Project rail/Rail header']);
    expect(names(findComponent([components, patterns], 'Project page/Project header'))).toEqual(['Patterns:Project page/Project header']);
  });
  it('matches a full path on its last segment too, and a name not yet grouped', () => {
    expect(names(findComponent([components, patterns], 'Data display/Badge'))).toEqual(['Components:Status & feedback/Badge']);
    expect(names(findComponent([{name: 'Components', children: [set('Rail header')]}], 'Project rail/Rail header')))
      .toEqual(['Components:Rail header']);
  });
  it('never matches a variant, a partial name or another page', () => {
    expect(findComponent([components, patterns], 'Icon=Yes')).toEqual([]);
    expect(findComponent([components, patterns], 'Compact')).toEqual([]);
    expect(findComponent([components], 'Rail header')).toEqual([]);
  });
  it('prefers the exact name when two share a last segment', () => {
    const both = [{name: 'Components', children: [set('Forms/Card')]}, {name: 'Patterns', children: [set('Project page/Card')]}];
    expect(names(findComponent(both, 'Project page/Card'))).toEqual(['Patterns:Project page/Card']);
    expect(names(findComponent(both, 'Card'))).toEqual(['Components:Forms/Card', 'Patterns:Project page/Card']);
  });
});
