'use client';
import {Button, Toolbar} from 'react-aria-components';
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
}

/** Rich text toolbar's English words; a page passes its own over them with `labels`. */
export const richTextToolbarLabels: RichTextToolbarLabels = {
  toolbar: 'Formatting',
  bold: 'Bold',
  italic: 'Italic',
  list: 'List',
  link: 'Add link',
  image: 'Add image',
  video: 'Embed video'
};

export interface RichTextToolbarProps extends PlacementProps {
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
 */
export function RichTextToolbar({
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
  return (
    <Toolbar aria-label={l.toolbar} className={clsx('gv-editor-toolbar', className)} style={style}>
      <RichTextToolbarButton aria-label={l.bold} isSelected={isBold} onChange={onBoldChange}>
        <Bold aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label={l.italic} isSelected={isItalic} onChange={onItalicChange}>
        <Italic aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label={l.list} isSelected={isList} onChange={onListChange}>
        <List aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <Button aria-label={l.link} onPress={onLink} className="gv-editor-tool">
        <LinkIcon aria-hidden size={14} strokeWidth={1.75} />
      </Button>
      <Button aria-label={l.image} onPress={onImage} className="gv-editor-tool">
        <Image aria-hidden size={14} strokeWidth={1.75} />
      </Button>
      <Button aria-label={l.video} onPress={onVideo} className="gv-editor-tool">
        <SquarePlay aria-hidden size={14} strokeWidth={1.75} />
      </Button>
    </Toolbar>
  );
}
