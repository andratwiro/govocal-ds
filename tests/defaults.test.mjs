import {describe, expect, it} from 'vitest';
import {readableDefault} from '../scripts/lib/defaults.mjs';

// The Props table shows a default written from a part's words (`@default \`labels.field\` ("Description")`) as
// `labels.field ("Description")`, not with the backticks and escaped quotes Storybook's JSON quoting left
// (.storybook/preview.tsx runs it over every prop).
describe('readable defaults', () => {
  it('unwraps a labels default', () => {
    expect(readableDefault(JSON.stringify('`labels.field` ("Description")'))).toBe('labels.field ("Description")');
    expect(readableDefault(JSON.stringify('`labels.filters` ("Active filters")'))).toBe('labels.filters ("Active filters")');
  });
  it('leaves other defaults as they are', () => {
    expect(readableDefault('false')).toBe('false');
    expect(readableDefault("'vertical'")).toBe("'vertical'");
    expect(readableDefault('"Description"')).toBe('"Description"');
    expect(readableDefault(undefined)).toBe(undefined);
  });
});
