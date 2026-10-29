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

export const AllVariants: Story = () => (
  <div style={{display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap'}}>
    <ListHeaderCell kind="label">Idea</ListHeaderCell>
    <ListHeaderCell kind="add-column" />
    <ListHeaderCell kind="label" isStatic>
      Statement
    </ListHeaderCell>
    <ListHeaderCell kind="number">Likes</ListHeaderCell>
    <ListHeaderCell kind="number" isSorted>
      Agree
    </ListHeaderCell>
    <ListHeaderCell kind="label" isSorted>
      Votes
    </ListHeaderCell>
  </div>
);

export const Label: Story = () => <ListHeaderCell kind="label">Idea</ListHeaderCell>;

export const AddColumn: Story = () => <ListHeaderCell kind="add-column" />;
AddColumn.storyName = 'Add column';

export const LabelSquare: Story = () => (
  <ListHeaderCell kind="label" isStatic>
    Statement
  </ListHeaderCell>
);
LabelSquare.storyName = 'Label · square';

export const Number_: Story = () => <ListHeaderCell kind="number">Likes</ListHeaderCell>;
Number_.storyName = 'Number';

export const NumberSorted: Story = () => (
  <ListHeaderCell kind="number" isSorted>
    Agree
  </ListHeaderCell>
);
NumberSorted.storyName = 'Number · sorted';

export const LabelSorted: Story = () => (
  <ListHeaderCell kind="label" isSorted>
    Votes
  </ListHeaderCell>
);
LabelSorted.storyName = 'Label · sorted';
