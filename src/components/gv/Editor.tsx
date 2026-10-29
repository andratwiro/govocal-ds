'use client';
import {TextField, TextArea} from 'react-aria-components';
import {EditorToolbar, type EditorToolbarProps} from './EditorToolbar';
import './Editor.css';

export interface EditorProps extends EditorToolbarProps {
  /** Accessible name for the text area, since there's no visible label. */
  'aria-label'?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Editor({
  'aria-label': ariaLabel = 'Description',
  placeholder = 'Add a short description',
  value,
  onChange,
  ...toolbar
}: EditorProps) {
  return (
    <div className="gv-editor">
      <EditorToolbar {...toolbar} />
      <TextField aria-label={ariaLabel} value={value} onChange={onChange} className="gv-editor__field">
        <TextArea placeholder={placeholder} className="gv-editor__area" />
      </TextField>
    </div>
  );
}
