// Input manager: what the shared INPUTS lack for the first clicks (invented data only).
import {INPUTS} from './data';

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

export type ManagedInput = typeof INPUTS[number] & {topic: string; body: string; feedback: string[]};

export const MANAGED_INPUTS: ManagedInput[] = INPUTS.map(i => ({
  ...i, topic: TOPIC_OF[i.title] ?? 'Public space', feedback: [],
  body: `${i.title}: it would make the area easier and safer to use every day. Several neighbours agree and would ` +
    'help to get it started.'
}));

export const PAGE_SIZE = 10;
