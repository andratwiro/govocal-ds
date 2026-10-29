import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, FolderKanban, Inbox, LayoutDashboard, LifeBuoy, Settings, Users} from 'lucide-react';
import {SideNav, SideNavGroup, SideNavHome, SideNavLink, SideNavButton} from './SideNav';
import {Avatar} from '../components/gv/Avatar';
import {MenuTrigger, Menu, MenuItem} from '../components/Menu';

const meta: Meta<typeof SideNav> = {
  title: 'Patterns/Side nav',
  component: SideNav,
  tags: ['autodocs'],
  parameters: {layout: 'fullscreen'},
  decorators: [Story => <div style={{display: 'flex', height: 640}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof SideNav>;

const Items = () => (
  <>
    <SideNavHome href="#" />
    <SideNavGroup>
      <SideNavLink href="#" label="Dashboard" icon={<LayoutDashboard aria-hidden size={18} />} />
      <SideNavLink href="#" label="Projects" icon={<FolderKanban aria-hidden size={18} />} isCurrent />
      <SideNavLink href="#" label="Input manager" icon={<Inbox aria-hidden size={18} />} count={46} countLabel="46 inputs need feedback" />
      <SideNavLink href="#" label="Users" icon={<Users aria-hidden size={18} />} />
    </SideNavGroup>
    <SideNavGroup push>
      <SideNavLink href="#" label="Settings" icon={<Settings aria-hidden size={18} />} />
      <SideNavButton label="Notifications" icon={<Bell aria-hidden size={18} />} count={28} countLabel="28 unread" />
      <MenuTrigger>
        <SideNavButton label="Sam Rivera" sub="Administrator" chevron icon={<Avatar initials="SR" size={24} />} />
        <Menu aria-label="Account"><MenuItem>My profile</MenuItem><MenuItem>Sign out</MenuItem></Menu>
      </MenuTrigger>
      <SideNavButton label="Support" chevron accent icon={<LifeBuoy aria-hidden size={18} />} />
    </SideNavGroup>
  </>
);

/** 224px wide: labels, the red counts, the account row's role, chevrons on the rows that open menus. */
export const Open: Story = {render: () => <div style={{width: 224}}><SideNav aria-label="Main"><Items /></SideNav></div>};

/** The 52px icon rail inside a project: names stay accessible and show as tooltips; counts sit on the icons. */
export const Folded: Story = {render: () => <div style={{width: 52}}><SideNav aria-label="Main" folded><Items /></SideNav></div>};
