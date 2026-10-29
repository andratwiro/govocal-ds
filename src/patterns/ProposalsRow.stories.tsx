import {ProposalsRow} from './ProposalsRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ProposalsRow> = {
  title: 'Patterns/Participation methods/Proposals row',
  component: ProposalsRow,
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
type Story = StoryFn<typeof ProposalsRow>;

const THUMB = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=64&auto=format&fit=crop';

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, background: 'var(--gv-surface-panel)'}}>{children}</div>
);

/** Figma's variants, each with its thumbnail. */
export const AllVariants: Story = () => (
  <Frame>
    <ProposalsRow
      title="Car-free park loop on weekends"
      thumbnail={THUMB}
      voteCount={512}
      voteThreshold={300}
      statusLabel="Official response"
      commentCount={14}
      isClosed
    />
    <ProposalsRow
      title="Night lighting for the east paths"
      thumbnail={THUMB}
      voteCount={341}
      voteThreshold={300}
      statusLabel="Threshold reached"
      commentCount={9}
      newCommentCount={3}
      isClosed
    />
    <ProposalsRow
      title="Community orchard by the north gate"
      thumbnail={THUMB}
      hasWarning
      voteCount={268}
      voteThreshold={300}
      statusLabel="Gathering support"
      commentCount={7}
      newCommentCount={1}
      daysLeft={9}
    />
    <ProposalsRow
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
    <ProposalsRow
      title="Car-free park loop on weekends"
      thumbnail={THUMB}
      voteCount={512}
      voteThreshold={300}
      statusLabel="Official response"
      commentCount={14}
      isClosed
    />
  </Frame>
);

export const New: Story = () => (
  <Frame>
    <ProposalsRow
      title="Night lighting for the east paths"
      thumbnail={THUMB}
      voteCount={341}
      voteThreshold={300}
      statusLabel="Threshold reached"
      commentCount={9}
      newCommentCount={3}
      isClosed
    />
  </Frame>
);

export const NewWarning: Story = () => (
  <Frame>
    <ProposalsRow
      title="Community orchard by the north gate"
      thumbnail={THUMB}
      hasWarning
      voteCount={268}
      voteThreshold={300}
      statusLabel="Gathering support"
      commentCount={7}
      newCommentCount={1}
      daysLeft={9}
    />
  </Frame>
);
NewWarning.storyName = 'New · warning';

export const Open: Story = () => (
  <Frame>
    <ProposalsRow
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
