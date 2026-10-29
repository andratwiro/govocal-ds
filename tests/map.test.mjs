import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {boundsOf, clusterPoints, initialView, nextInDirection, parseCredits, placeCard, worldPoint} from '../src/components/gv/map/geo.ts';
import {Map, MapCard, MapChip, MapLegend, MapOverlay, MapPin} from '../src/components/gv/Map.tsx';

const at = (id, lat, lng) => ({id, lat, lng});

describe('Map helpers: bounds and the first view', () => {
  it('boxes the points south-west to north-east, or gives null for none', () => {
    expect(boundsOf([at(1, 52.1, 5.1), at(2, 52.0, 5.2), at(3, 52.05, 5.0)])).toEqual([{lat: 52.0, lng: 5.0}, {lat: 52.1, lng: 5.2}]);
    expect(boundsOf([])).toBeNull();
  });
  it('a centre wins; without one the map fits its items; one item is a street view; none is the world', () => {
    expect(initialView([at(1, 1, 1)], {lat: 52, lng: 5}, undefined)).toEqual({center: {lat: 52, lng: 5}, zoom: 13});
    expect(initialView([at(1, 1, 1)], {lat: 52, lng: 5}, 9)).toEqual({center: {lat: 52, lng: 5}, zoom: 9});
    expect(initialView([at(1, 52.1, 5.1), at(2, 52.0, 5.2)])).toEqual({bounds: [{lat: 52.0, lng: 5.1}, {lat: 52.1, lng: 5.2}]});
    expect(initialView([at(1, 52.1, 5.1)])).toEqual({center: {lat: 52.1, lng: 5.1}, zoom: 15});
    expect(initialView([])).toEqual({center: {lat: 20, lng: 0}, zoom: 1});
  });
});

describe('Map helpers: Web Mercator pixels and clusters', () => {
  it('puts lat 0, lng 0 in the middle of the world and doubles with each zoom', () => {
    expect(worldPoint({lat: 0, lng: 0}, 0)).toEqual({x: 256, y: 256});
    expect(worldPoint({lat: 0, lng: 0}, 1)).toEqual({x: 512, y: 512});
    const north = worldPoint({lat: 60, lng: 90}, 0);
    expect(north.x).toBe(384);
    expect(north.y).toBeLessThan(256);
  });
  it('groups points that share a cell, keeps a lone point alone, and never folds a kept one in', () => {
    const items = [at('a', 52.0900, 5.1200), at('b', 52.0901, 5.1201), at('c', 52.0902, 5.1199), at('far', 52.2, 5.4)];
    const {singles, clusters} = clusterPoints(items, 12, 48);
    expect(singles.map(i => i.id)).toEqual(['far']);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].keys.sort()).toEqual(['a', 'b', 'c']);
    expect(clusters[0].lat).toBeCloseTo(52.0901, 4);
    const kept = clusterPoints(items, 12, 48, new Set(['b']));
    expect(kept.singles.map(i => i.id).sort()).toEqual(['b', 'far']);
    expect(kept.clusters[0].keys.sort()).toEqual(['a', 'c']);
  });
  it('splits the cluster apart as the map zooms in', () => {
    const items = [at('a', 52.090, 5.120), at('b', 52.091, 5.121)];
    expect(clusterPoints(items, 10, 48).clusters).toHaveLength(1);
    expect(clusterPoints(items, 18, 48).clusters).toHaveLength(0);
  });
});

