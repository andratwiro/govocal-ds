'use client';
import {useId, useRef, useState, type KeyboardEvent, type ReactNode, type Ref} from 'react';
import {Button as AriaButton} from 'react-aria-components/Button';
import {TextArea as AriaTextArea, TextField as AriaTextField} from 'react-aria-components/TextField';
import {Tab, TabList, TabPanel, Tabs} from '../components/Tabs';
import {Button} from '../components/Button';
import {Avatar} from '../components/gv/Avatar';
import {TriangleAlert, X} from 'lucide-react';
// The composer's field is the system field (its look from TextField.css), named by an aria-label: the system TextArea
// always draws a visible label.
import '../components/TextField.css';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './CommentThread.css';

/** The words Comment composer says itself (docs/API.md rule 11). Comment thread takes the same keys. */
export interface CommentComposerLabels {
  /** The line over the field while replying, given the author answered, and its cancel's name. */
  replying: (author: string) => string;
  /** The ×'s name on the "Replying to" line. */
  cancelReply: string;
  /** The field's name and hint: public, a reply (given the author), internal. */
  field: string;
  /** The field's hint for a public comment. */
  placeholder: string;
  /** The field's name and hint while replying, given the author answered. */
  replyTo: (author: string) => string;
  /** The field's name on the internal conversation. */
  internalField: string;
  /** The field's hint on the internal conversation. */
  internalPlaceholder: string;
  /** The Post button's name. */
  post: string;
}

/** Comment composer's English words; a page passes its own over them with `labels`. */
export const commentComposerLabels: CommentComposerLabels = {
  replying: author => `Replying to ${author}`,
  cancelReply: 'Cancel reply',
  field: 'Comment',
  placeholder: 'Reply as the project team',
  replyTo: author => `Reply to ${author}`,
  internalField: 'Internal comment',
  internalPlaceholder: 'This comment is not visible to regular users',
  post: 'Post'
};

/** The words Comment thread says itself (docs/API.md rule 11), with the composer's, which it hands on. */
export interface CommentThreadLabels extends CommentComposerLabels {
  /** The heading and the tabs, given how many comments each holds. */
  comments: CountLabel;
  /** The internal tab's name, given how many comments it holds ("Internal conversation (2)"). */
  internal: CountLabel;
  /** The tab list's name. */
  conversation: string;
  /** The lists' names, and what an empty one says. */
  commentsList: string;
  /** The internal comments list's name. */
  internalList: string;
  /** What the public list says when it is empty. */
  noComments: string;
  /** What the internal list says when it is empty. */
  noInternal: string;
  /** A reply list's name, given the author answered. */
  repliesTo: (author: string) => string;
  /** The mark on a comment the team has not seen. */
  new: string;
  /** The content warning line, given what the check found. */
  warning: (found: string) => string;
  /** A comment's actions; Reply is named with `replyTo`, Delete with `deleteComment` (given the author). */
  reply: string;
  /** The button that dismisses a comment's content warning. */
  dismissWarning: string;
  /** The Delete button's text. */
  delete: string;
  /** The Delete button's accessible name, given the author whose comment it removes. */
  deleteComment: (author: string) => string;
}

/** Comment thread's English words; a page passes its own over them with `labels`. */
export const commentThreadLabels: CommentThreadLabels = {
  ...commentComposerLabels,
  comments: (count, n) => `Comments (${n})`,
  internal: (count, n) => `Internal conversation (${n})`,
  conversation: 'Conversation',
  commentsList: 'Comments',
  internalList: 'Internal comments',
  noComments: 'No comments yet',
  noInternal: 'No internal comments yet',
  repliesTo: author => `Replies to ${author}`,
  new: 'New',
  warning: found => `Content warning: ${found}. Detected automatically.`,
  reply: 'Reply',
  dismissWarning: 'Dismiss warning',
  delete: 'Delete',
  deleteComment: author => `Delete ${author}'s comment`
};

export interface ThreadComment {
  /** Tells the comment apart; `onPost`, `onDelete` and `onDismissWarning` hand it back. */
  id: string;
  /** Who wrote it, as people see it ("Resident", "Anonymous"). */
  author: string;
  /** The avatar's letters. @default the author's first letter */
  initials?: string;
  /** When, as shown ("Today", "2 days ago"). */
  time: string;
  /** The comment's words. */
  text: ReactNode;
  /** Not yet seen by the team: a tinted block and a "New" mark. */
  isNew?: boolean;
  /** What the automatic check found ("Possibly offensive language"), until the team dismisses it. */
  warning?: string;
  /** Replies, one level deep. */
  replies?: ThreadComment[];
}

export type ThreadTab = 'comments' | 'internal';

export interface ThreadTarget {
  /** Comments or the internal conversation. */
  tab: ThreadTab;
  /** The comment answered (a reply to a reply answers its parent), when the post is a reply. */
  replyTo?: string;
}

