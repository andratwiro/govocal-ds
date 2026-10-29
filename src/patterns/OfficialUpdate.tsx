'use client';
import {useId, useState, type FormEvent, type KeyboardEvent, type ReactNode} from 'react';
import {useLocale} from 'react-aria-components';
import {TextArea as AriaTextArea, TextField as AriaTextField} from 'react-aria-components/TextField';
import {Button} from '../components/Button';
import {TextField} from '../components/TextField';
import {Modal} from '../components/gv/Modal';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './OfficialUpdate.css';

export interface PostedUpdate {
  id: string;
  text: ReactNode;
  /** The name people see with it. @default 'The project team' */
  by?: string;
  /** When, as shown ("12 October 2026"). */
  date?: string;
}

export interface OfficialUpdateDraft {
  text: string;
  /** The name people see with the update; empty = "The project team". */
  name: string;
}

export interface OfficialUpdateProps extends PlacementProps {
  /** The updates posted so far, newest first. */
  updates?: PostedUpdate[];
  /** Publish was pressed with words in the field: apply it at once, with an Undo toast. The form clears. No form
   * when absent. */
  onPublish?: (draft: OfficialUpdateDraft) => void;
}

/**
 * Official update: the team's public answer to a record, in the Manage tab's Side panel (the prototype's `.pj-upd`
 * and `.pj-update`). The updates posted so far on the stage grey, newest first, each named "Official update · The
 * project team" (or the name chosen), then the form to post another. In bulk, `OfficialUpdateForm` goes in a Modal
 * with the Send in its footer. Not in Figma.
 */
export function OfficialUpdate({updates = [], onPublish, className, style}: OfficialUpdateProps) {
  return (
    <div className={clsx('gv-official-update', className)} style={style}>
      {updates.map(u => <PostedOfficialUpdate key={u.id} {...u} />)}
      {onPublish && <OfficialUpdateForm onPublish={onPublish} />}
    </div>
  );
}

/** One posted update: "Official update · name · date" in Small secondary over its words. */
export interface PostedOfficialUpdateProps extends Omit<PostedUpdate, 'id'>, PlacementProps {}

export function PostedOfficialUpdate({text, by, date, className, style}: PostedOfficialUpdateProps) {
  const key = ['Official update', by || 'The project team', date].filter(Boolean).join(' · ');
  return (
    <article className={clsx('gv-official-update__posted', className)} style={style} aria-label={key}>
      <p className="gv-official-update__key">{key}</p>
      <div className="gv-official-update__text">{text}</div>
    </article>
  );
}

export interface OfficialUpdateFormProps extends PlacementProps {
  /** The form was sent with words in the field. It clears itself. */
  onPublish: (draft: OfficialUpdateDraft) => void;
  /**
   * The form's id. With it, the form draws no button of its own: put the submit button where it belongs (a Modal's
   * footer) with `type="submit"` and `form={id}`.
   */
  id?: string;
  /** Called as the words change, e.g. to turn that outside button on. */
  onDraftChange?: (draft: OfficialUpdateDraft) => void;
  /** @default 'Publish' */
  submitLabel?: string;
  autoFocus?: boolean;
}

/** The form: the update's words (a field that grows), the name people see, and Publish (on once there are words).
 * ⌘/Ctrl + Enter in the words sends it too. */
export function OfficialUpdateForm({onPublish, id, onDraftChange, submitLabel = 'Publish', autoFocus, className, style}: OfficialUpdateFormProps) {
  const [draft, setDraft] = useState<OfficialUpdateDraft>({text: '', name: ''});
  const change = (next: OfficialUpdateDraft) => {
    setDraft(next);
    onDraftChange?.(next);
  };
  const send = () => {
    if (!draft.text.trim()) return;
    onPublish({text: draft.text.trim(), name: draft.name.trim()});
    change({text: '', name: draft.name});
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  };
  return (
    <form id={id} className={clsx('gv-official-update__form', className)} style={style} onSubmit={onSubmit}>
      {/* The system TextArea always draws a visible label; this field is named by its place, so it is built from
          the same parts (and the system field's look) with an aria-label. */}
      <AriaTextField aria-label="Official update" value={draft.text} onChange={text => change({...draft, text})}
        autoFocus={autoFocus} className="react-aria-TextField gv-base-text-field">
        <AriaTextArea rows={3} placeholder="Add an official update" onKeyDown={onKeyDown}
          className="react-aria-TextArea gv-base-text-area inset gv-official-update__words" />
      </AriaTextField>
      <TextField aria-label="Name shown with the update" placeholder="Choose how people see your name"
        value={draft.name} onChange={name => change({...draft, name})} />
      {!id && (
        <div className="gv-official-update__actions">
          <Button type="submit" variant="secondary" isDisabled={!draft.text.trim()}>{submitLabel}</Button>
        </div>
      )}
    </form>
  );
}

/** `className` and `style` place the modal's dialog box, as Modal's do. */
export interface BulkOfficialUpdateProps extends PlacementProps {
  /** How many records the update goes to. */
  count: number;
  /** What one record is called. @default 'idea' */
  itemName?: string;
  /** What several are called. @default itemName + 's' */
  itemsName?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Send was pressed with words in the field: apply it at once, with an Undo toast. The modal closes. */
  onSend: (draft: OfficialUpdateDraft) => void;
}

/** The Selection bar's "Official update": the form in a Modal, its footer saying how many records it goes to, then
 * Send. A modal, not the prototype's popover: it is a long-text form (DECISIONS.md). */
export function BulkOfficialUpdate({count, itemName = 'idea', itemsName = `${itemName}s`, isOpen, onOpenChange, onSend, className, style}: BulkOfficialUpdateProps) {
  const id = useId();
  const [ready, setReady] = useState(false);
  const {locale} = useLocale();
  const n = new Intl.NumberFormat(locale).format(count);
  return (
    <Modal title="Official update" className={className} style={style} isOpen={isOpen} onOpenChange={o => { onOpenChange(o); if (!o) setReady(false); }}
      footer={(
        <>
          <span className="gv-official-update__reach">This update goes to {n} {count === 1 ? itemName : itemsName}</span>
          <Button type="submit" form={id} isDisabled={!ready}>Send</Button>
        </>
      )}>
      <OfficialUpdateForm id={id} autoFocus onDraftChange={d => setReady(!!d.text.trim())}
        onPublish={draft => { onSend(draft); onOpenChange(false); setReady(false); }} />
    </Modal>
  );
}
