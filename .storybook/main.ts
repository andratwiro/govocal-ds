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
  // The component manifest the Storybook MCP serves agents (/mcp while `npm run storybook` runs; built into
  // dist/storybook/manifests/). react-docgen-typescript follows `extends RACButtonProps`, so a part's React Aria props
  // reach the manifest and the Controls table: its own props, plus the React Aria ones in REACT_ARIA_PROPS.
  features: {componentsManifest: true},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Never story data: the plugin stamps displayName and __docgenInfo on every export with a doc comment, so a
      // data object gains two keys (Object.keys(METRICS) broke Data table's "In a panel"). e2e/stories.spec.ts catches it.
      exclude: ['**/*.stories.tsx', '**/story-data/**'],
      propFilter: prop => !prop.parent || !/node_modules/.test(prop.parent.fileName) ||
        (REACT_ARIA_PROPS.has(prop.name) && !/@deprecated/.test(prop.description))
    }
  },
  // Stories and docs may import from 'govocal-ds' like any consumer.
  viteFinal: config => ({...config, resolve: {...config.resolve, alias: [...toAliasArray(config.resolve?.alias), ...alias]}})
};

// React Aria and DOM props a page sets on the system's parts. The rest of the ~100 a React Aria part inherits stay out
// of the manifest: they would bury the part's own.
const REACT_ARIA_PROPS = new Set([
  'children', 'id', 'slot', 'aria-label', 'aria-labelledby', 'aria-describedby',
  'isDisabled', 'isReadOnly', 'isRequired', 'isInvalid', 'validate', 'validationBehavior', 'name', 'form', 'autoFocus',
  'value', 'defaultValue', 'onChange', 'onBlur', 'onFocus', 'onKeyDown', 'onSubmit', 'onClear',
  'type', 'inputMode', 'autoComplete', 'maxLength', 'minLength', 'pattern', 'minValue', 'maxValue', 'step',
  'formatOptions', 'isSelected', 'defaultSelected', 'isIndeterminate', 'orientation',
  'onPress', 'onAction', 'href', 'target', 'isPending',
  'isOpen', 'defaultOpen', 'onOpenChange', 'isDismissable', 'isKeyboardDismissDisabled', 'placement', 'offset', 'delay',
  'items', 'selectionMode', 'selectedKeys', 'defaultSelectedKeys', 'onSelectionChange', 'disabledKeys',
  'disallowEmptySelection', 'renderEmptyState', 'dependencies',
  'sortDescriptor', 'onSortChange', 'onRowAction', 'selectedKey', 'defaultSelectedKey', 'onLoadMore'
]); // A prop React Aria marks @deprecated (Select's selectedKey, onSelectionChange) stays out.

function toAliasArray(a: unknown): {find: string | RegExp; replacement: string}[] {
  if (!a) return [];
  if (Array.isArray(a)) return a;
  return Object.entries(a as Record<string, string>).map(([find, replacement]) => ({find, replacement}));
}

export default config;
