'use client';
import clsx from 'clsx';
import {Description} from '../Form';
import {RichTextEditor, type RichTextEditorProps} from './RichTextEditor';
import {useMultilingualField, type MultilingualFieldProps} from './MultilingualTextField';
import './MultilingualRichTextEditor.css';

export interface MultilingualRichTextEditorProps
  extends Omit<MultilingualFieldProps, 'isDisabled'>,
    Omit<RichTextEditorProps, 'value' | 'onChange' | 'aria-label'> {}

/**
 * A multilingual rich text editor: a description or a page's text in each of the platform's languages, the language
 * switcher over the editor, as the platform's multilingual description fields. The Rich text editor, one Multiloc for
 * every language. Not in Figma.
 */
export function MultilingualRichTextEditor({
  locales,
  value,
  defaultValue,
  onChange,
  locale,
  defaultLocale,
  onLocaleChange,
  showLocaleSwitcher,
  label,
  'aria-label': ariaLabel,
  description,
  errorMessage,
  isRequired,
  isInvalid,
  className,
  style,
  ...editor
}: MultilingualRichTextEditorProps) {
  const field = useMultilingualField({locales, value, defaultValue, onChange, locale, defaultLocale, onLocaleChange,
    showLocaleSwitcher, label, 'aria-label': ariaLabel, errorMessage, isRequired, isInvalid});
  return (
    <div
      className={clsx('gv-multilingual-field', 'gv-multilingual-rich-text', className)}
      style={style}
      data-invalid={field.isInvalid || undefined}
      data-dir={field.dir}>
      {field.head}
      <RichTextEditor {...editor} aria-label={field.inputLabel} value={field.text} onChange={field.setText} />
      {description && !field.isInvalid && <Description>{description}</Description>}
      {field.isInvalid && field.error && (
        <span className="react-aria-FieldError gv-multilingual-field__error" role="alert">
          {field.error}
        </span>
      )}
    </div>
  );
}
