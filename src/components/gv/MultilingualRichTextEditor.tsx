'use client';
import clsx from 'clsx';
import {RichTextEditor, richTextEditorLabels, type RichTextEditorLabels, type RichTextEditorProps} from './RichTextEditor';
import {
  multilingualFieldLabels,
  useMultilingualField,
  type MultilingualFieldLabels,
  type MultilingualFieldProps
} from './MultilingualTextField';

/** The words a multilingual rich text editor says itself: the field's (switcher, errors) and the editor's (toolbar). */
export interface MultilingualRichTextEditorLabels extends MultilingualFieldLabels, RichTextEditorLabels {}

/** A multilingual rich text editor's English words; a page passes its own over them with `labels`. */
export const multilingualRichTextEditorLabels: MultilingualRichTextEditorLabels = {
  ...multilingualFieldLabels,
  ...richTextEditorLabels
};

export interface MultilingualRichTextEditorProps
  extends Omit<MultilingualFieldProps, 'labels'>,
    Omit<RichTextEditorProps, 'value' | 'onChange' | 'aria-label' | 'labels' | 'description' | 'errorMessage' | 'isInvalid'
      | 'isDisabled' | 'lang' | 'dir'> {
  /** Its own words (the switcher's, the errors it writes, the toolbar's), over `multilingualRichTextEditorLabels`. */
  labels?: Partial<MultilingualRichTextEditorLabels>;
}

/**
 * A multilingual rich text editor: a description or a page's text in each of the platform's languages, the language
 * switcher over the editor, as the platform's multilingual description fields. The Rich text editor, one Multiloc for
 * every language: the editor takes the shown language's `lang` and direction, and draws the description, the error
 * and the disabled state itself. Not in Figma.
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
  isDisabled,
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
      data-disabled={isDisabled || undefined}
      data-invalid={field.isInvalid || undefined}>
      {field.head}
      <RichTextEditor {...editor} labels={labels} aria-label={field.inputLabel} value={field.text} onChange={field.setText}
        lang={field.lang} dir={field.dir} description={description} isInvalid={field.isInvalid} errorMessage={field.error}
        isDisabled={isDisabled} />
    </div>
  );
}
