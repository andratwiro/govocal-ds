'use client';
import type {CSSProperties} from 'react';
import {Text as RACText, type TextProps as RACTextProps} from 'react-aria-components/Text';
import {clsx} from 'clsx';
import './Text.css';

/** A type style from Foundations/Typography. */
export type TextKind = 'title' | 'body' | 'ui' | 'small' | 'stat';

/** A text colour, by emphasis: primary (the words that matter), secondary, meta (a record's date and author), tertiary. */
export type TextColor = 'primary' | 'secondary' | 'meta' | 'tertiary';

export interface TextProps extends Omit<RACTextProps, 'className' | 'style' | 'color' | 'slot'> {
  /**
   * The slot it fills inside a React Aria part (`'description'` in a List box item). `null` opts out of the part's
   * slots, for a Text of its own inside one (a count at the end of a list row).
   */
  slot?: string | null;
  /**
   * The type style: `title` (a page's or dialog's title), `body` (reading text), `ui` (labels and controls), `small`
   * (meta lines, captions), `stat` (a figure). Left out, the text takes its look from around it (a slot inside a
   * React Aria part, e.g. an item's `slot="description"`).
   */
  kind?: TextKind;
  /** The style's strong weight: body, ui and small have one; title and stat are strong already. */
  isStrong?: boolean;
  /** The colour, by emphasis. Left out, the colour around it. */
  color?: TextColor;
  /** The element: `span` by default; `p` for a paragraph, `h2`–`h6` for a heading (or Content's `Heading`). */
  elementType?: string;
  /** Places the text (a margin, a grid area); never paints it: the look comes from `kind` and `color`. */
  className?: string;
  /** Places the text; never paints it. */
  style?: CSSProperties;
}

/**
 * Text: words in one of the system's type styles and colours, `<Text kind="small" color="meta">Posted 2 days ago</Text>`
 * or `<Text elementType="h2" kind="body" isStrong>Where people stand</Text>`. It has no margins. It is React Aria's
 * Text underneath, so it also fills a part's slot (`<Text slot="description">`), as the plain one does.
 */
export function Text({kind, isStrong, color, className, slot, ...props}: TextProps) {
  const painted = kind != null || color != null;
  return (
    <RACText
      {...props}
      // React Aria reads a null slot as "no slot"; its prop type only says string.
      slot={slot as string | undefined}
      className={clsx('react-aria-Text gv-base-text', painted && 'gv-text', className)}
      data-kind={kind}
      data-strong={(kind && isStrong) || undefined}
      data-color={color}
    />
  );
}
