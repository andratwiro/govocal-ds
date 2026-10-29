'use client';
import {useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode} from 'react';
import {Button as RACButton} from 'react-aria-components/Button';
import {FileTrigger} from 'react-aria-components/FileTrigger';
import {TextArea, TextField} from 'react-aria-components/TextField';
import {ArrowUp, CircleAlert, FileText, Paperclip, Square} from 'lucide-react';
import clsx from 'clsx';
import {Tooltip, TooltipTrigger} from '../Tooltip';
import type {PlacementProps} from '../className';
import {useControlledState} from '../useControlledState';
import {IconButton} from './IconButton';
import {ItemChip} from './ItemChip';
import './PromptComposer.css';

/** The words Prompt composer says itself (docs/API.md rule 11). */
export interface PromptComposerLabels {
  /** The field's name. */
  field: string;
  /** The field's placeholder. */
  placeholder: string;
  /** The round button: send when there is a prompt, stop while the assistant works. */
  send: string;
  stop: string;
  /** The paperclip. */
  attach: string;
  /** An attachment's ×, given its name. */
  removeAttachment: (name: string) => string;
  /** Read and shown while files are dragged over the box. */
  drop: string;
}

/** Prompt composer's English words; a page passes its own over them with `labels`. */
export const promptComposerLabels: PromptComposerLabels = {
  field: 'Ask the assistant',
  placeholder: 'Ask the assistant…',
  send: 'Send',
  stop: 'Stop',
  attach: 'Attach a file',
  removeAttachment: name => `Remove ${name}`,
  drop: 'Drop to attach'
};

/** A file attached to the prompt, shown as a chip above the field. */
export interface PromptComposerAttachment {
  id: string;
  /** The file's name. */
  name: string;
  /** Its kind, as a Lucide icon. @default a document */
  icon?: ReactNode;
}

export interface PromptComposerProps extends PlacementProps {
  /** The prompt (controlled). Left out, the composer keeps its own and clears it on send. */
  value?: string;
  /** The prompt it starts with, when the page doesn't control it. @default '' */
  defaultValue?: string;
  /** Called as the prompt changes, and with '' after a send. */
  onChange?: (value: string) => void;
  /** Called with the prompt (trimmed) on Enter or the send button. The field clears and keeps focus. */
  onSend: (prompt: string) => void;
  /** The assistant is working: the field locks, and the round button turns into a stop square. */
  isWorking?: boolean;
  /** The stop square calls this; focus goes back to the field. */
  onStop?: () => void;
  /** Can't be used (the assistant is off): field and buttons off, the box at 45%. */
  isDisabled?: boolean;
  /** What the prompt is about, first in the chip row: a filled Item chip with an × that clears it. */
  context?: ReactNode;
  /** Files attached to the prompt, as chips after the context. */
  attachments?: PromptComposerAttachment[];
  /** An attachment's × calls this. */
  onRemoveAttachment?: (id: string) => void;
  /**
   * Files picked with the paperclip or dropped on the box. With it, the paperclip opens the file picker and the box
   * takes drops (lit while files are over it). The page checks them, adds them to `attachments`, or says what's wrong
   * with `fileError`.
   */
  onFiles?: (files: File[]) => void;
  /** Without `onFiles`: the paperclip calls this instead (the page opens its own picker). No paperclip with neither. */
  onAttach?: () => void;
  /** The file types the picker offers, as MIME types or extensions. */
  acceptedFileTypes?: string[];
  /** What was wrong with the last files: a danger line under the chips ("This file is over 25 MB."). */
  fileError?: ReactNode;
  /** Its own words, over `promptComposerLabels`. */
  labels?: Partial<PromptComposerLabels>;
}

/**
 * Prompt composer: where you write to the assistant. One rounded box: a chip row (what the prompt is about, then the
 * attached files), a field that grows from 56 to 160 tall, the paperclip at the start and a round send button at
 * the end: grey while there is nothing to send, ink when there is, a stop square while the assistant works (the
 * field locks then, keeping focus). Enter sends; Shift+Enter makes a new line. After a send the field clears and
 * keeps focus.
 *
 * States: empty, ready, working, with context, with attachment, drag-over (with `onFiles`), file error
 * (`fileError`), disabled. Dock it under a `ChatThread` (its `composer` slot). `className` and `style` place it;
 * they never paint it. Not in Figma.
 *
 * ```tsx
 * <PromptComposer onSend={ask} isWorking={working} onStop={stop}
 *   context={scope && <ItemChip variant="filled" icon={scope.icon} label={scope.name} onRemove={clearScope}
 *     labels={{remove: () => 'Ask about the whole report'}} />} />
 * ```
 */
