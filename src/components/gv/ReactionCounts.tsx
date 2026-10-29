'use client';
import {MessageCircle, ThumbsDown, ThumbsUp, type LucideIcon} from 'lucide-react';
import {useLocale, VisuallyHidden} from 'react-aria-components';
import './ReactionCounts.css';

export interface ReactionCountsProps {
  /** Likes (the thumb up). */
  likes: number;
  /** Dislikes (the thumb down). Left out where the phase doesn't allow disliking. */
  dislikes?: number;
  /** Comments (the speech bubble), as on a Most liked row. Left out in a side panel, which lists them below. */
  comments?: number;
}

const COUNTS: {key: keyof ReactionCountsProps; icon: LucideIcon; one: string; many: string}[] = [
  {key: 'likes', icon: ThumbsUp, one: 'like', many: 'likes'},
  {key: 'dislikes', icon: ThumbsDown, one: 'dislike', many: 'dislikes'},
  {key: 'comments', icon: MessageCircle, one: 'comment', many: 'comments'}
];

/**
 * How people reacted to an input: likes, dislikes and comments, each a 16px icon and its number (the prototype's
 * `.pj-react` in the side panel and `.pj-mlrow__st` on Most liked). Display-only: each count is read with its word
 * ("128 likes"), the icons are hidden. Numbers follow the locale. Not in Figma.
 */
export function ReactionCounts(props: ReactionCountsProps) {
  const {locale} = useLocale();
  const format = new Intl.NumberFormat(locale);
  return (
    <span className="gv-reaction-counts">
      {COUNTS.filter(c => props[c.key] !== undefined).map(({key, icon: Icon, one, many}) => {
        const n = props[key] as number;
        return (
          <span key={key} className="gv-reaction-counts__item">
            <Icon aria-hidden size={16} />
            {format.format(n)}
            <VisuallyHidden> {n === 1 ? one : many}</VisuallyHidden>
          </span>
        );
      })}
    </span>
  );
}
