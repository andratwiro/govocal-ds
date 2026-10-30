'use client';
import {useEffect, useRef, type KeyboardEvent, type ReactNode} from 'react';
import {Button as RACButton} from 'react-aria-components/Button';
import {Toolbar} from 'react-aria-components/Toolbar';
import {ArrowDown, ArrowUp, Copy, Plus, Sparkles, Trash2} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {Tooltip, TooltipTrigger} from '../Tooltip';
import {IconButton} from './IconButton';
import './BlockFrame.css';

/** The words Block frame says itself (docs/API.md rule 11). */
export interface BlockFrameLabels {
  /** The toolbar's name, given the block's label ("By the numbers: block tools"). */
  toolbar: (label: string) => string;
  /** The ↑ button's name. */
  moveUp: string;
  /** The ↓ button's name. */
  moveDown: string;
  /** The duplicate button's name. */
  duplicate: string;
  /** The delete button's name. */
  delete: string;
  /** The ✦ mark's name: the assistant made or last changed this block. */
  aiMade: string;
}

/** Block frame's English words; a page passes its own over them with `labels`. */
export const blockFrameLabels: BlockFrameLabels = {
  toolbar: label => `${label}: block tools`,
  moveUp: 'Move up',
  moveDown: 'Move down',
  duplicate: 'Duplicate',
  delete: 'Delete',
  aiMade: 'Made by the assistant'
};

export interface BlockFrameProps extends PlacementProps {
  /** The block's content, drawn as it will print: the frame adds nothing inside it, so nothing shifts on select. */
  children?: ReactNode;
  /** The block's name, on its tag ("By the numbers", "Executive summary"). */
  label: string;
  /** The block's kind, as a Lucide icon on the tag (`<Hash aria-hidden />`). */
  icon?: ReactNode;
  /** The selected block: the selected frame, the filled tag and the toolbar. */
  isSelected?: boolean;
  /** Fires when the block is pressed, or Enter or Space is pressed on it, while it isn't selected. */
  onSelect?: () => void;
  /** Fires on Esc anywhere in the selected block; focus goes back to the block. */
  onDeselect?: () => void;
  /** Draws the hover look from elsewhere (its row in the outline is under the pointer). */
  isHighlighted?: boolean;
  /** Fires as the pointer enters and leaves the block, so the outline can highlight its row. */
  onHoverChange?: (isHovering: boolean) => void;
  /** A block that stays in place (a title page, the contents): the toolbar keeps only Delete. */
  isPinned?: boolean;
  /** The assistant made or last changed this block: a ✦ mark on the frame's end edge. */
  isAiMade?: boolean;
  /** The block is being dragged: dimmed in place. */
  isDragging?: boolean;
  /** Shows ↑. Off at the top (`canMoveUp`). */
  onMoveUp?: () => void;
  /** Shows ↓. Off at the bottom (`canMoveDown`). */
  onMoveDown?: () => void;
  /** Whether ↑ can be pressed. @default true */
  canMoveUp?: boolean;
  /** Whether ↓ can be pressed. @default true */
  canMoveDown?: boolean;
  /** Shows ⧉. */
  onDuplicate?: () => void;
  /** Shows the bin. */
  onDelete?: () => void;
  /**
   * Replaces the built-in tools with your own, floated in the same place (centred over a text block): a floating
   * Rich text toolbar, which carries its own Delete.
   */
  toolbar?: ReactNode;
  /** The block's name for screen readers. @default `label` */
  'aria-label'?: string;
  /** The element's `id` (the outline scrolls to it). */
  id?: string;
  /** Its own words, over `blockFrameLabels`. */
  labels?: Partial<BlockFrameLabels>;
}

/**
 * Block frame: the hover and selection chrome around one block of a document being edited (a report's chart, its
 * key figures, a text section): a frame, a tag naming the block, and a floating toolbar to move, duplicate or delete
 * it. Use it on a Page stage's blocks. A card someone opens is a Card; a row someone picks in a list is a List row.
 *
 * - Hover: a grey frame and tag. Selected: the selected frame, a filled tag off the top start, and the toolbar off
 *   the top end. The tag and the toolbar sit outside the content, so the text never shifts.
 * - The block is a focusable group: Enter or Space selects it, Esc steps back out; the toolbar's arrow keys move
 *   between its tools.
 * - `isPinned` keeps only Delete; `isAiMade` adds the ✦ mark; `toolbar` swaps in a text block's format bar.
 *
 * `className` and `style` place it; they never paint it. Not in Figma.
 *
 * ```tsx
 * <BlockFrame label="By the numbers" icon={<Hash aria-hidden />} isSelected={selected === id}
 *   onSelect={() => setSelected(id)} onDeselect={() => setSelected(null)}
 *   onMoveUp={() => move(id, -1)} onMoveDown={() => move(id, 1)} canMoveUp={i > 0}
 *   onDuplicate={() => duplicate(id)} onDelete={() => remove(id)}>
 *   <KeyFigures … />
 * </BlockFrame>
 * ```
 */