export interface CommentThreadProps extends PlacementProps {
  /** The public comments, oldest first. */
  comments: ThreadComment[];
  /** The team's internal conversation. Given, the thread shows two tabs, Comments (n) and Internal conversation (n);
   * absent, one "Comments (n)" heading. */
  internal?: ThreadComment[];
  /** The open tab (controlled). */
  tab?: ThreadTab;
  /** @default 'comments' */
  defaultTab?: ThreadTab;
  /** Fires when the person switches between Comments and Internal conversation, with the tab. */
  onTabChange?: (tab: ThreadTab) => void;
  /** The team member writing: the letters on the composer's avatar. */
  me: string;
  /** A comment or a reply was posted. The thread clears its composer; add the comment to `comments` or `internal`. */
  onPost?: (text: string, target: ThreadTarget) => void;
  /** Delete was pressed. Apply it at once, with an Undo toast. */
  onDelete?: (id: string, tab: ThreadTab) => void;
  /** "Dismiss warning" was pressed. Apply it at once, with an Undo toast. */
  onDismissWarning?: (id: string) => void;
  /** Its own words (the heading and tabs, each action, the warning line, the composer's), over
   * `commentThreadLabels`. */
  labels?: Partial<CommentThreadLabels>;
}

const count = (list: ThreadComment[]) => list.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);

/**
 * A thread of comments with replies and a composer: Reply points the composer at a comment. For one comment box, use `CommentComposer`.
 *
 * It is the conversation under a record in the Manage tab's Side panel (the prototype's `pjDiscussionHTML`).
 * Comments oldest first, each with its avatar, name, time, a "New" mark until the team has seen
 * it, an automatic content warning, and Reply / Dismiss warning / Delete; replies one level deep; then the team's
 * composer. With `internal`, a second tab holds the team's internal conversation, which residents never see. Every
 * action applies at once (with an Undo toast from the page). Not in Figma.
 */
export function CommentThread({
  comments,
  internal,
  tab,
  defaultTab = 'comments',
  onTabChange,
  me,
  onPost,
  onDelete,
  onDismissWarning,
  labels,
  className,
  style
}: CommentThreadProps) {
  const l = mergeLabels(commentThreadLabels, labels);
  const number = useNumberFormatter();
  const counted = (say: CountLabel, list: ThreadComment[]) => say(count(list), number.format(count(list)));
  const pane = (which: ThreadTab, list: ThreadComment[]) => (
    <ThreadPane key={which} tab={which} list={list} me={me} onPost={onPost} onDelete={onDelete}
      onDismissWarning={onDismissWarning} l={l} />
  );
  if (!internal) {
    return (
      <div className={clsx('gv-comment-thread', className)} style={style}>
        <h3 className="gv-comment-thread__title">{counted(l.comments, comments)}</h3>
        {pane('comments', comments)}
      </div>
    );
  }
  return (
    <Tabs className={clsx('react-aria-Tabs gv-base-tabs gv-comment-thread', className)} style={style} selectedKey={tab} defaultSelectedKey={defaultTab}
      onSelectionChange={k => onTabChange?.(k as ThreadTab)}>
      <TabList aria-label={l.conversation} className="react-aria-TabList gv-base-tab-list gv-comment-thread__tabs">
        <Tab id="comments">{counted(l.comments, comments)}</Tab>
        <Tab id="internal">{counted(l.internal, internal)}</Tab>
      </TabList>
      <TabPanel id="comments" className="react-aria-TabPanel gv-base-tab-panel gv-comment-thread__panel">{pane('comments', comments)}</TabPanel>
      <TabPanel id="internal" className="react-aria-TabPanel gv-base-tab-panel gv-comment-thread__panel">{pane('internal', internal)}</TabPanel>
    </Tabs>
  );
}

interface PaneProps extends Pick<CommentThreadProps, 'me' | 'onPost' | 'onDelete' | 'onDismissWarning'> {
  tab: ThreadTab;
  list: ThreadComment[];
  l: CommentThreadLabels;
}

/** One tab's comments and its composer. Reply points the composer at a comment and moves focus there. */
function ThreadPane({tab, list, me, onPost, onDelete, onDismissWarning, l}: PaneProps) {
  const [replyTo, setReplyTo] = useState<{id: string; author: string} | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const reply = (id: string, author: string) => {
    setReplyTo({id, author});
    field.current?.focus();
  };
  const item = (c: ThreadComment, parent?: ThreadComment) => (
    <li key={c.id} className="gv-comment-thread__item">
      <CommentRow comment={c} isReply={!!parent} l={l}
        onReply={onPost && (() => reply(parent?.id ?? c.id, c.author))}
        onDelete={onDelete && (() => onDelete(c.id, tab))}
        onDismissWarning={onDismissWarning && (() => onDismissWarning(c.id))} />
      {!!c.replies?.length && (
        <ol className="gv-comment-thread__replies" aria-label={l.repliesTo(c.author)}>
          {c.replies.map(r => item(r, c))}
        </ol>
      )}
    </li>
  );
  return (
    <>
      {list.length === 0
        ? <p className="gv-comment-thread__empty">{tab === 'internal' ? l.noInternal : l.noComments}</p>
        : <ol className="gv-comment-thread__list" aria-label={tab === 'internal' ? l.internalList : l.commentsList}>
          {list.map(c => item(c))}
        </ol>}
      {onPost && (
        <CommentComposer me={me} fieldRef={field} isInternal={tab === 'internal'} replyTo={replyTo?.author} labels={l}
          onCancelReply={() => { setReplyTo(null); field.current?.focus(); }}
          onPost={text => { onPost(text, {tab, replyTo: replyTo?.id}); setReplyTo(null); }} />
      )}
    </>
  );
}

