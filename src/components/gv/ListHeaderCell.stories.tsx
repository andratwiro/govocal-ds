import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';
import {ListHeaderCell} from './ListHeaderCell';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListHeaderCell> = {
  title: 'Components/Data display/List header cell',
  component: ListHeaderCell,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-884'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListHeaderCell>;

// Each cell is a column head: in the stories, as in a List header, it sits in a row of a table.
const Row = ({children}: {children: React.ReactNode}) => (
  <div role="table" aria-label="Ideas">
    <div role="row" style={{display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap'}}>{children}</div>
  </div>
);

export const AllVariants: Story = () => (
  <Row>
    <ListHeaderCell kind="label" onPress={() => {}}>Idea</ListHeaderCell>
    <ListHeaderCell kind="add-column" />
    <ListHeaderCell kind="label" isStatic>
      Statement
    </ListHeaderCell>
    <ListHeaderCell kind="number" onPress={() => {}}>Likes</ListHeaderCell>
    <ListHeaderCell kind="number" onPress={() => {}} isSorted>
      Agree
    </ListHeaderCell>
    <ListHeaderCell kind="label" onPress={() => {}} isSorted sortDirection="ascending">
      Votes
    </ListHeaderCell>
  </Row>
);

export const Label: Story = () => <Row><ListHeaderCell kind="label" onPress={() => {}}>Idea</ListHeaderCell></Row>;

export const AddColumn: Story = () => <Row><ListHeaderCell kind="add-column" /></Row>;
AddColumn.storyName = 'Add column';

export const LabelSquare: Story = () => (
  <Row>
    <ListHeaderCell kind="label" isStatic>
      Statement
    </ListHeaderCell>
  </Row>
);
LabelSquare.storyName = 'Label · square';

export const Number_: Story = () => <Row><ListHeaderCell kind="number" onPress={() => {}}>Likes</ListHeaderCell></Row>;
Number_.storyName = 'Number';

export const NumberSorted: Story = () => (
  <Row>
    <ListHeaderCell kind="number" onPress={() => {}} isSorted>
      Agree
    </ListHeaderCell>
  </Row>
);
NumberSorted.storyName = 'Number · sorted';

export const LabelSorted: Story = () => (
  <Row>
    <ListHeaderCell kind="label" onPress={() => {}} isSorted>
      Votes
    </ListHeaderCell>
  </Row>
);
LabelSorted.storyName = 'Label · sorted';

/** The keyboard: a static cell, and a cell with no `onPress`, take no focus; Tab reaches a sortable cell and the
 * add-column cell, and Enter or Space presses them. The sorted column's head says its order (`aria-sort`). */
export const Keyboard: Story = () => {
  const [sorts, setSorts] = useState(0);
  const [added, setAdded] = useState(0);
  return (
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <Row>
        <ListHeaderCell kind="label" isStatic>Statement</ListHeaderCell>
        <ListHeaderCell kind="number">Agree</ListHeaderCell>
        <ListHeaderCell kind="number" isSorted onPress={() => setSorts(n => n + 1)}>Likes</ListHeaderCell>
        <ListHeaderCell kind="add-column" onPress={() => setAdded(n => n + 1)} />
      </Row>
      <span role="status">{`Sorted ${sorts}, added ${added}`}</span>
    </div>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryByRole('button', {name: 'Agree'})).toBeNull();
  await expect(canvas.getByRole('columnheader', {name: 'Likes'})).toHaveAttribute('aria-sort', 'descending');
  await expect(canvas.getByRole('button', {name: 'Likes'})).not.toHaveAttribute('aria-pressed');
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Likes'})).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toHaveTextContent('Sorted 1, added 0');
  await userEvent.keyboard(' ');
  await expect(canvas.getByRole('status')).toHaveTextContent('Sorted 2, added 0');
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Add column'})).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toHaveTextContent('Sorted 2, added 1');
};