export function BlockFrame({
  children, label, icon, isSelected, onSelect, onDeselect, isHighlighted, onHoverChange, isPinned, isAiMade,
  isDragging, onMoveUp, onMoveDown, canMoveUp = true, canMoveDown = true, onDuplicate, onDelete, toolbar,
  'aria-label': ariaLabel, id, labels, className, style
}: BlockFrameProps) {
  const l = mergeLabels(blockFrameLabels, labels);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSelected && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect?.();
    }
  };
  // Esc from anywhere inside. Listen on the window, on the way down: a focused tool shows its tooltip, and React Aria's
  // tooltip takes Esc at the document and stops it, so a listener on the block would need a second Esc.
  const ref = useRef<HTMLDivElement>(null);
  const deselect = useRef(onDeselect);
  deselect.current = onDeselect;
  const canDeselect = !!onDeselect;
  useEffect(() => {
    if (!isSelected || !canDeselect) return;
    const onEsc = (e: globalThis.KeyboardEvent) => {
      const block = ref.current;
      if (e.key !== 'Escape' || !block?.contains(block.ownerDocument.activeElement)) return;
      e.preventDefault();
      e.stopPropagation();
      deselect.current?.();
      block.focus();
    };
    const win = ref.current?.ownerDocument.defaultView ?? window;
    win.addEventListener('keydown', onEsc, true);
    return () => win.removeEventListener('keydown', onEsc, true);
  }, [isSelected, canDeselect]);
  const tool = (name: string, onPress: () => void, glyph: ReactNode, isDisabled = false) => (
    <TooltipTrigger>
      <IconButton size={24} aria-label={name} onPress={onPress} isDisabled={isDisabled}>{glyph}</IconButton>
      <Tooltip>{name}</Tooltip>
    </TooltipTrigger>
  );
  const tools = toolbar ?? (
    <Toolbar aria-label={l.toolbar(label)} className="gv-block-frame__tools">
      {!isPinned && onMoveUp && tool(l.moveUp, onMoveUp, <ArrowUp aria-hidden />, !canMoveUp)}
      {!isPinned && onMoveDown && tool(l.moveDown, onMoveDown, <ArrowDown aria-hidden />, !canMoveDown)}
      {!isPinned && onDuplicate && tool(l.duplicate, onDuplicate, <Copy aria-hidden />)}
      {onDelete && tool(l.delete, onDelete, <Trash2 aria-hidden />)}
    </Toolbar>
  );
  return (
    <div ref={ref} id={id} className={clsx('gv-block-frame', className)} style={style} role="group" tabIndex={0}
      aria-label={ariaLabel ?? label} aria-current={isSelected || undefined}
      data-selected={isSelected || undefined} data-highlighted={isHighlighted || undefined}
      data-dragging={isDragging || undefined} data-custom-toolbar={toolbar != null || undefined}
      onClickCapture={() => { if (!isSelected) onSelect?.(); }} onKeyDown={onKeyDown}
      onPointerEnter={onHoverChange && (() => onHoverChange(true))}
      onPointerLeave={onHoverChange && (() => onHoverChange(false))}>
      <span className="gv-block-frame__tag" aria-hidden>
        {icon && <span className="gv-block-frame__icon">{icon}</span>}
        <span className="gv-block-frame__label">{label}</span>
      </span>
      {isSelected && <div className="gv-block-frame__bar">{tools}</div>}
      {isAiMade && (
        <span className="gv-block-frame__ai" role="img" aria-label={l.aiMade} title={l.aiMade}>
          <Sparkles aria-hidden />
        </span>
      )}
      {children}
    </div>
  );
}

/** The words Block insert line says itself (docs/API.md rule 11). */
export interface BlockInsertLineLabels {
  /** The + button's name (and its tooltip). */
  insert: string;
}

/** Block insert line's English words; a page passes its own over them with `labels`. */
export const blockInsertLineLabels: BlockInsertLineLabels = {
  insert: 'Add widget here'
};

export interface BlockInsertLineProps extends PlacementProps {
  /** Fires when its + is pressed: open the library to insert a block at this place. */
  onInsert: () => void;
  /** This is where the next block goes (the library is open for it): the line in the accent, always shown. */
  isTarget?: boolean;
  /** Shown at rest, not only on hover and focus (the end of a document). */
  isAlwaysVisible?: boolean;
  /** Its own words, over `blockInsertLineLabels`. */
  labels?: Partial<BlockInsertLineLabels>;
}

/**
 * The line between two blocks where a new one can go: a hairline with a + pill in the middle, shown on hover and
 * focus, and while it is the target. Part of Block frame.
 */
export function BlockInsertLine({onInsert, isTarget, isAlwaysVisible, labels, className, style}: BlockInsertLineProps) {
  const l = mergeLabels(blockInsertLineLabels, labels);
  return (
    <div className={clsx('gv-block-insert', className)} style={style} data-target={isTarget || undefined}
      data-visible={isAlwaysVisible || undefined}>
      <TooltipTrigger>
        <RACButton className="gv-block-insert__button" onPress={onInsert} aria-label={l.insert}>
          <Plus aria-hidden />
        </RACButton>
        <Tooltip>{l.insert}</Tooltip>
      </TooltipTrigger>
    </div>
  );
}
