'use client';
import {TextField, TextArea} from 'react-aria-components';
import {RichTextToolbar, type RichTextToolbarProps} from './RichTextToolbar';
import './RichTextEditor.css';

export interface RichTextEditorProps extends RichTextToolbarProps {
  /** Accessible name for the text area, since there's no visible label. */
  'aria-label'?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function RichTextEditor({
  'aria-label': ariaLabel = 'Description',
  placeholder = 'Add a short description',
  value,
  onChange,
  ...toolbar
}: RichTextEditorProps) {
  return (
    <div className="gv-editor">
      <RichTextToolbar {...toolbar} />
      <TextField aria-label={ariaLabel} value={value} onChange={onChange} className="gv-editor__field">
        <TextArea placeholder={placeholder} className="gv-editor__area" />
      </TextField>
    </div>
  );
}
