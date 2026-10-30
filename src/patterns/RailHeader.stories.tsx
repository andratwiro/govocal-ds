import {RailHeader} from './RailHeader';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {useState} from 'react';

const meta: Meta<typeof RailHeader> = {
  title: 'Patterns/Project rail/Rail header',
  component: RailHeader,
  tags: ['autodocs', 'status:candidate'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-437'
    }
  }
};

export default meta;
type Story = StoryObj<typeof RailHeader>;

/** Figma's row (title and +), the prototype's (hide panel and +, Not in Figma), and a title alone. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32, width: 264, padding: '8px 0'}}>
      <RailHeader title="Participation" onAdd={() => {}} />
      <RailHeader title="Participation" onTogglePanel={() => {}} onAdd={() => {}} labels={{add: 'Add a phase'}} />
      <RailHeader title="Participation" />
    </div>
  )
};

export const WithAction: Story = {
  name: 'With action',
  args: {title: 'Participation', onAdd: () => {}}
};

/** Not in Figma: the prototype's hide-panel button before the +. */
export const WithPanelToggle: Story = {
  name: 'With panel toggle',
  args: {title: 'Participation', onTogglePanel: () => {}, onAdd: () => {}, labels: {add: 'Add a phase'}}
};

export const WithoutAction: Story = {
  name: 'Without action',
  args: {title: 'Participation'}
};

/** Its buttons by keyboard: Tab reaches hide panel, then +; Enter or Space presses. Try the keys here; an automated test presses them too (the Interactions panel). */
export const Keyboard: Story = {
  render: function Render() {
    const [said, setSaid] = useState('Nothing pressed');
    return (
      <div style={{width: 264, display: 'flex', flexDirection: 'column', gap: 16}}>
        <RailHeader title="Participation" onTogglePanel={() => setSaid('Panel hidden')} onAdd={() => setSaid('Phase added')}
          labels={{add: 'Add a phase', togglePanel: 'Hide the participation rail'}} />
        <span role="status">{said}</span>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Hide the participation rail'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Panel hidden');
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Add a phase'})).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('status')).toHaveTextContent('Phase added');
  }
};
