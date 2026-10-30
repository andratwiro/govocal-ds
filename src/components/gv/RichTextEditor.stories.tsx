import {expect, userEvent, within} from 'storybook/test';
import {useState} from 'react';
import {Type} from 'lucide-react';
import {RichTextEditor} from './RichTextEditor';
import {BlockFrame} from './BlockFrame';
import {RichTextToolbar} from './RichTextToolbar';
import {Stack} from './Stack';
import {Text} from './Text';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RichTextEditor> = {
  title: 'Components/Forms/Rich text editor',
  component: RichTextEditor,
  tags: ['autodocs', 'status:candidate'],
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

/** Inline (not in Figma): typed straight on a document's page, in the type around it, with no border or toolbar. */
export const Inline: Story = {
  tags: ['not-in-figma'],
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{maxInlineSize: 560}}>
        <Text elementType="div" kind="document-body">
          <RichTextEditor variant="inline" aria-label="Summary" value={value} onChange={setValue}
            placeholder="Type here, or ask the assistant to write this part" />
        </Text>
      </div>
    );
  }
};

/** A report's text block: a section heading and its text, edited on the page, the format bar floated by Block frame. */
export const InlineInABlock: Story = {
  name: 'Inline, in a block',
  tags: ['not-in-figma'],
  render: () => {
    const [title, setTitle] = useState('Executive summary');
    const [body, setBody] = useState('3,600 identifiable participants took part across 6 projects.');
    return (
      <div style={{maxInlineSize: 560, paddingBlock: 'var(--gv-space-48)', paddingInline: 'var(--gv-space-40)'}}>
        <BlockFrame label="Text" icon={<Type aria-hidden />} isSelected
          toolbar={<RichTextToolbar variant="floating" blockType="section" onBlockTypeChange={() => {}} onLink={() => {}} />}>
          <Stack gap="8">
            <Text elementType="div" kind="document-heading" color="primary">
              <RichTextEditor variant="inline" aria-label="Section heading" value={title} onChange={setTitle} />
            </Text>
            <Text elementType="div" kind="document-body">
              <RichTextEditor variant="inline" aria-label="Section text" value={body} onChange={setBody}
                placeholder="Type here, or ask the assistant to write this part" />
            </Text>
          </Stack>
        </BlockFrame>
      </div>
    );
  }
};

/** Inline, right to left: the text and its placeholder start at the right. */
export const InlineRightToLeft: Story = {
  name: 'Inline, right to left',
  tags: ['not-in-figma'],
  globals: {direction: 'rtl'},
  render: Inline.render
};
