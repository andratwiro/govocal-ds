import {expect, userEvent, within} from 'storybook/test';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {SectionToggle} from './SectionToggle';

const meta: Meta<typeof SectionToggle> = {
  title: 'Patterns/Pages & menu/Section toggle',
  component: SectionToggle,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [Story => <div style={{width: 560}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof SectionToggle>;

export const Shown: Story = {name: 'Default', args: {title: 'Events', description: 'Upcoming events from every project.', isSelected: true}};

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

/**
 * The keys a section list takes: Tab skips a locked section's switch and moves from switch to switch; Space shows or
 * hides the section. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: () => {
    const [on, setOn] = useState({projects: true, events: false});
    return (
      <ul style={{listStyle: 'none', margin: 0, padding: 0}} aria-label="Sections">
        <li><SectionToggle title="Homepage banner" isSelected isDisabled onChange={() => {}} /></li>
        <li><SectionToggle title="Projects" isSelected={on.projects} onChange={v => setOn(s => ({...s, projects: v}))} /></li>
        <li><SectionToggle title="Events" isSelected={on.events} onChange={v => setOn(s => ({...s, events: v}))} /></li>
      </ul>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const projects = canvas.getByRole('switch', {name: 'Show Projects'});
    await expect(projects).toHaveFocus();
    await expect(projects).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(projects).not.toBeChecked();
    await userEvent.tab();
    const events = canvas.getByRole('switch', {name: 'Show Events'});
    await expect(events).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(events).toBeChecked();
    await expect(canvas.getAllByText('Shown on page')).toHaveLength(2);
  }
};
