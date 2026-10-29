import type {StorybookConfig} from '@storybook/react-vite';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

// 'govocal-ds', 'govocal-ds/base' and 'govocal-ds/tokens.css' resolve as in the back office: package.json's exports.
const pkgDir = resolve(import.meta.dirname, '..');
const {name, exports} = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8'));
const alias = Object.entries<string>(exports).map(([entry, file]) => ({
  find: new RegExp(`^${(name + entry.slice(1)).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`),
  replacement: resolve(pkgDir, file)
}));

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    // The design system's components: explicit titles under Components/.
    {directory: '../src/components/gv', files: '**/*.stories.@(ts|tsx)'},
    // The React Aria starter, painted with the tokens: the base the components are built on.
    {directory: '../src/components', files: '*.stories.@(ts|tsx)', titlePrefix: 'Base'},
    '../src/patterns/**/*.stories.@(ts|tsx)'
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-mcp',
    '@storybook/addon-designs',
    // Glob limited to tokens.css: component CSS has no @tokens annotations and must not be parsed.
    {name: 'storybook-design-token', options: {designTokenGlob: 'src/tokens.css'}}
  ],
  // The Go Vocal mark: Storybook's tab icon (favicon.svg is picked up by name), the sidebar brand, Welcome.
  staticDirs: ['./static'],
  framework: {name: '@storybook/react-vite', options: {}},
  // Status marks (docs/NAMING.md): filter the sidebar by them; `covered` hides a Base entry a Components entry wraps.
  tags: {'not-in-figma': {}, deprecated: {}, covered: {excludeFromSidebar: true}},
  core: {disableTelemetry: true},
  // Stories and docs may import from 'govocal-ds' like any consumer.
  viteFinal: config => ({...config, resolve: {...config.resolve, alias: [...toAliasArray(config.resolve?.alias), ...alias]}})
};

function toAliasArray(a: unknown): {find: string | RegExp; replacement: string}[] {
  if (!a) return [];
  if (Array.isArray(a)) return a;
  return Object.entries(a as Record<string, string>).map(([find, replacement]) => ({find, replacement}));
}

export default config;
