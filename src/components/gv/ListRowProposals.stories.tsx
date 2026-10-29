import {ListRowProposals} from './ListRowProposals';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListRowProposals> = {
  title: 'Components/List row · Proposals',
  component: ListRowProposals,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-487'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListRowProposals>;

const THUMB = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=64&auto=format&fit=crop';

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, background: 'var(--gv-surface-panel)'}}>{children}</div>
);

/** Figma's variants, each with its thumbnail. */
export const AllVariants: Story = () => (
  <Frame>
    <ListRowProposals
      title="Car-free park loop on weekends"
      thumbnail={THUMB}
      voteCount={512}
      voteThreshold={300}
      statusLabel="Official response"
      commentCount={14}
      closed
    />
    <ListRowProposals
      title="Night lighting for the east paths"
      thumbnail={THUMB}
      voteCount={341}
      voteThreshold={300}
      statusLabel="Threshold reached"
      commentCount={9}
      newCommentCount={3}
      closed
    />
    <ListRowProposals
      title="Community orchard by the north gate"
      thumbnail={THUMB}
      warning
      voteCount={268}
      voteThreshold={300}
      statusLabel="Gathering support"
      commentCount={7}
      newCommentCount={1}
      daysLeft={9}
    />
    <ListRowProposals
      title="Repair the lagoon railings"
      thumbnail={THUMB}
      voteCount={152}
      voteThreshold={300}
      statusLabel="Gathering support"
      commentCount={3}
      daysLeft={21}
    />
  </Frame>
);

export const Closed: Story = () => (
  <Frame>
    <ListRowProposals
      title="Car-free park loop on weekends"
      thumbnail={THUMB}
      voteCount={512}
      voteThreshold={300}
      statusLabel="Official response"
      commentCount={14}
      closed
    />
  </Frame>
);

export const New: Story = () => (
  <Frame>
    <ListRowProposals
      title="Night lighting for the east paths"
      thumbnail={THUMB}
      voteCount={341}
      voteThreshold={300}
      statusLabel="Threshold reached"
      commentCount={9}
      newCommentCount={3}
      closed
    />
  </Frame>
);

export const NewWarning: Story = () => (
  <Frame>
    <ListRowProposals
      title="Community orchard by the north gate"
      thumbnail={THUMB}
      warning
      voteCount={268}
      voteThreshold={300}
      statusLabel="Gathering support"
      commentCount={7}
      newCommentCount={1}
      daysLeft={9}
    />
  </Frame>
);

export const Open: Story = () => (
  <Frame>
    <ListRowProposals
      title="Repair the lagoon railings"
      thumbnail={THUMB}
      voteCount={152}
      voteThreshold={300}
      statusLabel="Gathering support"
      commentCount={3}
      daysLeft={21}
    />
  </Frame>
);
