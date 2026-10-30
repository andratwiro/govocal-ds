import {useState} from 'react';
import {ListHeader, type ListHeaderColumn} from './ListHeader';
import {ListRow} from './ListRow';
import {expect, userEvent, within} from 'storybook/test';
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
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryFn<typeof ListHeader>;

const ideation: ListHeaderColumn[] = [
  {key: 'idea', label: 'Idea', width: 572},
  {key: 'status', label: 'Status', width: 136}
];

const commonGround: ListHeaderColumn[] = [
  {key: 'statement', label: 'Statement', width: 404, isStatic: true},
  {key: 'assignee', label: 'Assignee', width: 88, isStatic: true},
  {key: 'likes', label: 'Likes', width: 56, kind: 'number'},
  {key: 'agree', label: 'Agree', width: 72, kind: 'number', isSorted: true},
  {key: 'reactions', label: 'Reactions', width: 88, kind: 'number'}
];

const proposals: ListHeaderColumn[] = [
  {key: 'proposal', label: 'Proposal', width: 176, isStatic: true},
  {key: 'votes', label: 'Votes', width: 200, isSorted: true},
  {key: 'status', label: 'Status', width: 144, isStatic: true},
  {key: 'comments', label: 'Comments', width: 112, kind: 'number'},
  {key: 'timeLeft', label: 'Time left', width: 104, isStatic: true}
];

const voting: ListHeaderColumn[] = [
  {key: 'option', label: 'Option', width: 264, isStatic: true},
  {key: 'votes', label: 'Votes', width: 200, isSorted: true},
  {key: 'online', label: 'Online', width: 80, kind: 'number'},
  {key: 'offline', label: 'Offline', width: 80, kind: 'number'},
  {key: 'comments', label: 'Comments', width: 112, kind: 'number'}
];

const Label = ({children}: {children: React.ReactNode}) => (
  <p style={{font: 'var(--gv-type-small-strong)', margin: '0 0 8px'}}>{children}</p>
);

/** Figma's four `Method` variants. Ideation and Common ground carry the select-all checkbox. */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 32, width: 764}}>
    <div>
      <Label>Method · Ideation</Label>
      <div role="table" aria-label="Inputs"><ListHeader columns={ideation} onSort={() => {}} selectAll={{}} onAddColumn={() => {}} /></div>
    </div>
    <div>
      <Label>Method · Common ground</Label>
      <div role="table" aria-label="Inputs"><ListHeader columns={commonGround} onSort={() => {}} selectAll={{}} /></div>
    </div>
    <div>
      <Label>Method · Proposals</Label>
      <div role="table" aria-label="Inputs"><ListHeader columns={proposals} onSort={() => {}} /></div>
    </div>
    <div>
      <Label>Method · Voting</Label>
      <div role="table" aria-label="Inputs"><ListHeader columns={voting} onSort={() => {}} /></div>
    </div>
  </div>
);

// A List header is a row of column heads: it sits in a table.
const Wide = ({children}: {children: React.ReactNode}) => <div role="table" aria-label="Inputs" style={{width: 764}}>{children}</div>;

export const Ideation: Story = () => (
  <Wide>
    <ListHeader columns={ideation} onSort={() => {}} selectAll={{}} onAddColumn={() => {}} />
  </Wide>
);

export const CommonGround: Story = () => (
  <Wide>
    <ListHeader columns={commonGround} onSort={() => {}} selectAll={{}} />
  </Wide>
);
CommonGround.storyName = 'Common ground';

export const Proposals: Story = () => (
  <Wide>
    <ListHeader columns={proposals} onSort={() => {}} />
  </Wide>
);

