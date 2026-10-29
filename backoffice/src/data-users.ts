// Invented people for the Users page only: no real names, emails on example.org.

export type Role = 'Platform admin' | 'Space manager' | 'Folder manager' | 'Project manager' | 'Registered user';
export type Person = {
  id: string; name: string; email?: string; role: Role;
  /** Minutes since the person was last active; undefined when never seen since joining. */
  lastActive?: number;
  joined: string; // ISO date
};

const P = (n: number, name: string, role: Role, joined: string, lastActive?: number, noEmail?: boolean): Person =>
  ({id: `u${n}`, name, email: noEmail ? undefined : `user${n}@example.org`, role, lastActive, joined});

export const PEOPLE: Person[] = [
  P(1, 'Admin A', 'Platform admin', '2026-10-28', 60),
  P(2, 'Admin B', 'Platform admin', '2025-03-28', 240),
  P(3, 'Manager C', 'Project manager', '2025-06-12', 2 * 1440),
  P(4, 'Manager D', 'Folder manager', '2025-09-02', 9 * 1440),
  P(5, 'Resident E', 'Registered user', '2026-10-28'),
  P(6, 'Resident F', 'Registered user', '2026-10-28', undefined, true),
  P(7, 'Resident G', 'Registered user', '2026-10-21', 3 * 1440),
  P(8, 'Resident H', 'Registered user', '2026-09-30', 21 * 1440),
  P(9, 'Resident I', 'Registered user', '2026-08-14', 40 * 1440),
  P(10, 'Resident J', 'Registered user', '2026-05-03'),
  P(11, 'Resident K', 'Registered user', '2025-12-19', 120 * 1440),
  P(12, 'Resident L', 'Registered user', '2025-03-28', 15)
];

/** The real admin's role lists, in its order, with the role each one keeps. */
export const SEGMENTS: {id: string; label: string; roles?: Role[]}[] = [
  {id: 'all', label: 'Registered users'},
  {id: 'admins', label: 'Admins', roles: ['Platform admin']},
  {id: 'space', label: 'Space managers', roles: ['Space manager']},
  {id: 'folder', label: 'Folder managers', roles: ['Folder manager']},
  {id: 'project', label: 'Project managers', roles: ['Project manager']},
  {id: 'banned', label: 'Banned emails', roles: []},
  {id: 'bounces', label: 'Email bounces', roles: []}
];

/** Smart groups fill themselves from rules; manual groups are hand-picked. */
export const GROUPS: {id: string; label: string; kind: 'smart' | 'manual'; members: string[]}[] = [
  {id: 'verified', label: 'Verified residents', kind: 'smart', members: ['u7', 'u8', 'u9', 'u11', 'u12']},
  {id: 'youth', label: 'Youth panel', kind: 'manual', members: ['u5', 'u8', 'u10']},
  {id: 'newsletter', label: 'Newsletter readers', kind: 'smart', members: ['u6']}
];
