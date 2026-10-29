// The Map's MapLibre engine: the one file that imports maplibre-gl. The Map loads it on demand (`maplibreEngine` in
// Map.tsx imports this module dynamically), so the engine, its worker and its CSS reach a page only when a map draws.
// Swapping in ArcGIS means writing this file again against `MapEngine` (./engine.ts); nothing else changes.
import {Map as MapLibreMap, setWorkerUrl} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type {MapEngine, MapEngineEvent, MapEngineOptions} from './engine';

// MapLibre finds its worker beside its own module; bundled, that file is elsewhere: point it at the emitted copy.
setWorkerUrl(workerUrl);

export function createMapLibreEngine({container, view, isInteractive, label}: MapEngineOptions, style: string): MapEngine {
  const map = new MapLibreMap({
    container,
    style,
    ...('bounds' in view
      ? {bounds: [[view.bounds[0].lng, view.bounds[0].lat], [view.bounds[1].lng, view.bounds[1].lat]] as [[number, number], [number, number]],
          fitBoundsOptions: {padding: 48, maxZoom: 16}}
      : {center: [view.center.lng, view.center.lat] as [number, number], zoom: view.zoom}),
    interactive: isInteractive,
    // The Map draws its own zoom buttons and credits line from tokens.
    attributionControl: false,
    maplibreLogo: false,
    // A flat map, north up: an admin places and reads points; rotating and tilting only lose them.
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    locale: {'Map.Title': label}
  });
  map.keyboard.disableRotation();
  map.touchZoomRotate.disableRotation();

  const listeners = new Set<(event: MapEngineEvent) => void>();
  const emit = (event: MapEngineEvent) => listeners.forEach(l => l(event));
  map.on('move', () => emit({type: 'move'}));
  map.on('moveend', () => emit({type: 'moveend'}));
  map.on('click', e => emit({type: 'press', point: {lat: e.lngLat.lat, lng: e.lngLat.lng}}));
  // A source's credits arrive with its metadata (a vector source's TileJSON), after the style.
  map.on('sourcedata', e => e.sourceDataType === 'metadata' && emit({type: 'attribution'}));
  map.on('styledata', () => emit({type: 'attribution'}));
  // Tiles that fail (offline, blocked) leave the background; say why in the console, never throw.
  map.on('error', e => console.warn('Map:', e.error?.message ?? e));

  return {
    project: ({lat, lng}) => {
      const p = map.project([lng, lat]);
      return {x: p.x, y: p.y};
    },
    unproject: ({x, y}) => {
      const p = map.unproject([x, y]);
      return {lat: p.lat, lng: p.lng};
    },
    getView: () => {
      const c = map.getCenter();
      return {center: {lat: c.lat, lng: c.lng}, zoom: map.getZoom()};
    },
    setView: ({center, zoom}, animate = true) => {
      map.easeTo({...(center && {center: [center.lng, center.lat] as [number, number]}), ...(zoom != null && {zoom}),
        ...(!animate && {duration: 0})});
    },
    zoomBy: delta => map.easeTo({zoom: map.getZoom() + delta}),
    get minZoom() {
      return map.getMinZoom();
    },
    get maxZoom() {
      return map.getMaxZoom();
    },
    attribution: () => {
      let ids: string[] = [];
      try {
        ids = Object.keys(map.getStyle()?.sources ?? {});
      } catch {
        // The style is still loading: no credits yet; `attribution` fires again when it has them.
      }
      return ids.map(id => map.getSource(id)?.attribution).filter((a): a is string => !!a);
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    resize: () => map.resize(),
    destroy: () => {
      listeners.clear();
      map.remove();
    }
  };
}