describe('Map helpers: arrow keys between pins', () => {
  const pins = [{key: 'o', x: 100, y: 100}, {key: 'right', x: 160, y: 104}, {key: 'far-right', x: 300, y: 100},
    {key: 'up', x: 96, y: 40}, {key: 'down-right', x: 150, y: 190}];
  it('goes to the nearest pin in the arrow\'s direction', () => {
    expect(nextInDirection(pins, 'o', 'right')).toBe('right');
    expect(nextInDirection(pins, 'o', 'up')).toBe('up');
    expect(nextInDirection(pins, 'o', 'down')).toBe('down-right');
  });
  it('stays put at the edge (null) and from an unknown pin', () => {
    expect(nextInDirection(pins, 'o', 'left')).toBeNull();
    expect(nextInDirection(pins, 'gone', 'right')).toBeNull();
  });
  it('prefers a pin straight ahead over one nearer but off to the side', () => {
    const row = [{key: 'o', x: 0, y: 0}, {key: 'ahead', x: 120, y: 0}, {key: 'aside', x: 40, y: 90}];
    expect(nextInDirection(row, 'o', 'right')).toBe('ahead');
  });
});

describe('Map helpers: the credits line and the card', () => {
  it('reads a source\'s attribution HTML as words and links, http(s) only, entities decoded', () => {
    const html = '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" ' +
      'target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    expect(parseCredits(html)).toEqual([
      {text: 'OpenFreeMap', href: 'https://openfreemap.org'},
      {text: '© OpenMapTiles', href: 'https://www.openmaptiles.org/'},
      {text: 'Data from'},
      {text: 'OpenStreetMap', href: 'https://www.openstreetmap.org/copyright'}
    ]);
    expect(parseCredits('<a href="javascript:alert(1)">x</a> <b>&amp; y</b>')).toEqual([{text: 'x'}, {text: '& y'}]);
  });
  it('puts the card above the pin, below it near the top edge, and shifts it inside the map', () => {
    const map = {width: 600, height: 400};
    const card = {width: 280, height: 120};
    expect(placeCard({x: 300, y: 300}, map, card)).toEqual({placement: 'top', dx: 0});
    expect(placeCard({x: 300, y: 80}, map, card).placement).toBe('bottom');
    expect(placeCard({x: 40, y: 300}, map, card).dx).toBe(12 - (40 - 140));
    expect(placeCard({x: 590, y: 300}, map, card).dx).toBe(600 - 12 - 280 - (590 - 140));
  });
});

describe('Map: the parts render without an engine', () => {
  it('names each pin by its label, as a button, the selected one expanded', () => {
    const html = renderToStaticMarkup(h(Map, {'aria-label': 'Ideas on the map', items: [
      {id: 'a', lat: 52.09, lng: 5.12, label: 'More benches'}, {id: 'b', lat: 52.08, lng: 5.11, label: 'Trees'}],
    selectedKey: 'a', engine: () => new Promise(() => {})}));
    expect(html).toMatch(/role="region"[^>]*aria-label="Ideas on the map"|aria-label="Ideas on the map"[^>]*role="region"/);
    expect(html).toContain('aria-label="More benches"');
    expect(html).toMatch(/aria-expanded="true"/);
    expect(html).toContain('aria-busy="true"');
  });
  it('draws the card, chip, legend, overlay and a static pin from tokens alone', () => {
    const html = renderToStaticMarkup(h('div', null,
      h(MapCard, {title: 'Widen the pavement', status: 'Accepted', details: ['2 likes', '0 comments'], location: 'The ring road'}),
      h(MapChip, null, '40 ideas without a location'),
      h(MapLegend, {items: [{label: 'Accepted', tone: 'success'}, {label: 'Proposed'}]}),
      h(MapOverlay, {placement: 'bottom-start'}, 'x'),
      h(MapPin, {label: 'A pin', isStatic: true, tone: 'info'})));
    expect(html).toContain('Accepted · 2 likes · 0 comments');
    expect(html).toContain('The ring road');
    expect(html).toContain('data-placement="bottom-start"');
    expect(html).toContain('data-tone="success"');
    expect(html).not.toMatch(/style="[^"]*(color|background)/);
  });
  it('keeps the map engine out of Map.tsx: it is imported only on demand', () => {
    const src = readFileSync('src/components/gv/Map.tsx', 'utf8');
    expect(src).not.toMatch(/from 'maplibre-gl/);
    expect(src).toMatch(/import\('\.\/map\/maplibre'\)/);
  });
});
