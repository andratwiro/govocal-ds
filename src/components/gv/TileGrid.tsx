'use client';
import type {CSSProperties, ReactNode} from 'react';
import {clsx} from 'clsx';
import './TileGrid.css';

export interface TileGridProps {
  /** The tiles: Stat tiles, Cards, Panels. In a `ul` or `ol`, each one in an `<li>`. */
  children: ReactNode;
  /**
   * The narrowest a tile gets: the grid fits as many columns as that allows and drops one below it (never wider than
   * the grid). 160 for Stat tiles, 220 for a pair of fields or cards side by side, 280 for cards, 360 for panels.
   *
   * @default 280
   */
  minTileWidth?: 160 | 220 | 280 | 360;
  /**
   * `row`: the tiles share the row and stretch across it (Stat tiles, dashboard cards, panels side by side).
   * `gallery`: the columns keep their width, so a short last row leaves room (a list of cards to pick from).
   *
   * @default 'row'
   */
  layout?: 'row' | 'gallery';
  /** The gap between tiles: 16, or 12 when `compact` (a row of Stat tiles). @default 'default' */
  density?: 'default' | 'compact';
  /** `ul` or `ol` for a list of tiles (its bullets and indent removed). @default 'div' */
  elementType?: 'div' | 'ul' | 'ol';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Places the grid (its margin, a grid area, `align-items`); never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Tile grid: tiles in as many equal columns as fit, each at least `minTileWidth` wide, wrapping onto new rows, one
 * column on a narrow screen. Not in Figma: the back office's Stat tile rows, card galleries and side-by-side panels.
 *
 * ```tsx
 * <TileGrid minTileWidth={160} density="compact">{stats.map(s => <StatTile key={s.id} {...s} />)}</TileGrid>
 * ```
 */
export function TileGrid({
  children, minTileWidth = 280, layout = 'row', density = 'default', elementType: Element = 'div', className, style,
  ...aria
}: TileGridProps) {
  return (
    <Element {...aria} className={clsx('gv-tile-grid', className)} style={style}
      data-min={minTileWidth} data-layout={layout} data-density={density}>
      {children}
    </Element>
  );
}
