import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, existsSync} from 'node:fs';

// A component's stylesheet selects only its own block: the `gv-…` classes its own TSX writes (`gv-card`,
// `gv-card__title`, `gv-card--compact`), plus states and elements (`[data-*]`, `[aria-*]`, `[dir]`, `svg`). Reaching
// into another part's classes (`.gv-pill` inside Data table, `.react-aria-Popover` inside Setup step) ties the two:
// a change inside Badge silently changes Data table, and no test links them. The child exposes what the parent needs
// instead: a prop, a documented custom property, or a class the parent passes it (className places, never paints).
// Base's own stylesheets (src/components/*.css) are the H3 scope script's business, not this guard's.
const DIRS = ['src/components/gv', 'src/patterns'];

// Today's reach-ins, per stylesheet. The list only shrinks: a new one fails, and so does an entry that is gone (take
// it off). Most are React Aria's or the starter's inner classes (`.react-aria-*`, `.indicator`, `.track`), which the
// starter wrappers don't expose another way yet.
export const REACH_INS = {
  'src/components/gv/AlertDialog.css': ['.react-aria-Modal'],
  'src/components/gv/Card.css': ['.gv-icon-button', '.gv-required', '.handle', '.radio-items', '.react-aria-Input',
    '.react-aria-Label', '.react-aria-Popover', '.react-aria-RadioButton', '.react-aria-RadioGroup',
    '.react-aria-SwitchButton', '.track'],
  'src/components/gv/Checkbox.css': ['.indicator', '.react-aria-CheckboxButton'],
  'src/components/gv/ChoiceCard.css': ['.indicator'],
  'src/components/gv/DashboardCard.css': ['.gv-bar-row', '.gv-empty-state'],
  'src/components/gv/DataTable.css': ['.gv-checkbox', '.gv-pill', '.gv-pill__label', '.react-aria-Link'],
  'src/components/gv/ListRow.css': ['.gv-checkbox'],
  // Map view: MapLibre's own canvas classes (an engine's DOM, not a system part) and the zoom buttons.
  'src/components/gv/MapView.css': ['.gv-icon-button', '.maplibregl-canvas-container', '.maplibregl-interactive'],
  'src/components/gv/Modal.css': ['.react-aria-Modal'],
  'src/components/gv/MultilingualRichTextEditor.css': ['.gv-editor__area'],
  'src/components/gv/MultilingualTextField.css': ['.react-aria-Label'],
  'src/components/gv/OptionList.css': ['.react-aria-Button', '.react-aria-Input'],
  'src/components/gv/SegmentedControl.css': ['.gv-new-dot'],
  'src/components/gv/TagPicker.css': ['.react-aria-Button', '.react-aria-Popover'],
  'src/components/gv/TitleField.css': ['.react-aria-FieldError', '.react-aria-Input'],
  'src/patterns/AccessRights.css': ['.gv-choice-card__button', '.gv-section-label', '.radio-items', '.react-aria-Select',
    '.react-aria-SwitchButton'],
  'src/patterns/CommonGroundRow.css': ['.gv-checkbox'],
  'src/patterns/FilterMenu.css': ['.gv-icon-button', '.react-aria-Menu', '.react-aria-MenuItem'],
  'src/patterns/NotificationList.css': ['.gv-new-dot'],
  'src/patterns/NotificationRow.css': ['.react-aria-SwitchField'],
  'src/patterns/ParticipantActionRow.css': ['.gv-number-field-wrap', '.react-aria-Label', '.react-aria-NumberField',
    '.react-aria-RadioGroup', '.react-aria-SwitchField'],
  'src/patterns/ProjectHeader.css': ['.gv-segment'],
  'src/patterns/SetupStep.css': ['.gv-option-list', '.gv-pill', '.gv-pill__label', '.react-aria-Popover'],
  'src/patterns/ViewOptionRow.css': ['.react-aria-Button', '.react-aria-Link', '.react-aria-SwitchField']
};

/** Every selector in a stylesheet (nesting kept as written; at-rule preludes and keyframe steps carry no class). */
export function selectors(css) {
  const out = [];
  let buf = '';
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (ch === '{') {
      const s = buf.split(/[;}]/).pop().trim();
      if (s && !s.startsWith('@')) out.push(s);
      buf = '';
    } else if (ch === '}') buf = '';
    else buf += ch;
  }
  return out;
}

const block = c => c.replace(/(__|--).*$/, '');

/** The blocks a part owns: every `gv-…` class its TSX writes (its story's markup, for a recipe with no TSX). */
export function ownBlocks(source) {
  return new Set([...source.matchAll(/gv-[a-z0-9-]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?/g)].map(m => block(m[0])));
}

/** The classes a stylesheet selects that are not its own block's, as `.name`, sorted. */
export function reachIns(css, own) {
  const out = new Set();
  for (const s of selectors(css))
    for (const [, c] of s.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g))
      if (!(c.startsWith('gv-') && own.has(block(c)))) out.add('.' + c);
  return [...out].sort();
}

const sheets = DIRS.flatMap(d => readdirSync(d).filter(f => f.endsWith('.css')).map(f => `${d}/${f}`));
const ownOf = file => {
  const tsx = file.replace(/\.css$/, '.tsx');
  const story = file.replace(/\.css$/, '.stories.tsx');
  return ownBlocks(readFileSync(existsSync(tsx) ? tsx : story, 'utf8'));
};

describe('a component stylesheet selects only its own block', () => {
  it('finds a reach-in, and leaves states, elements and own classes alone', () => {
    const css = `.gv-row { & svg { x: 1 } } .gv-row__lead > .gv-checkbox[data-selected] { x: 1 }
      @media (forced-colors: active) { .gv-row--on:not([aria-disabled]) .react-aria-Popover { x: 1 } }
      /* .gv-pill in a comment */ [dir='rtl'] .gv-row { x: 1 }`;
    expect(reachIns(css, new Set(['gv-row']))).toEqual(['.gv-checkbox', '.react-aria-Popover']);
  });
  it('reaches into no other part beyond the listed ones (a new reach-in fails; a fixed one comes off the list)', () => {
    const found = Object.fromEntries(sheets.map(f => [f, reachIns(readFileSync(f, 'utf8'), ownOf(f))]).filter(([, r]) => r.length));
    expect(found, 'expose a prop, a documented custom property or a placing class instead').toEqual(REACH_INS);
  });
});
