'use client';
import clsx from 'clsx';
import {Description} from '../Form';
import {RichTextEditor, richTextEditorLabels, type RichTextEditorLabels, type RichTextEditorProps} from './RichTextEditor';
import {
  multilingualFieldLabels,
  useMultilingualField,
  type MultilingualFieldLabels,
  type MultilingualFieldProps
} from './MultilingualTextField';
import './MultilingualRichTextEditor.css';

/** The words a multilingual rich text editor says itself: the field's (switcher, errors) and the editor's (toolbar). */
export interface MultilingualRichTextEditorLabels extends MultilingualFieldLabels, RichTextEditorLabels {}

/** A multilingual rich text editor's English words; a page passes its own over them with `labels`. */
export const multilingualRichTextEditorLabels: MultilingualRichTextEditorLabels = {
  ...multilingualFieldLabels,
  ...richTextEditorLabels
};

export interface MultilingualRichTextEditorProps
  extends Omit<MultilingualFieldProps, 'isDisabled' | 'labels'>,
    Omit<RichTextEditorProps, 'value' | 'onChange' | 'aria-label' | 'labels'> {
  /** Its own words (the switcher's, the errors it writes, the toolbar's), over `multilingualRichTextEditorLabels`. */
  labels?: Partial<MultilingualRichTextEditorLabels>;
}

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
  labels,
  ...editor
}: MultilingualRichTextEditorProps) {
  const field = useMultilingualField({locales, value, defaultValue, onChange, locale, defaultLocale, onLocaleChange,
    showLocaleSwitcher, label, 'aria-label': ariaLabel, errorMessage, isRequired, isInvalid, labels});
  return (
    <div
      className={clsx('gv-multilingual-field', 'gv-multilingual-rich-text', className)}
      style={style}
      data-invalid={field.isInvalid || undefined}
      data-dir={field.dir}>
      {field.head}
      <RichTextEditor {...editor} labels={labels} aria-label={field.inputLabel} value={field.text} onChange={field.setText} />
      {description && !field.isInvalid && <Description>{description}</Description>}
      {field.isInvalid && field.error && (
        <span className="react-aria-FieldError gv-base-field-error gv-multilingual-field__error" role="alert">
          {field.error}
        </span>
      )}
    </div>
  );
}
