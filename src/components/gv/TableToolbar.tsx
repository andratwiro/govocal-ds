'use client';
import type {KeyboardEvent, ReactNode} from 'react';
import {Toolbar} from 'react-aria-components/Toolbar';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './TableToolbar.css';

export interface TableToolbarHeadingProps extends PlacementProps {
  /** The count, in words: "124 ideas". */
  children: ReactNode;
  /** @default 3 */
  headingLevel?: 2 | 3 | 4;
}

/**
 * The count heading at a table's start ("124 ideas"). It follows what the table shows, search and filters
 * included, and says so politely to screen readers as it changes.
 */
export function TableToolbarHeading({children, headingLevel: level = 3, className, style}: TableToolbarHeadingProps) {
  const Heading = `h${level}` as const;
  return <Heading className={clsx('gv-table-toolbar__heading', className)} style={style} aria-live="polite" aria-atomic>{children}</Heading>;
}

export interface TableToolbarProps extends PlacementProps {
  /** The count heading at the start, e.g. "124 ideas" (a `TableToolbarHeading`). */
  heading?: ReactNode;
  /** The heading's level. @default 3 */
  headingLevel?: 2 | 3 | 4;
  /**
   * What sits at the start instead of the heading: a Selection bar wrapping the `TableToolbarHeading`, so that
   * selecting rows swaps the count for the batch actions while the tools stay put.
   */
  start?: ReactNode;
  /** The tools at the end: a collapsible Search field, the Filter menu, an export menu. */
  children?: ReactNode;
  /** Names the tools. @default 'Table tools' */
  'aria-label'?: string;
}

// React Aria's Toolbar moves focus on ← and →, even from inside a text field. In the search field the arrows move
// the caret instead, and only hand over to the next tool once the caret is at the field's edge.
function keepCaret(e: KeyboardEvent) {
  const field = e.target;
  if (!(field instanceof HTMLInputElement) || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
  const {selectionStart: from, selectionEnd: to, value} = field;
  if (from == null || to == null) return;
  const backwards = (e.key === 'ArrowLeft') === (getComputedStyle(field).direction !== 'rtl');
  const atEdge = from === to && (backwards ? from === 0 : to === value.length);
  if (!atEdge) e.stopPropagation();
}

/**
 * The row above a table (the prototype's Manage tables and Audience table): the count heading, or a Selection bar
 * while rows are selected, at the start; the tools at the end (a collapsible Search field, the Filter menu with its
 * dot, an export menu), which never move. The tools are a React Aria Toolbar: Tab enters it once, ← → move between
 * tools, and inside the search field they move the caret until it reaches the edge. Not in Figma yet.
 */
export function TableToolbar({heading, headingLevel, start, children, 'aria-label': label = 'Table tools', className, style}: TableToolbarProps) {
  return (
    <div className={clsx('gv-table-toolbar', className)} style={style}>
      <div className="gv-table-toolbar__start">
        {start ?? (heading != null && <TableToolbarHeading headingLevel={headingLevel}>{heading}</TableToolbarHeading>)}
      </div>
      {children && (
        <div className="gv-table-toolbar__end" onKeyDownCapture={keepCaret}>
          <Toolbar aria-label={label} className="gv-table-toolbar__tools">{children}</Toolbar>
        </div>
      )}
    </div>
  );
}
