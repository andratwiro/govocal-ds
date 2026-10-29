import {ListRow} from './ListRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListRow> = {
  title: 'Components/List row',
  component: ListRow,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-885'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListRow>;

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, border: '1px solid var(--gv-border-card)'}}>{children}</div>
);

export const AllVariants: Story = () => (
  <Frame>
    <ListRow
      title="Organise open-air cinema nights on Linde square"
      status="Viewed"
      warning
    />
    <ListRow title="Build rain gardens along the north district" status="Rejected" />
    <ListRow
      title="More street trees along the canal would cool the area"
      status="Under consideration"
      thumbnail="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=64&auto=format&fit=crop"
    />
  </Frame>
);

export const WarningNoImage: Story = () => (
  <Frame>
    <ListRow title="Organise open-air cinema nights on Linde square" status="Viewed" warning />
  </Frame>
);

export const NoneNoImage: Story = () => (
  <Frame>
    <ListRow title="Build rain gardens along the north district" status="Rejected" />
  </Frame>
);

export const NoneWithImage: Story = () => (
  <Frame>
    <ListRow
      title="More street trees along the canal would cool the area"
      status="Under consideration"
      thumbnail="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=64&auto=format&fit=crop"
    />
  </Frame>
);
