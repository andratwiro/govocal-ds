import {addons} from 'storybook/manager-api';
import {create} from 'storybook/theming';
import tokensJson from '../tokens/foundations.tokens.json';

type TokenTree = {[key: string]: TokenTree | {$type: string; $value: unknown}};
const tokens = tokensJson as TokenTree;

// Resolves a token's $value, following "{a.b.c}" references down to a colour primitive's hex.
function resolveHex(value: unknown): string {
  if (typeof value === 'string') {
    const m = /^\{([a-z0-9.-]+)\}$/.exec(value);
    if (!m) throw new Error(`unexpected token reference "${value}"`);
    let node: TokenTree | {$type: string; $value: unknown} = tokens;
    for (const key of m[1].split('.')) node = (node as TokenTree)[key];
    return resolveHex((node as {$value: unknown}).$value);
  }
  const hex = (value as {hex?: string}).hex;
  if (!hex) throw new Error(`expected a colour value, got ${JSON.stringify(value)}`);
  return hex;
}

const of = (group: string, role: string) =>
  resolveHex(((tokens[group] as TokenTree)[role] as {$value: unknown}).$value);

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Go Vocal design system',
    brandUrl: '../',
    colorPrimary: of('action', 'primary'),
    colorSecondary: of('action', 'primary'),
    appBg: of('surface', 'app'),
    appContentBg: of('surface', 'panel'),
    appBorderColor: of('border', 'card'),
    textColor: of('text', 'primary'),
    fontBase: "'Public Sans', system-ui, sans-serif"
  })
});
