import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';
import type {Multiloc} from './LocaleSwitcher';
import {MultilingualRichTextEditor} from './MultilingualRichTextEditor';

const meta: Meta<typeof MultilingualRichTextEditor> = {
  title: 'Components/Forms/Multilingual rich text editor',
  component: MultilingualRichTextEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Not in Figma: the platform\'s multilingual rich text field (its content builder\'s Text widget, a ' +
          'project\'s description) on the Rich text editor; the designer\'s drawings for multilingual fields are pending.'
      }
    }
  },
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  args: {
    label: 'Description',
    locales: ['en', 'es-ES'],
    placeholder: 'Add a short introduction here',
    onChange: fn(),
    onLocaleChange: fn()
  },
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export default meta;
type Story = StoryObj<typeof MultilingualRichTextEditor>;

/* Invented data: a platform in English and Spanish, a project's introduction. */
const intro: Multiloc = {
  en: 'Add a short introduction here: tell residents what this project is about and how they can take part.',
  'es-ES': ''
};

/** English written, Spanish still empty (the field is optional, so its mark is grey). */
export const Default: Story = {
  args: {defaultValue: intro}
};

/** Every language is required: Spanish is marked amber, and the platform's Spanish is shown. */
export const Required: Story = {
  args: {defaultValue: intro, defaultLocale: 'es-ES', isRequired: true}
};

/** After a save was tried: the missing language is shown and named under the editor. */
export const Invalid: Story = {
  args: {defaultValue: intro, isRequired: true, isInvalid: true}
};

/** An Arabic text runs right to left in the editor; the toolbar keeps the interface's order. */
export const RightToLeft: Story = {
  name: 'Right to left',
  args: {
    locales: ['en', 'ar-SA'],
    defaultLocale: 'ar-SA',
    defaultValue: {en: intro.en, 'ar-SA': 'أضف مقدمة قصيرة هنا: أخبر السكان عن هذا المشروع وكيف يمكنهم المشاركة.'}
  }
};

function ControlledEditor() {
  const [value, setValue] = useState<Multiloc>(intro);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <MultilingualRichTextEditor label="Description" locales={['en', 'es-ES']} value={value} onChange={setValue} />
      <pre style={{margin: 0, font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)', whiteSpace: 'pre-wrap'}}>
        {JSON.stringify(value, null, 1)}
      </pre>
    </div>
  );
}

/** The page holds the Multiloc (`value` / `onChange`). */
export const Controlled: Story = {
  render: () => <ControlledEditor />
};

/** The keyboard, proved by this story's play function: Tab lands on the shown language, the right arrow picks the
 * next one and the editor follows; Tab goes on into the editor. */
export const Keyboard: Story = {
  args: {defaultValue: intro},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', {name: /^EN\b/})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(canvas.getByRole('radio', {name: /^ES-ES\b/})).toBeChecked());
    const spanish = canvas.getByRole('textbox', {name: 'Description, Spanish (Spain)'});
    await expect(spanish).toHaveValue('');
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Bold'})).toHaveFocus();
  }
};
