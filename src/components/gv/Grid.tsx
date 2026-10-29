'use client';
import type {ReactNode} from 'react';
import {clsx} from 'clsx';
import type {PlacementProps} from '../className';
import {layoutVars, spaceVar, type PaddingProps, type Space} from '../space';
import './Grid.css';

export interface GridProps extends PaddingProps, PlacementProps {
  /** The regions: Grid items, or any parts (each takes the next cell). */
  children?: ReactNode;
  /**
   * The columns: a count of equal columns (`3`), or the track list for columns that differ (`'2fr 1fr'`,
   * `'minmax(0, 1fr) 360px'`). The columns stay at every width; tiles that wrap on a narrow screen are a Tile grid.
   *
   * @default 1
   */
  columns?: number | string;
  /** The rows' track list (`'auto 1fr'`), when rows aren't simply as tall as their content. */
  rows?: string;
  /**
   * Named regions, one string per row, one name per column (`['head head', 'list detail']`); a `.` leaves a cell
   * empty. Each Grid item takes its region with `area`.
   */
  areas?: string[];
  /** The space between columns and rows, a spacing token (`'16'` is `--gv-space-16`). @default '0' */
  gap?: Space;
  /** The space between rows, when it differs from `gap`. */
  rowGap?: Space;
  /** The space between columns, when it differs from `gap`. */
  columnGap?: Space;
  /** How each region fills its cell's height: stretched, or at the start, centre or end. @default 'stretch' */
  alignItems?: 'stretch' | 'start' | 'center' | 'end';
  /** The element. A `ul` or `ol` loses its bullets and indent; each child is then an `<li>`. @default 'div' */
  elementType?: 'div' | 'section' | 'article' | 'main' | 'form' | 'ul' | 'ol';
  /** The element's `id`. */
  id?: string;
  /** A name for the element, when it is a landmark or a list (`section`, `ul`, `nav`). */
  'aria-label'?: string;
  /** The `id` of the heading that names the element, instead of `aria-label`. */
  'aria-labelledby'?: string;
}

/**
 * Grid: a page's distinct regions in columns and named areas, a spacing token apart, with no CSS of your own. Use it
 * for a list beside its detail, a form in two columns, a dashboard's fixed layout. Many like tiles that should wrap
 * to fit the width (Stat tiles, cards) are a Tile grid; one column of parts a Stack; one row an Inline.
 *
 * ```tsx
 * <Grid columns="minmax(0, 1fr) 360px" areas={['list detail']} gap="16">
 *   <GridItem area="list"><DataTable … /></GridItem>
 *   <GridItem area="detail"><SidePanel … /></GridItem>
 * </Grid>
 * ```
 */
export function Grid({
  children, columns = 1, rows, areas, gap, rowGap, columnGap, padding, paddingInline, paddingBlock, alignItems,
  elementType: Element = 'div', className, style, ...rest
}: GridProps) {
  const vars = layoutVars({
    '--gv-grid-columns': typeof columns === 'number' ? `repeat(${columns}, minmax(0, 1fr))` : columns,
    '--gv-grid-rows': rows,
    '--gv-grid-areas': areas?.map(row => `"${row}"`).join(' '),
    '--gv-grid-row-gap': spaceVar(rowGap ?? gap),
    '--gv-grid-column-gap': spaceVar(columnGap ?? gap),
    '--gv-grid-padding-inline': spaceVar(paddingInline ?? padding),
    '--gv-grid-padding-block': spaceVar(paddingBlock ?? padding)
  });
  return (
    <Element {...rest} className={clsx('gv-grid', className)} style={{...vars, ...style}} data-align={alignItems}>
      {children}
    </Element>
  );
}

export interface GridItemProps extends PlacementProps {
  /** What fills the region. */
  children?: ReactNode;
  /** The named region it takes, one of the Grid's `areas`. */
  area?: string;
  /** How many columns it spans, or `all` for the full row. @default 1 */
  columnSpan?: number | 'all';
  /** The column it starts in, counting from 1 at the start of the line. */
  columnStart?: number;
  /** How many rows it spans. @default 1 */
  rowSpan?: number;
  /** The element: `li` inside a Grid that is a `ul` or `ol`. @default 'div' */
  elementType?: 'div' | 'section' | 'article' | 'aside' | 'li';
  /** The element's `id`. */
  id?: string;
  /** A name for the region, when it is a landmark (`section`, `aside`). */
  'aria-label'?: string;
  /** The `id` of the heading that names the element, instead of `aria-label`. */
  'aria-labelledby'?: string;
}

/**
 * Grid item: one region of a Grid, placed by area name or by column span and start. A part needs one only to take a
 * named area or span columns; otherwise put it in the Grid as it is.
 */
export function GridItem({
  children, area, columnSpan, columnStart, rowSpan, elementType: Element = 'div', className, style, ...rest
}: GridItemProps) {
  // One grid-area: a named region, or row-start / column-start / row-end / column-end from the span and start.
  const all = columnSpan === 'all';
  const placed = columnStart !== undefined || columnSpan !== undefined || rowSpan !== undefined;
  const lines = [
    'auto', all ? '1' : columnStart ?? 'auto', rowSpan ? `span ${rowSpan}` : 'auto',
    all ? '-1' : columnSpan ? `span ${columnSpan}` : 'auto'
  ].join(' / ');
  const vars = layoutVars({'--gv-grid-item-area': area ?? (placed ? lines : undefined)});
  return (
    <Element {...rest} className={clsx('gv-grid__item', className)} style={{...vars, ...style}}>
      {children}
    </Element>
  );
}
