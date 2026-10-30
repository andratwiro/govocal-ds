import type {Preview} from '@storybook/react-vite';
import {useEffect} from 'react';
import {I18nProvider} from 'react-aria-components';
import {LucideProvider} from 'lucide-react';
import {theme} from './theme';
import {DocsPage} from './DocsPage';

/*
 * The locale every story runs in: numbers, dates and lists follow it (React Aria's I18nProvider), as they follow
 * AppProvider's `locale` in an app. The words stay English: the system never translates, so a story shows another
 * language by passing `labels`. Arabic runs right to left.
 */
const LOCALES = [
  {value: 'en-GB', title: 'English (UK)'},
  {value: 'nl-BE', title: 'Dutch (Belgium)'},
  {value: 'fr-BE', title: 'French (Belgium)'},
  {value: 'de-DE', title: 'German'},
  {value: 'es-CL', title: 'Spanish (Chile)'},
  {value: 'ar-SA', title: 'Arabic, right to left'}
];
const RTL_LOCALES = new Set(['ar-SA']);

const preview: Preview = {
  globalTypes: {
    locale: {description: 'Locale: numbers and dates (the words stay English)', toolbar: {title: 'Locale', icon: 'globe',
      items: LOCALES, dynamicTitle: true}},
    // "Right to left" is Arabic, whatever the Locale says, so links with `globals=direction:rtl` keep working.
    direction: {description: 'Direction', toolbar: {title: 'Direction', icon: 'transfer',
      items: [{value: 'ltr', title: 'Left to right'}, {value: 'rtl', title: 'Right to left (Arabic)'}]}},
  },
  initialGlobals: {locale: 'en-GB', direction: 'ltr'},
  decorators: [
    (Story, {globals, storyGlobals, viewMode}) => {
      // A story's own globals (the "Right to left" stories) win; on a docs page Storybook leaves them out of `globals`.
      const g = {...globals, ...storyGlobals};
      const chosen = LOCALES.some(l => l.value === g.locale) ? (g.locale as string) : 'en-GB';
      const locale = g.direction === 'rtl' ? 'ar-SA' : chosen;
      const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
      const docs = viewMode === 'docs';
      useEffect(() => {
        if (docs) return;
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
      }, [dir, locale, docs]);
      // Figma and the prototype draw icons at 1.75 (Lucide's default is 2); an explicit strokeWidth still wins.
      const story = <I18nProvider locale={locale}><LucideProvider strokeWidth={1.75}><Story /></LucideProvider></I18nProvider>;
      // On a docs page many stories share one document: each story turns only its own box.
      return docs ? <div dir={dir} lang={locale}>{story}</div> : story;
    }
  ],
  parameters: {
    layout: 'centered',
    // Storybook's docs page, plus Base's one line on a Base entry's page (DocsPage.tsx).
    docs: {theme, page: DocsPage},
    a11y: {
      test: 'todo',
      options: {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']},
        rules: {'target-size': {enabled: true}}}
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Overview', ['Welcome', 'Start here', 'Principles', 'Who owns what', 'For developers', 'Questions for developers',
          'What comes from React Aria', 'Lifecycle', 'Accessibility'], 'Foundations',
          ['Colour', 'Typography', 'Spacing', 'Radius', 'Shadows', 'Motion', 'Icons', 'Illustrations'],
          'Components', 'Patterns', 'Back office', 'Base', ['Introduction']]
      }
    }
  }
};
export default preview;
