import {useState} from 'react';
import {Outlet, useLocation, useMatch} from 'react-router';
import {Bell, BookOpen, Languages, LogOut, MessageSquare, FileChartColumn, Flag, Inbox, LifeBuoy, ScrollText, User, UserCheck, Users, Building2} from 'lucide-react';
import {Avatar, Menu, MenuItem, MenuTrigger, NotificationList, SideNav, SideNavButton, SideNavGroup, SideNavHome,
  SideNavLink, SubmenuTrigger} from 'govocal-ds';
import {Dialog, DialogTrigger, Popover} from 'govocal-ds/base';
import {NAV} from './nav';
import {ME, INPUTS_NEEDING_FEEDBACK, UNREAD_NOTIFICATIONS, NOTIFICATIONS, LOCALES, SUPPORT_LINKS, type SidebarNotification} from './data-sidebar';

const KIND_ICON: Record<SidebarNotification['kind'], typeof Bell> = {
  comment: MessageSquare, inputs: Inbox, report: FileChartColumn, phase: Flag, assigned: UserCheck, review: ScrollText};
const SUPPORT_ICON = {kb: BookOpen, changelog: ScrollText, community: Users, portal: Building2};
// The bottom group starts at Tools, as in the real admin.
const BOTTOM_FROM = NAV.findIndex(n => n.id === 'tools');

export function Layout() {
  // Inside a project or a phase the main nav folds to its icons (labels stay as the controls' names, and show as
  // tooltips), as in the prototype, so the project screens get the width the Figma frames give them.
  const inPhase = useMatch('/projects/:projectId/phases/:phaseId/:tab');
  const inProject = useMatch('/projects/:projectId');
  // The report view's three columns get the same width.
  const inReport = useMatch('/reporting/report-builder/:reportId/editor');
  const folded = !!(inPhase || inProject || inReport);
  const {pathname} = useLocation();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [unread, setUnread] = useState(UNREAD_NOTIFICATIONS);
  const [locale, setLocale] = useState('en');
  const current = LOCALES.find(l => l.id === locale)!.label;

  const link = ({id, label, icon: Icon}: (typeof NAV)[number]) => (
    <SideNavLink key={id} href={`#/${id}`} label={label} icon={<Icon aria-hidden size={18} />}
      isCurrent={pathname === `/${id}` || pathname.startsWith(`/${id}/`)}
      {...(id === 'inputs' ? {count: INPUTS_NEEDING_FEEDBACK, countLabel: `${INPUTS_NEEDING_FEEDBACK} inputs need feedback`} : {})} />
  );

  return (
    <div className={folded ? 'bo-app bo-phase-shell' : 'bo-app'}>
      <SideNav aria-label="Main" isFolded={folded}>
        <SideNavHome href="#/platform" />
        <SideNavGroup>{NAV.slice(0, BOTTOM_FROM).map(link)}</SideNavGroup>
        <SideNavGroup isAtBottom>
          {NAV.slice(BOTTOM_FROM).map(link)}
          <DialogTrigger>
            <SideNavButton label="Notifications" icon={<Bell aria-hidden size={18} />}
              count={unread || undefined} countLabel={`${unread} unread`} />
            <Popover placement="end bottom" showArrow={false}>
              <Dialog aria-label="Notifications">
                <NotificationList
                  items={notifications.map(n => {
                    const Icon = KIND_ICON[n.kind];
                    return {...n, icon: <Icon aria-hidden size={16} />};
                  })}
                  onMarkAllRead={() => { setNotifications(ns => ns.map(n => ({...n, isUnread: false}))); setUnread(0); }} />
              </Dialog>
            </Popover>
          </DialogTrigger>
          <MenuTrigger>
            <SideNavButton label={ME.name} sub={ME.role} hasMenu icon={<Avatar initials={ME.initials} size={24} />} />
            <Menu aria-label="Account">
              <SubmenuTrigger>
                <MenuItem textValue="Language" icon={<Languages aria-hidden size={16} />}>
                  Language: {current}
                </MenuItem>
                <Menu aria-label="Language" selectionMode="single" selectedKeys={[locale]}
                  onSelectionChange={keys => keys !== 'all' && keys.size && setLocale(String([...keys][0]))}>
                  {LOCALES.map(l => <MenuItem key={l.id} id={l.id}>{l.label}</MenuItem>)}
                </Menu>
              </SubmenuTrigger>
              <MenuItem href="#/platform?profile" textValue="My profile" icon={<User aria-hidden size={16} />}>My profile</MenuItem>
              <MenuItem href="#/platform?signed-out" textValue="Sign out" icon={<LogOut aria-hidden size={16} />}>Sign out</MenuItem>
            </Menu>
          </MenuTrigger>
          <MenuTrigger>
            <SideNavButton label="Support" hasMenu hasAccentIcon icon={<LifeBuoy aria-hidden size={18} />} />
            <Menu aria-label="Support">
              {SUPPORT_LINKS.map(s => {
                const Icon = SUPPORT_ICON[s.id];
                const external = s.href.startsWith('http');
                return (
                  <MenuItem key={s.id} href={s.href} textValue={s.label} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
                    icon={<Icon aria-hidden size={16} />}>
                    {s.label}
                  </MenuItem>
                );
              })}
            </Menu>
          </MenuTrigger>
        </SideNavGroup>
      </SideNav>
      <main className="bo-main"><Outlet /></main>
    </div>
  );
}
