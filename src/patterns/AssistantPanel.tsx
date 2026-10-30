'use client';
import type {ReactNode} from 'react';
import {Button} from '../components/Button';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import {SidePanel} from '../components/gv/SidePanel';
import {ChatThread, chatThreadLabels, type ChatThreadLabels} from '../components/gv/ChatThread';
import {ItemChip} from '../components/gv/ItemChip';
import {PromptComposer, promptComposerLabels, type PromptComposerLabels} from '../components/gv/PromptComposer';
import {PromptSuggestions, type PromptSuggestion} from '../components/gv/PromptSuggestions';

/** The words Assistant panel says itself (docs/API.md rule 11), and those of the thread and composer it draws. */
export interface AssistantPanelLabels extends ChatThreadLabels, PromptComposerLabels {
  /** The column's name. */
  panel: string;
  /** The openings' heading about the whole report. */
  heading: string;
  /** The openings' heading while the chat is about one block, given the block's name as the outline shows it (the English default lowers its case). */
  scopedHeading: (name: string) => string;
  /** An empty report's one opening. */
  generate: string;
  /** The preview's heading, while the assistant is switched off. */
  previewHeading: string;
  /** Why it is off, and the button that asks for it. */
  notSwitchedOn: string;
  askAccountManager: string;
  /** The × on the scope chip: what removing it does. */
  clearScope: string;
}

/** Assistant panel's English words; a page passes its own over them with `labels`. */
export const assistantPanelLabels: AssistantPanelLabels = {
  ...chatThreadLabels,
  ...promptComposerLabels,
  panel: 'Assistant',
  heading: 'What should it change?',
  scopedHeading: name => `What should change in ${name.toLowerCase()}?`,
  generate: 'Generate a report from the folder',
  previewHeading: 'What the assistant could do here',
  notSwitchedOn: 'Not switched on for this platform.',
  askAccountManager: 'Ask your account manager',
  clearScope: 'Ask about the whole report'
};

/** The block the chat is about: its name and its kind icon. */
export interface AssistantPanelScope {
  /** The block's name as the outline shows it ("Title page", "By the numbers"). */
  label: string;
  /** Its kind, as a Lucide icon, `aria-hidden`. */
  icon?: ReactNode;
}

export interface AssistantPanelProps extends PlacementProps {
  /** The turns, oldest first: `ChatMessage`s, and a `ChatProgress` last while it works. */
  children?: ReactNode;
  /**
   * Whether the assistant is switched on for the platform. Off: the thread and composer step back to 45%, and the
   * openings become a preview of what it could do (`previewItems`) with "Ask your account manager".
   *
   * @default true
   */
  isEnabled?: boolean;
  /** The report has no blocks yet: the one opening is "Generate a report from the folder" (`onGenerate`). */
  isEmpty?: boolean;
  /** The assistant is working (a reply, a generate run): openings hidden, composer locked, send becomes stop. */
  isWorking?: boolean;
  /** The block the chat is about: a chip in the composer and its own heading. None: the whole report. */
  scope?: AssistantPanelScope;
  /** The scope chip's × calls this: back to the whole report. */
  onClearScope?: () => void;
  /** The prompts to offer, for the report or for the scoped block: two or three. */
  suggestions?: PromptSuggestion[];
  /** Called with the suggestion pressed; the page sends its label. */
  onSuggestion?: (id: string) => void;
  /** Called by an empty report's Generate (the page confirms in a Modal, then runs). */
  onGenerate?: () => void;
  /** What the assistant could do here, shown while it is off: icon, title, description. */
  previewItems?: PromptSuggestion[];
  /** Called by "Ask your account manager". */
  onAskAccountManager?: () => void;
  /** Called with the prompt on Enter or send. */
  onSend: (prompt: string) => void;
  /** The stop square calls this. */
  onStop?: () => void;
  /** The paperclip: the page opens its picker (the prototype only toasts). No paperclip without it. */
  onAttach?: () => void;
  /** Its own words, over `assistantPanelLabels`. */
  labels?: Partial<AssistantPanelLabels>;
}

/**
 * Assistant panel: the report builder's assistant, the resting state of the report's end column. An inline Side
 * panel with no head (it can't be closed), holding a Chat thread: the turns, the openings at the foot ("What should
 * it change?" and two or three prompts) and the Prompt composer under them. Five states from its props: on, off
 * (`isEnabled={false}`: a preview of what it could do and "Ask your account manager"), an empty report
 * (`isEmpty`: Generate), generating (`isWorking` with a Chat progress as the last turn) and scoped to a block
 * (`scope`: a chip in the composer and that block's prompts). The page owns the conversation and what each prompt
 * does. Not in Figma.
 *
 * ```tsx
 * <AssistantPanel onSend={ask} isWorking={working} onStop={stop} suggestions={prompts} onSuggestion={pick}
 *   scope={selected && {label: selected.name, icon: KIND_ICON[selected.kind]}} onClearScope={() => setSelected(null)}>
 *   {turns.map(t => <ChatMessage key={t.id} from={t.from} change={t.change} onUndo={t.undo}>{t.text}</ChatMessage>)}
 * </AssistantPanel>
 * ```
 */
export function AssistantPanel({
  children, isEnabled = true, isEmpty, isWorking, scope, onClearScope, suggestions = [], onSuggestion, onGenerate,
  previewItems = [], onAskAccountManager, onSend, onStop, onAttach, labels, className, style
}: AssistantPanelProps) {
  const l = mergeLabels(assistantPanelLabels, labels);
  const isOff = !isEnabled;

  const openings = isOff ? (
    <PromptSuggestions kind="preview" heading={l.previewHeading} items={previewItems}
      footer={<>
        <span>{l.notSwitchedOn}</span>
        <Button variant="secondary" size={32} onPress={onAskAccountManager}>{l.askAccountManager}</Button>
      </>} />
  ) : isWorking ? null : isEmpty ? (
    <PromptSuggestions heading={l.heading} items={[{id: 'generate', label: l.generate}]} onAction={() => onGenerate?.()} />
  ) : suggestions.length ? (
    <PromptSuggestions heading={scope ? l.scopedHeading(scope.label) : l.heading} items={suggestions}
      onAction={id => onSuggestion?.(id)} />
  ) : null;

  const context = scope && !isOff ? (
    <ItemChip variant="filled" icon={scope.icon} label={scope.label} onRemove={onClearScope}
      labels={{remove: () => l.clearScope}} />
  ) : undefined;

  return (
    <SidePanel isInline showHead={false} label={l.panel} className={className} style={style}>
      <ChatThread isDisabled={isOff} openings={openings} labels={l}
        composer={
          <PromptComposer onSend={onSend} isWorking={isWorking} onStop={onStop} isDisabled={isOff} context={context}
            onAttach={onAttach} labels={l} />
        }>
        {children}
      </ChatThread>
    </SidePanel>
  );
}
