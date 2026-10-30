'use client';
import {TextField, TextArea} from 'react-aria-components';
import {RichTextToolbar, richTextToolbarLabels, type RichTextToolbarLabels, type RichTextToolbarProps} from './RichTextToolbar';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './RichTextEditor.css';

/** The words Rich text editor says itself (docs/API.md rule 11), with the toolbar's, which it hands on. */
export interface RichTextEditorLabels extends RichTextToolbarLabels {
  /** The text area's name when no `aria-label` is given. */
  field: string;
  /** The text area's hint when no `placeholder` is given. */
  placeholder: string;
}

/** Rich text editor's English words; a page passes its own over them with `labels`. */
export const richTextEditorLabels: RichTextEditorLabels = {
  ...richTextToolbarLabels,
  field: 'Description',
  placeholder: 'Add a short description'
};

export interface RichTextEditorProps
  extends Omit<RichTextToolbarProps, 'labels' | 'variant' | 'blockType' | 'onBlockTypeChange' | 'actions'>, PlacementProps {
  /** Accessible name for the text area, since there's no visible label. @default `labels.field` ("Description") */
  'aria-label'?: string;
  /** @default `labels.placeholder` ("Add a short description") */
  placeholder?: string;
  /** The text in the area (controlled). */
  value?: string;
  /** Fires as the text changes, with the new text. */
  onChange?: (value: string) => void;
  /**
   * `boxed`: the bordered editor with its toolbar on top (Figma). `inline`: the text typed straight on a document's
   * page (a report's text block), with no border and no toolbar (a Block frame floats the Rich text toolbar), in the
   * type around it, growing with its text; the placeholder shows while it is empty. @default 'boxed'
   */
  variant?: 'boxed' | 'inline';
  /** Its own words (the text area's name and hint, the toolbar's), over `richTextEditorLabels`. */
  labels?: Partial<RichTextEditorLabels>;
}

/**
 * A box to write a longer text with formatting buttons above it, for a description, an email or a policy page. For now
 * the buttons only light up when pressed: the screen's code applies the formatting. For plain text use Text field's
 * TextArea; for one text per language, Multilingual rich text editor. `variant="inline"`
 * types the text straight on a document's page, with no border or toolbar (not in Figma).
 */
export function RichTextEditor({
  'aria-label': ariaLabel,
  placeholder,
  value,
  onChange,
  labels,
  className,
  style,
  variant = 'boxed',
  ...toolbar
}: RichTextEditorProps) {
  const l = mergeLabels(richTextEditorLabels, labels);
  return (
    <div className={clsx('gv-editor', className)} style={style} data-variant={variant}>
      {variant === 'boxed' && <RichTextToolbar {...toolbar} labels={l} />}
      <TextField aria-label={ariaLabel ?? l.field} value={value} onChange={onChange} className="gv-editor__field">
        <TextArea placeholder={placeholder ?? l.placeholder} className="gv-editor__area" rows={variant === 'inline' ? 1 : undefined} />
      </TextField>
    </div>
  );
}
