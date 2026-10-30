'use client';
import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {useNumberFormatter} from '../format';
import './PageStage.css';

/** The words Page stage and its sheets say themselves (docs/API.md rule 11). */
export interface PageStageLabels {
  /** The stage's name, when no `aria-label` is given: the scrolling region that holds the pages. */
  stage: string;
  /** A sheet's name, given its page number written in the locale ("Page 3"). */
  page: (page: string) => string;
}

/** Page stage's English words; a page passes its own over them with `labels`. */
export const pageStageLabels: PageStageLabels = {
  stage: 'Pages',
  page: page => `Page ${page}`
};

/** A sheet's shape: an A4 page, upright, or a 16:9 slide. */
export type PageStageFormat = 'a4' | 'slide';

/** A sheet's width at 100%, in CSS pixels (A4 at 96 dpi; a slide as wide as an A4 page is tall). */
const SHEET_WIDTH: Record<PageStageFormat, number> = {a4: 794, slide: 1123};
/** The stage's side padding at 100%, on each side (the CSS's --gv-space-32). */
const STAGE_PADDING = 32;

export interface PageStageProps extends PlacementProps {
  /** The pages: Page stage sheets, top to bottom. */
  children?: ReactNode;
  /**
   * The zoom, in percent: 100 draws an A4 sheet 794 pixels wide. The sheets scale; the stage, its padding and the
   * zoom bar don't. A page keeps it in state with the Zoom bar. @default 100
   */
  zoom?: number;
  /** A Zoom bar, floated over the stage at the bottom centre (where it never covers the scroll bar). */
  zoomBar?: ReactNode;
  /**
   * Fires as the stage scrolls, with the page now in view (1-based: the last sheet whose top has passed the upper
   * third of the stage). The Zoom bar's "Page 3 of 12".
   */
  onPageChange?: (page: number) => void;
  /**
   * Fires when the stage's width changes, with the zoom at which a sheet fills it (whole percent, the padding kept).
   * The Zoom bar's Fit.
   */
  onFitZoomChange?: (zoom: number) => void;
  /** The stage's name. @default `labels.stage` ("Pages") */
  'aria-label'?: string;
  /** Its own words, over `pageStageLabels`. */
  labels?: Partial<PageStageLabels>;
}

/**
 * Page stage: a document's pages as white sheets on a grey stage, scrolled and zoomed, with a Zoom bar floating at the
 * bottom. Use it wherever people edit or preview something that will be printed or exported page by page (a report).
 * One page of settings is a Panel; a phone-sized preview is a Phone preview.
 *
 * - The stage is a scrolling region people can reach with Tab and scroll with the arrow keys.
 * - `zoom` scales the sheets only; `onFitZoomChange` says which zoom fills the width, `onPageChange` which page is
 *   in view.
 * - Each Page stage sheet is an `article` named "Page n", with an optional footer (the document's title · the page
 *   number).
 *
 * `className` and `style` place it (its height in the page's layout); they never paint it. Not in Figma.
 *
 * ```tsx
 * <PageStage zoom={zoom} onFitZoomChange={setFit} onPageChange={setPage}
 *   zoomBar={<ZoomBar zoom={zoom} onZoomChange={setZoom} fitZoom={fit} page={page} pageCount={pages.length} />}>
 *   {pages.map((p, i) => <PageStageSheet key={i} pageNumber={i + 1} footer={title}>{p}</PageStageSheet>)}
 * </PageStage>
 * ```
 */
export function PageStage({
  children, zoom = 100, zoomBar, onPageChange, onFitZoomChange, 'aria-label': ariaLabel, labels, className, style
}: PageStageProps) {
  const l = mergeLabels(pageStageLabels, labels);
  const scroller = useRef<HTMLDivElement>(null);
  const lastPage = useRef(0);

  const sheets = () => [...(scroller.current?.querySelectorAll<HTMLElement>(':scope > .gv-page-stage__sheets > .gv-page-sheet') ?? [])];

  const reportPage = useCallback(() => {
    const el = scroller.current;
    if (!el || !onPageChange) return;
    const line = el.getBoundingClientRect().top + el.clientHeight / 3;
    const all = sheets();
    let page = all.length ? 1 : 0;
    all.forEach((sheet, i) => { if (sheet.getBoundingClientRect().top <= line) page = i + 1; });
    if (page !== lastPage.current) { lastPage.current = page; onPageChange(page); }
  }, [onPageChange]);

  // The fit zoom follows the stage's width; the page in view follows the zoom too (sheets move as they scale).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => {
      if (onFitZoomChange) {
        const format = (sheets()[0]?.dataset.format as PageStageFormat | undefined) ?? 'a4';
        const room = el.clientWidth - 2 * STAGE_PADDING;
        if (room > 0) onFitZoomChange(Math.floor((room / SHEET_WIDTH[format]) * 100));
      }
      reportPage();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onFitZoomChange, reportPage, zoom]);

  return (
    <div className={clsx('gv-page-stage', className)} style={style}>
      {/* A scrolling region takes focus, so people without a mouse can scroll it (WCAG 2.1.1). */}
      <div ref={scroller} className="gv-page-stage__scroll" role="region" aria-label={ariaLabel ?? l.stage} tabIndex={0}
        onScroll={reportPage}>
        <div className="gv-page-stage__sheets" style={{zoom: zoom / 100}}>{children}</div>
      </div>
      {zoomBar != null && <div className="gv-page-stage__bar">{zoomBar}</div>}
    </div>
  );
}

export interface PageStageSheetProps extends PlacementProps {
  /** The page's content, laid out top to bottom inside its margins. */
  children?: ReactNode;
  /** The sheet's shape. @default 'a4' */
  format?: PageStageFormat;
  /** The page's number: its name ("Page 3") and the end of its footer. */
  pageNumber?: number;
  /** The footer's start, usually the document's title; the page number sits at its end. */
  footer?: ReactNode;
  /** A cover (a report's title page): no footer, though it keeps its number and name. */
  isCover?: boolean;
  /** Draws the sheet as busy (a report being generated): `aria-busy`, for Skeleton lines inside. */
  isBusy?: boolean;
  /** The sheet's name. @default `labels.page(pageNumber)` ("Page 3") */
  'aria-label'?: string;
  /** Its own words, over `pageStageLabels`. */
  labels?: Partial<PageStageLabels>;
}

/**
 * One page of a Page stage: a white sheet (the document's paper, `--gv-surface-document`) with the document's margins
 * and an optional footer. Content inside uses the document type roles (`--gv-type-document-*`).
 */
export function PageStageSheet({
  children, format = 'a4', pageNumber, footer, isCover, isBusy, 'aria-label': ariaLabel, labels, className, style
}: PageStageSheetProps) {
  const l = mergeLabels(pageStageLabels, labels);
  const number = useNumberFormatter();
  const written = pageNumber != null ? number.format(pageNumber) : undefined;
  const hasFooter = !isCover && (footer != null || written != null);
  return (
    <article className={clsx('gv-page-sheet', className)} style={style} data-format={format}
      aria-label={ariaLabel ?? (written != null ? l.page(written) : undefined)} aria-busy={isBusy || undefined}>
      <div className="gv-page-sheet__body">{children}</div>
      {hasFooter && (
        <footer className="gv-page-sheet__foot">
          <span className="gv-page-sheet__title">{footer}</span>
          {written != null && <span className="gv-page-sheet__number">{written}</span>}
        </footer>
      )}
    </article>
  );
}
