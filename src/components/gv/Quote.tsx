'use client';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {Badge} from './Badge';
import './Quote.css';

/** The words Quote says itself (docs/API.md rule 11). */
export interface QuoteLabels {
  /** The words in the language's quotation marks ("“…”"; „…“ in German, « … » in French). */
  quoted: (words: string) => string;
}

/** Quote's English words; a page passes its own over them with `labels`. */
export const quoteLabels: QuoteLabels = {
  quoted: words => `“${words}”`
};

export interface QuoteProps extends PlacementProps {
  /** What the person said, without quotation marks (`labels.quoted` adds the language's own). */
  words: string;
  /** Who said it, as the platform may show them ("Resident A", a first name and initial). */
  author: ReactNode;
  /** A face or initials: an Avatar at 28 (`<Avatar initials="RA" size={28} />`). Leave it out to show none. */
  avatar?: ReactNode;
  /** A line under the name: where the words come from ("North Quarter · 31 reactions · Translated from German"). */
  meta?: ReactNode;
  /** What the words are about, as a small outlined tag above them ("Heat and shade"). */
  tag?: ReactNode;
  /**
   * The look: `card` on a soft fill (quotes side by side in a report), `plain` with a rule at the start (one quote in
   * running text). @default 'card'
   */
  variant?: 'card' | 'plain';
  /** Its own words, over `quoteLabels`. */
  labels?: Partial<QuoteLabels>;
}

/**
 * Quote: a person's own words from the platform, with who said them: an input in a report, a resident's comment on an
 * inspiration page. Use it to let participants speak in a document. A comment someone can reply to is a Comment
 * thread; an official answer is an Official update.
 *
 * - A `figure` with a `blockquote` and a caption naming the person, so the words and the author stay together.
 * - The quotation marks come from `labels.quoted`, in the document's language.
 * - `card` (soft fill, side by side in a Grid) or `plain` (a rule at the start).
 *
 * Show only what the platform lets you show about a person: the author, face and meta are the page's to choose.
 * `className` and `style` place it; they never paint it. Not in Figma.
 *
 * ```tsx
 * <Quote tag="Heat and shade" words="There is no shade between the tram and my door."
 *   author="Resident A" meta="North Quarter · 31 reactions" avatar={<Avatar initials="RA" size={28} />} />
 * ```
 */
export function Quote({words, author, avatar, meta, tag, variant = 'card', labels, className, style}: QuoteProps) {
  const l = mergeLabels(quoteLabels, labels);
  return (
    <figure className={clsx('gv-quote', className)} style={style} data-variant={variant}>
      {tag != null && <span className="gv-quote__tag"><Badge variant="outlined">{tag}</Badge></span>}
      <blockquote className="gv-quote__words">
        <p>{l.quoted(words)}</p>
      </blockquote>
      <figcaption className="gv-quote__who">
        {avatar != null && <span className="gv-quote__avatar">{avatar}</span>}
        <span className="gv-quote__person">
          <span className="gv-quote__author">{author}</span>
          {meta != null && <span className="gv-quote__meta">{meta}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
