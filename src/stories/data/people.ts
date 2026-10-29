// Invented people for the long-list stories (Data table, "Virtualized"): numbered residents, project managers and
// admins with example.org addresses. Nobody real; the same list every time.

export type PersonRole = 'Registered user' | 'Project manager' | 'Platform admin';

export interface ListPerson {
  id: string;
  /** "Resident 1042", "Manager 1040", "Admin 1050": a role word and the person's number. */
  name: string;
  /** For the Avatar: the role word's letter and the number's last digit, e.g. "R2". */
  initials: string;
  email: string;
  role: PersonRole;
  /** Ideas posted. */
  ideas: number;
  /** ISO date joined, and the same date as a reader sees it ("12 June 2025"). */
  joined: string;
  joinedLabel: string;
}

const DAY = 86_400_000;
const LAST = Date.UTC(2026, 9, 28);
const LABEL = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});

/**
 * `count` invented people, numbered from `from`: every 50th an admin, every 10th a project manager, the rest
 * residents. A seeded sequence gives each their ideas and joining date (up to four years back), so the list is the same
 * on every load. Five thousand take a few milliseconds: dates are formatted here, once, not in every row's render.
 */
export function inventPeople(count: number, from = 1): ListPerson[] {
  const people: ListPerson[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const n = from + i;
    const role: PersonRole = n % 50 === 0 ? 'Platform admin' : n % 10 === 0 ? 'Project manager' : 'Registered user';
    const word = role === 'Platform admin' ? 'Admin' : role === 'Project manager' ? 'Manager' : 'Resident';
    // A multiplicative hash of n: well spread, and the same every time.
    const seed = Math.imul(n, 2654435761) >>> 0;
    const joined = new Date(LAST - (seed % 1461) * DAY);
    people[i] = {
      id: `person-${n}`,
      name: `${word} ${n}`,
      initials: `${word[0]}${n % 10}`,
      email: `user${n}@example.org`,
      role,
      ideas: (seed >>> 11) % 40,
      joined: joined.toISOString().slice(0, 10),
      joinedLabel: LABEL.format(joined)
    };
  }
  return people;
}

const COLLATOR = new Intl.Collator('en', {numeric: true});

/** The list sorted by one column, as a new array: names by number ("Resident 9" before "Resident 10"). */
export function sortPeople(list: readonly ListPerson[], column: string, direction: 'ascending' | 'descending') {
  const sign = direction === 'descending' ? -1 : 1;
  const by = column === 'ideas'
    ? (a: ListPerson, b: ListPerson) => a.ideas - b.ideas
    : column === 'joined'
      ? (a: ListPerson, b: ListPerson) => (a.joined < b.joined ? -1 : a.joined > b.joined ? 1 : 0)
      : (a: ListPerson, b: ListPerson) => COLLATOR.compare(a[column === 'role' ? 'role' : 'name'], b[column === 'role' ? 'role' : 'name']);
  return [...list].sort((a, b) => sign * by(a, b));
}
