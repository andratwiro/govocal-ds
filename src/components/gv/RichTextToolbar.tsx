'use client';
import {Button, Toolbar} from 'react-aria-components';
import {Bold, Italic, List, Link as LinkIcon, Image, SquarePlay} from 'lucide-react';
import {RichTextToolbarButton} from './RichTextToolbarButton';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './RichTextToolbar.css';

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
  className,
  style
}: RichTextToolbarProps) {
  return (
    <Toolbar aria-label="Formatting" className={clsx('gv-editor-toolbar', className)} style={style}>
      <RichTextToolbarButton aria-label="Bold" isSelected={isBold} onChange={onBoldChange}>
        <Bold aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="Italic" isSelected={isItalic} onChange={onItalicChange}>
        <Italic aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="List" isSelected={isList} onChange={onListChange}>
        <List aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <Button aria-label="Add link" onPress={onLink} className="gv-editor-tool">
        <LinkIcon aria-hidden size={14} strokeWidth={1.75} />
      </Button>
      <Button aria-label="Add image" onPress={onImage} className="gv-editor-tool">
        <Image aria-hidden size={14} strokeWidth={1.75} />
      </Button>
      <Button aria-label="Embed video" onPress={onVideo} className="gv-editor-tool">
        <SquarePlay aria-hidden size={14} strokeWidth={1.75} />
      </Button>
    </Toolbar>
  );
}
