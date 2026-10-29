import type {StorybookConfig} from '@storybook/react-vite';
const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    // Tali's components: explicit titles under Components/.
    {directory: '../src/components/gv', files: '**/*.stories.@(ts|tsx)'},
    // The React Aria starter, painted with her tokens: the base Tali's components are built on.
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
  framework: {name: '@storybook/react-vite', options: {}},
  core: {disableTelemetry: true}
};
export default config;
