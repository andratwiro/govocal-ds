import type {ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {X} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './Badge.css';

/** The words Badge says itself (docs/API.md rule 11). */
export interface BadgeLabels {
  /** The remove ×'s name, given the badge's words when they are text. */
  remove: (name?: string) => string;
}

/** Badge's English words; a page passes its own over them with `labels`. */
export const badgeLabels: BadgeLabels = {remove: name => (name ? `Remove ${name}` : 'Remove')};

export interface BadgeProps extends PlacementProps {
  /** A small leading icon (Figma "Icon: Yes/No"), e.g. `<Lightbulb aria-hidden size={14} />`. */
  icon?: ReactNode;
  /** The badge's words (or a number). */
  children: ReactNode;
  /**
   * Figma draws the filled grey pill ("Idea", "6 questions"). The others are the prototype's, not in Figma yet:
   * `outlined` for a quiet status or a flag ("Viewed", "Beta", "you"), `value` for a value someone chose, shown on
   * what it belongs to ("Harbour", "2 tags" on a setup step), `count` for a number beside a title ("2,184").
   *
   * @default 'filled'
   */
  variant?: 'filled' | 'outlined' | 'value' | 'count';
  /**
   * Adds a × that removes the badge (a tag on an input); the badge takes the outlined look. Several removable tags
   * together are a `TagPicker`, which adds arrow keys between them and Backspace.
   */
  onRemove?: () => void;
  /** Its own words (the ×'s name: "Remove <children>"), over `badgeLabels`. */
  labels?: Partial<BadgeLabels>;
}

/** A small rounded label, e.g. a content type, a status, a chosen value or a count. Display-only unless removable. */
export function Badge({icon, children, variant = 'filled', onRemove, labels, className, style}: BadgeProps) {
  const name = mergeLabels(badgeLabels, labels)
    .remove(typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);
  return (
    <span className={clsx('gv-pill', className)} style={style} data-variant={onRemove ? 'outlined' : variant} data-removable={onRemove ? true : undefined}>
      {icon}
      <span className="gv-pill__label">{children}</span>
      {onRemove && (
        <Button className="gv-pill__remove" aria-label={name} onPress={onRemove}>
          <X aria-hidden size={12} />
        </Button>
      )}
    </span>
  );
}
