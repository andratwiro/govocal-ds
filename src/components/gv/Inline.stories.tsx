import type {Meta, StoryObj} from '@storybook/react-vite';
import {Plus} from 'lucide-react';
import {Inline} from './Inline';
import {Badge} from './Badge';
import {StatusBadge} from './StatusBadge';
import {Button} from '../Button';
import {SearchField} from '../SearchField';

const meta: Meta<typeof Inline> = {
  title: 'Components/Layout & containers/Inline',
  component: Inline,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  parameters: {layout: 'padded'},
  argTypes: {
    gap: {control: 'select', options: ['0', '4', '8', '12', '16', '24']},
    rowGap: {control: 'select', options: [undefined, '4', '8', '12']}
  }
};
export default meta;
type Story = StoryObj<typeof Inline>;

/** A dialog's buttons, 8 apart, at the end of the line. */
export const Buttons: Story = {
  args: {gap: '8', justifyContent: 'end'},
  render: args => (
    <Inline {...args}>
      <Button variant="secondary">Cancel</Button>
      <Button>Save</Button>
    </Inline>
  )
};

const TAGS = ['Mobility', 'Green spaces', 'Housing', 'Safety', 'Culture', 'Education', 'Health', 'Climate'];

/** Badges that wrap onto a new line when the row is full, 6 apart along the line and 6 between lines. */
export const Wrapping: Story = {
  args: {gap: '6', elementType: 'ul', 'aria-label': 'Topics'},
  render: args => (
    <Inline {...args} style={{maxWidth: 320}}>
      {TAGS.map(t => <li key={t}><Badge variant="outlined">{t}</Badge></li>)}
    </Inline>
  )
};

/** A toolbar's row: the search first, the action pushed to the end (`space-between`), centred on each other. */
export const SpaceBetween: Story = {
  name: 'Space between',
  args: {gap: '16', justifyContent: 'space-between'},
  render: args => (
    <Inline {...args}>
      <Inline gap="8">
        <SearchField aria-label="Search projects" placeholder="Search projects" />
        <StatusBadge status="live">Live</StatusBadge>
      </Inline>
      <Button><Plus aria-hidden size={16} />New project</Button>
    </Inline>
  )
};
