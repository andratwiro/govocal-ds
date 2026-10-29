import {useState} from 'react';
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
  <div style={{width: 764, background: 'var(--gv-surface-panel)'}}>{children}</div>
);

/** Figma's four types: Assignee · new, New, New · warning, Empty. */
export const AllVariants: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="Put drinking fountains at every park entrance."
      isNew
      assignee={{initial: 'A'}}
      likes={31}
      agreePercent={81}
      reactions={119}
    />
    <ListRowCommonGround
      statement="Dogs should be kept on a lead near the playground."
      isNew
      assignee={null}
      likes={24}
      agreePercent={66}
      reactions={179}
    />
    <ListRowCommonGround
      statement="People who complain about noise should just move away."
      isNew
      warning
      assignee={null}
      likes={2}
      agreePercent={17}
      reactions={121}
    />
    <ListRowCommonGround
      statement="The park needs much more shade for hot days."
      likes={null}
      agreePercent={80}
      reactions={516}
    />
  </Frame>
);

export const AssigneeNew: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="Put drinking fountains at every park entrance."
      isNew
      assignee={{initial: 'A'}}
      likes={31}
      agreePercent={81}
      reactions={119}
    />
  </Frame>
);

export const New: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="Dogs should be kept on a lead near the playground."
      isNew
      assignee={null}
      likes={24}
      agreePercent={66}
      reactions={179}
    />
  </Frame>
);

export const NewWarning: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="People who complain about noise should just move away."
      isNew
      warning
      assignee={null}
      likes={2}
      agreePercent={17}
      reactions={121}
    />
  </Frame>
);

export const Empty: Story = () => (
  <Frame>
    <ListRowCommonGround
      statement="The park needs much more shade for hot days."
      likes={null}
      agreePercent={80}
      reactions={516}
    />
  </Frame>
);

/**
 * Not in Figma: the prototype's checkbox in the leading slot (participants' statements can be
 * picked for a bulk status or assignee change). It shows on hover, on focus and once checked.
 */
export const Selectable: Story = () => {
  const [picked, setPicked] = useState(true);
  return (
    <Frame>
      <ListRowCommonGround
        statement="Keep one quiet zone with no music at all."
        isNew
        assignee={{initial: 'W'}}
        likes={17}
        agreePercent={60}
        reactions={123}
        select={{isSelected: picked, onChange: setPicked}}
      />
      <ListRowCommonGround
        statement="Evening events would make the park feel safer."
        likes={null}
        agreePercent={76}
        reactions={469}
      />
    </Frame>
  );
};