export const Voting: Story = () => (
  <Wide>
    <ListHeader columns={voting} onSort={() => {}} />
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
 * The header checkbox selects every row, and shows a dash while only some are picked. The header is a row of column
 * heads, so the list is a table (`role="table"`), and each `ListRow` is one of its rows (`isRow`): its checkbox, title
 * and status are cells under the heads.
 */
export const ManageTable: Story = () => {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const all = picked.size === IDEAS.length;
  const pick = (i: number, on: boolean) =>
    setPicked(p => {
      const n = new Set(p);
      if (on) n.add(i);
      else n.delete(i);
      return n;
    });
  return (
    <div role="table" aria-label="Ideas awaiting review" style={{width: 764, padding: 8, background: 'var(--gv-surface-panel)'}}>
      <div role="rowgroup">
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
      </div>
      <div role="rowgroup">
        {IDEAS.map(([title, status, warning], i) => (
          <ListRow
            key={i}
            isRow
            title={title}
            status={status}
            hasWarning={warning}
            select={{isSelected: picked.has(i), 'aria-label': `Select: ${title}`, onChange: on => pick(i, on)}}
          />
        ))}
      </div>
    </div>
  );
};
ManageTable.storyName = 'Manage table';

/** The keyboard: Tab reaches the select-all checkbox, then each sortable column (static ones are skipped); Space
 * ticks the checkbox, Enter or Space on a column sorts by it. */
export const Keyboard: Story = () => {
  const [sortedBy, setSortedBy] = useState('agree');
  const [all, setAll] = useState(false);
  const columns = commonGround.map(c => ({...c, isSorted: c.key === sortedBy}));
  return (
    <div style={{width: 764}}>
      <div role="table" aria-label="Statements">
        <ListHeader columns={columns} onSort={setSortedBy} selectAll={{isSelected: all, onChange: setAll}} />
      </div>
      <p role="status">Sorted by {columns.find(c => c.isSorted)?.label}</p>
    </div>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  await expect(canvas.getByRole('checkbox', {name: 'Select all'})).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(canvas.getByRole('checkbox', {name: 'Select all'})).toBeChecked();
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Likes'})).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toHaveTextContent('Sorted by Likes');
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Agree'})).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(canvas.getByRole('status')).toHaveTextContent('Sorted by Agree');
};

/** Sorting: the sorted column says its direction (`aria-sort` on its column head, an arrow down for most first, up for
 * least first); pressing it again turns the order round. A column is a button only when the list can be sorted. */
export const Sorting: Story = () => {
  const [sort, setSort] = useState<{key: string; direction: 'ascending' | 'descending'}>({key: 'votes', direction: 'descending'});
  const columns = voting.map(c => ({...c, isSorted: !c.isStatic && c.key === sort.key, sortDirection: sort.direction}));
  return (
    <div role="table" aria-label="Options" style={{width: 764}}>
      <ListHeader columns={columns}
        onSort={key => setSort(s => ({key, direction: s.key === key && s.direction === 'descending' ? 'ascending' : 'descending'}))} />
    </div>
  );
};
Sorting.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const votes = canvas.getByRole('columnheader', {name: 'Votes'});
  await expect(votes).toHaveAttribute('aria-sort', 'descending');
  await expect(canvas.getByRole('button', {name: 'Votes'})).not.toHaveAttribute('aria-pressed');
  await expect(canvas.getByRole('columnheader', {name: 'Online'})).not.toHaveAttribute('aria-sort');
  await userEvent.click(canvas.getByRole('button', {name: 'Votes'}));
  await expect(votes).toHaveAttribute('aria-sort', 'ascending');
  await userEvent.click(canvas.getByRole('button', {name: 'Online'}));
  await expect(canvas.getByRole('columnheader', {name: 'Online'})).toHaveAttribute('aria-sort', 'descending');
  await expect(votes).not.toHaveAttribute('aria-sort');
};

/** No `onSort`: the column heads are plain text, so Tab doesn't stop on heads that do nothing. The sorted column still
 * says its order. */
export const NotSortable: Story = () => (
  <div role="table" aria-label="Proposals" style={{width: 764}}>
    <ListHeader columns={proposals} />
  </div>
);
NotSortable.storyName = 'Not sortable';
NotSortable.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  await expect(canvas.getAllByRole('columnheader')).toHaveLength(5);
  await expect(canvas.getByRole('columnheader', {name: 'Votes'})).toHaveAttribute('aria-sort', 'descending');
};
