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
  toolbar: string;
  bold: string;
  italic: string;
  list: string;
  link: string;
  image: string;
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
  isBold?: boolean;
  onBoldChange?: (v: boolean) => void;
  isItalic?: boolean;
  onItalicChange?: (v: boolean) => void;
  isList?: boolean;
  onListChange?: (v: boolean) => void;
  onLink?: () => void;
  onImage?: () => void;
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
