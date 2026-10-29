'use client';
import {Toolbar} from 'react-aria-components';
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
        <Bold aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Italic" isSelected={italic} onChange={onItalicChange}>
        <Italic aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="List" isSelected={list} onChange={onListChange}>
        <List aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Link" onPress={onLink}>
        <LinkIcon aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Image" onPress={onImage}>
        <Image aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Video" onPress={onVideo}>
        <SquarePlay aria-hidden size={16} />
      </EditorTool>
    </Toolbar>
  );
}
