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
    (Story, {globals}) => {
      const chosen = LOCALES.some(l => l.value === globals.locale) ? (globals.locale as string) : 'en-GB';
      const locale = globals.direction === 'rtl' ? 'ar-SA' : chosen;
      const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
      useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
      }, [dir, locale]);
      // Figma and the prototype draw icons at 1.75 (Lucide's default is 2); an explicit strokeWidth still wins.
      return <I18nProvider locale={locale}><LucideProvider strokeWidth={1.75}><Story /></LucideProvider></I18nProvider>;
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
