'use client';
import {MessageCircle, ThumbsDown, ThumbsUp, type LucideIcon} from 'lucide-react';
import {VisuallyHidden} from 'react-aria-components';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {useNumberFormatter} from '../format';
import {mergeLabels, type CountLabel} from '../labels';
import './ReactionCounts.css';

/** The words Reaction counts says itself (docs/API.md rule 11): each count read out with its word ("128 likes"). */
export interface ReactionCountsLabels {
  likes: CountLabel;
  dislikes: CountLabel;
  comments: CountLabel;
}

/** Reaction counts' English words; a page passes its own over them with `labels`. */
export const reactionCountsLabels: ReactionCountsLabels = {
  likes: (count, n) => (count === 1 ? `${n} like` : `${n} likes`),
  dislikes: (count, n) => (count === 1 ? `${n} dislike` : `${n} dislikes`),
  comments: (count, n) => (count === 1 ? `${n} comment` : `${n} comments`)
};

export interface ReactionCountsProps extends PlacementProps {
  /** Likes (the thumb up). */
  likes: number;
  /** Dislikes (the thumb down). Left out where the phase doesn't allow disliking. */
  dislikes?: number;
  /** Comments (the speech bubble), as on a Most liked row. Left out in a side panel, which lists them below. */
  comments?: number;
  /** Its own words (each count read with its word), over `reactionCountsLabels`. */
  labels?: Partial<ReactionCountsLabels>;
}

const COUNTS: {key: keyof ReactionCountsLabels; icon: LucideIcon}[] = [
  {key: 'likes', icon: ThumbsUp},
  {key: 'dislikes', icon: ThumbsDown},
  {key: 'comments', icon: MessageCircle}
];

/**
 * How people reacted to an input: likes, dislikes and comments, each a 16px icon and its number (the prototype's
 * `.pj-react` in the side panel and `.pj-mlrow__st` on Most liked). Display-only: each count is read with its word
 * (`labels`, "128 likes"), the icons and the bare number are hidden. Numbers follow the locale. Not in Figma.
 */
export function ReactionCounts({labels, className, style, ...props}: ReactionCountsProps) {
  const l = mergeLabels(reactionCountsLabels, labels);
  const number = useNumberFormatter();
  return (
    <span className={clsx('gv-reaction-counts', className)} style={style}>
      {COUNTS.filter(c => props[c.key] !== undefined).map(({key, icon: Icon}) => {
        const count = props[key] as number;
        const n = number.format(count);
        return (
          <span key={key} className="gv-reaction-counts__item">
            <Icon aria-hidden size={16} />
            <span aria-hidden>{n}</span>
            <VisuallyHidden>{l[key](count, n)}</VisuallyHidden>
          </span>
        );
      })}
    </span>
  );
}
