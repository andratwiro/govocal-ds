// One theme for the Storybook chrome (manager.ts) and the docs pages (preview.tsx: parameters.docs.theme),
// built from the Figma tokens. Importing this module also loads tokens.css on both sides, so
// manager-head.html and preview-head.html paint with var(--gv-*) like every component does.
import '../src/tokens.css';
import {create} from 'storybook/theming';
import tokensJson from '../tokens/foundations.tokens.json';

type Token = {$type: string; $value: unknown};
type TokenTree = {[key: string]: TokenTree | Token};
const tokens = tokensJson as TokenTree;

// Resolves a token's $value, following "{a.b.c}" references down to a colour primitive's hex.
function resolveHex(value: unknown): string {
  if (typeof value === 'string') {
    const m = /^\{([a-z0-9.-]+)\}$/.exec(value);
    if (!m) throw new Error(`unexpected token reference "${value}"`);
    let node: TokenTree | Token = tokens;
    for (const key of m[1].split('.')) node = (node as TokenTree)[key];
    return resolveHex((node as Token).$value);
  }
  const hex = (value as {hex?: string}).hex;
  if (!hex) throw new Error(`expected a colour value, got ${JSON.stringify(value)}`);
  return hex;
}

const token = (group: string, role: string) => (tokens[group] as TokenTree)[role] as Token;
const of = (group: string, role: string) => resolveHex(token(group, role).$value);
const px = (group: string, role: string) => (token(group, role).$value as {value: number}).value;
const family = (token('type', 'body').$value as {fontFamily: string}).fontFamily;

// The sidebar's brand block: the Go Vocal mark (static/favicon.svg, also the tab icon) and the name.
// Storybook renders brandTitle as HTML inside its link; manager-head.html styles .gv-sb-brand.
const brandTitle =
  '<span class="gv-sb-brand"><img src="./favicon.svg" alt="Go Vocal" width="24" height="24"><span>Design system</span></span>';

export const theme = create({
  base: 'light',
  brandTitle,
  brandUrl: '../',
  brandTarget: '_self',
  fontBase: `'${family}', system-ui, sans-serif`,

  colorPrimary: of('action', 'primary'),
  colorSecondary: of('action', 'primary'),

  // The sidebar sits on the info surface: the closest token to the mark's mint, as a wash.
  appBg: of('surface', 'info'),
  appHoverBg: of('surface', 'ai'),
  appContentBg: of('surface', 'panel'),
  appPreviewBg: of('surface', 'panel'),
  appBorderColor: of('border', 'card'),
  appBorderRadius: px('radius', '8'),

  textColor: of('text', 'primary'),
  textInverseColor: of('text', 'inverse'),
  textMutedColor: of('text', 'secondary'),

  barBg: of('surface', 'panel'),
  barTextColor: of('icon', 'strong'),
  barHoverColor: of('action', 'primary'),
  barSelectedColor: of('action', 'primary'),

  buttonBg: of('surface', 'panel'),
  buttonBorder: of('border', 'control'),
  booleanBg: of('surface', 'pill'),
  booleanSelectedBg: of('surface', 'panel'),
  inputBg: of('surface', 'panel'),
  inputBorder: of('border', 'control'),
  inputTextColor: of('text', 'primary'),
  inputBorderRadius: px('radius', '8')
});
