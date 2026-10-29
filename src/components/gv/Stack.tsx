'use client';
import type {ReactNode} from 'react';
import {clsx} from 'clsx';
import type {PlacementProps} from '../className';
import {layoutVars, spaceVar, type PaddingProps, type Space} from '../space';
import './Stack.css';

export interface StackProps extends PaddingProps, PlacementProps {
  /** The parts to stack, top to bottom. */
  children?: ReactNode;
  /** The space between children, a spacing token (`'16'` is `--gv-space-16`). @default '0' */
  gap?: Space;
  /** Where the children sit across the stack: stretched to its width, or at the start, centre or end. @default 'stretch' */
  alignItems?: 'stretch' | 'start' | 'center' | 'end';
  /** Where the children sit along the stack when it is taller than they are. @default 'start' */
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';
  /** The element. A `ul` or `ol` loses its bullets and indent; each child is then an `<li>`. @default 'div' */
  elementType?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav' | 'form' | 'ul' | 'ol' |
    'li';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Stack: parts one under another, a spacing token apart, with no CSS of your own. Use it for a page's column of
 * panels, a form's fields, a panel's sections. Parts side by side are an Inline; distinct regions placed in columns
 * (a list beside its detail) a Grid; many like tiles that wrap a Tile grid.
 *
 * ```tsx
 * <Stack gap="16"><PageHeader title="Projects" /><Panel title="Drafts">…</Panel></Stack>
 * ```
 */
export function Stack({
  children, gap, padding, paddingInline, paddingBlock, alignItems, justifyContent, elementType: Element = 'div',
  className, style, ...rest
}: StackProps) {
  const vars = layoutVars({
    '--gv-stack-gap': spaceVar(gap),
    '--gv-stack-padding-inline': spaceVar(paddingInline ?? padding),
    '--gv-stack-padding-block': spaceVar(paddingBlock ?? padding)
  });
  return (
    <Element {...rest} className={clsx('gv-stack', className)} style={{...vars, ...style}}
      data-align={alignItems} data-justify={justifyContent}>
      {children}
    </Element>
  );
}
