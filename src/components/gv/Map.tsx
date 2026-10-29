'use client';
import {
  useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent, type ReactNode
} from 'react';
import {clsx} from 'clsx';
import {Button} from 'react-aria-components/Button';
import type {Key} from 'react-aria-components';
import {Minus, Plus} from 'lucide-react';
import {IconButton} from './IconButton';
import {clusterPoints, initialView, nextInDirection, parseCredits, placeCard, type Credit, type Direction, type LatLng} from './map/geo';
import type {MapEngine, MapEngineEvent, MapEngineFactory} from './map/engine';
import './Map.css';

export type {LatLng} from './map/geo';
export type {MapEngine, MapEngineEvent, MapEngineFactory, MapEngineOptions} from './map/engine';

/** A pin's colour: a colour intent, from the system's one tone set; a legend says what each means on this map. */
export type MapTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'ai';

/** A place on the map: one pin. */
export interface MapItem {
  /** Names the pin for `selectedKey` and `hoveredKey`. */
  id: Key;
  lat: number;
  lng: number;
  /** The pin's name, read out, and the card's title unless `renderCard` says otherwise. */
  label: string;
  /** The card's status line ("Accepted"). */
  status?: string;
  /** @default 'neutral' */
  tone?: MapTone;
}

/** OpenFreeMap's light vector style: free, no key; its credits come with its tiles. */
export const OPENFREEMAP_POSITRON = 'https://tiles.openfreemap.org/styles/positron';

/**
 * The MapLibre engine with a MapLibre style (`styleUrl`, OpenFreeMap's Positron unless told). maplibre-gl, its worker
 * and its CSS load only when a map first draws. Make it once, outside the page's component: the Map reads its
 * `engine` when it first draws.
 */
export function maplibreEngine({styleUrl = OPENFREEMAP_POSITRON}: {styleUrl?: string} = {}): MapEngineFactory {
  return async options => (await import('./map/maplibre')).createMapLibreEngine(options, styleUrl);
}

const DEFAULT_ENGINE = maplibreEngine();

export interface MapProps<T extends MapItem = MapItem> {
  /** Names the map: what its pins are ("Ideas on the map"). */
  'aria-label': string;
  /** The pins. A page lists the items without a place elsewhere (a `MapChip` says how many). */
  items?: readonly T[];
  /**
   * The centre the map opens on, and moves to whenever it changes. It never holds the map there: people pan and zoom
   * freely, and `onViewChange` says where they stop. Left out, the map opens around its items.
   */
  center?: LatLng;
  /** The zoom to open at (and move to when it changes): 0 is the world, 13 a town, 16 a street. @default 13 */
  zoom?: number;
  /** Where the map rests after each move: the centre and zoom to save (a "Save zoom"). */
  onViewChange?: (view: {center: LatLng; zoom: number}) => void;
  /**
   * The open pin (controlled; null for none): its card shows, its pin is drawn selected, and the map moves to it if it
   * is out of view. A list beside the map passes the same key (Data table's `openKey`).
   */
  selectedKey?: Key | null;
  /** The open pin to start with, uncontrolled. */
  defaultSelectedKey?: Key | null;
  /** A pin pressed (its key), or the card closed: Esc, a press on the map, the same pin again (null). */
  onSelectionChange?: (key: Key | null) => void;
  /** The pin to raise and darken ("hot"): the item a list row beside the map is hovering. */
  hoveredKey?: Key | null;
  /** The pointer moved onto a pin (its key) or off it (null), for the list to mark its row. */
  onHoverChange?: (key: Key | null) => void;
  /**
   * A press on the map itself, not on a pin, with its place: an admin adding an input there. Enter on the focused map
   * presses its centre. A press while a card is open closes the card instead.
   */
  onMapPress?: (point: LatLng) => void;
  /** The open pin's card. @default a `MapCard` with the item's label and status */
  renderCard?: (item: T) => ReactNode;
  /** Folds pins that crowd each other into a count; pressing it zooms in. The open and hot pins stay apart. @default false */
  isClustered?: boolean;
  /** Off: a picture of the map (no moving, no zoom buttons, pins not pressable), e.g. a phone preview. @default true */
  isInteractive?: boolean;
  /** The engine that draws the tiles. @default maplibreEngine() */
  engine?: MapEngineFactory;
  /** Overlays: `MapOverlay`s holding a Banner, a `MapChip`, a `MapLegend`, a button. */
  children?: ReactNode;
  /** Places the map (its height, a grid area, margin); never paints it. The map fills the height it is given. */
  className?: string;
  /** Places the map, like `className`. */
  style?: CSSProperties;
}

