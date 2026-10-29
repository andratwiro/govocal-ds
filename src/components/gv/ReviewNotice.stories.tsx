import type {Meta, StoryObj} from '@storybook/react-vite';
import {ReviewNotice} from './ReviewNotice';

const meta: Meta<typeof ReviewNotice> = {
  title: 'Components/Review notice',
  component: ReviewNotice,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-224'}
  }
};
export default meta;
type Story = StoryObj<typeof ReviewNotice>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <ReviewNotice state="to-review" />
      <ReviewNotice state="to-set" />
      <ReviewNotice state="reviewed" />
    </div>
  )
};

/** Review notice (Figma's one variant) */
export const ToReview: Story = {name: 'To review', args: {state: 'to-review'}};

/** Prototype only: a decision with no value yet. */
export const ToSet: Story = {name: 'To set', args: {state: 'to-set'}};

/** Prototype only: after the admin visited the card. */
export const Reviewed: Story = {args: {state: 'reviewed'}};
