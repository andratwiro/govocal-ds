import {RailHeader} from './RailHeader';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RailHeader> = {
  title: 'Patterns/Project rail/Rail header',
  component: RailHeader,
  tags: ['autodocs'],
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
