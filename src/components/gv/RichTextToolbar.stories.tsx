import {Button} from '../Button';
import {expect, fn, userEvent, within} from 'storybook/test';
import {Sparkles, Trash2} from 'lucide-react';
import {useState} from 'react';
import {RichTextToolbar, type RichTextBlockType} from './RichTextToolbar';
import {IconButton} from './IconButton';
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

/** The floating format bar over a text block on a document's page (not in Figma): the block type, the formatting, then
 * the block's own actions. */
function Floating({actions = true}: {actions?: boolean}) {
  const [type, setType] = useState<RichTextBlockType>('section');
  const [bold, setBold] = useState(false);
  return (
    <RichTextToolbar variant="floating" blockType={type} onBlockTypeChange={setType} isBold={bold} onBoldChange={setBold}
      onLink={fn()}
      actions={actions ? (
        <>
          <IconButton size={24} aria-label="Ask the assistant"><Sparkles aria-hidden /></IconButton>
          <IconButton size={24} aria-label="Delete"><Trash2 aria-hidden /></IconButton>
        </>
      ) : undefined} />
  );
}

/** Floating: Section · Sub-section · Text, B I • link, then Ask the assistant and Delete. */
export const FloatingVariant: Story = {
  name: 'Floating',
  tags: ['not-in-figma'],
  render: () => <Floating />
};

/** Floating with no block type and no actions: the formatting alone. */
export const FloatingFormattingOnly: Story = {
  name: 'Floating, formatting only',
  tags: ['not-in-figma'],
  render: () => <RichTextToolbar variant="floating" onLink={fn()} />
};

/** Right to left: the segment at the start (the right), the actions at the end. */
export const FloatingRightToLeft: Story = {
  name: 'Floating, right to left',
  tags: ['not-in-figma'],
  globals: {direction: 'rtl'},
  render: () => <Floating />
};

/** One Tab stop; the arrow keys move through the segment and the buttons; Enter picks a block type. */
export const FloatingKeyboard: Story = {
  name: 'Floating, keyboard',
  tags: ['not-in-figma'],
  render: () => <Floating />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', {name: 'Section'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', {name: 'Sub-section'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('radio', {name: 'Sub-section'})).toBeChecked();
  }
};
