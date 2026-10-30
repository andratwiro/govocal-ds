import {Button} from '../Button';
import {expect, userEvent, within} from 'storybook/test';
import {useState} from 'react';
import {RichTextToolbar} from './RichTextToolbar';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RichTextToolbar> = {
  title: 'Components/Forms/Rich text toolbar',
  component: RichTextToolbar,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-178'
    }
  }
};

export default meta;
type Story = StoryObj<typeof RichTextToolbar>;

function Controlled() {
  let [bold, setBold] = useState(false);
  let [italic, setItalic] = useState(true);
  let [list, setList] = useState(false);
  return (
    <RichTextToolbar
      isBold={bold}
      onBoldChange={setBold}
      isItalic={italic}
      onItalicChange={setItalic}
      isList={list}
      onListChange={setList}
    />
  );
}

export const AllVariants: Story = {
  render: () => <Controlled />
};

export const Default: Story = {
  render: () => <RichTextToolbar />
};

/** The keyboard, proved by this story's play function: Tab lands on the first tool (the toolbar is one Tab stop); the
 * right and left arrows move between tools; Enter presses one; the next Tab leaves the toolbar. */
export const Keyboard: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'start'}}>
      <Controlled />
      <Button variant="secondary">After the toolbar</Button>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole('button', {name: 'Bold'});
    await userEvent.tab();
    await expect(bold).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', {name: 'Italic'})).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(bold).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'After the toolbar'})).toHaveFocus();
  }
};
