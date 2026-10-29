'use client';
import type {ReactNode} from 'react';
import {clsx} from 'clsx';
import type {PlacementProps} from '../className';
import {layoutVars, spaceVar, type PaddingProps, type Space} from '../space';
import './Inline.css';

export interface InlineProps extends PaddingProps, PlacementProps {
  /** The parts to line up, in reading order (right to left in an RTL page). */
  children?: ReactNode;
  /** The space between children, both along the line and between wrapped lines, a spacing token. @default '0' */
  gap?: Space;
  /** The space between wrapped lines, when it differs from `gap`. */
  rowGap?: Space;
  /** How the children line up across the line: centred, at the top or bottom, stretched, or on the text's baseline. @default 'center' */
  alignItems?: 'center' | 'start' | 'end' | 'stretch' | 'baseline';
  /** Where the children sit along the line: `space-between` pushes the first and last to the ends. @default 'start' */
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';
  /** `wrap` moves what doesn't fit onto a new line; `nowrap` keeps one line (the children shrink). @default 'wrap' */
  wrap?: 'wrap' | 'nowrap';
  /** The element. A `ul` or `ol` loses its bullets and indent; each child is then an `<li>`. @default 'div' */
  elementType?: 'div' | 'span' | 'section' | 'header' | 'footer' | 'nav' | 'ul' | 'ol' | 'li';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Inline: parts side by side in a row that wraps, a spacing token apart, with no CSS of your own. Use it for a row
 * of buttons, filters, badges or a toolbar's controls. Parts one under another are a Stack; regions in fixed columns
 * a Grid; equal tiles that fill the width a Tile grid. A labelled group of controls with arrow keys is React Aria's
 * Toolbar (`govocal-ds/base`), not an Inline.
 *
 * ```tsx
 * <Inline gap="8" justifyContent="end"><Button variant="secondary">Cancel</Button><Button>Save</Button></Inline>
 * ```
 */
export function Inline({
  children, gap, rowGap, padding, paddingInline, paddingBlock, alignItems, justifyContent, wrap,
  elementType: Element = 'div', className, style, ...rest
}: InlineProps) {
  const vars = layoutVars({
    '--gv-inline-gap': spaceVar(gap),
    '--gv-inline-row-gap': spaceVar(rowGap),
    '--gv-inline-padding-inline': spaceVar(paddingInline ?? padding),
    '--gv-inline-padding-block': spaceVar(paddingBlock ?? padding)
  });
  return (
    <Element {...rest} className={clsx('gv-inline', className)} style={{...vars, ...style}}
      data-align={alignItems} data-justify={justifyContent} data-wrap={wrap}>
      {children}
    </Element>
  );
}