// Pins are placed before paint; on the server (no layout) a plain effect, so React stays quiet.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const ARROWS: Record<string, Direction> = {ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'};
const CLUSTER_CELL = 48;
/** How far past the map's edge a pin still draws (its own size), so pins slide out rather than vanish. */
const BLEED = 24;

interface Marker {
  /** `i:<id>` for an item, `cluster:…` for a cluster. */
  key: string;
  lat: number;
  lng: number;
  item?: MapItem;
  count?: number;
}

/**
 * A map with pins: places on map tiles, a card for the open pin, overlays in its corners. Zoom buttons and the
 * tiles' credits come with it; a Banner, a count of items without a place or a legend go in `MapOverlay`s. Pins are
 * buttons named by their label: Tab reaches the map's pins once and the arrow keys move between them (to the nearest
 * one that way), Enter or a click opens a pin's card and Esc closes it. The chrome is the system's (tokens); the tiles
 * come from an engine (MapLibre with OpenFreeMap's tiles) loaded only when a map draws. Not in Figma.
 *
 * ```tsx
 * <Map aria-label="Ideas on the map" items={located} selectedKey={open} onSelectionChange={setOpen} hoveredKey={hot}>
 *   <MapOverlay placement="bottom-start"><MapChip>40 ideas without a location</MapChip></MapOverlay>
 * </Map>
 * ```
 */
