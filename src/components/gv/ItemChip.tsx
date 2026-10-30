'use client';
import type {ReactNode} from 'react';
import {Button as RACButton} from 'react-aria-components/Button';
import {ArrowRight, Plus, X} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {VisuallyHidden} from './VisuallyHidden';
import './ItemChip.css';

/** The words Item chip says itself (docs/API.md rule 11). */
export interface ItemChipLabels {
  /** The ×'s name, given the chip's label. A page names what removing it does: "Ask about the whole report". */
  remove: (label: string) => string;
  /** An added item, given its label ("Added: Upcoming events"); the chip shows a +. */
  added: (label: string) => string;
  /** A removed item, given its label ("Removed: Reach"); the chip is dashed and struck through. */
  removed: (label: string) => string;
  /** A renamed item, given its old and new labels; the chip shows the old struck through, then the new. */
  renamed: (previousLabel: string, label: string) => string;
}

/** Item chip's English words; a page passes its own over them with `labels`. */
export const itemChipLabels: ItemChipLabels = {
  remove: label => `Remove ${label}`,
  added: label => `Added: ${label}`,
  removed: label => `Removed: ${label}`,
  renamed: (previousLabel, label) => `Renamed from ${previousLabel} to ${label}`
};

/** What happened to the item in a change: shown by the chip's look and read before its label. */
export type ItemChipStatus = 'added' | 'removed' | 'renamed';

export interface ItemChipProps extends PlacementProps {
  /** The item's name, as the document calls it ("Title page", "Votes per cycle lane route"). Long names truncate. */
  label: string;
  /** The item's kind, as a Lucide icon (`<BarChart3 aria-hidden />`): drawn 12 or 14, in the icon grey. */
  icon?: ReactNode;
  /**
   * The look, by where it sits:
   * - `outlined`: a 28 pill with a border, 12 type (a history entry's changed items);
   * - `filled`: a 24 grey tag, radius 6, 12 type (a composer's context and attachments);
   * - `quiet`: no chrome, small and secondary (the line above a message that names the item it asked about).
   *
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled' | 'quiet';
  /**
   * What a change did to the item: `added` (+ and the accent edge), `removed` (dashed, struck through, and not
   * pressable: it is gone) or `renamed` (the old name struck through, then `label`). None: a plain mention.
   */
  status?: ItemChipStatus;
  /** A renamed item's old name, struck through before `label`. */
  previousLabel?: string;
  /**
   * Makes the chip a button that reveals the item (scrolls to it, selects it). A removed item can't be pressed. The
   * button's name is the chip's words, status included.
   */
  onPress?: () => void;
  /** Shows an × after the label that calls this. Name what it does with `labels.remove`. */
  onRemove?: () => void;
  /** The × and the press, off. */
  isDisabled?: boolean;
  /** Its own words, over `itemChipLabels`. */
  labels?: Partial<ItemChipLabels>;
}

/**
 * Item chip: a named thing from the document (a section, a chart, a question), with its kind icon. It names what a
 * message asked about, what a composer is scoped to, and what a version changed; pressed, it reveals the item.
 *
 * - Static by default: a span whose words a screen reader reads with the status first ("Removed: Reach").
 * - `onPress` makes the label a button; `onRemove` adds an × beside it (two buttons, never one inside the other).
 * - `status` draws a change: added (+, accent edge), removed (dashed, struck through), renamed (old → new).
 *
 * `className` and `style` place it (a margin, a max width); they never paint it. Not in Figma.
 *
 * ```tsx
 * <ItemChip variant="filled" icon={<FileText aria-hidden />} label="Title page" onRemove={clearScope}
 *   labels={{remove: () => 'Ask about the whole report'}} />
 * <ItemChip icon={<BarChart3 aria-hidden />} label="Votes per route" status="added" onPress={() => reveal(id)} />
 * ```
 */
export function ItemChip({
  label, icon, variant = 'outlined', status, previousLabel, onPress, onRemove, isDisabled, labels, className, style
}: ItemChipProps) {
  const l = mergeLabels(itemChipLabels, labels);
  const isRenamed = status === 'renamed' && previousLabel != null;
  // What a screen reader hears: the status in words, since the look (a +, a strike) says it only to the eye.
  const spoken = isRenamed ? l.renamed(previousLabel, label)
    : status === 'added' ? l.added(label)
    : status === 'removed' ? l.removed(label)
    : null;
  const words = (
    <>
      {status === 'added' && <Plus aria-hidden className="gv-item-chip__mark" />}
      {icon && <span className="gv-item-chip__icon" aria-hidden>{icon}</span>}
      <span className="gv-item-chip__label" aria-hidden={spoken ? true : undefined}>
        {isRenamed && <><s className="gv-item-chip__old">{previousLabel}</s><ArrowRight aria-hidden className="gv-item-chip__arrow" /></>}
        {label}
      </span>
      {spoken && <VisuallyHidden>{spoken}</VisuallyHidden>}
    </>
  );
  const canPress = onPress && status !== 'removed';
  return (
    <span
      className={clsx('gv-item-chip', className)}
      style={style}
      data-variant={variant}
      data-status={status}
      data-pressable={canPress || undefined}
      data-removable={onRemove ? true : undefined}
      data-disabled={isDisabled || undefined}
      title={isRenamed ? `${previousLabel} → ${label}` : label}>
      {canPress ? (
        <RACButton className="gv-item-chip__press" onPress={onPress} isDisabled={isDisabled}>{words}</RACButton>
      ) : (
        <span className="gv-item-chip__body">{words}</span>
      )}
      {onRemove && (
        <RACButton className="gv-item-chip__remove" aria-label={l.remove(label)} onPress={onRemove} isDisabled={isDisabled}>
          <X aria-hidden />
        </RACButton>
      )}
    </span>
  );
}
