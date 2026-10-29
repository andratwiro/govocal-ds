import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';
import {I18nProvider} from 'react-aria-components';
import type {Multiloc} from './LocaleSwitcher';
import {MultilingualTextField} from './MultilingualTextField';

const meta: Meta<typeof MultilingualTextField> = {
  title: 'Components/Forms/Multilingual text field',
  component: MultilingualTextField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Not in Figma: built from the platform\'s multilingual input (the one with a locale switcher that most ' +
          'admin forms use); the designer\'s drawings for multilingual fields are pending. `value` is the platform\'s ' +
          'Multiloc.'
      }
    }
  },
  tags: ['autodocs', 'not-in-figma'],
  args: {
    label: 'Title',
    locales: ['en', 'nl-BE', 'fr-BE'],
    placeholder: 'Add a title',
    onChange: fn(),
    onLocaleChange: fn()
  },
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export default meta;
type Story = StoryObj<typeof MultilingualTextField>;

/* Invented data: a Belgian platform's three languages and a project's title. */
const title: Multiloc = {en: 'Green Corridors for Riverside', 'nl-BE': 'Groene corridors voor Riverside', 'fr-BE': ''};
const allTitles: Multiloc = {...title, 'fr-BE': 'Corridors verts pour Riverside'};

/** English and Dutch filled in, French still empty; the field is optional, so the empty mark is grey. */
export const Default: Story = {
  args: {defaultValue: title}
};

/** Every language has text. */
export const Filled: Story = {
  args: {defaultValue: allTitles, isRequired: true}
};

/** Every language is required: the Required marker follows the label, French is marked amber. */
export const Required: Story = {
  args: {defaultValue: title, isRequired: true}
};

/** After a save was tried: the field shows French, the language still missing, and says so. */
export const Invalid: Story = {
  args: {defaultValue: title, isRequired: true, isInvalid: true}
};

/** An error for one language (from the platform's API, as its `errorMultiloc`): that language is marked and shown. */
export const ErrorPerLanguage: Story = {
  name: 'Error per language',
  args: {
    defaultValue: allTitles,
    isRequired: true,
    errorMessage: {'nl-BE': 'This title is already used by another project'}
  }
};

/** The text can't change; the switcher still shows each language's text. */
export const Disabled: Story = {
  args: {defaultValue: allTitles, isDisabled: true, description: 'Built-in fields keep their name.'}
};

/** An Arabic text: the input runs right to left while the interface stays left to right (and the other way round). */
export const RightToLeft: Story = {
  name: 'Right to left',
  args: {
    locales: ['en', 'ar-SA'],
    defaultLocale: 'ar-SA',
    defaultValue: {en: 'Green Corridors for Riverside', 'ar-SA': 'ممرات خضراء لريفرسايد'},
    isRequired: true
  }
};

/**
 * A Dutch interface: the page hands the field its words in `labels` (from its own i18n), and the language names follow
 * the React Aria locale. The system never translates; here the story plays the host.
 */
export const DutchInterface: Story = {
  name: 'Dutch interface',
  args: {
    label: 'Titel',
    placeholder: 'Voeg een titel toe',
    defaultValue: title,
    isRequired: true,
    isInvalid: true,
    labels: {
      required: 'Verplicht',
      language: 'Taal',
      markFilled: 'ingevuld',
      markEmpty: 'leeg',
      markRequired: 'leeg, verplicht',
      markInvalid: 'bevat een fout',
      languageOf: name => `Taal van ${name}`,
      missing: (language, more, n) => `Vul de tekst in het ${language} in${more ? ` en in ${n} andere talen` : ''}`
    }
  },
  decorators: [Story => <I18nProvider locale="nl-BE"><Story /></I18nProvider>]
};

/** Several lines (a description), with the platform's counter. */
export const MultiLine: Story = {
  name: 'Multi-line',
  args: {
    label: 'Short description',
    placeholder: 'Add a short description',
    isMultiline: true,
    maxLength: 280,
    showCounter: true,
    description: 'Shown on the project card.',
    defaultValue: {en: 'We are collecting ideas for new green corridors across Riverside.', 'nl-BE': '', 'fr-BE': ''}
  }
};

/** A platform with many languages: the switcher wraps under the label, still at the end. */
export const ManyLanguages: Story = {
  name: 'Many languages',
  args: {
    label: 'Area name',
    locales: ['en', 'nl-BE', 'fr-BE', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'da-DK', 'sv-SE', 'nb-NO', 'pl-PL', 'ar-SA'],
    defaultValue: {en: 'Riverside North', 'nl-BE': 'Riverside Noord', 'fr-BE': 'Riverside Nord', 'ar-SA': 'ريفرسايد الشمالية'},
    isRequired: true
  }
};

/** No visible label (`aria-label`): the switcher sits alone at the end over the field, as the platform's back office. */
export const WithoutLabel: Story = {
  name: 'Without label',
  args: {label: undefined, 'aria-label': 'Event name', placeholder: 'Add an event name', defaultValue: title}
};

function ControlledField() {
  const [value, setValue] = useState<Multiloc>(title);
  const [locale, setLocale] = useState('en');
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <MultilingualTextField label="Title" locales={['en', 'nl-BE', 'fr-BE']} isRequired value={value}
        onChange={setValue} locale={locale} onLocaleChange={setLocale} />
      <pre style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)', whiteSpace: 'pre-wrap'}}>
        {`locale: ${locale}\nvalue: ${JSON.stringify(value, null, 1)}`}
      </pre>
    </div>
  );
}

/** The page holds the Multiloc and the shown language (`value` / `onChange`, `locale` / `onLocaleChange`). */
export const Controlled: Story = {
  render: () => <ControlledField />
};
