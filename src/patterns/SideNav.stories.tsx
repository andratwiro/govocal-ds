import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {Bell, FolderKanban, Inbox, LayoutDashboard, LifeBuoy, Settings, Users} from 'lucide-react';
import {SideNav, SideNavGroup, SideNavHome, SideNavLink, SideNavButton} from './SideNav';
import {Avatar} from '../components/gv/Avatar';
import {MenuTrigger, Menu, MenuItem} from '../components/Menu';

const meta: Meta<typeof SideNav> = {
  title: 'Patterns/App shell/Side nav',
  component: SideNav,
  tags: ['autodocs', 'not-in-figma'],
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
    <SideNavGroup isAtBottom>
      <SideNavLink href="#" label="Settings" icon={<Settings aria-hidden size={18} />} />
      <SideNavButton label="Notifications" icon={<Bell aria-hidden size={18} />} count={28} countLabel="28 unread" />
      <MenuTrigger>
        <SideNavButton label="Sam Rivera" sub="Administrator" hasMenu icon={<Avatar initials="SR" size={24} />} />
        <Menu aria-label="Account"><MenuItem>My profile</MenuItem><MenuItem>Sign out</MenuItem></Menu>
      </MenuTrigger>
      <SideNavButton label="Support" hasMenu hasAccentIcon icon={<LifeBuoy aria-hidden size={18} />} />
    </SideNavGroup>
  </>
);

/** 224px wide: labels, the red counts, the account row's role, chevrons on the rows that open menus. */
export const Open: Story = {name: 'Default', render: () => <div style={{width: 224}}><SideNav aria-label="Main"><Items /></SideNav></div>};

/** The 52px icon rail inside a project: names stay accessible and show as tooltips; counts sit on the icons. */
export const Folded: Story = {render: () => <div style={{width: 52}}><SideNav aria-label="Main" isFolded><Items /></SideNav></div>};

/**
 * The keys the rail takes, folded: Tab walks the rows in order and each shows its name as a tooltip; Enter on a row
 * with a menu opens it, Esc closes it and puts focus back on the row. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: () => <div style={{width: 52}}><SideNav aria-label="Main" isFolded><Items /></SideNav></div>,
  play: async ({canvasElement}) => {
    const nav = within(canvasElement).getByRole('navigation', {name: 'Main'});
    await userEvent.tab();
    await expect(within(nav).getByRole('link', {name: 'To platform'})).toHaveFocus();
    await waitFor(() => expect(screen.getByRole('tooltip', {name: 'To platform'})).toBeVisible());
    await userEvent.tab();
    await expect(within(nav).getByRole('link', {name: 'Dashboard'})).toHaveFocus();
    await waitFor(() => expect(screen.getByRole('tooltip', {name: 'Dashboard'})).toBeVisible());
    for (const name of [/^Projects/, /^Input manager/, /^Users/, /^Settings/]) {
      await userEvent.tab();
      await expect(within(nav).getByRole('link', {name})).toHaveFocus();
    }
    await userEvent.tab();
    await expect(within(nav).getByRole('button', {name: /^Notifications/})).toHaveFocus();
    await userEvent.tab();
    const account = within(nav).getByRole('button', {name: /^Sam Rivera/});
    await expect(account).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu', {name: 'Account'});
    await waitFor(() => expect(within(menu).getByRole('menuitem', {name: 'My profile'})).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(account).toHaveFocus());
  }
};
