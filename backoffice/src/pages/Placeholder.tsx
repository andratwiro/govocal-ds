import {Button} from '../../../src/components/Button';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell}
  from '../../../src/components/gv/DataTable';
import {INPUTS, USERS} from '../data';
import type {NavItem} from '../nav';
import {Page} from './Page';

export function Placeholder({item}: {item: NavItem}) {
  const rows = item.id === 'users' ? USERS.map(u => [u.name, u.email, u.role, u.joined])
    : INPUTS.map(i => [i.title, i.author, String(i.votes), i.status]);
  const cols = item.id === 'users' ? ['Name', 'Email', 'Role', 'Joined'] : ['Title', 'Author', 'Votes', 'Status'];
  return (
    <Page title={item.label} actions={<Button variant="primary" size={32}>New</Button>}>
      <p className="bo-note">Shallow page: layout and components only, invented data.</p>
      <DataTable aria-label={item.label} framed>
        <DataTableHeader>{cols.map((c, i) => <DataTableColumn key={c} isRowHeader={i === 0}>{c}</DataTableColumn>)}</DataTableHeader>
        <DataTableBody>{rows.map((r, i) => (
          <DataTableRow key={i}>{r.map((c, j) => <DataTableCell key={j}>{c}</DataTableCell>)}</DataTableRow>))}
        </DataTableBody>
      </DataTable>
    </Page>
  );
}
