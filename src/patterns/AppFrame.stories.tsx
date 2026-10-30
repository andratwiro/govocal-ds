import type {Meta, StoryObj} from '@storybook/react-vite';
import {FolderKanban, Inbox, LayoutDashboard, Settings, Users} from 'lucide-react';
import {AppFrame, AppFramePanel} from './AppFrame';
import {SideNav, SideNavGroup, SideNavHome, SideNavLink} from './SideNav';
import {PageHeader} from '../components/gv/PageHeader';
import {Panel} from '../components/gv/Panel';
import {Stack} from '../components/gv/Stack';
import {Grid} from '../components/gv/Grid';
import {Text} from '../components/gv/Text';
import {Button} from '../components/Button';

const meta: Meta<typeof AppFrame> = {
  title: 'Patterns/App shell/App frame',
  component: AppFrame,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  parameters: {layout: 'fullscreen'}
};
export default meta;
type Story = StoryObj<typeof AppFrame>;

const nav = (isFolded?: boolean) => (
  <SideNav aria-label="Main" isFolded={isFolded}>
    <SideNavHome href="#" />
    <SideNavGroup>
      <SideNavLink href="#" label="Dashboard" icon={<LayoutDashboard aria-hidden size={18} />} />
      <SideNavLink href="#" label="Projects" icon={<FolderKanban aria-hidden size={18} />} isCurrent />
      <SideNavLink href="#" label="Input manager" icon={<Inbox aria-hidden size={18} />} />
      <SideNavLink href="#" label="Users" icon={<Users aria-hidden size={18} />} />
    </SideNavGroup>
    <SideNavGroup isAtBottom>
      <SideNavLink href="#" label="Settings" icon={<Settings aria-hidden size={18} />} />
    </SideNavGroup>
  </SideNav>
);

/** A list page: the page's bar (a Page header in an App frame panel), then its Panel, 8 apart on the grey ground. */
export const Default: Story = {
  render: () => (
    <AppFrame nav={nav()}>
      <Stack gap="8">
        <AppFramePanel paddingInline="16" paddingBlock="12">
          <PageHeader title="Projects" actions={<Button size={32}>New project</Button>} />
        </AppFramePanel>
        <Panel title="All projects" description="Open a project to set it up.">
          <Text elementType="p" kind="ui">The projects' table goes here.</Text>
        </Panel>
      </Stack>
    </AppFrame>
  )
};

/** Inside a project: the folded rail, and the page's columns as App frame panels. */
export const FoldedNav: Story = {
  name: 'Folded nav',
  render: () => (
    <AppFrame nav={nav(true)} isNavFolded>
      <Grid columns="300px minmax(0, 1fr)" gap="8">
        <AppFramePanel elementType="aside" aria-label="Participation" padding="16">
          <Text elementType="p" kind="ui" isStrong color="primary">Participation</Text>
        </AppFramePanel>
        <AppFramePanel elementType="section" aria-label="Preview" padding="16">
          <Text elementType="p" kind="ui">What residents see.</Text>
        </AppFramePanel>
      </Grid>
    </AppFrame>
  )
};
