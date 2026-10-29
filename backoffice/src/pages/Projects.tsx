import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {PROJECTS} from '../data';
import {Page} from './Page';

export function Projects() {
  return (
    <Page title="Projects" actions={<Button variant="primary" size={32}>New project</Button>}>
      <Table aria-label="Projects">
        <TableHeader><Column isRowHeader>Project</Column><Column>Status</Column><Column>Phases</Column></TableHeader>
        <TableBody>{PROJECTS.map(p => (
          <Row key={p.id}>
            <Cell><Link href={`#/projects/${p.id}/phases/${p.phases[0].id}/build`}>{p.title}</Link></Cell>
            <Cell>{p.status}</Cell><Cell>{p.phases.length}</Cell>
          </Row>))}
        </TableBody>
      </Table>
    </Page>
  );
}
