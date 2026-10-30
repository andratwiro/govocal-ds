import {useState} from 'react';
import {Navigate, useParams} from 'react-router';
import {ChartColumn, Download, Gauge} from 'lucide-react';
import {Avatar, Button, DashboardCard, DashboardDemographic, DataTable, DataTableBody, DataTableCell, DataTableColumn,
  DataTableEmpty, DataTableHeader, Grid, DataTableOptions, DataTablePerson, DataTableRow, DataTableStack, Inline, LineChart, Link,
  MenuItem, Panel, ProjectHeader, SearchField, SectionLabel, Stack, StatTile, Tab, TableToolbar, TabList, TabPanel,
  TabPanels, Tabs, TileGrid, toast, useDateFormatter, useNumberFormatter, VisuallyHidden} from 'govocal-ds';
import {useOpenNav} from '../Layout';
import {ME, PROJECTS} from '../data';
import {AUDIENCE, INSIGHT_WEEKS, PARTICIPATION_WEEKS, VOTER_AGES, VOTER_COMMUTES} from '../data-project';
import {PEOPLE} from '../data-users';
import {ago, initials} from './Users';
import {SharePopover} from './ProjectOverview';
import {AddPhase, NAV_TOGGLE, ProjectRail, Workspace, WorkspaceRail, useAddedPhases, useDeletedPhases, useRailCollapsed} from './ProjectPhase';

// A project's Audience (#/projects/:id/audience), after the prototype's page behind the Participants card: the
// project's crumbs over the rail and the page's own area; the tabs Participants, Demographics and Traffic with the two
// links to the platform's figures at their end; four Stat tiles; then everyone who has taken part, in a Panel's table.
export function ProjectAudience() {
  const {projectId} = useParams();
  return <Audience key={projectId} projectId={projectId ?? ''} />;
}

