// Input manager: what the shared INPUTS lack for the first clicks (invented data only).
import {INPUTS} from './data';
import type {PostedUpdate, ThreadComment} from 'govocal-ds';

export const TOPICS = ['Mobility', 'Nature and green spaces', 'Public space', 'Services'] as const;

// Each input's topic, by title, so the Topics tab can filter.
const TOPIC_OF: Record<string, typeof TOPICS[number]> = {
  'More trees on Elm Lane': 'Nature and green spaces', 'Bike lane by the school': 'Mobility',
  'Benches in Park Row': 'Public space', 'Night buses on weekends': 'Mobility',
  'A water fountain at the station': 'Public space', 'Wider pavements on Mill Road': 'Mobility',
  'Shade over the market stalls': 'Public space', 'Quiet hours in the library': 'Services',
  'A crossing near the clinic': 'Mobility', 'Compost bins per block': 'Nature and green spaces',
  'Murals on the underpass': 'Public space', 'Longer green light for walkers': 'Mobility'
};

export type ManagedInput = typeof INPUTS[number] & {
  /** The input's tags (the real admin's topics), the first one from its title. */
  tags: string[];
  body: string;
  /** The team's official updates, newest first. */
  updates: PostedUpdate[];
  /** Residents' comments, oldest first: as many as the row's Comments count. */
  thread: ThreadComment[];
  /** The team's internal conversation about the input. */
  internal: ThreadComment[];
};

// Invented residents' comments, taken in turn; the last `newComments` of each input are new to the team.
const SAID = [
  'I walk here every day, this would really help.', 'Could this be tried for a month first?',
  'Good idea, but please think of the people living right next to it.', 'Our street has the same problem.',
  'Happy to help organise this with the neighbours.', 'Who would look after it once it is done?'
];
const WHO = ['Resident D', 'Resident E', 'Resident F', 'Resident G'];
const WHEN = ['3 weeks ago', '2 weeks ago', '9 days ago', '6 days ago', '4 days ago', '2 days ago', 'Yesterday', 'Today'];

const threadOf = (i: typeof INPUTS[number]): ThreadComment[] => Array.from({length: i.comments}, (_, n) => ({
  id: `${i.id}-c${n + 1}`, author: WHO[(n + Number(i.id.slice(1))) % WHO.length], text: SAID[n % SAID.length],
  time: WHEN[Math.min(WHEN.length - 1, WHEN.length - i.comments + n)], isNew: n >= i.comments - i.newComments
}));

export const MANAGED_INPUTS: ManagedInput[] = INPUTS.map(i => ({
  ...i, tags: [TOPIC_OF[i.title] ?? 'Public space'],
  body: `${i.title}: it would make the area easier and safer to use every day. Several neighbours agree and would ` +
    'help to get it started.',
  updates: i.needsFeedback ? [] : [{id: `${i.id}-u1`, date: '20 October 2026',
    text: 'Thank you for this input. The project team is looking into it and will post an update here.'}],
  thread: threadOf(i),
  internal: i.assignee === 'Unassigned' ? [] : [{id: `${i.id}-n1`, author: i.assignee, initials: `M${i.assignee.slice(-1)}`,
    time: 'Yesterday', text: 'I will check this with the area team before we answer.'}]
}));

export const PAGE_SIZE = 10;
