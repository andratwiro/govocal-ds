import {ListHeader, type ListHeaderColumn} from './ListHeader';
import {ListRow} from './ListRow';
import {Table, TableHeader, TableBody, Column, Row, Cell} from '../Table';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListHeader> = {
  title: 'Components/List header',
  component: ListHeader,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-485'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListHeader>;

const ideation: ListHeaderColumn[] = [
  {key: 'idea', label: 'Idea', width: 572},
  {key: 'status', label: 'Status', width: 136, square: true}
];

const commonGround: ListHeaderColumn[] = [
  {key: 'statement', label: 'Statement', width: 404, square: true},
  {key: 'assignee', label: 'Assignee', width: 88, square: true},
  {key: 'likes', label: 'Likes', width: 56, variant: 'number'},
  {key: 'agree', label: 'Agree', width: 71, variant: 'number', sorted: true},
  {key: 'reactions', label: 'Reactions', width: 88, variant: 'number'}
];

const proposals: ListHeaderColumn[] = [
  {key: 'proposal', label: 'Proposal', width: 176, square: true},
  {key: 'votes', label: 'Votes', width: 200, sorted: true},
  {key: 'status', label: 'Status', width: 144, square: true},
  {key: 'comments', label: 'Comments', width: 112, variant: 'number'},
  {key: 'timeLeft', label: 'Time left', width: 104, square: true}
];

const voting: ListHeaderColumn[] = [
  {key: 'option', label: 'Option', width: 264, square: true},
  {key: 'votes', label: 'Votes', width: 200, sorted: true},
  {key: 'online', label: 'Online', width: 80, variant: 'number'},
  {key: 'offline', label: 'Offline', width: 80, variant: 'number'},
  {key: 'comments', label: 'Comments', width: 112, variant: 'number'}
];

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 32, width: 764}}>
    <div>
      <p style={{font: 'var(--gv-type-small-strong)', marginBottom: 8}}>Method · Ideation</p>
      <ListHeader columns={ideation} onAddColumn={() => {}} />
    </div>
    <div>
      <p style={{font: 'var(--gv-type-small-strong)', marginBottom: 8}}>Method · Common ground</p>
      <ListHeader columns={commonGround} />
    </div>
    <div>
      <p style={{font: 'var(--gv-type-small-strong)', marginBottom: 8}}>Method · Proposals</p>
      <ListHeader columns={proposals} />
    </div>
    <div>
      <p style={{font: 'var(--gv-type-small-strong)', marginBottom: 8}}>Method · Voting</p>
      <ListHeader columns={voting} />
    </div>
  </div>
);

export const Ideation: Story = () => (
  <ListHeader columns={ideation} onAddColumn={() => {}} />
);

export const CommonGround: Story = () => <ListHeader columns={commonGround} />;

export const Proposals: Story = () => <ListHeader columns={proposals} />;

export const Voting: Story = () => <ListHeader columns={voting} />;

/**
 * `ListHeader` and `ListRow` compose directly into a selectable React Aria
 * `Table`: the starter `Table`/`TableHeader`/`Row` already add the checkbox
 * column when `selectionMode="multiple"`, and handle focus, keyboard
 * navigation and selection state — `ListHeader`/`ListRow` only supply
 * Tali's look, as the single (non-tree) column's content. The same pattern
 * works with `GridList`/`GridListItem` for a looser, card-less list.
 */
export const InATable: Story = () => (
  <Table
    aria-label="Ideas awaiting review"
    selectionMode="multiple"
    style={{width: 764}}>
    <TableHeader>
      <Column isRowHeader>
        <ListHeader columns={ideation} onAddColumn={() => alert('Add column')} />
      </Column>
    </TableHeader>
    <TableBody>
      <Row>
        <Cell>
          <ListRow
            title="Organise open-air cinema nights on Linde square"
            status="Viewed"
            warning
          />
        </Cell>
      </Row>
      <Row>
        <Cell>
          <ListRow title="Build rain gardens along the north district" status="Rejected" />
        </Cell>
      </Row>
      <Row>
        <Cell>
          <ListRow
            title="More street trees along the canal would cool the area"
            status="Under consideration"
            thumbnail="https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=64&auto=format&fit=crop"
          />
        </Cell>
      </Row>
      <Row>
        <Cell>
          <ListRow title="A pop-up library for Green Corridors for Riverside" status="New" />
        </Cell>
      </Row>
    </TableBody>
  </Table>
);
