// tsconfig has no resolveJsonModule (owned elsewhere, not touched here): this ambient module lets
// manager.ts import tokens/foundations.tokens.json to build the Storybook chrome theme.
declare module '*.json' {
  const value: unknown;
  export default value;
}
