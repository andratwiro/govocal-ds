import {VolunteeringRow} from './VolunteeringRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof VolunteeringRow> = {
  title: 'Patterns/Participation methods/Volunteering row',
  component: VolunteeringRow,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-483'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof VolunteeringRow>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', width: 500}}>
    <VolunteeringRow
      title="Tree-planting weekends"
      description="Help plant shade trees along the park promenade."
      volunteerCount={18}
      percent={100}
    />
    <VolunteeringRow
      title="Photograph the park"
      description="Before-and-after shots for the final report."
      volunteerCount={4}
      percent={22}
      isLast
    />
  </div>
);

export const Default: Story = () => (
  <div style={{width: 500}}>
    <VolunteeringRow
      title="Tree-planting weekends"
      description="Help plant shade trees along the park promenade."
      volunteerCount={18}
      percent={100}
    />
  </div>
);

export const Last: Story = () => (
  <div style={{width: 500}}>
    <VolunteeringRow
      title="Photograph the park"
      description="Before-and-after shots for the final report."
      volunteerCount={4}
      percent={22}
      isLast
    />
  </div>
);

/** One sign-up reads "1 volunteer" (the prototype's singular). */
export const OneVolunteer: Story = () => (
  <div style={{width: 500}}>
    <VolunteeringRow title="Repaint the park benches" description="One Saturday morning, paint and brushes provided." volunteerCount={1} percent={5} isLast />
  </div>
);
OneVolunteer.storyName = 'One volunteer';