function Audience({projectId}: {projectId: string}) {
  const openNav = useOpenNav();
  const number = useNumberFormatter();
  const percent = useNumberFormatter({style: 'percent'});
  const joined = useDateFormatter({day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
  const [railCollapsed, setRailCollapsed] = useRailCollapsed();
  const [adding, setAdding] = useState(false);
  const [added] = useAddedPhases(projectId);
  const [removed, deletePhase] = useDeletedPhases();
  const [query, setQuery] = useState('');
  const project = PROJECTS.find(p => p.id === projectId);
  if (!project) return <Navigate to="/projects" replace />;
  const q = query.trim().toLowerCase();
  const people = PEOPLE.filter(p => !q || p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
  const total = project.participants ?? 0;
  return (
    <Grid rows="auto 1fr" gap="8" className="bo-phase">
      <VisuallyHidden elementType="h1">{`${project.title}: Audience`}</VisuallyHidden>
      {/* Project header's bar with the project as the parent crumb: Project › Audience, who is here, Share. */}
      <ProjectHeader projectName="Audience" parentLabel={project.title} parentHref={`#/projects/${project.id}`}
        onTogglePanel={openNav} labels={{toggleSetup: NAV_TOGGLE}}
        people={<Avatar initials={ME.slice(-1)} aria-label={`${ME} is here`} />}
        share={<SharePopover project={project} canCopy={project.status === 'Live'} />} />
      <WorkspaceRail isCollapsed={railCollapsed} onCollapsedChange={setRailCollapsed}>
        <Workspace main="plain" rail={<ProjectRail project={project} added={added} onAdd={() => setAdding(true)}
          onHide={() => setRailCollapsed(true)} removed={removed} onDelete={deletePhase}
          href={p => `#/projects/${project.id}/phases/${p.id}/build`} />}>
          <Tabs defaultSelectedKey="participants" className="bo-fill">
            <Inline gap="16" justifyContent="space-between" alignItems="center">
              <TabList aria-label="Audience">
                <Tab id="participants">Participants</Tab>
                <Tab id="demographics">Demographics</Tab>
                <Tab id="traffic">Traffic</Tab>
              </TabList>
              <Inline gap="16">
                <Link size="medium" href="#/dashboard"><Gauge aria-hidden size={16} /> Stats overview</Link>
                <Link size="medium" href="#/users"><ChartColumn aria-hidden size={16} /> User insights</Link>
              </Inline>
            </Inline>
            <TabPanels>
              <TabPanel id="participants">
                <Stack gap="16">
                  <TileGrid minTileWidth={160} density="compact">
                    <StatTile label="Participants" value={number.format(total)} />
                    <StatTile label="Shared an idea" value={number.format(AUDIENCE.sharedIdea)} />
                    <StatTile label="Votes cast" value={number.format(AUDIENCE.votes)} />
                    <StatTile label="Provided demographics" value={percent.format(AUDIENCE.demographics)} />
                  </TileGrid>
                  {/* The prototype's Audience card: the Panel's head counts everyone, its toolbar exports and searches. */}
                  <Panel title="All participants" count={total} description="Everyone who has taken part in this project." isFlush
                    toolbar={(
                      <TableToolbar aria-label="Participant tools">
                        <Button variant="quiet" size={32} onPress={() => toast('Participants exported', 'An Excel file of everyone who took part.')}>
                          <Download aria-hidden size={16} />Export all
                        </Button>
                        <SearchField aria-label="Search participants" placeholder="Search" value={query} onChange={setQuery} />
                      </TableToolbar>
                    )}>
                    <DataTable aria-label="All participants" selectionMode="multiple" showChecksOnHover>
                      <DataTableHeader>
                        <DataTableColumn id="name" isRowHeader width="2fr">Name</DataTableColumn>
                        <DataTableColumn id="role" width="1.5fr">Role</DataTableColumn>
                        <DataTableColumn id="lastActive">Last active</DataTableColumn>
                        <DataTableColumn id="joined">Joined</DataTableColumn>
                        <DataTableColumn id="options" align="options">Options</DataTableColumn>
                      </DataTableHeader>
                      <DataTableBody items={people} renderEmptyState={() => <DataTableEmpty>No participant matches.</DataTableEmpty>}>
                        {p => (
                          <DataTableRow id={p.id} textValue={p.name}>
                            <DataTableCell><DataTablePerson name={p.name} initials={initials(p.name)} sub={p.email} /></DataTableCell>
                            <DataTableCell>
                              <DataTableStack sub={p.role !== 'Registered user' && 'Assigned items'}>{p.role}</DataTableStack>
                            </DataTableCell>
                            <DataTableCell>{ago(p.lastActive)}</DataTableCell>
                            <DataTableCell>{joined.format(new Date(`${p.joined}T00:00:00Z`))}</DataTableCell>
                            <DataTableCell>
                              <DataTableOptions aria-label={`Options for ${p.name}`}
                                onAction={k => toast(k === 'message' ? `Message to ${p.name} started` : `${p.name}'s profile opened`)}>
                                <MenuItem id="profile">See profile</MenuItem>
                                <MenuItem id="message">Send a message</MenuItem>
                              </DataTableOptions>
                            </DataTableCell>
                          </DataTableRow>
                        )}
                      </DataTableBody>
                    </DataTable>
                  </Panel>
                </Stack>
              </TabPanel>
              <TabPanel id="demographics">
                <Stack gap="16">
                  <SectionLabel>Participants who shared their profile</SectionLabel>
                  <TileGrid minTileWidth={280}>
                    <DashboardCard kind="demographic-age"><DashboardDemographic label="Age group" items={[...VOTER_AGES]} /></DashboardCard>
                    <DashboardCard kind="demographic-commute"><DashboardDemographic label="Primary commute" items={[...VOTER_COMMUTES]} /></DashboardCard>
                  </TileGrid>
                </Stack>
              </TabPanel>
              <TabPanel id="traffic">
                <DashboardCard kind="visitors-over-time" title="Visitors over time" subtitle={`Weekly, since ${INSIGHT_WEEKS[0]}`}>
                  <LineChart xAxis={INSIGHT_WEEKS} series={[{label: 'Visitors', values: PARTICIPATION_WEEKS.visitors}]} />
                </DashboardCard>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Workspace>
      </WorkspaceRail>
      <AddPhase project={project} isOpen={adding} onOpenChange={setAdding} />
    </Grid>
  );
}
