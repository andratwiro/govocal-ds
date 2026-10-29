import type {ComponentProps, CSSProperties} from 'react';
import {Unstyled} from '@storybook/addon-docs/blocks';
import {DesignTokenDocBlock} from 'storybook-design-token';
import {Settings} from 'lucide-react';
import usageJson from './usage.json';
import tokensJson from '../../tokens/foundations.tokens.json';
import sizeJson from '../../tokens/size.tokens.json';
import semanticJson from '../../tokens/semantic.tokens.json';
import './TokenBlocks.css';

// The Foundations pages (src/foundations/*.mdx) share these blocks. Each block shows at full height: the page
// scrolls, never a block inside it.

const usage = usageJson as Record<string, string[]>;
type Presenters = NonNullable<ComponentProps<typeof DesignTokenDocBlock>['presenters']>;
type Presenter = ({token}: {token: {name: string}}) => JSX.Element;

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

// The Typography frame in Figma names each role and says where it goes; the tokens keep only the numbers.
const FIGMA_ROLES: Record<string, [name: string, use: string]> = {
  'stat': ['Stat', 'Big numbers: KPI tiles, stat rows'],
  'stat-small': ['Stat small', 'Small number tiles (Volunteers, Causes) and counts in rows'],
  'title': ['Title', 'Panel, modal and dashboard card titles'],
  'body-strong': ['Body strong', 'Modal titles and emphasised body'],
  'body': ['Body', 'Metric labels, banners, recommended actions title'],
  'ui-strong': ['UI strong', 'Buttons, current breadcrumb, selected segment'],
  'ui': ['UI', 'List rows, breadcrumb, cells, group titles, menu options'],
  'small-strong': ['Small strong', 'Pills, rail header, phase name, column header sorted'],
  'small': ['Small', 'Card titles, To review / Required, rail labels, meta and captions']
};
const roleName = (role: string) => FIGMA_ROLES[role]?.[0] ?? role.replace(/-/g, ' ');
// --gv-type-stat-small-size → "Stat small"
const roleOf = (token: string) => roleName(token.replace(/^--gv-type-|-(size|line|weight)$/g, ''));

// Two of the addon's presenters scroll inside their 32px cell (a big radius, a wrapped line of text); the type
// ones say "Lorem ipsum". These draw the same tokens without either. Divs, not spans: the addon's table restyles
// every span in a cell.
// One rounded corner on a 56×32 box, so every radius up to full (32 here) reads differently.
const Radius: Presenter = ({token}) =>
  <div className="gv-tokens-radius" style={{borderStartStartRadius: `var(${token.name})`}} />;
// A line height at its role's size, on a band as tall as the line.
const LineHeight: Presenter = ({token}) =>
  <div className="gv-tokens-type gv-tokens-type--band"
    style={{fontSize: `var(${token.name.replace(/-line$/, '-size')})`, lineHeight: `var(${token.name})`}}>
    {roleOf(token.name)}
  </div>;
const FontSize: Presenter = ({token}) =>
  <div className="gv-tokens-type" style={{fontSize: `var(${token.name})`}}>{roleOf(token.name)}</div>;
const FontWeight: Presenter = ({token}) =>
  <div className="gv-tokens-type" style={{fontWeight: `var(${token.name})`}}>{roleOf(token.name)}</div>;
const presenters: Presenters = {BorderRadius: Radius, LineHeight, FontSize, FontWeight};

// One category from tokens.css, by its @tokens name (e.g. "Space @presenter Spacing"). Right-click a row: the
// components that use it (usage.json, written by `npm run tokens:usage`).
export const Tokens = ({category, view = 'table'}: {category: string; view?: 'table' | 'card'}) =>
  <DesignTokenDocBlock categoryName={category} viewType={view} usageMap={usage} presenters={presenters}
    maxHeight={NO_CAP} pageSize={NO_CAP} showSearch={false} />;

const WEIGHT: Record<number, string> = {400: 'Regular', 500: 'Medium', 600: 'Semibold'};

// Every --gv-type-<role>, drawn in itself, with Figma's size/line, weight and use, and the components using it
// (folded: the busiest roles name fifty).
export const TypeRoles = () => <Unstyled>
  <ol className="gv-tokens-roles">
    {Object.entries(typeRoles).map(([role, {$value: v}]) => {
      const use = FIGMA_ROLES[role]?.[1];
      const size = deref(v.fontSize).value;
      const users = usage[`--gv-type-${role}`] ?? [];
      return <li key={role} className="gv-tokens-role">
        <div className="gv-tokens-role__sample"
          style={{font: `var(--gv-type-${role})`, letterSpacing: `var(--gv-type-${role}-tracking)`}}>
          {roleName(role)}
        </div>
        <div className="gv-tokens-role__spec">
          <span>{size}/{Math.round(size * v.lineHeight)} {WEIGHT[deref(v.fontWeight)] ?? deref(v.fontWeight)}</span>
          <code>--gv-type-{role}</code>
        </div>
        {use && <p className="gv-tokens-role__use">{use}</p>}
        {users.length
          ? <details className="gv-tokens-role__users">
            <summary>Used in {users.length} {users.length === 1 ? 'component' : 'components'}</summary>
            <p>{users.join(', ')}</p>
          </details>
          : <p className="gv-tokens-role__users">Not used by a component yet</p>}
      </li>;
    })}
  </ol>
</Unstyled>;

const shadows = Object.keys((tokensJson as {shadow: Record<string, unknown>}).shadow);

// Every --gv-shadow-* on a panel, with room around it for the whole blur (a table row would clip it).
export const ShadowSpecimens = () => <Unstyled>
  <ul className="gv-tokens-shadows">
    {shadows.map(name => <li key={name} className="gv-tokens-shadow" style={{boxShadow: `var(--gv-shadow-${name})`}}>
      <code>--gv-shadow-{name}</code>
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
