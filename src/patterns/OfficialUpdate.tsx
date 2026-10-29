'use client';
import {useId, useState, type FormEvent, type KeyboardEvent, type ReactNode} from 'react';
import {TextArea as AriaTextArea, TextField as AriaTextField} from 'react-aria-components/TextField';
import {Button} from '../components/Button';
import {TextField} from '../components/TextField';
import {Modal, modalLabels, type ModalLabels} from '../components/gv/Modal';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './OfficialUpdate.css';

/** The words the Official update parts say themselves (docs/API.md rule 11), one object for all four, with the bulk
 * Modal's ×. */
export interface OfficialUpdateLabels extends ModalLabels {
  /** What an update is called: a posted one's key, the words field's name, the bulk modal's title. */
  title: string;
  /** Who posted it when no name was chosen. */
  team: string;
  /** The words field's hint. */
  placeholder: string;
  /** The name field's name and hint. */
  name: string;
  namePlaceholder: string;
  /** The form's own button, and the bulk modal's. */
  publish: string;
  send: string;
  /** The bulk modal's footer, given how many records the update goes to. */
  reach: CountLabel;
}

/** The Official update parts' English words; a page passes its own over them with `labels`. */
export const officialUpdateLabels: OfficialUpdateLabels = {
  ...modalLabels,
  title: 'Official update',
  team: 'The project team',
  placeholder: 'Add an official update',
  name: 'Name shown with the update',
  namePlaceholder: 'Choose how people see your name',
  publish: 'Publish',
  send: 'Send',
  reach: (count, n) => `This update goes to ${n} ${count === 1 ? 'idea' : 'ideas'}`
};

export interface PostedUpdate {
  id: string;
  text: ReactNode;
  /** The name people see with it. @default `labels.team` ("The project team") */
  by?: string;
  /** When, as shown ("12 October 2026"). */
  date?: string;
}

export interface OfficialUpdateDraft {
  text: string;
  /** The name people see with the update; empty = `labels.team` ("The project team"). */
  name: string;
}

export interface OfficialUpdateProps extends PlacementProps {
  /** The updates posted so far, newest first. */
  updates?: PostedUpdate[];
  /** Publish was pressed with words in the field: apply it at once, with an Undo toast. The form clears. No form
   * when absent. */
  onPublish?: (draft: OfficialUpdateDraft) => void;
  /** Its own words, over `officialUpdateLabels`; handed on to the posted updates and the form. */
  labels?: Partial<OfficialUpdateLabels>;
}

/**
 * Official update: the team's public answer to a record, in the Manage tab's Side panel (the prototype's `.pj-upd`
 * and `.pj-update`). The updates posted so far on the stage grey, newest first, each named "Official update · The
 * project team" (or the name chosen), then the form to post another. In bulk, `OfficialUpdateForm` goes in a Modal
 * with the Send in its footer. Not in Figma.
 */
export function OfficialUpdate({updates = [], onPublish, labels, className, style}: OfficialUpdateProps) {
  return (
    <div className={clsx('gv-official-update', className)} style={style}>
      {updates.map(u => <PostedOfficialUpdate key={u.id} {...u} labels={labels} />)}
      {onPublish && <OfficialUpdateForm onPublish={onPublish} labels={labels} />}
    </div>
  );
}

/** One posted update: "Official update · name · date" in Small secondary over its words. */
export interface PostedOfficialUpdateProps extends Omit<PostedUpdate, 'id'>, PlacementProps {
  /** Its own words ("Official update", "The project team"), over `officialUpdateLabels`. */
  labels?: Partial<OfficialUpdateLabels>;
}

export function PostedOfficialUpdate({text, by, date, labels, className, style}: PostedOfficialUpdateProps) {
  const l = mergeLabels(officialUpdateLabels, labels);
  const key = [l.title, by || l.team, date].filter(Boolean).join(' · ');
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
  autoFocus?: boolean;
  /** Its own words (the fields' names and hints, Publish), over `officialUpdateLabels`. */
  labels?: Partial<OfficialUpdateLabels>;
}

/** The form: the update's words (a field that grows), the name people see, and Publish (on once there are words).
 * ⌘/Ctrl + Enter in the words sends it too. */
export function OfficialUpdateForm({onPublish, id, onDraftChange, autoFocus, labels, className, style}: OfficialUpdateFormProps) {
  const l = mergeLabels(officialUpdateLabels, labels);
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
      <AriaTextField aria-label={l.title} value={draft.text} onChange={text => change({...draft, text})}
        autoFocus={autoFocus} className="react-aria-TextField gv-base-text-field">
        <AriaTextArea rows={3} placeholder={l.placeholder} onKeyDown={onKeyDown}
          className="react-aria-TextArea gv-base-text-area inset gv-official-update__words" />
      </AriaTextField>
      <TextField aria-label={l.name} placeholder={l.namePlaceholder}
        value={draft.name} onChange={name => change({...draft, name})} />
      {!id && (
        <div className="gv-official-update__actions">
          <Button type="submit" variant="secondary" isDisabled={!draft.text.trim()}>{l.publish}</Button>
        </div>
      )}
    </form>
  );
}

/** `className` and `style` place the modal's dialog box, as Modal's do. */
export interface BulkOfficialUpdateProps extends PlacementProps {
  /** How many records the update goes to, said with `labels.reach` ("This update goes to 2 ideas"). */
  count: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Send was pressed with words in the field: apply it at once, with an Undo toast. The modal closes. */
  onSend: (draft: OfficialUpdateDraft) => void;
  /** Its own words (the title, the reach, Send, the form's), over `officialUpdateLabels`. Name the records:
   * `labels={{reach: (count, n) => ...}}`. */
  labels?: Partial<OfficialUpdateLabels>;
}

/** The Selection bar's "Official update": the form in a Modal, its footer saying how many records it goes to, then
 * Send. A modal, not the prototype's popover: it is a long-text form (DECISIONS.md). */
export function BulkOfficialUpdate({count, isOpen, onOpenChange, onSend, labels, className, style}: BulkOfficialUpdateProps) {
  const l = mergeLabels(officialUpdateLabels, labels);
  const id = useId();
  const [ready, setReady] = useState(false);
  const n = useNumberFormatter().format(count);
  return (
    <Modal title={l.title} labels={l} className={className} style={style} isOpen={isOpen} onOpenChange={o => { onOpenChange(o); if (!o) setReady(false); }}
      footer={(
        <>
          <span className="gv-official-update__reach">{l.reach(count, n)}</span>
          <Button type="submit" form={id} isDisabled={!ready}>{l.send}</Button>
        </>
      )}>
      <OfficialUpdateForm id={id} autoFocus labels={l} onDraftChange={d => setReady(!!d.text.trim())}
        onPublish={draft => { onSend(draft); onOpenChange(false); setReady(false); }} />
    </Modal>
  );
}
