import type {Meta, StoryObj} from '@storybook/react-vite';
import {ReactionCounts} from './ReactionCounts';

const meta: Meta<typeof ReactionCounts> = {
  title: 'Components/Data display/Reaction counts',
  component: ReactionCounts,
  tags: ['autodocs', 'not-in-figma'],
  args: {likes: 128, dislikes: 3}
};
export default meta;
type Story = StoryObj<typeof ReactionCounts>;

/** Every configuration: likes and dislikes (a side panel's head), with comments (a Most liked row), and none yet. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 16}}>
      <ReactionCounts likes={128} dislikes={3} />
      <ReactionCounts likes={124} dislikes={4} comments={3} />
      <ReactionCounts likes={0} dislikes={0} />
    </div>
  )
};

/** Likes and dislikes, as in the side panel's head beside the quick actions. */
export const Default: Story = {};

/** With the comment count, as on a Most liked row of the Insights tab. */
export const WithComments: Story = {name: 'With comments', args: {likes: 124, dislikes: 4, comments: 3}};

/** Nobody reacted yet: the counts still show, at 0. */
export const Zero: Story = {args: {likes: 0, dislikes: 0}};
