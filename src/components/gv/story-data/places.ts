// Invented data for the Map stories: 160 ideas in one town, 120 with a place on the map and 40 without. The places are
// scattered at random round a town centre from a fixed seed: nobody's address. Streets and titles are invented too.
import type {MapItem, MapTone} from '../MapView';

export interface MapIdea {
  id: string;
  title: string;
  status: string;
  likes: number;
  comments: number;
  /** Where it is: a point and a few words. Left out: the idea has no location. */
  place?: {lat: number; lng: number; where: string};
}

/** A pin for an idea: the Map's item plus the idea it stands for. */
export type IdeaPin = MapItem & {idea: MapIdea};

/** The town centre the map opens on. */
export const MAP_CENTRE = {lat: 52.0907, lng: 5.1214};

// Ten streets and sixteen titles make 160 different titles, one per idea (a pin is named by its title).
const STREETS = ['Wrenfield Avenue', 'Quillmoor Road', 'Tamsel Park', 'Brindle Street', 'Hollowbrook Square',
  'Orchard Reach', 'the ring road', 'the river walk', 'Fennick Lane', 'Marrow Green'];
const TEMPLATES = [
  'Build a protected cycle lane on {p} instead of the painted line that stops halfway.',
  'Plant a row of trees along {p} so the pavement has shade in summer.',
  'Organise open-air cinema nights on {p} in summer.',
  'Add a raised crossing on {p}: cars come round the corner far too fast.',
  'Turn the car park behind {p} into a small green square with benches.',
  'Add charging points for e-bikes and e-scooters on {p}.',
  'Set up a repair café near {p} where people can fix bikes, clothes and small appliances.',
  'Build rain gardens along {p} so the street stops flooding after every heavy storm.',
  'Give {p} a car-free Sunday once a month so children can play in the street.',
  'Widen the pavement on {p}: with prams, wheelchairs and terraces there is not enough room.',
  'Light the footpath through {p} at night; many people avoid it after dark.',
  'Create a safe school route along {p} with crossing guards in the morning.',
  'Put secure bike parking at the end of {p}.',
  'Add a water fountain on {p} for walkers and runners.',
  'Replace the hedges on {p} with wildflowers for bees.',
  'Hold a yearly neighbourhood festival on {p}.'
];
export const MAP_STATUSES = ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented'];

/** A pin colour per status, for the legend story. */
export const STATUS_TONE: Record<string, MapTone> = {
  Proposed: 'neutral', Viewed: 'neutral', 'Under consideration': 'info', Accepted: 'success', Implemented: 'success',
  Rejected: 'danger'
};
export const STATUS_LEGEND = [
  {label: 'Proposed or viewed', tone: 'neutral' as const},
  {label: 'Under consideration', tone: 'info' as const},
  {label: 'Accepted or implemented', tone: 'success' as const},
  {label: 'Rejected', tone: 'danger' as const}
];

// A small seeded generator (mulberry32): the same town every time.
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = seeded(20261029);

export const MAP_IDEAS: MapIdea[] = Array.from({length: 160}, (_, n) => {
  const street = STREETS[(n * 3 + Math.floor(n / TEMPLATES.length)) % STREETS.length];
  const angle = random() * 2 * Math.PI;
  const r = 0.15 + 0.85 * Math.sqrt(random());
  const isPlaced = n % 4 !== 1;
  return {
    id: `idea-${n + 1}`,
    title: TEMPLATES[n % TEMPLATES.length].replace('{p}', street),
    status: MAP_STATUSES[(n * 5 + Math.floor(n / 7)) % MAP_STATUSES.length],
    likes: (n * 13) % 47,
    comments: (n * 7) % 19,
    place: isPlaced
      ? {lat: MAP_CENTRE.lat + r * 0.0125 * Math.sin(angle), lng: MAP_CENTRE.lng + r * 0.021 * Math.cos(angle),
          where: street[0].toUpperCase() + street.slice(1)}
      : undefined
  };
});

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** The counts on the card and the list's meta line: "2 likes", "0 comments". */
export const ideaCounts = (i: MapIdea) => [plural(i.likes, 'like', 'likes'), plural(i.comments, 'comment', 'comments')];

/** The ideas with a place, as pins. */
export const toPins = (ideas: readonly MapIdea[], tones = false): IdeaPin[] =>
  ideas.flatMap(idea => idea.place
    ? [{id: idea.id, lat: idea.place.lat, lng: idea.place.lng, label: idea.title, status: idea.status, idea,
        ...(tones && {tone: STATUS_TONE[idea.status]})}]
    : []);

export const MAP_PINS = toPins(MAP_IDEAS);

const fromCentre = (p: IdeaPin) => Math.hypot(p.lat - MAP_CENTRE.lat, p.lng - MAP_CENTRE.lng);
/** The pins nearest the centre first: the Hovered story's list. */
export const NEAR_CENTRE = [...MAP_PINS].sort((a, b) => fromCentre(a) - fromCentre(b));
/** The pin nearest the centre: the one the Selected story opens. */
export const CENTRE_PIN = NEAR_CENTRE[0];
