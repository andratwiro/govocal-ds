import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {SectionToggle} from './SectionToggle';

const meta: Meta<typeof SectionToggle> = {
  title: 'Patterns/Section toggle',
  component: SectionToggle,
  tags: ['autodocs'],
  decorators: [Story => <div style={{width: 560}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof SectionToggle>;

export const Shown: Story = {args: {title: 'Events', description: 'Upcoming events from every project.', isSelected: true}};

export const Hidden: Story = {args: {title: 'Proposals', description: 'Proposals residents can support.', isSelected: false}};

/** Always shown: the switch stays on. */
export const Locked: Story = {args: {title: 'Homepage banner', isSelected: true, isDisabled: true}};

/** A builder's section list. */
export const List: Story = {
  render: () => {
    const [on, setOn] = useState({banner: true, projects: true, events: false});
    return (
      <ul style={{listStyle: 'none', margin: 0, padding: 0}} aria-label="Sections">
        {([['banner', 'Homepage banner'], ['projects', 'Projects'], ['events', 'Events']] as const).map(([id, title]) => (
          <li key={id}>
            <SectionToggle title={title} isSelected={on[id]} onChange={v => setOn(s => ({...s, [id]: v}))} />
          </li>
        ))}
      </ul>
    );
  }
};
