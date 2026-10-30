import {VoteProgress} from './VoteProgress';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof VoteProgress> = {
  title: 'Patterns/Participation methods/Vote progress',
  component: VoteProgress,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-484'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryFn<typeof VoteProgress>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    <VoteProgress kind="threshold" label="Votes toward the threshold" count={512} threshold={300} />
    <VoteProgress kind="threshold" label="Votes toward the threshold" count={87} threshold={300} />
    <VoteProgress kind="count" label="Votes for Green Corridors for Riverside" count={72} maxCount={100} newCount={4} />
    <VoteProgress kind="count" label="Votes for Shaded bus shelters" count={41} maxCount={150} />
  </div>
);

export const Threshold: Story = () => (
  <VoteProgress kind="threshold" label="Votes toward the threshold" count={512} threshold={300} />
);

export const CountNew: Story = () => (
  <VoteProgress kind="count" label="Votes for Green Corridors for Riverside" count={72} maxCount={100} newCount={4} />
);
CountNew.storyName = 'Count · new';

export const Count: Story = () => (
  <VoteProgress kind="count" label="Votes for Shaded bus shelters" count={41} maxCount={150} />
);
