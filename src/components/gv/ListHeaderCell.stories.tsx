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
    <ListHeaderCell variant="label">Idea</ListHeaderCell>
    <ListHeaderCell variant="add-column" />
    <ListHeaderCell variant="label" square>
      Statement
    </ListHeaderCell>
    <ListHeaderCell variant="number">Likes</ListHeaderCell>
    <ListHeaderCell variant="number" sorted>
      Agree
    </ListHeaderCell>
    <ListHeaderCell variant="label" sorted>
      Votes
    </ListHeaderCell>
  </div>
);

export const Label: Story = () => <ListHeaderCell variant="label">Idea</ListHeaderCell>;

export const AddColumn: Story = () => <ListHeaderCell variant="add-column" />;
AddColumn.storyName = 'Add column';

export const LabelSquare: Story = () => (
  <ListHeaderCell variant="label" square>
    Statement
  </ListHeaderCell>
);
LabelSquare.storyName = 'Label · square';

export const Number_: Story = () => <ListHeaderCell variant="number">Likes</ListHeaderCell>;
Number_.storyName = 'Number';

export const NumberSorted: Story = () => (
  <ListHeaderCell variant="number" sorted>
    Agree
  </ListHeaderCell>
);
NumberSorted.storyName = 'Number · sorted';

export const LabelSorted: Story = () => (
  <ListHeaderCell variant="label" sorted>
    Votes
  </ListHeaderCell>
);
LabelSorted.storyName = 'Label · sorted';