export function Map<T extends MapItem = MapItem>({
  'aria-label': label, items = [], center, zoom, onViewChange, selectedKey, defaultSelectedKey = null, onSelectionChange,
  hoveredKey = null, onHoverChange, onMapPress, renderCard, isClustered = false, isInteractive = true, engine: engineProp,
  children, className, style
}: MapProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MapEngine | null>(null);
  const factory = useRef(engineProp ?? DEFAULT_ENGINE).current;
  const markerEls = useRef<Record<string, HTMLDivElement | null>>({});
  const cardId = useId();

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [viewZoom, setViewZoom] = useState(zoom ?? 13);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [ownSelected, setOwnSelected] = useState<Key | null>(defaultSelectedKey);
  const selected = selectedKey !== undefined ? selectedKey : ownSelected;
  const select = useCallback((key: Key | null) => {
    if (selectedKey === undefined) setOwnSelected(key);
    onSelectionChange?.(key);
  }, [selectedKey, onSelectionChange]);
  const [tabStop, setTabStop] = useState<string | null>(null);

  const located = useMemo(() => items.filter(i => Number.isFinite(i.lat) && Number.isFinite(i.lng)), [items]);
  const level = Math.round(viewZoom);
  const markers = useMemo<Marker[]>(() => {
    if (!isClustered) return located.map(item => ({key: `i:${item.id}`, lat: item.lat, lng: item.lng, item}));
    const keep = new Set<Key>([selected, hoveredKey].filter((k): k is Key => k != null));
    const {singles, clusters} = clusterPoints(located, level, CLUSTER_CELL, keep);
    const order = new globalThis.Map(located.map((item, n) => [item.id, n]));
    return [
      ...clusters.map(c => ({key: c.key, lat: c.lat, lng: c.lng, count: c.keys.length})),
      ...singles.sort((a, b) => order.get(a.id)! - order.get(b.id)!).map(item => ({key: `i:${item.id}`, lat: item.lat, lng: item.lng, item}))
    ];
  }, [located, isClustered, level, selected, hoveredKey]);
  const markersRef = useRef(markers);
  markersRef.current = markers;
  const selectedItem = located.find(i => i.id === selected) ?? null;

  // ── Placing the pins: every frame the camera moves, straight from the engine (no React render per frame) ──
  const isInside = useCallback((p: {x: number; y: number}, bleed = 0) => {
    const root = rootRef.current;
    if (!root) return false;
    return p.x >= -bleed && p.y >= -bleed && p.x <= root.clientWidth + bleed && p.y <= root.clientHeight + bleed;
  }, []);
  const position = useCallback(() => {
    const engine = engineRef.current;
    const root = rootRef.current;
    if (!engine || !root) return;
    for (const m of markersRef.current) {
      const el = markerEls.current[m.key];
      if (!el) continue;
      const p = engine.project(m);
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      el.toggleAttribute('data-outside', !isInside(p, BLEED));
      const card = el.querySelector<HTMLElement>(':scope > .gv-map__card');
      if (card) {
        const {placement, dx} = placeCard(p, {width: root.clientWidth, height: root.clientHeight},
          {width: card.offsetWidth, height: card.offsetHeight});
        card.dataset.placement = placement;
        card.style.setProperty('--gv-map-card-dx', `${dx}px`);
      }
    }
  }, [isInside]);
  useIsomorphicLayoutEffect(position);

  /** The markers in view, in item order: where Tab lands and where the arrow keys go. */
  const visible = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return [];
    return markersRef.current.map(m => ({key: m.key, ...engine.project(m)})).filter(p => isInside(p));
  }, [isInside]);
  // Tab lands on one pin in view: the last one focused, else the open one, else the first.
  const refreshTabStop = useCallback(() => {
    const shown = visible();
    setTabStop(current => (current && shown.some(p => p.key === current) ? current : shown[0]?.key ?? null));
  }, [visible]);

  // ── The engine: started once (again if `isInteractive` changes), destroyed on unmount ──
  const latest = useRef({onViewChange, onMapPress, select, selected, refreshTabStop, position});
  latest.current = {onViewChange, onMapPress, select, selected, refreshTabStop, position};
  const firstView = useRef({items: located, center, zoom});
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    let cancelled = false;
    let engine: MapEngine | null = null;
    let unsubscribe = () => {};
    const readCredits = (e: MapEngine) => {
      const seen = new Set<string>();
      setCredits(e.attribution().flatMap(parseCredits).filter(c => !seen.has(c.text) && !!seen.add(c.text)));
    };
    const onEvent = (event: MapEngineEvent) => {
      const e = engineRef.current;
      if (!e) return;
      const now = latest.current;
      if (event.type === 'move') now.position();
      else if (event.type === 'moveend') {
        now.position();
        const view = e.getView();
        setViewZoom(view.zoom);
        now.refreshTabStop();
        now.onViewChange?.(view);
      } else if (event.type === 'attribution') readCredits(e);
      else if (event.type === 'press') {
        if (now.selected != null) now.select(null);
        else now.onMapPress?.(event.point);
      }
    };
    setStatus('loading');
    const {items: first, center: c, zoom: z} = firstView.current;
    const canvasLabel = 'Map: arrow keys move it, + and − zoom';
    factory({container, view: initialView(first, c, z), isInteractive, label: canvasLabel}).then(e => {
      if (cancelled) return e.destroy();
      engine = e;
      engineRef.current = e;
      unsubscribe = e.subscribe(onEvent);
      setViewZoom(e.getView().zoom);
      readCredits(e);
      setStatus('ready');
      latest.current.position();
      latest.current.refreshTabStop();
    }, error => {
      if (cancelled) return;
      console.warn('Map: the engine could not start.', error);
      setStatus('error');
    });
    return () => {
      cancelled = true;
      unsubscribe();
      engine?.destroy();
      engineRef.current = null;
    };
  }, [factory, isInteractive]);

  // The container changes size (a side panel opens beside it): the engine redraws, the pins follow.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      engineRef.current?.resize();
      latest.current.position();
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // A new centre or zoom from the page moves the map there.
  const viewKey = `${center?.lat},${center?.lng},${zoom}`;
  const lastViewKey = useRef(viewKey);
  useEffect(() => {
    if (lastViewKey.current === viewKey) return;
    lastViewKey.current = viewKey;
    engineRef.current?.setView({center, zoom});
  }, [viewKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // An item opened from elsewhere (a list row) that is out of view: the map moves to it.
  const selectedRef = useRef(selectedItem);
  selectedRef.current = selectedItem;
  useEffect(() => {
    const engine = engineRef.current;
    const item = selectedRef.current;
    if (!engine || !item) return;
    if (!isInside(engine.project(item))) engine.setView({center: {lat: item.lat, lng: item.lng}});
    setTabStop(`i:${item.id}`);
  }, [selected, status, isInside]);

  // ── Keyboard ──
  const focusMarker = (key: string) =>
    markerEls.current[key]?.querySelector<HTMLElement>('.gv-map-pin')?.focus({preventScroll: true});
  const onPinKeyDown = (key: string) => (e: KeyboardEvent) => {
    const direction = ARROWS[e.key];
    if (direction) {
      e.preventDefault();
      const next = nextInDirection(visible(), key, direction);
      if (next) {
        setTabStop(next);
        focusMarker(next);
      }
    } else if (e.key === 'Escape' && selected != null) {
      e.preventDefault();
      select(null);
    }
  };
  const onCardKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !selectedItem) return;
    e.preventDefault();
    const key = `i:${selectedItem.id}`;
    select(null);
    focusMarker(key);
  };
  const onCanvasKeyDown = (e: KeyboardEvent) => {
    const engine = engineRef.current;
    if (e.key !== 'Enter' || !engine || !(e.target instanceof HTMLCanvasElement)) return;
    if (selected != null) select(null);
    else onMapPress?.(engine.getView().center);
  };

  const zoomControls = engineRef.current;
  const stop = tabStop && markers.some(m => m.key === tabStop) ? tabStop : markers[0]?.key ?? null;
  return (
    <div ref={rootRef} className={clsx('gv-map', className)} style={style} role="region" aria-label={label}
      aria-busy={status === 'loading' || undefined} data-status={status}
      data-pressable={onMapPress && isInteractive ? true : undefined}>
      <div ref={canvasRef} className="gv-map__canvas" onKeyDown={onCanvasKeyDown} />
      {status === 'error' && <p className="gv-map__message" role="status">The map can't be shown here.</p>}
      <div className="gv-map__pins">
        {markers.map(m => {
          const isOpen = m.item != null && m.item.id === selected;
          return (
            <div key={m.key} ref={el => { markerEls.current[m.key] = el; }} className="gv-map__marker"
              data-selected={isOpen || undefined} data-hot={(m.item != null && m.item.id === hoveredKey) || undefined}>
              {m.item ? (
                <MapPin label={m.item.label} tone={m.item.tone} isSelected={isOpen} isHighlighted={m.item.id === hoveredKey}
                  isStatic={!isInteractive} excludeFromTabOrder={m.key !== stop}
                  aria-expanded={isOpen} aria-controls={isOpen ? cardId : undefined}
                  onPress={() => select(isOpen ? null : m.item!.id)}
                  onHoverChange={h => onHoverChange?.(h ? m.item!.id : null)}
                  onFocus={() => setTabStop(m.key)} onKeyDown={onPinKeyDown(m.key)} />
              ) : (
                <MapPin label={`${m.count} pins: zoom in`} count={m.count} isStatic={!isInteractive}
                  excludeFromTabOrder={m.key !== stop} onFocus={() => setTabStop(m.key)} onKeyDown={onPinKeyDown(m.key)}
                  onPress={() => engineRef.current?.setView({center: m, zoom: level + 2})} />
              )}
              {isOpen && isInteractive && (
                <div id={cardId} className="gv-map__card" onKeyDown={onCardKeyDown}>
                  {renderCard ? renderCard(m.item as T) : <MapCard title={m.item!.label} status={m.item!.status} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {children}
      {isInteractive && (
        <div className="gv-map__zoom" role="group" aria-label="Zoom">
          <IconButton aria-label="Zoom in" tone="strong" isDisabled={!zoomControls || viewZoom >= zoomControls.maxZoom}
            onPress={() => engineRef.current?.zoomBy(1)}>
            <Plus aria-hidden size={16} />
          </IconButton>
          <IconButton aria-label="Zoom out" tone="strong" isDisabled={!zoomControls || viewZoom <= zoomControls.minZoom}
            onPress={() => engineRef.current?.zoomBy(-1)}>
            <Minus aria-hidden size={16} />
          </IconButton>
        </div>
      )}
      {credits.length > 0 && (
        <p className="gv-map__credits">
          {credits.map((c, n) => (
            <span key={n}>
              {n > 0 && ' '}
              {c.href ? <a href={c.href} target="_blank" rel="noreferrer">{c.text}</a> : c.text}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

export interface MapPinProps {
  /** The pin's name: the place's title, or the count for a cluster. */
  label: string;
  /** @default 'neutral' */
  tone?: MapTone;
  /** The open pin (its card shows): larger, in the accent, ringed. */
  isSelected?: boolean;
  /** Raised and darkened ("hot"): a list row beside the map is hovering its item. */
  isHighlighted?: boolean;
  /** A cluster: the number of pins folded into it, written on it. */
  count?: number;
  /** Drawn, not pressable and hidden from screen readers: a legend's swatch, a picture of a map. */
  isStatic?: boolean;
  onPress?: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  onFocus?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Leaves the pin out of the Tab order (the Map keeps one pin in it and moves between pins with the arrow keys). */
  excludeFromTabOrder?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  /** Places the pin; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A map pin: a dot in its tone (darker and raised when hot, larger and ringed when open), or a count for a cluster.
 * A button named by its label; static for a legend swatch. Engine-free: the Map places it. Not in Figma.
 */
export function MapPin({
  label, tone = 'neutral', isSelected, isHighlighted, count, isStatic, onPress, onHoverChange, onFocus, onKeyDown,
  excludeFromTabOrder, className, style, ...aria
}: MapPinProps) {
  const data = {
    'data-tone': tone,
    'data-selected': isSelected || undefined,
    'data-highlighted': isHighlighted || undefined,
    'data-cluster': count != null || undefined
  };
  const dot = <span className="gv-map-pin__dot">{count}</span>;
  if (isStatic) return <span {...data} className={clsx('gv-map-pin', className)} style={style} aria-hidden>{dot}</span>;
  return (
    <Button {...data} {...aria} className={clsx('gv-map-pin', className)} style={style} aria-label={label}
      excludeFromTabOrder={excludeFromTabOrder} onPress={onPress} onHoverChange={onHoverChange}
      onFocus={onFocus} onKeyDown={onKeyDown}>
      {dot}
    </Button>
  );
}

export interface MapCardProps {
  /** The item's title, as a heading. */
  title: string;
  /** Its status ("Accepted"), first on the meta line. */
  status?: string;
  /** More of the meta line after the status: counts, a date ("2 likes", "0 comments"), joined by " · ". */
  details?: string[];
  /** Where it is, in words ("The ring road"). */
  location?: string;
  /** A picture on top (an `<img>`), edge to edge. */
  media?: ReactNode;
  /** Buttons or a link under the text ("Open"). */
  actions?: ReactNode;
  /** The title's heading level. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Places the card; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The card of an open map pin: the item's title, a meta line (status · counts) and where it is, with an optional
 * picture and actions. The Map shows it above the pin; it works anywhere a small item summary floats. Not in Figma.
 */
export function MapCard({title, status, details = [], location, media, actions, headingLevel = 3, className, style}: MapCardProps) {
  const Heading = `h${headingLevel}` as const;
  const meta = [status, ...details].filter(Boolean).join(' · ');
  return (
    <section className={clsx('gv-map-card', className)} style={style} aria-label={title}>
      {media && <div className="gv-map-card__media">{media}</div>}
      <div className="gv-map-card__body">
        <Heading className="gv-map-card__title">{title}</Heading>
        {meta && <p className="gv-map-card__meta">{meta}</p>}
        {location && <p className="gv-map-card__meta">{location}</p>}
        {actions && <div className="gv-map-card__actions">{actions}</div>}
      </div>
    </section>
  );
}

export interface MapOverlayProps {
  /**
   * The corner, in the reading direction: `top-start` for a Banner, `bottom-start` for a `MapChip`, `bottom-end` for a
   * `MapLegend` (above the credits), `top-end` under the zoom buttons. One overlay per corner.
   */
  placement: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  children: ReactNode;
  /** Places the overlay (a width); never paints it. */
  className?: string;
  style?: CSSProperties;
}

/** Something laid over a map in one of its corners: a Banner, a `MapChip`, a `MapLegend`, a button. Not in Figma. */
export function MapOverlay({placement, children, className, style}: MapOverlayProps) {
  return <div className={clsx('gv-map-overlay', className)} style={style} data-placement={placement}>{children}</div>;
}

export interface MapChipProps {
  /** A few words: "40 ideas without a location". */
  children: ReactNode;
  /** Makes it a button (show those items in the list). */
  onPress?: () => void;
  /** Places the chip; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/** A short note on a map's white surface, e.g. how many items have no place on it; a button with `onPress`. Not in Figma. */
export function MapChip({children, onPress, className, style}: MapChipProps) {
  if (onPress) return <Button className={clsx('gv-map-chip', className)} style={style} onPress={onPress}>{children}</Button>;
  return <span className={clsx('gv-map-chip', className)} style={style}>{children}</span>;
}

export interface MapLegendItem {
  label: string;
  /** @default 'neutral' */
  tone?: MapTone;
}

export interface MapLegendProps {
  /** What each pin colour means. None: the legend says "No legend". */
  items: readonly MapLegendItem[];
  /** A title above the rows. */
  title?: string;
  /** @default the title, else 'Legend' */
  'aria-label'?: string;
  /** Places the legend; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/** A map's legend: each pin colour and what it means, on the map's white surface. Not in Figma. */
export function MapLegend({items, title, 'aria-label': label, className, style}: MapLegendProps) {
  if (!items.length) return <span className={clsx('gv-map-chip', className)} style={style}>No legend</span>;
  return (
    <div className={clsx('gv-map-legend', className)} style={style} role="group" aria-label={label ?? title ?? 'Legend'}>
      {title && <p className="gv-map-legend__title">{title}</p>}
      <ul className="gv-map-legend__list">
        {items.map(i => (
          <li key={i.label} className="gv-map-legend__row">
            <MapPin label={i.label} tone={i.tone} isStatic />
            {i.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
