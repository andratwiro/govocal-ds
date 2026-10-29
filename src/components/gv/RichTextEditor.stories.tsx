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
  let [value, setValue] = useState('');
  return (
    <div style={{width: 444}}>
      <RichTextEditor aria-label="Project description" value={value} onChange={setValue} />
    </div>
  );
}

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 444}}>
      <RichTextEditor aria-label="Project description" placeholder="Add a short description" />
      <RichTextEditor
        aria-label="Green Corridors for Riverside — update"
        value="We're collecting ideas for new green corridors across Riverside."
      />
    </div>
  )
};

export const Empty: Story = {
  render: () => (
    <div style={{width: 444}}>
      <RichTextEditor aria-label="Project description" placeholder="Add a short description" />
    </div>
  )
};

export const Filled: Story = {
  render: () => <Controlled />
};
