import {expect, within} from 'storybook/test';
import {VotingRow} from './VotingRow';
import {PICTURES} from '../stories/images';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof VotingRow> = {
  title: 'Patterns/Participation methods/Voting row',
  component: VotingRow,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-488'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof VotingRow>;

const THUMB = PICTURES.park;

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, background: 'var(--gv-surface-panel)'}}>{children}</div>
);

/** Figma's variants, each with its thumbnail. */
export const AllVariants: Story = () => (
  <Frame>
    <VotingRow
      title="New lagoon-side playground"
      thumbnail={THUMB}
      voteCount={72}
      fillPercent={100}
      newVoteCount={4}
      onlineCount={72}
      offlineCount={0}
      commentCount={6}
      newCommentCount={2}
    />
    <VotingRow
      title="Restored central lawn"
      thumbnail={THUMB}
      voteCount={54}
      fillPercent={75}
      newVoteCount={2}
      onlineCount={54}
      offlineCount={0}
      commentCount={3}
    />
    <VotingRow
      title="Evening path lighting"
      thumbnail={THUMB}
      hasWarning
      voteCount={41}
      fillPercent={35}
      onlineCount={41}
      offlineCount={0}
      commentCount={4}
      newCommentCount={1}
    />
  </Frame>
);

export const New: Story = () => (
  <Frame>
    <VotingRow
      title="New lagoon-side playground"
      thumbnail={THUMB}
      voteCount={72}
      fillPercent={100}
      newVoteCount={4}
      onlineCount={72}
      offlineCount={0}
      commentCount={6}
      newCommentCount={2}
    />
  </Frame>
);

export const Default: Story = () => (
  <Frame>
    <VotingRow
      title="Restored central lawn"
      thumbnail={THUMB}
      voteCount={54}
      fillPercent={75}
      newVoteCount={2}
      onlineCount={54}
      offlineCount={0}
      commentCount={3}
    />
  </Frame>
);

export const NewWarning: Story = () => (
  <Frame>
    <VotingRow
      title="Evening path lighting"
      thumbnail={THUMB}
      hasWarning
      voteCount={41}
      fillPercent={35}
      onlineCount={41}
      offlineCount={0}
      commentCount={4}
      newCommentCount={1}
    />
  </Frame>
);
NewWarning.storyName = 'New · warning';

/** One vote against the leader's two and a half: the bar is `fillPercent` exactly (40%), not a scale rounded on the
 * way. */
export const SmallCounts: Story = () => (
  <Frame>
    <VotingRow title="Benches by the lagoon" thumbnail={THUMB} voteCount={1} fillPercent={40} onlineCount={1}
      offlineCount={0} commentCount={0} />
  </Frame>
);
SmallCounts.storyName = 'Small counts';
SmallCounts.play = async ({canvasElement}) => {
  const bar = within(canvasElement).getByRole('progressbar', {name: 'Votes for Benches by the lagoon'});
  await expect(Number(bar.getAttribute('aria-valuenow')) / Number(bar.getAttribute('aria-valuemax'))).toBeCloseTo(0.4, 5);
};
