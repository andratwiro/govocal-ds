import {RailHeader} from './RailHeader';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RailHeader> = {
  title: 'Components/Rail header',
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

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 264}}>
      <RailHeader title="Participation" onAdd={() => {}} />
      <RailHeader title="Green Corridors for Riverside" />
    </div>
  )
};

export const WithAction: Story = {
  args: {title: 'Participation', onAdd: () => {}}
};

export const WithoutAction: Story = {
  args: {title: 'Participation'}
};
