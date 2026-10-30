'use client';
import type {ReactNode} from 'react';
import {Button, Separator, ToggleButton, ToggleButtonGroup, Toolbar} from 'react-aria-components';
import {Bold, Italic, List, Link as LinkIcon, Image, SquarePlay} from 'lucide-react';
import {RichTextToolbarButton} from './RichTextToolbarButton';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './RichTextToolbar.css';

/** The words Rich text toolbar says itself (docs/API.md rule 11): its name and each button's. Rich text editor and
 * Notification email take the same keys and hand them on. */
export interface RichTextToolbarLabels {
  /** The toolbar's name. */
  toolbar: string;
  /** The Bold button's name. */
  bold: string;
  /** The Italic button's name. */
  italic: string;
  /** The List button's name. */
  list: string;
  /** The link button's name. */
  link: string;
  /** The image button's name. */
  image: string;
  /** The video button's name. */
  video: string;
  /** The block-type segment's name (floating variant). */
  blockType: string;
  /** The segment's Section: a numbered heading that feeds the document's contents. */
  section: string;
  /** The segment's Sub-section: a smaller heading under a section. */
  subsection: string;
  /** The segment's Text: paragraphs and lists. */
  text: string;
}

/** Rich text toolbar's English words; a page passes its own over them with `labels`. */
export const richTextToolbarLabels: RichTextToolbarLabels = {
  toolbar: 'Formatting',
  bold: 'Bold',
  italic: 'Italic',
  list: 'List',
  link: 'Add link',
  image: 'Add image',
  video: 'Embed video',
  blockType: 'Block type',
  section: 'Section',
  subsection: 'Sub-section',
  text: 'Text'
};

/** What a text block is, in the floating toolbar's segment: a section heading, a sub-section heading or text. */
export type RichTextBlockType = 'section' | 'subsection' | 'text';

export interface RichTextToolbarProps extends PlacementProps {
  /**
   * `docked`: the strip on top of a Rich text editor (Figma). `floating`: a card over a text block on a document's
   * page (a Block frame's `toolbar`), with the block-type segment first, then Bold, Italic, List and link, then
   * `actions`; image and video show only when their handler is given. @default 'docked'
   */
  variant?: 'docked' | 'floating';
  /** The block's type, pressed in the segment. The segment shows when `onBlockTypeChange` is given. */
  blockType?: RichTextBlockType;
  /** Fires with the type picked in the segment (Section · Sub-section · Text). */
  onBlockTypeChange?: (type: RichTextBlockType) => void;
  /** Buttons after the formatting, past a hairline: Ask the assistant, Delete (24 Icon buttons). */
  actions?: ReactNode;
  /** Whether Bold is on (its button is pressed). */
  isBold?: boolean;
  /** Fires when Bold is pressed, with the new state. */
  onBoldChange?: (v: boolean) => void;
  /** Whether Italic is on (its button is pressed). */
  isItalic?: boolean;
  /** Fires when Italic is pressed, with the new state. */
  onItalicChange?: (v: boolean) => void;
  /** Whether List is on (its button is pressed). */
  isList?: boolean;
  /** Fires when List is pressed, with the new state. */
  onListChange?: (v: boolean) => void;
  /** Fires when Add link is pressed; open the page's link picker. */
  onLink?: () => void;
  /** Fires when Add image is pressed; open the page's image picker. */
  onImage?: () => void;
  /** Fires when Embed video is pressed; open the page's video picker. */
  onVideo?: () => void;
  /** Its own words (the toolbar's and each button's name), over `richTextToolbarLabels`. */
  labels?: Partial<RichTextToolbarLabels>;
}

/**
 * The rich-text toolbar (Figma "Rich text toolbar"): bold, italic and list hold a
 * pressed state; link, image and video are plain buttons that open a picker
 * (as toggles they stayed pressed after a click). 25 tall with its bottom
 * line; icons at 14 with a 1.75 stroke, as Figma's 14 icons and the prototype.
 *
 * `variant="floating"` is the report builder's format bar over a text block (not in Figma): a white card with the
 * block-type segment (Section · Sub-section · Text), the formatting, and `actions` (Ask the assistant, Delete).
 */
export function RichTextToolbar({
  variant = 'docked',
  blockType,
  onBlockTypeChange,
  actions,
  isBold,
  onBoldChange,
  isItalic,
  onItalicChange,
  isList,
  onListChange,
  onLink,
  onImage,
  onVideo,
  labels,
  className,
  style
}: RichTextToolbarProps) {
  const l = mergeLabels(richTextToolbarLabels, labels);
  const floating = variant === 'floating';
  return (
    <Toolbar aria-label={l.toolbar} className={clsx('gv-editor-toolbar', className)} style={style} data-variant={variant}>
      {floating && onBlockTypeChange && (
        <>
          <ToggleButtonGroup aria-label={l.blockType} selectionMode="single" disallowEmptySelection
            selectedKeys={blockType ? [blockType] : []} className="gv-editor-toolbar__segment"
            onSelectionChange={keys => { const [k] = [...keys]; if (k) onBlockTypeChange(k as RichTextBlockType); }}>
            {(['section', 'subsection', 'text'] as const).map(t => (
              <ToggleButton key={t} id={t} className="gv-editor-toolbar__type">{l[t]}</ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Separator orientation="vertical" className="gv-editor-toolbar__rule" />
        </>
      )}
      <RichTextToolbarButton aria-label={l.bold} isSelected={isBold} onChange={onBoldChange}>
        <Bold aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label={l.italic} isSelected={isItalic} onChange={onItalicChange}>
        <Italic aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label={l.list} isSelected={isList} onChange={onListChange}>
        <List aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      {(!floating || onLink) && (
        <Button aria-label={l.link} onPress={onLink} className="gv-editor-tool">
          <LinkIcon aria-hidden size={14} strokeWidth={1.75} />
        </Button>
      )}
      {(!floating || onImage) && (
        <Button aria-label={l.image} onPress={onImage} className="gv-editor-tool">
          <Image aria-hidden size={14} strokeWidth={1.75} />
        </Button>
      )}
      {(!floating || onVideo) && (
        <Button aria-label={l.video} onPress={onVideo} className="gv-editor-tool">
          <SquarePlay aria-hidden size={14} strokeWidth={1.75} />
        </Button>
      )}
      {actions != null && (
        <>
          <Separator orientation="vertical" className="gv-editor-toolbar__rule" />
          {actions}
        </>
      )}
    </Toolbar>
  );
}
