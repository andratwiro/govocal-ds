import {LayoutDashboard, FolderKanban, Inbox, Users, Mail, FileChartColumn, Activity, Globe, LayoutGrid, Network, Settings, type LucideIcon} from 'lucide-react';
export type NavItem = {id: string; label: string; icon: LucideIcon};
export const NAV: NavItem[] = [
  {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {id: 'projects', label: 'Projects', icon: FolderKanban},
  {id: 'inputs', label: 'Inputs', icon: Inbox},
  {id: 'users', label: 'Users', icon: Users},
  {id: 'messaging', label: 'Messaging', icon: Mail},
  {id: 'reporting', label: 'Reporting', icon: FileChartColumn},
  {id: 'community-monitor', label: 'Community monitor', icon: Activity},
  {id: 'inspiration-hub', label: 'Inspiration hub', icon: Globe},
  {id: 'tools', label: 'Tools', icon: LayoutGrid},
  {id: 'pages-menu', label: 'Pages & menu', icon: Network},
  {id: 'settings', label: 'Settings', icon: Settings}
];
