// The Map's pure helpers: no map engine and no DOM, so any engine (MapLibre today, ArcGIS on the platform) shares
// them and the unit tests run them in Node (tests/map.test.mjs). Bounds and the first view, Web Mercator pixels and
// clusters, arrow keys between pins, the credits line, and where the open pin's card goes.

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

type Key = string | number;

/** The box around the points, south-west then north-east, or null for none. */
export function boundsOf(points: readonly LatLng[]): [LatLng, LatLng] | null {
  if (!points.length) return null;
  let south = Infinity, west = Infinity, north = -Infinity, east = -Infinity;
  for (const {lat, lng} of points) {
    south = Math.min(south, lat);
    north = Math.max(north, lat);
    west = Math.min(west, lng);
    east = Math.max(east, lng);
  }
  return [{lat: south, lng: west}, {lat: north, lng: east}];
}

/** Where a map opens: on its centre (at `zoom`, else 13: a town), else around its items, else on the world. */
export type InitialView = {center: LatLng; zoom: number} | {bounds: [LatLng, LatLng]};

export function initialView(items: readonly LatLng[], center?: LatLng, zoom?: number): InitialView {
  if (center) return {center, zoom: zoom ?? 13};
  if (items.length === 1) return {center: {lat: items[0].lat, lng: items[0].lng}, zoom: zoom ?? 15};
  const bounds = boundsOf(items);
  return bounds ? {bounds} : {center: {lat: 20, lng: 0}, zoom: zoom ?? 1};
}

const MAX_LAT = 85.0511287798;

/** A point's place on the Web Mercator world at `zoom`, in pixels of 512-pixel tiles (MapLibre's size). */
export function worldPoint({lat, lng}: LatLng, zoom: number): ScreenPoint {
  const size = 512 * 2 ** zoom;
  const sin = Math.sin((Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)) * Math.PI) / 180);
  return {x: ((lng + 180) / 360) * size, y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size};
}

export interface Cluster<K extends Key = Key> {
  /** Stable while the zoom level and the members stay. */
  key: string;
  lat: number;
  lng: number;
  keys: K[];
}

/**
 * Folds points that share a `cell`-pixel square of the Mercator world at `zoom` (rounded) into clusters, so panning
 * never regroups them and zooming in splits them. Points in `keep` (the selected and hovered pins) always stand alone.
 */
export function clusterPoints<T extends LatLng & {id: K}, K extends Key>(
  items: readonly T[], zoom: number, cell: number, keep: ReadonlySet<K> = new Set()
): {singles: T[]; clusters: Cluster<K>[]} {
  const level = Math.round(zoom);
  const cells: Record<string, T[]> = {};
  const singles: T[] = [];
  for (const item of items) {
    if (keep.has(item.id)) {
      singles.push(item);
      continue;
    }
    const p = worldPoint(item, level);
    const id = `${Math.floor(p.x / cell)}:${Math.floor(p.y / cell)}`;
    (cells[id] ??= []).push(item);
  }
  const clusters: Cluster<K>[] = [];
  for (const [id, members] of Object.entries(cells)) {
    if (members.length === 1) {
      singles.push(members[0]);
      continue;
    }
    clusters.push({
      key: `cluster:${level}:${id}`,
      lat: members.reduce((sum, m) => sum + m.lat, 0) / members.length,
      lng: members.reduce((sum, m) => sum + m.lng, 0) / members.length,
      keys: members.map(m => m.id)
    });
  }
  return {singles, clusters};
}

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * The pin an arrow key moves to from `from`: the nearest one within 45° of that direction (every pin lies within 45°
 * of one of the four), a pin off to the side counting double its offset, so the one straight ahead wins over a nearer
 * one beside it; null at the edge. Screen directions: a map is not mirrored right to left, so neither are its arrows.
 */
export function nextInDirection<K>(points: readonly {key: K; x: number; y: number}[], from: K, direction: Direction): K | null {
  const origin = points.find(p => p.key === from);
  if (!origin) return null;
  let best: K | null = null;
  let bestScore = Infinity;
  for (const p of points) {
    if (p.key === from) continue;
    const dx = p.x - origin.x;
    const dy = p.y - origin.y;
    const along = direction === 'right' ? dx : direction === 'left' ? -dx : direction === 'down' ? dy : -dy;
    const across = Math.abs(direction === 'left' || direction === 'right' ? dy : dx);
    if (along <= 0 || across > along) continue;
    const score = along + 2 * across;
    if (score < bestScore) {
      bestScore = score;
      best = p.key;
    }
  }
  return best;
}

export interface Credit {
  text: string;
  /** Only http(s) links are kept. */
  href?: string;
}

const ENTITIES: Record<string, string> = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®'};
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) =>
    name[0] === '#'
      ? String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1)))
      : ENTITIES[name.toLowerCase()] ?? whole);
const words = (s: string) => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

/**
 * A map source's credits (its `attribution`, HTML) as words and links, read as text: nothing from it reaches the page
 * as markup.
 */
export function parseCredits(html: string): Credit[] {
  const out: Credit[] = [];
  const push = (text: string, href?: string) => {
    if (!text) return;
    out.push(href && /^https?:\/\//i.test(href) ? {text, href} : {text});
  };
  let rest = html;
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const [whole, href, inner] = m;
    const at = rest.indexOf(whole);
    push(words(rest.slice(0, at)));
    push(words(inner), decode(href));
    rest = rest.slice(at + whole.length);
  }
  push(words(rest));
  return out;
}

/**
 * Where the open pin's card goes: above the pin unless that leaves the map's top edge, then below it; slid sideways
 * (`dx`) to stay `inset` inside the map's sides. `pin` is the pin's centre in the map's pixels.
 */
export function placeCard(
  pin: ScreenPoint, map: {width: number; height: number}, card: {width: number; height: number},
  {gap = 12, inset = 12, pinRadius = 10} = {}
): {placement: 'top' | 'bottom'; dx: number} {
  const placement = pin.y - pinRadius - gap - card.height >= inset ? 'top' : 'bottom';
  const left = pin.x - card.width / 2;
  const min = inset;
  const max = Math.max(inset, map.width - inset - card.width);
  return {placement, dx: Math.min(max, Math.max(min, left)) - left};
}
