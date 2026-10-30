import {expect, userEvent, within} from 'storybook/test';
import {useState} from 'react';
import {RichTextEditor} from './RichTextEditor';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RichTextEditor> = {
  title: 'Components/Forms/Rich text editor',
  component: RichTextEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-203'
    }
  }
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

function Controlled() {
  let [value, setValue] = useState("We're collecting ideas for new green corridors across Riverside. Tell us where a tree, a bench or a path would help.");
  return (
    <div style={{width: 444}}>
      <RichTextEditor aria-label="Project description" value={value} onChange={setValue} />
    </div>
  );
}

/** Empty, with its placeholder, then filled with a project update. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 444}}>
      <RichTextEditor aria-label="Project description" placeholder="Add a short description" />
      <RichTextEditor
        aria-label="Project update"
        value="We're collecting ideas for new green corridors across Riverside."
      />
    </div>
  )
};

/** Nothing written yet: the placeholder says what to write. */
export const Empty: Story = {
  render: () => (
    <div style={{width: 444}}>
      <RichTextEditor aria-label="Project description" placeholder="Add a short description" />
    </div>
  )
};

/** With text in it; type to change it. The text is plain: the toolbar's buttons don't format it yet. */
export const Filled: Story = {
  render: () => <Controlled />
};

/** The keys: Tab lands on the toolbar, the next Tab in the writing area, where typing writes. Try the keys here; an
 * automated test presses them too (the Interactions panel). */
export const Keyboard: Story = {
  render: () => (
    <div style={{width: 444}}>
      <RichTextEditor aria-label="Project description" />
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Bold'})).toHaveFocus();
    await userEvent.tab();
    const text = canvas.getByRole('textbox', {name: 'Project description'});
    await expect(text).toHaveFocus();
    await userEvent.keyboard('Tell residents how to take part.');
    await expect(text).toHaveValue('Tell residents how to take part.');
  }
};
