import type {Meta, StoryObj} from '@storybook/react-vite';
import {ReviewStatus} from './ReviewStatus';

const meta: Meta<typeof ReviewStatus> = {
  title: 'Components/Status & feedback/Review status',
  component: ReviewStatus,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-224'}
  }
};
export default meta;
type Story = StoryObj<typeof ReviewStatus>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <ReviewStatus status="to-review" />
      <ReviewStatus status="to-set" />
      <ReviewStatus status="reviewed" />
    </div>
  )
};

/** Review status (Figma's one variant) */
export const ToReview: Story = {name: 'To review', args: {status: 'to-review'}};

/** Not in Figma (the prototype's `.rv--todo` "To set"): a decision with no value yet. */
export const ToSet: Story = {name: 'To set', args: {status: 'to-set'}};

/** Not in Figma (the prototype's `.rv--done`): after the admin visited the card. */
export const Reviewed: Story = {args: {status: 'reviewed'}};
