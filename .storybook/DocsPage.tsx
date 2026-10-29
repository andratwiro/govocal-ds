import {DocsPage as StorybookDocsPage, useOf} from '@storybook/addon-docs/blocks';
import {BaseNote} from '../src/overview/BaseNote';

/**
 * Every entry's docs page: Storybook's own, with Base's one line on top of a Base entry's page. One parameter
 * (preview.tsx, `docs.page`) instead of a note in each Base story file.
 */
export function DocsPage() {
  const {preparedMeta} = useOf('meta', ['meta']);
  return (
    <>
      {preparedMeta.title.startsWith('Base/') && <BaseNote />}
      <StorybookDocsPage />
    </>
  );
}
