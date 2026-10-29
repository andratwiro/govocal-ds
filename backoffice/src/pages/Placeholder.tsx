import {Button} from '../../../src/components/Button';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
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
      <Table aria-label={item.label}>
        <TableHeader>{cols.map((c, i) => <Column key={c} isRowHeader={i === 0}>{c}</Column>)}</TableHeader>
        <TableBody>{rows.map((r, i) => <Row key={i}>{r.map((c, j) => <Cell key={j}>{c}</Cell>)}</Row>)}</TableBody>
      </Table>
    </Page>
  );
}
