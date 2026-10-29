import {DocsPage as StorybookDocsPage, useOf} from '@storybook/addon-docs/blocks';
import {BaseNote} from '../src/overview/BaseNote';
import {ComponentPage} from '../src/overview/ComponentPage';

/**
 * Every entry's docs page. A Components or Patterns entry gets the component page (its thirteen sections, from its
 * `<Name>.guide.md` and its code: src/overview/ComponentPage.tsx); a Base entry gets Storybook's own with Base's one line
 * on top; anything else Storybook's own. One parameter (preview.tsx, `docs.page`) instead of a block in each file.
 */
export function DocsPage() {
  const {preparedMeta} = useOf('meta', ['meta']);
  const title = preparedMeta.title;
  if (/^(Components|Patterns)\//.test(title) && !title.startsWith('Patterns/Recipes/')) return <ComponentPage />;
  return (
    <>
      {title.startsWith('Base/') && <BaseNote />}
      <StorybookDocsPage />
    </>
  );
}
