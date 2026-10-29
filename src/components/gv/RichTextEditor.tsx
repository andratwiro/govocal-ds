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

export interface RichTextEditorProps extends Omit<RichTextToolbarProps, 'labels'>, PlacementProps {
  /** Accessible name for the text area, since there's no visible label. @default `labels.field` ("Description") */
  'aria-label'?: string;
  /** @default `labels.placeholder` ("Add a short description") */
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Its own words (the text area's name and hint, the toolbar's), over `richTextEditorLabels`. */
  labels?: Partial<RichTextEditorLabels>;
}

export function RichTextEditor({
  'aria-label': ariaLabel,
  placeholder,
  value,
  onChange,
  labels,
  className,
  style,
  ...toolbar
}: RichTextEditorProps) {
  const l = mergeLabels(richTextEditorLabels, labels);
  return (
    <div className={clsx('gv-editor', className)} style={style}>
      <RichTextToolbar {...toolbar} labels={l} />
      <TextField aria-label={ariaLabel ?? l.field} value={value} onChange={onChange} className="gv-editor__field">
        <TextArea placeholder={placeholder ?? l.placeholder} className="gv-editor__area" />
      </TextField>
    </div>
  );
}
