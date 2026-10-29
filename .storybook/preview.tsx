import type {Preview} from '@storybook/react-vite';
import {useEffect} from 'react';
import {I18nProvider} from 'react-aria-components';

const preview: Preview = {
  globalTypes: {
    direction: {description: 'Direction', toolbar: {title: 'Direction', icon: 'transfer',
      items: [{value: 'ltr', title: 'Left to right'}, {value: 'rtl', title: 'Right to left (Arabic)'}]}},
  },
  initialGlobals: {direction: 'ltr'},
  decorators: [
    (Story, {globals}) => {
      const dir = globals.direction === 'rtl' ? 'rtl' : 'ltr';
      const locale = dir === 'rtl' ? 'ar-SA' : 'en-GB';
      useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
      }, [dir, locale]);
      return <I18nProvider locale={locale}><Story /></I18nProvider>;
    }
  ],
  parameters: {
    layout: 'centered',
    a11y: {
      test: 'todo',
      options: {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']},
        rules: {'target-size': {enabled: true}}}
    }
  }
};
export default preview;