export function PromptComposer({
  value, defaultValue = '', onChange, onSend, isWorking, onStop, isDisabled, context, attachments, onRemoveAttachment,
  onFiles, onAttach, acceptedFileTypes, fileError, labels, className, style
}: PromptComposerProps) {
  const l = {...promptComposerLabels, ...labels};
  const [text, setText] = useControlledState(value, defaultValue, onChange);
  const [isDropTarget, setDropTarget] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const isReady = !isWorking && !isDisabled && text.trim() !== '';

  const send = () => {
    if (!isReady) return;
    onSend(text.trim());
    setText('');
    field.current?.focus();
  };
  const stop = () => {
    onStop?.();
    field.current?.focus();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    // Enter sends; Shift+Enter is a new line; an IME composing a character keeps its Enter.
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    send();
  };

  // Files dragged over the box: lit while they are over it; dropped, handed to the page.
  const hasFiles = (e: DragEvent) => !!onFiles && !isDisabled && Array.from(e.dataTransfer.types).includes('Files');
  const dropProps = onFiles ? {
    onDragEnter: (e: DragEvent) => { if (hasFiles(e)) { e.preventDefault(); setDropTarget(true); } },
    onDragOver: (e: DragEvent) => { if (hasFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropTarget(false);
    },
    onDrop: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDropTarget(false);
      onFiles(Array.from(e.dataTransfer.files));
    }
  } : {};

  const paperclip = (
    <IconButton aria-label={l.attach} isDisabled={isDisabled || isWorking} onPress={onFiles ? undefined : onAttach}>
      <Paperclip aria-hidden />
    </IconButton>
  );
  const hasChips = !!context || !!attachments?.length;

  return (
    <div
      className={clsx('gv-prompt-composer', className)}
      style={style}
      data-working={isWorking || undefined}
      data-disabled={isDisabled || undefined}
      data-drop-target={isDropTarget || undefined}
      {...dropProps}>
      {hasChips && (
        <div className="gv-prompt-composer__chips">
          {context}
          {attachments?.map(file => (
            <ItemChip key={file.id} variant="filled" label={file.name} icon={file.icon ?? <FileText aria-hidden />}
              isDisabled={isDisabled} onRemove={onRemoveAttachment ? () => onRemoveAttachment(file.id) : undefined}
              labels={{remove: l.removeAttachment}} />
          ))}
        </div>
      )}
      {fileError && (
        <p className="gv-prompt-composer__error" role="alert">
          <CircleAlert aria-hidden />
          <span>{fileError}</span>
        </p>
      )}
      <TextField
        className="gv-prompt-composer__field"
        aria-label={l.field}
        value={text}
        onChange={setText}
        isDisabled={isDisabled}
        isReadOnly={isWorking}>
        <TextArea ref={field} className="gv-prompt-composer__input" placeholder={l.placeholder} rows={1} onKeyDown={onKeyDown} />
      </TextField>
      <div className="gv-prompt-composer__bar">
        {onFiles ? (
          <FileTrigger onSelect={files => files && onFiles(Array.from(files))} acceptedFileTypes={acceptedFileTypes}
            allowsMultiple>
            {paperclip}
          </FileTrigger>
        ) : onAttach ? paperclip : <span />}
        <TooltipTrigger>
          <RACButton
            className="gv-prompt-composer__send"
            aria-label={isWorking ? l.stop : l.send}
            data-ready={isReady || undefined}
            data-stop={isWorking || undefined}
            isDisabled={isDisabled || (!isWorking && !isReady)}
            onPress={isWorking ? stop : send}>
            {isWorking ? <Square aria-hidden /> : <ArrowUp aria-hidden />}
          </RACButton>
          <Tooltip placement="top">{isWorking ? l.stop : l.send}</Tooltip>
        </TooltipTrigger>
      </div>
      {isDropTarget && <div className="gv-prompt-composer__drop" aria-hidden>{l.drop}</div>}
    </div>
  );
}
