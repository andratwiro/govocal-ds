import {CauseRow} from './CauseRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof CauseRow> = {
  title: 'Components/Cause row',
  component: CauseRow,
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
type Story = StoryFn<typeof CauseRow>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', width: 500}}>
    <CauseRow
      title="Tree-planting weekends"
      description="Help plant shade trees along the park promenade."
      volunteerCount={18}
      percent={100}
    />
    <CauseRow
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
    <CauseRow
      title="Tree-planting weekends"
      description="Help plant shade trees along the park promenade."
      volunteerCount={18}
      percent={100}
    />
  </div>
);

export const Last: Story = () => (
  <div style={{width: 500}}>
    <CauseRow
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
    <CauseRow title="Repaint the park benches" description="One Saturday morning, paint and brushes provided." volunteerCount={1} percent={5} isLast />
  </div>
);
