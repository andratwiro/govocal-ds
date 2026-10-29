import './BaseNote.css';

/**
 * The line every Base page carries, from one place: the Base intro page and the docs page of each Base entry
 * (`.storybook/DocsPage.tsx`). Base is the primitives the Components build on, not a second menu of parts.
 */
export function BaseNote() {
  return (
    <p className="gv-sb-base-note sb-unstyled">
      <strong>Base</strong> React Aria parts painted with the tokens. Primitives: don't use them directly in pages;
      prefer the Components entry; when a page truly needs one, import it from <code>govocal-ds/base</code>.
    </p>
  );
}
