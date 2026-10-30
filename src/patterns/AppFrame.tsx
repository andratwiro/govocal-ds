'use client';
import type {CSSProperties, ReactNode} from 'react';
import {clsx} from 'clsx';
import {layoutVars, spaceVar, type PaddingProps} from '../components/space';
import type {PlacementProps} from '../components/className';
import './AppFrame.css';

export interface AppFrameProps {
  /** The Side nav, in the frame's first column. */
  nav: ReactNode;
  /** The page, on the app's grey ground, 8 in from the edges. */
  children: ReactNode;
  /** The Side nav's folded rail (52 wide) instead of the open nav (224): inside a project, as `SideNav isFolded`. */
  isNavFolded?: boolean;
  /** Places the frame; never paints it. */
  className?: string;
  /** Inline placement, as `className`. */
  style?: CSSProperties;
}

/**
 * App frame: the back office's frame around every page, the Side nav in a column at the start (224 wide, or the 52
 * rail when `isNavFolded`) and the page in a `main` on the app's grey ground, 8 in, in the UI type and the body text
 * colour. Not in Figma: the real admin's layout. Pages lay their panels out on it with Stack, Inline and Grid; a white
 * region of the frame with no head of its own (the page's bar, a project page's column) is an App frame panel.
 *
 * ```tsx
 * <AppFrame nav={<SideNav aria-label="Main">…</SideNav>}><Outlet /></AppFrame>
 * ```
 */
export function AppFrame({nav, children, isNavFolded, className, style}: AppFrameProps) {
  return (
    <div className={clsx('gv-app-frame', className)} style={style} data-folded={isNavFolded || undefined}>
      <div className="gv-app-frame__nav">{nav}</div>
      <main className="gv-app-frame__main">{children}</main>
    </div>
  );
}

export interface AppFramePanelProps extends PaddingProps, PlacementProps {
  /** What the region holds: a Page header, a project page's rail, an empty state. */
  children?: ReactNode;
  /** The element: `header` for a page's bar, `aside` for a side column, `section` for a named region. @default 'div' */
  elementType?: 'div' | 'section' | 'aside' | 'header' | 'nav';
  /** The region's id, for a link or an `aria-controls` to point at. */
  id?: string;
  /** The region's name, for a `section`, `aside` or `nav` with no visible heading. */
  'aria-label'?: string;
  /** The id of the visible heading that names the region. */
  'aria-labelledby'?: string;
}

/**
 * App frame panel: a white region of the App frame with rounded corners and no border or head of its own, such as a
 * page's bar or a project page's column. Its padding takes spacing tokens (`padding="16"`), none by default. A
 * region with a title over a hairline is a Panel; a box to tick or open is a Card.
 *
 * ```tsx
 * <AppFramePanel elementType="aside" aria-label="Participation" padding="16">…</AppFramePanel>
 * ```
 */
export function AppFramePanel({
  children, elementType: Element = 'div', padding, paddingInline, paddingBlock, className, style, ...rest
}: AppFramePanelProps) {
  const vars = layoutVars({
    '--gv-app-frame-panel-padding-inline': spaceVar(paddingInline ?? padding),
    '--gv-app-frame-panel-padding-block': spaceVar(paddingBlock ?? padding)
  });
  return (
    <Element {...rest} className={clsx('gv-app-frame-panel', className)} style={{...vars, ...style}}>
      {children}
    </Element>
  );
}
