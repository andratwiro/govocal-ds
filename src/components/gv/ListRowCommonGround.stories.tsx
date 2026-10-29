import {ListRowCommonGround} from './ListRowCommonGround';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListRowCommonGround> = {
  title: 'Components/List row · Common ground',
  component: ListRowCommonGround,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-486'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListRowCommonGround>;

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, border: '1px solid var(--gv-border-card)'}}>{children}</div>
);

export const AllVariants: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="Put drinking fountains at every park entrance"
      isNew
      assignee={{initial: 'A'}}
      reactionCount={31}
      agreePercent={81}
      visibleCount={119}
    />
    <ListRowCommonGround
      statement="Dogs should be kept on a lead near the playgrounds"
      isNew
      assignee={null}
      reactionCount={24}
      agreePercent={66}
      visibleCount={179}
    />
    <ListRowCommonGround
      statement="People who complain about noise should just move"
      isNew
      warning
      assignee={null}
      reactionCount={2}
      agreePercent={17}
      visibleCount={121}
    />
    <ListRowCommonGround
      statement="The park needs much more shade for hot days"
      reactionCount={null}
      agreePercent={80}
      visibleCount={516}
    />
  </Frame>
);

export const AssigneeNew: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="Put drinking fountains at every park entrance"
      isNew
      assignee={{initial: 'A'}}
      reactionCount={31}
      agreePercent={81}
      visibleCount={119}
    />
  </Frame>
);

export const New: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="Dogs should be kept on a lead near the playgrounds"
      isNew
      assignee={null}
      reactionCount={24}
      agreePercent={66}
      visibleCount={179}
    />
  </Frame>
);

export const NewWarning: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="People who complain about noise should just move"
      isNew
      warning
      assignee={null}
      reactionCount={2}
      agreePercent={17}
      visibleCount={121}
    />
  </Frame>
);

export const Empty: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="The park needs much more shade for hot days"
      reactionCount={null}
      agreePercent={80}
      visibleCount={516}
    />
  </Frame>
);
