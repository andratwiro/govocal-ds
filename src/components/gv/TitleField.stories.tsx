import {useState} from 'react';
import {TitleField} from './TitleField';
import {LocaleSwitcher, type Multiloc} from './LocaleSwitcher';
import {MultilingualRichTextEditor} from './MultilingualRichTextEditor';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof TitleField> = {
  title: 'Components/Forms/Title field',
  component: TitleField,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-123'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryObj<typeof TitleField>;

/** Empty, required, filled, invalid. Figma draws the required one; the invalid state is Not in Figma. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 444}}>
      <TitleField />
      <TitleField isRequired />
      <TitleField defaultValue="Green Corridors for Riverside" isRequired />
      <TitleField isInvalid isRequired errorMessage="Give your project a title" />
    </div>
  )
};

export const Empty: Story = {
  args: {},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export const Required: Story = {
  args: {isRequired: true},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export const Filled: Story = {
  args: {defaultValue: 'Green Corridors for Riverside', isRequired: true},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export const Invalid: Story = {
  args: {isInvalid: true, isRequired: true, errorMessage: 'Give your project a title'},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

/* Invented data: a Belgian platform's three languages, a phase's title and description. */
const LOCALES = ['en', 'nl-BE', 'fr-BE'];

function MultilingualTitle() {
  const [locale, setLocale] = useState('en');
  const [title, setTitle] = useState<Multiloc>({en: 'Share your ideas', 'nl-BE': 'Deel je ideeën', 'fr-BE': ''});
  const [description, setDescription] = useState<Multiloc>({en: 'Tell us where new trees should go.', 'nl-BE': '', 'fr-BE': ''});
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, width: 444}}>
      <TitleField aria-label="Phase title" isRequired lang={locale} value={title[locale] ?? ''}
        onChange={text => setTitle({...title, [locale]: text})}
        localeSwitcher={
          <LocaleSwitcher kind="menu" aria-label="Content language" locales={LOCALES} locale={locale}
            onLocaleChange={setLocale} values={[title, description]} isRequired />
        } />
      <MultilingualRichTextEditor aria-label="Phase description" placeholder="Add a short description" locales={LOCALES}
        locale={locale} onLocaleChange={setLocale} showLocaleSwitcher={false} value={description} onChange={setDescription} />
    </div>
  );
}

/**
 * A title in each of the platform's languages: the content-language button sits in the end Figma keeps clear (the
 * prototype's language menu). The one button drives the description under it too: a language counts as done when
 * both have text. Not in Figma.
 */
export const Multilingual: Story = {
  render: () => <MultilingualTitle />
};
