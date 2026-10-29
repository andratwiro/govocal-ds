// One theme for the Storybook chrome (manager.ts) and the docs pages (preview.tsx: parameters.docs.theme),
// built from the Figma tokens. Importing this module also loads tokens.css on both sides, so
// manager-head.html and preview-head.html paint with var(--gv-*) like every component does.
import '../src/tokens.css';
import {create} from 'storybook/theming';
import foundationsJson from '../tokens/foundations.tokens.json';
import semanticJson from '../tokens/semantic.tokens.json';

type Token = {$type: string; $value: unknown};
type TokenTree = {[key: string]: TokenTree | Token};
// The Figma tokens and the ones Not in Figma, merged by token path as npm run tokens:build merges them.
const merge = (a: TokenTree, b: TokenTree): TokenTree => {
  const out: TokenTree = {...a};
  for (const [k, v] of Object.entries(b))
    out[k] = k in out && typeof v === 'object' && !('$value' in v) ? merge(out[k] as TokenTree, v as TokenTree) : v;
  return out;
};
const tokens = merge(foundationsJson as TokenTree, semanticJson as TokenTree);

// A token by its path ("surface.brand-strong"; the CSS name is --gv- and the path joined with dashes).
const token = (path: string) => path.split('.').reduce<TokenTree | Token>((node, key) => (node as TokenTree)[key], tokens) as Token;

// Resolves a token's $value, following "{a.b.c}" references down to a colour primitive's hex.
function resolveHex(value: unknown): string {
  if (typeof value === 'string') {
    const m = /^\{([a-z0-9.-]+)\}$/.exec(value);
    if (!m) throw new Error(`unexpected token reference "${value}"`);
    return resolveHex(token(m[1]).$value);
  }
  const hex = (value as {hex?: string}).hex;
  if (!hex) throw new Error(`expected a colour value, got ${JSON.stringify(value)}`);
  return hex;
}

const of = (path: string) => resolveHex(token(path).$value);
const px = (path: string) => (token(path).$value as {value: number}).value;
const family = (token('font.family').$value as string[]).map(f => (/\s/.test(f) ? `'${f}'` : f)).join(', ');

// The sidebar's brand block: the Go Vocal mark (static/favicon.svg, also the tab icon) and the name.
// Storybook renders brandTitle as HTML inside its link; manager-head.html styles .gv-sb-brand.
const brandTitle =
  '<span class="gv-sb-brand"><img src="./favicon.svg" alt="Go Vocal" width="24" height="24"><span>Design system</span></span>';

export const theme = create({
  base: 'light',
  brandTitle,
  brandUrl: '../',
  brandTarget: '_self',
  fontBase: family,

  colorPrimary: of('surface.brand-strong'),
  colorSecondary: of('surface.brand-strong'),

  // The sidebar sits on the info surface: the closest token to the mark's mint, as a wash. Its hover is the teal a
  // step under it (Storybook's chrome, not a component: surface-ai merged into surface-info, so no token has it).
  appBg: of('surface.info'),
  appHoverBg: of('color.teal.75'),
  appContentBg: of('surface.panel'),
  appPreviewBg: of('surface.panel'),
  appBorderColor: of('border.default'),
  appBorderRadius: px('radius.8'),

  textColor: of('text.primary'),
  textInverseColor: of('text.inverse'),
  textMutedColor: of('text.secondary'),

  barBg: of('surface.panel'),
  barTextColor: of('icon.secondary'),
  barHoverColor: of('surface.brand-strong'),
  barSelectedColor: of('surface.brand-strong'),

  buttonBg: of('surface.panel'),
  buttonBorder: of('border.control'),
  booleanBg: of('surface.neutral'),
  booleanSelectedBg: of('surface.panel'),
  inputBg: of('surface.panel'),
  inputBorder: of('border.control'),
  inputTextColor: of('text.primary'),
  inputBorderRadius: px('radius.8')
});
