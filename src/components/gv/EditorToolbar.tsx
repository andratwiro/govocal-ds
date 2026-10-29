'use client';
import {Button, Toolbar} from 'react-aria-components';
import {Bold, Italic, List, Link as LinkIcon, Image, SquarePlay} from 'lucide-react';
import {EditorTool} from './EditorTool';
import './EditorToolbar.css';

export interface EditorToolbarProps {
  bold?: boolean;
  onBoldChange?: (v: boolean) => void;
  italic?: boolean;
  onItalicChange?: (v: boolean) => void;
  list?: boolean;
  onListChange?: (v: boolean) => void;
  onLink?: () => void;
  onImage?: () => void;
  onVideo?: () => void;
}

/**
 * The rich-text toolbar (Figma "Editor toolbar"): bold, italic and list hold a
 * pressed state; link, image and video are plain buttons that open a picker
 * (as toggles they stayed pressed after a click). 25 tall with its bottom
 * line; icons at 14 with a 1.75 stroke, as Figma's 14 icons and the prototype.
 */
export function EditorToolbar({
  bold,
  onBoldChange,
  italic,
  onItalicChange,
  list,
  onListChange,
  onLink,
  onImage,
  onVideo
}: EditorToolbarProps) {
  return (
    <Toolbar aria-label="Formatting" className="gv-editor-toolbar">
      <EditorTool aria-label="Bold" isSelected={bold} onChange={onBoldChange}>
        <Bold aria-hidden size={14} strokeWidth={1.75} />
      </EditorTool>
      <EditorTool aria-label="Italic" isSelected={italic} onChange={onItalicChange}>
        <Italic aria-hidden size={14} strokeWidth={1.75} />
      </EditorTool>
      <EditorTool aria-label="List" isSelected={list} onChange={onListChange}>
        <List aria-hidden size={14} strokeWidth={1.75} />
      </EditorTool>
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
