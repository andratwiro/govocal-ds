import type {InitialView, LatLng, ScreenPoint} from './geo';

/**
 * What the Map asks of a map engine: the tiles, the camera, and turning a place into a pixel and back. Everything
 * people see and press on top (pins, the card, the zoom buttons, overlays, the credits) is the system's own, drawn
 * from tokens. MapLibre is the engine today (`maplibreEngine`); the platform's ArcGIS fits the same shape
 * (`MapView.toScreen` / `toMap`, `goTo`, `watch('stationary')`), so swapping it swaps one file and keeps the parts.
 */
export interface MapEngine {
  /** A place, in pixels from the map's top-left corner. */
  project(point: LatLng): ScreenPoint;
  /** The place under a pixel. */
  unproject(point: ScreenPoint): LatLng;
  /** The camera now: the place at the map's centre and the zoom level. */
  getView(): {center: LatLng; zoom: number};
  /** Moves the camera (eased unless `animate` is false). */
  setView(view: {center?: LatLng; zoom?: number}, animate?: boolean): void;
  /** Zooms in (positive) or out (negative) around the centre, eased. */
  zoomBy(delta: number): void;
  /** The farthest the camera zooms out. */
  minZoom: number;
  /** The closest the camera zooms in. */
  maxZoom: number;
  /** The credits the tiles ask for, as their sources give them (HTML: the Map reads it as text, see `parseCredits`). */
  attribution(): string[];
  /**
   * `move` on every frame the camera changes; `moveend` when it rests; `attribution` when the sources' credits arrive;
   * `press` for a click or tap on the map itself (not a pin), with its place.
   */
  subscribe(listener: (event: MapEngineEvent) => void): () => void;
  /** The container changed size. */
  resize(): void;
  /** Stops the engine and frees what it holds; the Map calls it on unmount. */
  destroy(): void;
}

export type MapEngineEvent = {type: 'move' | 'moveend' | 'attribution'} | {type: 'press'; point: LatLng};

export interface MapEngineOptions {
  /** An empty element the engine fills; the Map sizes it. */
  container: HTMLElement;
  /** Where the camera starts: a centre and zoom, or bounds to fit. */
  view: InitialView;
  /** Off: no dragging, wheel or keyboard moves. */
  isInteractive: boolean;
  /** The name of the engine's own focusable surface (it pans with the arrow keys). */
  label: string;
}

/** Starts an engine in `container`; the Map calls it once the element is on the page and `destroy`s it on unmount. */
export type MapEngineFactory = (options: MapEngineOptions) => Promise<MapEngine>;
