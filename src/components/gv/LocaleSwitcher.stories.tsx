import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';
import {LocaleSwitcher} from './LocaleSwitcher';

const meta: Meta<typeof LocaleSwitcher> = {
  title: 'Components/Forms/Locale switcher',
  component: LocaleSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Not in Figma: from the platform\'s locale switcher and the prototype\'s language button; the designer\'s ' +
          'drawings for multilingual fields are pending. The Multilingual text field and rich text editor carry one; ' +
          'use it alone when one switcher drives several fields.'
      }
    }
  },
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  args: {
    locales: ['en', 'nl-BE', 'fr-BE'],
    defaultLocale: 'en',
    onLocaleChange: fn()
  }
};

export default meta;
type Story = StoryObj<typeof LocaleSwitcher>;

/* Invented data: a Belgian platform's three languages, a project title in two of them. */
const title = {en: 'Green Corridors for Riverside', 'nl-BE': 'Groene corridors voor Riverside', 'fr-BE': ''};

/** The shown language filled in; green has text, grey is empty (the field is optional). */
export const Default: Story = {
  args: {values: title}
};

/** Every language needs text: French is still empty, marked amber. */
export const Required: Story = {
  args: {values: title, isRequired: true}
};

/** After a save was tried: the empty required language turns red. */
export const Invalid: Story = {
  args: {values: title, isRequired: true, isInvalid: true}
};

/** Without `values` the switcher only picks the language: no marks. */
export const WithoutMarks: Story = {
  name: 'Without marks',
  args: {}
};

export const Disabled: Story = {
  args: {values: title, isDisabled: true}
};

/** The compact version for a Title field's end: the shown code, "n/m" while languages are empty, the list in a menu. */
export const Menu: Story = {
  args: {values: title, isRequired: true, kind: 'menu', 'aria-label': 'Content language'}
};

/** A platform with many languages: the row wraps. */
export const ManyLanguages: Story = {
  name: 'Many languages',
  args: {
    locales: ['en', 'nl-BE', 'fr-BE', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'da-DK', 'sv-SE', 'nb-NO', 'pl-PL', 'ar-SA'],
    values: {en: 'Parks', 'nl-BE': 'Parken', 'fr-BE': 'Parcs', 'de-DE': 'Parks', 'ar-SA': 'حدائق'},
    isRequired: true
  },
  decorators: [Story => <div style={{width: 320}}><Story /></div>]
};
