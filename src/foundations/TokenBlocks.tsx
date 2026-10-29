/// <reference types="vite/client" />
import type {ComponentProps, CSSProperties} from 'react';
import {Unstyled} from '@storybook/addon-docs/blocks';
import {DesignTokenDocBlock} from 'storybook-design-token';
import {Settings} from 'lucide-react';
import usageJson from './usage.json';
import tokensCss from '../tokens.css?raw';
import tokensJson from '../../tokens/foundations.tokens.json';
import sizeJson from '../../tokens/size.tokens.json';
import semanticJson from '../../tokens/semantic.tokens.json';
import renamesJson from '../../tokens/renames.json';
import reportJson from '../../tokens/figma-report.json';
import variableIdsJson from '../../tokens/variable-ids.json';
import './TokenBlocks.css';

// The Foundations pages (src/foundations/*.mdx) share these blocks. Each block shows at full height: the page
// scrolls, never a block inside it. What a token is for comes from its description (the comment tokens.css carries,
// built from tokens/), never from a list kept here.

const usage = usageJson as Record<string, string[]>;
type Presenters = NonNullable<ComponentProps<typeof DesignTokenDocBlock>['presenters']>;
type Presenter = ({token}: {token: {name: string}}) => JSX.Element;

// Every token in src/tokens.css: its value and its description, by name (the first line of each, so the
// reduced-motion block's repeats don't count).
type Def = {value: string; description: string};
const DEFS = new Map<string, Def>();
for (const [, name, value, rest] of tokensCss.matchAll(/^\s*(--gv-[\w-]+):\s*([^;]+);(.*)$/gm))
  if (!DEFS.has(name)) DEFS.set(name, {value: value.trim(), description: rest.match(/\/\*\s*(.*?)\s*\*\//)?.[1] ?? ''});
const describe = (name: string) => DEFS.get(name)?.description ?? '';
// The primitive a semantic colour points at, by its ramp name: --gv-surface-app → slate-100.
const primitiveOf = (name: string): string => {
  const value = DEFS.get(name)?.value ?? '';
  const ref = value.match(/^var\((--gv-[\w-]+)\)$/)?.[1];
  if (!ref) return value;
  return ref.startsWith('--gv-color-') ? ref.slice('--gv-color-'.length) : primitiveOf(ref);
};

// What Figma calls a token today: the pull's report says where Figma's name still differs.
type Report = {kind: string; id: string | null; figma: string; code: string | null};
const report = (reportJson as {report: Report[]}).report;
const variableIds = variableIdsJson as Record<string, string | null>;
const inFigma = new Set(Object.values(variableIds).filter(Boolean));
const figmaName = (name: string) => {
  const differs = report.find(r => r.kind === 'rename' && r.code === name);
  if (differs) return `${differs.figma} (to rename)`;
  if (inFigma.has(name)) return name.replace(/^--gv-(side-nav|border-width|[a-z]+)-/, '$1/');
  return 'Not in Figma';
};

// storybook-design-token draws a table in a box capped at maxHeight (600 by default) that scrolls inside, and
// virtualises its 49px rows. A cap no category comes near lets the box grow to its rows, so every row renders.
const NO_CAP = 100_000;

// A role's parts are references to the font primitives ({font.size-13}) or, pulled without them, the drawn values.
type Ref = string;
type TypeValue = {fontSize: {value: number} | Ref; lineHeight: number; fontWeight: number | Ref};
const typeRoles = (tokensJson as unknown as {type: Record<string, {$value: TypeValue}>}).type;
const fontTokens = (semanticJson as unknown as {font: Record<string, {$value: unknown}>}).font;
const deref = <T,>(v: T | Ref): T =>
  typeof v === 'string' && v.startsWith('{font.') ? fontTokens[v.slice(6, -1)].$value as T : v as T;
// Figma's text style names: stat-small → "Stat small", ui-strong → "UI strong".
const roleName = (role: string) => role.replace(/^ui/, 'UI').replace(/^./, c => c.toUpperCase()).replace(/-/g, ' ');
// Each role's numbers, for the presenters: which roles a size, a line height or a weight serves.
const roles = Object.entries(typeRoles).map(([role, {$value: v}]) => {
  const size = deref(v.fontSize).value;
  return {role, size, line: Math.round(size * v.lineHeight), weight: deref(v.fontWeight) as number};
});
const rolesWith = (pick: (r: typeof roles[number]) => boolean) => roles.filter(pick).map(r => roleName(r.role)).join(' · ');
const pxOf = (name: string) => Number(name.match(/-(\d+)$/)?.[1]);
const weightOf = (name: string) => Number(DEFS.get(name)?.value);

// Two of the addon's presenters scroll inside their 32px cell (a big radius, a wrapped line of text); the type
// ones say "Lorem ipsum". These draw the same tokens without either. Divs, not spans: the addon's table restyles
// every span in a cell.
// One rounded corner on a 56×32 box, so every radius up to full (32 here) reads differently.
const Radius: Presenter = ({token}) =>
  <div className="gv-tokens-radius" style={{borderStartStartRadius: `var(${token.name})`}} />;
// A line height on a band as tall as the line, at the size of the first role that uses it, named by those roles.
const LineHeight: Presenter = ({token}) => {
  const role = roles.find(r => r.line === pxOf(token.name));
  return <div className="gv-tokens-type gv-tokens-type--band"
    style={{fontSize: role ? `var(--gv-font-size-${role.size})` : undefined, lineHeight: `var(${token.name})`}}>
    {rolesWith(r => r.line === pxOf(token.name)) || 'No role'}
  </div>;
};
const FontSize: Presenter = ({token}) =>
  <div className="gv-tokens-type" style={{fontSize: `var(${token.name})`}}>
    {rolesWith(r => r.size === pxOf(token.name)) || 'No role'}
  </div>;
// A weight serves up to five roles, too many names for the cell: its name and how many roles use it.
const FontWeight: Presenter = ({token}) => {
  const n = roles.filter(r => r.weight === weightOf(token.name)).length;
  return <div className="gv-tokens-type" style={{fontWeight: `var(${token.name})`}}>
    {WEIGHT[weightOf(token.name)] ?? weightOf(token.name)} · {n} {n === 1 ? 'role' : 'roles'}
  </div>;
};
const presenters: Presenters = {BorderRadius: Radius, LineHeight, FontSize, FontWeight};

// One category from tokens.css, by its @tokens name (e.g. "Space @presenter Spacing"). Right-click a row: the
// components that use it (usage.json, written by `npm run tokens:usage`).
export const Tokens = ({category, view = 'table'}: {category: string; view?: 'table' | 'card'}) =>
  <DesignTokenDocBlock categoryName={category} viewType={view} usageMap={usage} presenters={presenters}
    maxHeight={NO_CAP} pageSize={NO_CAP} showSearch={false} />;

const WEIGHT: Record<number, string> = {400: 'Regular', 500: 'Medium', 600: 'Semibold'};
const usedBy = (name: string) => {
  const users = usage[name] ?? [];
  return users.length
    ? <details className="gv-tokens-users">
      <summary>Used in {users.length} {users.length === 1 ? 'component' : 'components'}</summary>
      <p>{users.join(', ')}</p>
    </details>
    : <p className="gv-tokens-users">Not used by a component yet</p>;
};

// Every --gv-type-<role>, drawn in itself, with its size/line, weight, what it is for (its description) and the
// components using it (folded: the busiest roles name fifty).
export const TypeRoles = () => <Unstyled>
  <ol className="gv-tokens-roles">
    {roles.map(({role, size, line, weight}) => <li key={role} className="gv-tokens-role">
      <div className="gv-tokens-role__sample" style={{font: `var(--gv-type-${role})`}}>{roleName(role)}</div>
      <div className="gv-tokens-role__spec">
        <span>{size}/{line} {WEIGHT[weight] ?? weight}</span>
        <code>--gv-type-{role}</code>
      </div>
      <p className="gv-tokens-role__use">{describe(`--gv-type-${role}`).replace(/\s*\d+\/\d+ \w+\.$/, '')}</p>
      {usedBy(`--gv-type-${role}`)}
    </li>)}
  </ol>
</Unstyled>;

const shadows = Object.keys((tokensJson as {shadow: Record<string, unknown>}).shadow);

// Every --gv-shadow-* on a panel, with room around it for the whole blur (a table row would clip it), and what it is
// for.
export const ShadowSpecimens = () => <Unstyled>
  <ul className="gv-tokens-shadows">
    {shadows.map(name => <li key={name} className="gv-tokens-shadow" style={{boxShadow: `var(--gv-shadow-${name})`}}>
      <code>--gv-shadow-{name}</code>
      <p>{describe(`--gv-shadow-${name}`)}</p>
    </li>)}
  </ul>
</Unstyled>;

type SizeKind = 'icon' | 'control' | 'avatar';
const sizes = (sizeJson as {size: Record<SizeKind, Record<string, unknown>>}).size;

// Every --gv-size-<kind>-* drawn at its size: an icon, a control's outline, an avatar. Above the kind's table, which
// keeps the description and the components using each (a table cell is 32 tall: a 40 control would not fit).
export const SizeSpecimens = ({kind}: {kind: SizeKind}) => <Unstyled>
  <ul className={`gv-tokens-sizes gv-tokens-sizes--${kind}`}>
    {Object.keys(sizes[kind]).map(n => <li key={n} className="gv-tokens-size"
      style={{'--gv-tokens-size': `var(--gv-size-${kind}-${n})`} as CSSProperties}>
      <div className="gv-tokens-size__sample" aria-hidden="true">
        {kind === 'icon' && <Settings strokeWidth={1.75} />}
        {kind === 'control' && 'Label'}
        {kind === 'avatar' && 'G'}
      </div>
      <code>--gv-size-{kind}-{n}</code>
    </li>)}
  </ul>
</Unstyled>;

// ---- Colour ----

// One colour token: its swatch, name, Figma name, description and users.
const Swatch = ({name, compact = false}: {name: string; compact?: boolean}) =>
  <div className="gv-tokens-swatch">
    <div className="gv-tokens-swatch__chip" style={{background: `var(${name})`}} aria-hidden="true" />
    <div className="gv-tokens-swatch__text">
      <code>{name}</code>
      <span className="gv-tokens-swatch__meta">{primitiveOf(name)} · Figma: {figmaName(name)}</span>
      {!compact && <p>{describe(name)}</p>}
      {!compact && usedBy(name)}
    </div>
  </div>;

const INTENTS = ['neutral', 'brand', 'accent', 'info', 'success', 'warning', 'danger', 'selected', 'inverse'];
const STATES = 'hovered|pressed|selected|disabled|focused';
const COLUMNS: [label: string, match: (role: string) => RegExp][] = [
  ['surface', role => new RegExp(`^--gv-surface-${role}(-(${STATES}))?$`)],
  ['surface-strong', role => new RegExp(`^--gv-surface-${role}-strong(-(${STATES}))?$`)],
  ['border', role => new RegExp(`^--gv-border-${role}(-strong)?(-(${STATES}))?$`)],
  ['text', role => new RegExp(`^--gv-text-${role}(-strong)?(-(${STATES}))?$`)],
  ['icon', role => new RegExp(`^--gv-icon-${role}(-strong)?(-(${STATES}))?$`)]
];
const names = [...DEFS.keys()];

// The intents as a table: a row per role, a column per property; an empty cell has no token (nothing paints it yet).
export const Intents = () => <Unstyled>
  <div className="gv-tokens-intents" role="table" aria-label="Intent tokens">
    <div role="row" className="gv-tokens-intents__row gv-tokens-intents__head">
      <span role="columnheader">Role</span>
      {COLUMNS.map(([label]) => <span key={label} role="columnheader">{label}</span>)}
    </div>
    {INTENTS.map(role => <div key={role} role="row" className="gv-tokens-intents__row">
      <span role="rowheader" className="gv-tokens-intents__role">{role}</span>
      {COLUMNS.map(([label, match]) => <div key={label} role="cell" className="gv-tokens-intents__cell">
        {names.filter(n => match(role).test(n)).map(n => <Swatch key={n} name={n} />)}
      </div>)}
    </div>)}
  </div>
</Unstyled>;

// The neutral ladders side by side, lightest first, each token with its primitive: two tokens on one step are plain
// to see (the near-duplicates tests/token-names.test.mjs explains).
const LADDERS: [label: string, re: RegExp][] = [
  ['Text', /^--gv-text-(primary|body|neutral|secondary|tertiary|placeholder|disabled)$/],
  ['Icon', /^--gv-icon-(primary|neutral|secondary|tertiary|quiet|disabled)$/],
  ['Surface', /^--gv-surface-(panel|secondary|disabled|tertiary|hovered|app|pressed|neutral|neutral-hovered|neutral-strong)$/],
  ['Border', /^--gv-border-(row|subtle|disabled|default|strong|control|control-hovered)$/]
];
const RAMP = ['neutral-0', 'neutral-25', 'slate-50', 'slate-100', 'slate-150', 'slate-200', 'neutral-200', 'slate-250',
  'slate-400', 'slate-500', 'slate-600', 'slate-650', 'slate-700', 'slate-750', 'slate-800', 'neutral-800', 'neutral-900'];
const step = (name: string) => { const i = RAMP.indexOf(primitiveOf(name)); return i < 0 ? RAMP.length : i; };
export const Ladders = () => <Unstyled>
  <div className="gv-tokens-ladders">
    {LADDERS.map(([label, re]) => <section key={label} className="gv-tokens-ladder">
      <h4>{label}</h4>
      {names.filter(n => re.test(n)).sort((a, b) => step(a) - step(b)).map(n => <Swatch key={n} name={n} compact />)}
    </section>)}
  </div>
</Unstyled>;

// Tokens as a plain list (name, value, description): the groups the addon has no presenter for, or a hand-picked set.
export const TokenList = ({match}: {match: string}) => <Unstyled>
  <dl className="gv-tokens-list">
    {names.filter(n => new RegExp(match).test(n)).map(n => <div key={n}>
      <dt><code>{n}</code> <span>{DEFS.get(n)?.value}</span></dt>
      <dd>{describe(n)}</dd>
    </div>)}
  </dl>
</Unstyled>;

// Colour tokens written by hand because Figma has no variable for them yet (tokens/semantic.tokens.json).
type Node = {[key: string]: Node | unknown};
const handWritten: string[] = [];
const walk = (node: Node, path: string[]) => Object.entries(node).forEach(([k, v]) => {
  if (k.startsWith('$') || typeof v !== 'object' || v === null) return;
  if ('$value' in v) { if ((v as {$type?: string}).$type === 'color') handWritten.push(`--gv-${[...path, k].join('-')}`); }
  else walk(v as Node, [...path, k]);
});
walk(semanticJson as unknown as Node, []);
export const NotInFigma = () => <Unstyled>
  <div className="gv-tokens-grid">
    {handWritten.filter(n => !n.startsWith('--gv-color-')).map(n => <Swatch key={n} name={n} />)}
  </div>
</Unstyled>;

// The renames tokens/renames.json makes (npm run tokens:rename), for the names in `match`; "Figma follows" says
// whether Figma has caught up (the pull's report) or never had the name.
type Rename = {from: string; to?: string; by?: Record<string, string>; delete?: boolean; drop?: string; scale?: string;
  merge?: boolean; when?: string; figmaId?: string; why: string};
const renames = (renamesJson as unknown as {renames: Rename[]}).renames;
const becomes = (r: Rename) => r.delete ? 'deleted'
  : r.drop ? `${r.drop} on a position, else ${r.scale}`
  : r.by ? Object.entries(r.by).map(([use, to]) => `${to} (${use})`).join(', ')
  : r.when ? `${r.to} when ${r.when}` : r.to;
const follows = (r: Rename) => {
  const line = report.find(e => (r.figmaId && e.id === r.figmaId) || (!e.id && e.code === r.to));
  if (line) return line.kind === 'merge' ? `Not yet: Figma still has ${line.figma}` : `Not yet: Figma still calls it ${line.figma}`;
  return r.figmaId ? 'Yes' : 'Code only';
};
export const Renamed = ({match}: {match: string}) => <Unstyled>
  <table className="gv-tokens-renamed">
    <thead><tr><th>Was</th><th>Now</th><th>Why</th><th>Figma follows</th></tr></thead>
    <tbody>
      {renames.filter(r => new RegExp(match).test(r.from)).map(r => <tr key={r.from}>
        <td><code>{r.from}</code></td><td><code>{becomes(r)}</code></td><td>{r.why}</td><td>{follows(r)}</td>
      </tr>)}
    </tbody>
  </table>
</Unstyled>;

// ---- Focus and states ----

// The focus ring as the components draw it, on a button, a field and a row; and disabled at 45%.
export const FocusSpecimens = () => <Unstyled>
  <div className="gv-tokens-states">
    <figure>
      <div className="gv-tokens-state gv-tokens-state--button gv-tokens-state--focus">Publish</div>
      <figcaption>A button: <code>outline: var(--gv-focus-ring)</code>, offset <code>--gv-focus-ring-offset</code></figcaption>
    </figure>
    <figure>
      <div className="gv-tokens-state gv-tokens-state--field gv-tokens-state--focus">Project title</div>
      <figcaption>A field: the same ring, offset outside</figcaption>
    </figure>
    <figure>
      <div className="gv-tokens-state gv-tokens-state--row gv-tokens-state--focus-inset">Green corridors</div>
      <figcaption>A row: inside the box, <code>--gv-focus-ring-offset-inset</code></figcaption>
    </figure>
    <figure>
      <div className="gv-tokens-state gv-tokens-state--button gv-tokens-state--disabled">Publish</div>
      <figcaption>Disabled: <code>opacity: var(--gv-opacity-disabled)</code> (45%)</figcaption>
    </figure>
  </div>
</Unstyled>;
