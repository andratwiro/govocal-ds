import {useState} from 'react';
import {EditorToolbar} from './EditorToolbar';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof EditorToolbar> = {
  title: 'Components/Editor toolbar',
  component: EditorToolbar,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-178'
    }
  }
};

export default meta;
type Story = StoryObj<typeof EditorToolbar>;

function Controlled() {
  let [bold, setBold] = useState(false);
  let [italic, setItalic] = useState(true);
  let [list, setList] = useState(false);
  return (
    <EditorToolbar
      bold={bold}
      onBoldChange={setBold}
      italic={italic}
      onItalicChange={setItalic}
      list={list}
      onListChange={setList}
    />
  );
}

export const AllVariants: Story = {
  render: () => <Controlled />
};

export const Default: Story = {
  render: () => <EditorToolbar />
};
