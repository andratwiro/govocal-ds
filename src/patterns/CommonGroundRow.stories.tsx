import {useState} from 'react';
import {CommonGroundRow} from './CommonGroundRow';
import {ListHeader, type ListHeaderColumn} from '../components/gv/ListHeader';
import {expect, userEvent, within} from 'storybook/test';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof CommonGroundRow> = {
  title: 'Patterns/Participation methods/Common ground row',
  component: CommonGroundRow,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-486'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryFn<typeof CommonGroundRow>;

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, background: 'var(--gv-surface-panel)'}}>{children}</div>
);

/**
 * Figma's four types, top to bottom: Assignee · new, New, New · warning, Empty. The columns are Statement, Assignee,
 * Likes, Agree and Reactions; the "Under its List header" story names them.
 */
export const AllVariants: Story = () => (
  <Frame>
    <CommonGroundRow
      statement="Put drinking fountains at every park entrance."
      isNew
      assignee={{initial: 'A'}}
      likes={31}
      agreePercent={81}
      reactions={119}
    />
    <CommonGroundRow
      statement="Dogs should be kept on a lead near the playground."
      isNew
      assignee={null}
      likes={24}
      agreePercent={66}
      reactions={179}
    />
    <CommonGroundRow
      statement="People who complain about noise should just move away."
      isNew
      hasWarning
      assignee={null}
      likes={2}
      agreePercent={17}
      reactions={121}
    />
    <CommonGroundRow
      statement="The park needs much more shade for hot days."
      likes={null}
      agreePercent={80}
      reactions={516}
    />
  </Frame>
);

/** A new statement ("New") that someone on the team is assigned to review (their initial). */
export const AssigneeNew: Story = () => (
  <Frame>
    <CommonGroundRow
      statement="Put drinking fountains at every park entrance."
      isNew
      assignee={{initial: 'A'}}
      likes={31}
      agreePercent={81}
      reactions={119}
    />
  </Frame>
);
AssigneeNew.storyName = 'Assignee · new';

/** A new statement nobody is assigned to yet: the dashed ring. */
export const New: Story = () => (
  <Frame>
    <CommonGroundRow
      statement="Dogs should be kept on a lead near the playground."
      isNew
      assignee={null}
      likes={24}
      agreePercent={66}
      reactions={179}
    />
  </Frame>
);

/** A new, unassigned statement flagged for attention: the triangle, which screen readers hear as "Needs attention". */
export const NewWarning: Story = () => (
  <Frame>
    <CommonGroundRow
      statement="People who complain about noise should just move away."
      isNew
      hasWarning
      assignee={null}
      likes={2}
      agreePercent={17}
      reactions={121}
    />
  </Frame>
);
NewWarning.storyName = 'New · warning';

/**
 * Figma's "Empty": a statement the project team wrote, not a participant. Nobody reviews it, so no assignee, and
 * nobody can like it, so Likes reads "–".
 */
export const Empty: Story = () => (
  <Frame>
    <CommonGroundRow
      statement="The park needs much more shade for hot days."
      likes={null}
      agreePercent={80}
      reactions={516}
    />
  </Frame>
);

const COLUMNS: ListHeaderColumn[] = [
  {key: 'statement', label: 'Statement', isStatic: true},
  {key: 'assignee', label: 'Assignee', width: 88, isStatic: true},
  {key: 'likes', label: 'Likes', width: 56, kind: 'number'},
  {key: 'agree', label: 'Agree', width: 72, kind: 'number', isSorted: true},
  {key: 'reactions', label: 'Reactions', width: 88, kind: 'number'}
];

/** As in the Manage list: under a List header of the same column widths, which names each column. */
export const UnderItsListHeader: Story = () => (
  <Frame>
    <ListHeader columns={COLUMNS} selectAll={{}} />
    <CommonGroundRow statement="Put drinking fountains at every park entrance." isNew assignee={{initial: 'A'}} likes={31}
      agreePercent={81} reactions={119} select={{'aria-label': 'Select Put drinking fountains at every park entrance'}} />
    <CommonGroundRow statement="The park needs much more shade for hot days." likes={null} agreePercent={80}
      reactions={516} select={{'aria-label': 'Select The park needs much more shade for hot days'}} />
  </Frame>
);
UnderItsListHeader.storyName = 'Under its List header';

/**
 * Not in Figma: the prototype's checkbox in the leading slot (participants' statements can be
 * picked for a bulk status or assignee change). It shows on hover, on focus and once checked.
 */
export const Selectable: Story = () => {
  const [picked, setPicked] = useState(true);
  return (
    <Frame>
      <CommonGroundRow
        statement="Keep one quiet zone with no music at all."
        isNew
        assignee={{initial: 'W'}}
        likes={17}
        agreePercent={60}
        reactions={123}
        select={{isSelected: picked, onChange: setPicked}}
      />
      <CommonGroundRow
        statement="Evening events would make the park feel safer."
        likes={null}
        agreePercent={76}
        reactions={469}
      />
    </Frame>
  );
};

/**
 * The keys a selectable row takes: Tab reaches its checkbox, Space ticks or clears it. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = () => {
  const [picked, setPicked] = useState(false);
  return (
    <Frame>
      <CommonGroundRow statement="Keep one quiet zone with no music at all." likes={17} agreePercent={60} reactions={123}
        select={{isSelected: picked, onChange: setPicked, 'aria-label': 'Select Keep one quiet zone'}} />
    </Frame>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  const box = canvas.getByRole('checkbox', {name: 'Select Keep one quiet zone'});
  await expect(box).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(box).toBeChecked();
  await userEvent.keyboard(' ');
  await expect(box).not.toBeChecked();
};
