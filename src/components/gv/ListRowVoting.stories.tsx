import {ListRowVoting} from './ListRowVoting';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListRowVoting> = {
  title: 'Components/List row · Voting',
  component: ListRowVoting,
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
type Story = StoryFn<typeof ListRowVoting>;

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, border: '1px solid var(--gv-border-card)'}}>{children}</div>
);

export const AllVariants: Story = () => (
  <Frame>
    <ListRowVoting
      title="New lagoon-side playground"
      voteCount={72}
      fillPercent={100}
      newVoteCount={4}
      onlineCount={72}
      offlineCount={0}
      commentCount={6}
      newCommentCount={2}
    />
    <ListRowVoting
      title="Restored central lawn"
      voteCount={54}
      fillPercent={75}
      newVoteCount={2}
      onlineCount={54}
      offlineCount={0}
      commentCount={3}
    />
    <ListRowVoting
      title="Evening path lighting"
      warning
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
    <ListRowVoting
      title="New lagoon-side playground"
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
    <ListRowVoting
      title="Restored central lawn"
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
    <ListRowVoting
      title="Evening path lighting"
      warning
      voteCount={41}
      fillPercent={35}
      onlineCount={41}
      offlineCount={0}
      commentCount={4}
      newCommentCount={1}
    />
  </Frame>
);
