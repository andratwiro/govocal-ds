import {useState} from 'react';
import {ListHeader, type ListHeaderColumn} from './ListHeader';
import {ListRow} from './ListRow';
import {Table, TableHeader, TableBody, Column, Row, Cell} from '../Table';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListHeader> = {
  title: 'Components/Data display/List header',
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
  {key: 'status', label: 'Status', width: 136}
];

const commonGround: ListHeaderColumn[] = [
  {key: 'statement', label: 'Statement', width: 404, square: true},
  {key: 'assignee', label: 'Assignee', width: 88, square: true},
  {key: 'likes', label: 'Likes', width: 56, variant: 'number'},
  {key: 'agree', label: 'Agree', width: 72, variant: 'number', sorted: true},
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

const Label = ({children}: {children: React.ReactNode}) => (
  <p style={{font: 'var(--gv-type-small-strong)', margin: '0 0 8px'}}>{children}</p>
);

/** Figma's four `Method` variants. Ideation and Common ground carry the select-all checkbox. */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 32, width: 764}}>
    <div>
      <Label>Method · Ideation</Label>
      <ListHeader method="ideation" columns={ideation} selectAll={{}} onAddColumn={() => {}} />
    </div>
    <div>
      <Label>Method · Common ground</Label>
      <ListHeader method="common-ground" columns={commonGround} selectAll={{}} />
    </div>
    <div>
      <Label>Method · Proposals</Label>
      <ListHeader method="proposals" columns={proposals} />
    </div>
    <div>
      <Label>Method · Voting</Label>
      <ListHeader method="voting" columns={voting} />
    </div>
  </div>
);

const Wide = ({children}: {children: React.ReactNode}) => <div style={{width: 764}}>{children}</div>;

export const Ideation: Story = () => (
  <Wide>
    <ListHeader columns={ideation} selectAll={{}} onAddColumn={() => {}} />
  </Wide>
);

export const CommonGround: Story = () => (
  <Wide>
    <ListHeader columns={commonGround} selectAll={{}} />
  </Wide>
);
CommonGround.storyName = 'Common ground';

export const Proposals: Story = () => (
  <Wide>
    <ListHeader columns={proposals} />
  </Wide>
);

export const Voting: Story = () => (
  <Wide>
    <ListHeader columns={voting} />
  </Wide>
);

const IDEAS = [
  ['Organise open-air cinema nights on Linden Avenue in summer. It would be a great way for neighbours to meet.', 'Viewed', true],
  ['Build rain gardens along the north district so the street stops flooding after every heavy storm.', 'Rejected', false],
  ['Widen the pavement on Riverside Park. With prams, wheelchairs and shop terraces there is simply not enough room.', 'Under consideration', false],
  ['Set up a repair café near Riverside Park where people can fix bikes, clothes and small appliances.', 'Viewed', false]
] as const;

/**
 * The prototype's Manage table: `ListHeader` with its select-all, then `ListRow`s with theirs.
 * The header checkbox selects every row, and shows a dash while only some are picked.
 */
export const ManageTable: Story = () => {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const all = picked.size === IDEAS.length;
  return (
    <div style={{width: 764, padding: 8, background: 'var(--gv-surface-panel)'}}>
      <ListHeader
        columns={ideation}
        onSort={() => {}}
        onAddColumn={() => {}}
        selectAll={{
          isSelected: all,
          isIndeterminate: picked.size > 0 && !all,
          onChange: on => setPicked(on ? new Set(IDEAS.map((_, i) => i)) : new Set())
        }}
      />
      {IDEAS.map(([title, status, warning], i) => (
        <ListRow
          key={i}
          title={title}
          status={status}
          warning={warning}
          select={{
            isSelected: picked.has(i),
            'aria-label': `Select: ${title}`,
            onChange: on =>
              setPicked(p => {
                const n = new Set(p);
                if (on) n.add(i);
                else n.delete(i);
                return n;
              })
          }}
        />
      ))}
    </div>
  );
};
ManageTable.storyName = 'Manage table';

/**
 * `ListHeader` and `ListRow` inside a selectable React Aria `Table`: the starter
 * `Table`/`TableHeader`/`Row` add the checkbox column when `selectionMode="multiple"`,
 * and handle focus, keyboard navigation and selection state. `ListHeader`/`ListRow` only
 * supply the look, as the single column's content (`leadSlot` keeps the header in line with
 * the row's empty checkbox slot). The starter Table keeps its own zebra and borders; the
 * prototype's look is `ManageTable`.
 */
export const InATable: Story = () => (
  <Table
    aria-label="Ideas awaiting review"
    selectionMode="multiple"
    style={{width: 764}}>
    <TableHeader>
      <Column isRowHeader>
        <ListHeader columns={ideation} leadSlot onAddColumn={() => alert('Add column')} />
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
InATable.storyName = 'In a table';
