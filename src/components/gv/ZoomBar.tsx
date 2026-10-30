'use client';
import {Button as RACButton} from 'react-aria-components/Button';
import {Toolbar} from 'react-aria-components/Toolbar';
import {Minus, Plus} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {useNumberFormatter, usePercentFormatter} from '../format';
import {IconButton} from './IconButton';
import './ZoomBar.css';

/** The words Zoom bar says itself (docs/API.md rule 11). */
export interface ZoomBarLabels {
  /** The toolbar's name. */
  toolbar: string;
  /** The − button's name. */
  zoomOut: string;
  /** The + button's name. */
  zoomIn: string;
  /** The Fit button's words: zoom so a page fills the stage's width. */
  fit: string;
  /** The page line, given the page in view and the page count, written in the locale ("Page 3 of 12"). */
  page: (page: string, count: string) => string;
  /** Read for the zoom value, given it written in the locale ("Zoom 83%"); the bar shows the percentage alone. */
  zoom: (percent: string) => string;
}

/** Zoom bar's English words; a page passes its own over them with `labels`. */
export const zoomBarLabels: ZoomBarLabels = {
  toolbar: 'Zoom and pages',
  zoomOut: 'Zoom out',
  zoomIn: 'Zoom in',
  fit: 'Fit',
  page: (page, count) => `Page ${page} of ${count}`,
  zoom: percent => `Zoom ${percent}`
};

/** The zoom steps − and + move between, in percent. */
export const ZOOM_STEPS = [50, 67, 83, 100, 125, 150, 200];

export interface ZoomBarProps extends PlacementProps {
  /** The zoom now, in percent (it may sit between steps: the fit zoom). */
  zoom: number;
  /** Fires with the new zoom when − or + moves a step, or Fit is pressed. */
  onZoomChange: (zoom: number) => void;
  /** The steps − and + move between, lowest first. − stops at the first, + at the last. @default ZOOM_STEPS */
  steps?: number[];
  /**
   * The zoom at which a page fills the stage (Page stage's `onFitZoomChange`). Shows Fit, which sets it; Fit is off
   * when the zoom is already there. Leave it out for no Fit.
   */
  fitZoom?: number;
  /** The page in view (Page stage's `onPageChange`), 1-based. With `pageCount`, shows "Page 3 of 12". */
  page?: number;
  /** How many pages there are. */
  pageCount?: number;
  /** All of it off (the report is generating). */
  isDisabled?: boolean;
  /** Its own words, over `zoomBarLabels`. */
  labels?: Partial<ZoomBarLabels>;
}

/**
 * Zoom bar: a floating pill to zoom a stage of pages and say where you are: − 83% + · Fit · Page 3 of 12. Use it on a
 * Page stage (its `zoomBar`) or any preview stage that scales, such as the phone preview. Zooming a map is the Map
 * view's own buttons; moving between pages of a list is Pagination.
 *
 * - A labelled toolbar: Tab reaches it once, the arrow keys move between its buttons.
 * - The percentage and the page are in the locale; screen readers hear the zoom change.
 * - − and + stop at the ends of `steps`; Fit is off when the zoom already fits.
 *
 * `className` and `style` place it; they never paint it. Not in Figma.
 *
 * ```tsx
 * <ZoomBar zoom={zoom} onZoomChange={setZoom} fitZoom={fit} page={page} pageCount={12} />
 * ```
 */
export function ZoomBar({
  zoom, onZoomChange, steps = ZOOM_STEPS, fitZoom, page, pageCount, isDisabled, labels, className, style
}: ZoomBarProps) {
  const l = mergeLabels(zoomBarLabels, labels);
  const percent = usePercentFormatter();
  const number = useNumberFormatter();
  const lower = [...steps].reverse().find(s => s < zoom);
  const higher = steps.find(s => s > zoom);
  const shown = percent(zoom);
  return (
    <Toolbar aria-label={l.toolbar} className={clsx('gv-zoom-bar', className)} style={style}>
      <IconButton size={24} aria-label={l.zoomOut} isDisabled={isDisabled || lower == null}
        onPress={() => lower != null && onZoomChange(lower)}>
        <Minus aria-hidden />
      </IconButton>
      <output className="gv-zoom-bar__value" aria-live="polite" aria-label={l.zoom(shown)}>{shown}</output>
      <IconButton size={24} aria-label={l.zoomIn} isDisabled={isDisabled || higher == null}
        onPress={() => higher != null && onZoomChange(higher)}>
        <Plus aria-hidden />
      </IconButton>
      {fitZoom != null && (
        <RACButton className="gv-zoom-bar__fit" isDisabled={isDisabled || Math.round(zoom) === Math.round(fitZoom)}
          onPress={() => onZoomChange(fitZoom)}>
          {l.fit}
        </RACButton>
      )}
      {page != null && pageCount != null && (
        <span className="gv-zoom-bar__page">{l.page(number.format(page), number.format(pageCount))}</span>
      )}
    </Toolbar>
  );
}
