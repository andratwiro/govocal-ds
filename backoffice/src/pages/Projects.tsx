import {Calendar, ChevronDown, FileText, Folder, FolderPlus, GripVertical, LayoutGrid, MapPin, MoreHorizontal,
  Orbit, Plus, Users} from 'lucide-react';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {SearchField} from '../../../src/components/SearchField';
import {ToggleButton} from '../../../src/components/ToggleButton';
import {DateRangePicker} from '../../../src/components/DateRangePicker';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {Avatar} from '../../../src/components/gv/Avatar';
import {Status} from '../../../src/components/gv/Status';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Pill} from '../../../src/components/gv/Pill';
import {PROJECTS} from '../data';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

// The view tabs, each with its icon as in the prototype's sub-nav.
const VIEWS = [
  {id: 'Projects', icon: LayoutGrid}, {id: 'Folders', icon: Folder}, {id: 'Spaces', icon: Orbit},
  {id: 'Calendar', icon: Calendar}, {id: 'Arrange projects', icon: GripVertical}
];
const SORTS = ['Recently viewed', 'Phase starting or ending soon', 'Recently created (new-old)',
  'Recently created (old-new)', 'Alphabetically (a-z)', 'Alphabetically (z-a)'];

// "Manager B" → "B": one letter keeps the 28 avatar clean, as in the prototype's single-initial avatars.
const initial = (name: string) => name.split(' ').pop()!.slice(0, 1).toUpperCase();

function Managers({names}: {names?: string[]}) {
  if (!names?.length) {
    return <span className="bo-projects-person"><Avatar unassigned /><span className="bo-note">Not assigned</span></span>;
  }
  const [first, ...rest] = names;
  return (
    <span className="bo-projects-person" title={names.join(', ')}>
      <Avatar initials={initial(first)} />
      <span>{first}{rest.length > 0 && <span className="bo-note"> +{rest.length}</span>}</span>
    </span>
  );
}

function ProjectTable() {
  return (
    <Table aria-label="Projects" className="react-aria-Table bo-projects-table">
      <TableHeader>
        <Column isRowHeader>Project</Column>
        <Column><span className="bo-projects-icon-head"><Users aria-hidden size={16} /><span className="bo-visually-hidden">Participants</span></span></Column>
        <Column>Phase</Column><Column>Managers</Column><Column>Visibility</Column><Column>Start</Column><Column>End</Column>
        <Column><span className="bo-visually-hidden">Actions</span></Column>
      </TableHeader>
      <TableBody>{PROJECTS.map(p => (
        <Row key={p.id} id={p.id}>
          <Cell>
            <span className="bo-projects-name">
              <Gap name="Project thumbnail" inline><MapPin aria-hidden size={16} /></Gap>
              <span>
                <Link href={`#/projects/${p.id}`}>{p.title}</Link>
                {p.folder && <span className="bo-note bo-projects-folder"><Folder aria-hidden size={12} />{p.folder}</span>}
              </span>
            </span>
          </Cell>
          <Cell><span className="bo-projects-nowrap">{p.participants}</span></Cell>
          <Cell>{p.current}{p.timeLeft && <div className="bo-note">{p.timeLeft}</div>}</Cell>
          <Cell><Managers names={p.managers} /></Cell>
          <Cell>
            <span className="bo-projects-visibility">
              <Status state={p.status === 'Live' ? 'live' : 'draft'}>{p.status === 'Live' ? 'Published' : 'Draft'}</Status>
              <span className="bo-note">{p.access}</span>
            </span>
          </Cell>
          <Cell><span className="bo-projects-nowrap">{p.start}</span></Cell>
          <Cell><span className="bo-projects-nowrap">{p.end ?? '—'}</span></Cell>
          <Cell>
            <MenuTrigger>
              <IconButton aria-label={`Actions for ${p.title}`}><MoreHorizontal aria-hidden size={16} /></IconButton>
              <Menu>
                <MenuItem>Duplicate</MenuItem>
                <MenuItem>Move to folder</MenuItem>
                <MenuItem>Delete</MenuItem>
              </Menu>
            </MenuTrigger>
          </Cell>
        </Row>))}
      </TableBody>
    </Table>
  );
}

function HeaderActions() {
  return (
    <span className="bo-projects-actions">
      <Button variant="secondary" size={32}><FolderPlus aria-hidden size={16} />New folder</Button>
      <MenuTrigger>
        <Button variant="primary" size={32}><Plus aria-hidden size={16} />New project<ChevronDown aria-hidden size={16} /></Button>
        <Menu aria-label="New project">
          <MenuItem><FileText aria-hidden size={16} />From scratch</MenuItem>
          <MenuItem><LayoutGrid aria-hidden size={16} />Use a template</MenuItem>
        </Menu>
      </MenuTrigger>
    </span>
  );
}

export function Projects() {
  return (
    <Page title="Projects" actions={<HeaderActions />}>
      <Tabs defaultSelectedKey="Projects">
        <div className="bo-tabs-row">
          <TabList aria-label="Project views">
            {VIEWS.map(({id, icon: Icon}) => (
              <Tab key={id} id={id}>
                <span className="bo-projects-tab">
                  <Icon aria-hidden size={16} />{id}{id === 'Spaces' && <span aria-hidden><Pill>New</Pill></span>}
                </span>
              </Tab>
            ))}
          </TabList>
          <SearchField aria-label="Search projects" placeholder="Search projects" />
        </div>
        <TabPanel id="Projects">
          <div className="bo-filters bo-projects-filters">
            <Select aria-label="Sort" defaultSelectedKey={SORTS[0]}>
              {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
            </Select>
            <ToggleButton>Pending approval</ToggleButton>
            <DateRangePicker aria-label="Dates" />
            <Button variant="secondary" size={32}><Plus aria-hidden size={16} />Add filter</Button>
          </div>
          <GapLegend names={['Project thumbnail']} />
          <ProjectTable />
          <p className="bo-note bo-projects-foot">All projects have been loaded</p>
        </TabPanel>
        {VIEWS.slice(1).map(({id}) => (
          <TabPanel key={id} id={id}><p className="bo-note">Shallow view: {id} comes after the project list.</p></TabPanel>
        ))}
      </Tabs>
    </Page>
  );
}