interface CommentRowProps {
  comment: ThreadComment;
  isReply?: boolean;
  onReply?: () => void;
  onDelete?: () => void;
  onDismissWarning?: () => void;
  l: CommentThreadLabels;
}

/** One comment: avatar, then name · time · New, the warning line, the words, and its actions. */
function CommentRow({comment: c, isReply, onReply, onDelete, onDismissWarning, l}: CommentRowProps) {
  const head = useId();
  return (
    <article className="gv-comment-thread__comment" data-new={c.isNew || undefined} data-reply={isReply || undefined}
      aria-labelledby={head}>
      <span className="gv-comment-thread__avatar" aria-hidden><Avatar initials={c.initials ?? c.author.charAt(0)} /></span>
      <div className="gv-comment-thread__body">
        <div id={head} className="gv-comment-thread__head">
          <span className="gv-comment-thread__author">{c.author}</span>{' '}
          <span className="gv-comment-thread__time">{c.time}</span>{' '}
          {c.isNew && <span className="gv-comment-thread__new">{l.new}</span>}
        </div>
        {c.warning && (
          <p className="gv-comment-thread__warning">
            <TriangleAlert aria-hidden size={14} />
            <span>{l.warning(c.warning)}</span>
          </p>
        )}
        <div className="gv-comment-thread__text">{c.text}</div>
        {(onReply || onDelete || (c.warning && onDismissWarning)) && (
          <div className="gv-comment-thread__actions">
            {onReply && <AriaButton className="gv-comment-thread__action" onPress={onReply}
              aria-label={l.replyTo(c.author)}>{l.reply}</AriaButton>}
            {c.warning && onDismissWarning && (
              <AriaButton className="gv-comment-thread__action" onPress={onDismissWarning}>{l.dismissWarning}</AriaButton>
            )}
            {onDelete && <AriaButton className="gv-comment-thread__action" onPress={onDelete}
              aria-label={l.deleteComment(c.author)}>{l.delete}</AriaButton>}
          </div>
        )}
      </div>
    </article>
  );
}

export interface CommentComposerProps extends PlacementProps {
  /** The writer's avatar letters. */
  me: string;
  /** Posting to the internal conversation: its own placeholder. */
  isInternal?: boolean;
  /** The author answered, when Reply was pressed: a "Replying to …" line with a cancel. */
  replyTo?: string;
  /** Fires when the × on the "Replying to" line is pressed. */
  onCancelReply?: () => void;
  /** Fires when Post is pressed (or ⌘/Ctrl + Enter), with the trimmed text. The field then clears. */
  onPost: (text: string) => void;
  /** A ref to the text area, e.g. to move focus there when Reply is pressed. */
  fieldRef?: Ref<HTMLTextAreaElement>;
  /** Its own words (the field's name and hint, Post, the reply line), over `commentComposerLabels`. */
  labels?: Partial<CommentComposerLabels>;
}

/** The team's composer: their avatar, a field that grows with the words, and Post (on until there are words).
 * ⌘/Ctrl + Enter posts; Enter starts a new line. */
export function CommentComposer({me, isInternal, replyTo, onCancelReply, onPost, fieldRef, labels, className, style}: CommentComposerProps) {
  const l = mergeLabels(commentComposerLabels, labels);
  const [text, setText] = useState('');
  const post = () => {
    if (!text.trim()) return;
    onPost(text.trim());
    setText('');
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      post();
    }
  };
  const placeholder = isInternal ? l.internalPlaceholder : replyTo ? l.replyTo(replyTo) : l.placeholder;
  return (
    <div className={clsx('gv-comment-thread__composer', className)} style={style}>
      {replyTo && (
        <p className="gv-comment-thread__replying">
          {l.replying(replyTo)}
          <AriaButton className="gv-comment-thread__cancel" aria-label={l.cancelReply} onPress={onCancelReply}>
            <X aria-hidden size={14} />
          </AriaButton>
        </p>
      )}
      <div className="gv-comment-thread__compose-row">
        <span className="gv-comment-thread__avatar" aria-hidden><Avatar initials={me} /></span>
        <AriaTextField className="react-aria-TextField gv-base-text-field gv-comment-thread__field" value={text} onChange={setText}
          aria-label={isInternal ? l.internalField : replyTo ? l.replyTo(replyTo) : l.field}>
          <AriaTextArea ref={fieldRef} rows={1} placeholder={placeholder} onKeyDown={onKeyDown}
            className="react-aria-TextArea gv-base-text-area inset gv-comment-thread__input" />
        </AriaTextField>
        <Button variant="secondary" isDisabled={!text.trim()} onPress={post}>{l.post}</Button>
      </div>
    </div>
  );
}
