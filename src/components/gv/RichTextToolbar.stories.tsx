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
