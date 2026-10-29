import type {ChartColor} from '../../src/components/gv/Chart';

// Invented figures for the Dashboard page only. The headline numbers live in data.ts (DASHBOARD).

/** One label per value of the DASHBOARD series: the last eight months. */
export const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const PER_TAG = [
  {tag: 'Green spaces', inputs: 128},
  {tag: 'Mobility', inputs: 97},
  {tag: 'Safety', inputs: 74},
  {tag: 'Housing', inputs: 41},
  {tag: 'Culture', inputs: 22}
];

/** Input status breakdown, as the prototype's Status breakdown card (bar colour per status). */
export const STATUS_BREAKDOWN: {label: string; count: number; color: ChartColor}[] = [
  {label: 'Proposed', count: 71, color: 'blue-2'},
  {label: 'Viewed', count: 118, color: 'blue-3'},
  {label: 'Under consideration', count: 59, color: 'blue-1'},
  {label: 'Accepted', count: 71, color: 'agree'},
  {label: 'Rejected', count: 59, color: 'disagree'},
  {label: 'Implemented', count: 14, color: 'green'}
];

export const EMAILS = {
  automated: {total: 12, series: [0, 1, 1, 2, 1, 2, 2, 3]},
  custom: {total: 24, series: [1, 2, 2, 3, 3, 4, 4, 5]}
};

export const INVITATIONS = {sent: 58, pending: 14, accepted: 44};
export const EVENTS = {added: 14, upcoming: 3, completed: 11};

export const ADOPTION = {
  admins: {total: 4, active30: 3, series: [2, 2, 3, 3, 2, 3, 3, 3]},
  managers: {total: 5, active30: 3, series: [1, 2, 2, 3, 3, 2, 4, 3]}
};
