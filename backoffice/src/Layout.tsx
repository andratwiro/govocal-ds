import {useEffect, useState} from 'react';
import {Outlet, useLocation, useMatch, useOutletContext} from 'react-router';
import {Bell, BookOpen, Languages, LogOut, MessageSquare, FileChartColumn, Flag, Inbox, LifeBuoy, ScrollText, User, UserCheck, Users, Building2} from 'lucide-react';
import {AppFrame, Avatar, Button, Menu, MenuItem, MenuTrigger, NotificationList, Separator, SideNav, SideNavButton, SideNavGroup,
  SideNavHome, SideNavLink, Stack, SubmenuTrigger} from 'govocal-ds';
import {Dialog, DialogTrigger, Popover} from 'govocal-ds/base';
import {NAV} from './nav';
import {MY_INPUTS_AWAITING_FEEDBACK} from './data';
import {ME, UNREAD_NOTIFICATIONS, NOTIFICATIONS, OLDER_NOTIFICATIONS, LOCALES, SUPPORT_LINKS, type SidebarNotification} from './data-sidebar';

const KIND_ICON: Record<SidebarNotification['kind'], typeof Bell> = {
  comment: MessageSquare, inputs: Inbox, report: FileChartColumn, phase: Flag, assigned: UserCheck, review: ScrollText};
const SUPPORT_ICON = {kb: BookOpen, changelog: ScrollText, community: Users, portal: Building2};
// The bottom group starts at Tools, as in the real admin.
const BOTTOM_FROM = NAV.findIndex(n => n.id === 'tools');

/** What a page can ask of the frame: the project screens' header toggle opens the hidden Side nav over the page. */
export interface LayoutContext {
  openNav: () => void;
}
/** The Side nav's opener, for a page whose header carries the panel toggle (the project screens). */
export const useOpenNav = () => useOutletContext<LayoutContext>().openNav;

export function Layout() {
  // Inside a project or a phase the main nav is hidden (Side nav's "Hidden" story), as in the prototype, so the project
  // screens get the whole width; the Project header's panel toggle opens it over the page.
  const inPhase = useMatch('/projects/:projectId/phases/:phaseId/:tab');
  const inProject = useMatch('/projects/:projectId');
  const hidden = !!(inPhase || inProject);
  // The report view's three columns get the width of the folded rail (icons, labels as tooltips).
  const folded = !!useMatch('/reporting/report-builder/:reportId/editor');
  const [navOpen, setNavOpen] = useState(false);
  const {pathname} = useLocation();
  // Following a link in the opened nav closes it.
  useEffect(() => setNavOpen(false), [pathname]);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [unread, setUnread] = useState(UNREAD_NOTIFICATIONS);
  const [bellOpen, setBellOpen] = useState(false);
  const olderShown = notifications.length > NOTIFICATIONS.length;
  // A notification is a link: following one closes the list, as leaving any popover does.
  useEffect(() => setBellOpen(false), [pathname]);
  const [locale, setLocale] = useState('en');
  const current = LOCALES.find(l => l.id === locale)!.label;

  const link = ({id, label, icon: Icon}: (typeof NAV)[number]) => (
    <SideNavLink key={id} href={`#/${id}`} label={label} icon={<Icon aria-hidden size={18} />}
      isCurrent={pathname === `/${id}` || pathname.startsWith(`/${id}/`)}
      {...(id === 'inputs' ? {count: MY_INPUTS_AWAITING_FEEDBACK, countLabel: `${MY_INPUTS_AWAITING_FEEDBACK} of your inputs need feedback`} : {})} />
  );

  return (
    <AppFrame isNavFolded={folded} isNavHidden={hidden} nav={
        <SideNav aria-label="Main" isFolded={folded} isHidden={hidden} isOpen={navOpen} onOpenChange={setNavOpen}>
          <SideNavHome href="#/platform" />
          <SideNavGroup>{NAV.slice(0, BOTTOM_FROM).map(link)}</SideNavGroup>
          <SideNavGroup isAtBottom>
            {NAV.slice(BOTTOM_FROM).map(link)}
            <DialogTrigger isOpen={bellOpen} onOpenChange={setBellOpen}>
              <SideNavButton label="Notifications" icon={<Bell aria-hidden size={18} />}
                count={unread || undefined} countLabel={`${unread} unread`} />
              <Popover placement="end bottom" showArrow={false}>
                <Dialog aria-label="Notifications">
                  <Stack gap="4">
                    <NotificationList
                      items={notifications.map(n => {
                        const Icon = KIND_ICON[n.kind];
                        return {...n, icon: <Icon aria-hidden size={16} />};
                      })}
                      onMarkAllRead={() => { setNotifications(ns => ns.map(n => ({...n, isUnread: false}))); setUnread(0); }} />
                    {/* The real admin's "Load more": the older, read ones under the newest. */}
                    {!olderShown && (
                      <Button variant="quiet" size={32} onPress={() => setNotifications(ns => [...ns, ...OLDER_NOTIFICATIONS])}>
                        Show older notifications
                      </Button>
                    )}
                  </Stack>
                </Dialog>
              </Popover>
            </DialogTrigger>
            <MenuTrigger>
              <SideNavButton label={ME.name} sub={ME.role} hasMenu icon={<Avatar initials={ME.initials} size={24} />} />
              <Menu aria-label="Account">
                {/* Menu's "With a submenu checklist": the row names the setting, its line says the current choice. */}
                <SubmenuTrigger>
                  <MenuItem id="language" textValue="Language" description={current} icon={<Languages aria-hidden size={16} />}>
                    Language
                  </MenuItem>
                  <Menu aria-label="Language" selectionMode="single" selectedKeys={[locale]}
                    onSelectionChange={keys => keys !== 'all' && keys.size && setLocale(String([...keys][0]))}>
                    {LOCALES.map(l => <MenuItem key={l.id} id={l.id}>{l.label}</MenuItem>)}
                  </Menu>
                </SubmenuTrigger>
                <MenuItem id="profile" href="#/platform?profile" icon={<User aria-hidden size={16} />}>My profile</MenuItem>
                <Separator />
                <MenuItem id="sign-out" href="#/platform?signed-out" icon={<LogOut aria-hidden size={16} />}>Sign out</MenuItem>
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
      }>
      <Outlet context={{openNav: () => setNavOpen(true)} satisfies LayoutContext} />
    </AppFrame>
  );
}
