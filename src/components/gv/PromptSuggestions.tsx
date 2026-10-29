'use client';
import type {ReactNode} from 'react';
import {Button as RACButton} from 'react-aria-components/Button';
import {Sparkles} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './PromptSuggestions.css';

/** One opening: a prompt to send as it is, or (in the preview) something the assistant could do. */
export interface PromptSuggestion {
  /** Tells the suggestion apart; handed back when it is pressed. */
  id: string;
  /** The prompt, as you would type it ("Make the summary shorter"); in the preview, what it could do. */
  label: string;
  /** The preview's line under the label ("German for every page in one go, ready to check."). */
  description?: string;
  /** A 16 Lucide icon, `aria-hidden`. @default ✦ (Sparkles) for a prompt; none in the preview */
  icon?: ReactNode;
}

export interface PromptSuggestionsProps extends PlacementProps {
  /** The heading over the rows: "What should it change?", "What should change in title page?". */
  heading: string;
  /** The heading's level. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** The rows, in order: two or three, or one (Generate on an empty report). */
  items: PromptSuggestion[];
  /** Called with the row pressed. The page sends its label as the prompt, or opens what it starts (Generate). */
  onAction?: (id: string) => void;
  /**
   * `prompts`: ✦ rows you press to ask. `preview`: what the assistant could do where it is switched off: icon, title
   * and description rows that can't be pressed, then the `footer`.
   *
   * @default 'prompts'
   */
  kind?: 'prompts' | 'preview';
  /** Under a hairline after the rows: in the preview, "Not switched on for this platform." and its button. */
  footer?: ReactNode;
  /** The rows can't be pressed (the assistant is working). */
  isDisabled?: boolean;
}

/**
 * Prompt suggestions: the openings above the composer, under a heading. Each row is a prompt to send as it is
 * (✦, 36 tall, a soft fill under the pointer); the page changes the rows to match what the chat is about (the whole
 * report, one block, an empty report's single Generate). Where the assistant is switched off, `kind="preview"`
 * shows what it could do (icon, title, description) without letting you press it, and a `footer` that says why and
 * whom to ask. Put it in a `ChatThread`'s `openings`. Not in Figma.
 *
 * ```tsx
 * <PromptSuggestions heading="What should it change?" onAction={id => send(byId[id].label)}
 *   items={[{id: 'short', label: 'Make the summary shorter'}, {id: 'who', label: 'Explain who took part'}]} />
 * ```
 */
export function PromptSuggestions({
  heading, headingLevel = 3, items, onAction, kind = 'prompts', footer, isDisabled, className, style
}: PromptSuggestionsProps) {
  const Heading = `h${headingLevel}` as const;
  const isPreview = kind === 'preview';
  return (
    <section className={clsx('gv-prompt-suggestions', className)} style={style} data-kind={kind}>
      <Heading className="gv-prompt-suggestions__heading">{heading}</Heading>
      <ul className="gv-prompt-suggestions__list">
        {items.map(item => (
          <li key={item.id}>
            {isPreview ? (
              <div className="gv-prompt-suggestions__preview">
                {item.icon && <span className="gv-prompt-suggestions__icon" aria-hidden>{item.icon}</span>}
                <span className="gv-prompt-suggestions__words">
                  <span className="gv-prompt-suggestions__label">{item.label}</span>
                  {item.description && <span className="gv-prompt-suggestions__description">{item.description}</span>}
                </span>
              </div>
            ) : (
              <RACButton className="gv-prompt-suggestions__row" isDisabled={isDisabled} onPress={() => onAction?.(item.id)}>
                <span className="gv-prompt-suggestions__icon" aria-hidden>{item.icon ?? <Sparkles />}</span>
                <span className="gv-prompt-suggestions__label">{item.label}</span>
              </RACButton>
            )}
          </li>
        ))}
      </ul>
      {footer && <div className="gv-prompt-suggestions__footer">{footer}</div>}
    </section>
  );
}
