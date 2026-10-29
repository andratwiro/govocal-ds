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

const DAY = 86_400_000;
const FIRST = Date.UTC(2021, 0, 4);
const SPAN = (Date.UTC(2025, 2, 27) - FIRST) / DAY;

/** About 5,000 invented residents after the twelve, so the list runs as long as a real platform's and the table
 * virtualises. They joined before any of the twelve, so the twelve still lead the list, newest first. The same people
 * every time (a hash of the number, no random). */
export function inventPeople(count: number, from = PEOPLE.length + 1): Person[] {
  return Array.from({length: count}, (_, i) => {
    const n = from + i;
    const seed = Math.imul(n, 2654435761) >>> 0;
    const joined = new Date(FIRST + (seed % SPAN) * DAY).toISOString().slice(0, 10);
    // One in five never came back after joining; the others were last seen up to a year ago.
    const lastActive = seed % 5 === 0 ? undefined : (seed >>> 8) % (365 * 1440);
    return P(n, `Resident ${n}`, 'Registered user', joined, lastActive);
  });
}

/** The twelve, then the invented tail: the Users page's list. */
export const ALL_PEOPLE: Person[] = [...PEOPLE, ...inventPeople(5000)];

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

/** What each person did on the platform, for their profile (invented). */
export const PARTICIPATION: Record<string, {ideas: number; comments: number; votes: number; projects: number}> = {
  u1: {ideas: 0, comments: 14, votes: 2, projects: 6}, u2: {ideas: 1, comments: 9, votes: 0, projects: 4},
  u3: {ideas: 2, comments: 21, votes: 5, projects: 3}, u4: {ideas: 0, comments: 6, votes: 1, projects: 2},
  u7: {ideas: 3, comments: 4, votes: 12, projects: 2}, u8: {ideas: 1, comments: 2, votes: 7, projects: 1},
  u9: {ideas: 4, comments: 11, votes: 18, projects: 3}, u11: {ideas: 0, comments: 1, votes: 3, projects: 1},
  u12: {ideas: 2, comments: 0, votes: 9, projects: 2}
};

export type Invitation = {id: string; email: string; invited: string; status: 'Pending' | 'Accepted'; role: Role};
export const INVITATIONS: Invitation[] = [
  {id: 'i1', email: 'invitee1@example.org', invited: 'October 20, 2026', status: 'Accepted', role: 'Registered user'},
  {id: 'i2', email: 'invitee2@example.org', invited: 'October 20, 2026', status: 'Pending', role: 'Registered user'},
  {id: 'i3', email: 'invitee3@example.org', invited: 'September 2, 2026', status: 'Accepted', role: 'Project manager'}
];

/** Seats in the plan: admins and managers each have their own count. */
export const SEATS = {admins: 5, managers: 10};

/** Smart group rules (the real admin's rule picker, shortened). */
export const SMART_RULES = ['Email domain is', 'Is verified', 'Lives in area', 'Took part in project', 'Registered after'];

/** Seats taken a month ago, for the Seats overview's trend. */
export const SEATS_A_MONTH_AGO = {admins: 1, managers: 2};
