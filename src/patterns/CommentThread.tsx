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
import './CommentThread.css';

export interface ThreadComment {
  id: string;
  /** Who wrote it, as people see it ("Priya S.", "Anonymous"). */
  author: string;
  /** The avatar's letters. @default the author's first letter */
  initials?: string;
  /** When, as shown ("Today", "2 days ago"). */
  time: string;
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
  onTabChange?: (tab: ThreadTab) => void;
  /** The team member writing: the letters on the composer's avatar. */
  me: string;
  /** A comment or a reply was posted. The thread clears its composer; add the comment to `comments` or `internal`. */
  onPost?: (text: string, target: ThreadTarget) => void;
  /** Delete was pressed. Apply it at once, with an Undo toast. */
  onDelete?: (id: string, tab: ThreadTab) => void;
  /** "Dismiss warning" was pressed. Apply it at once, with an Undo toast. */
  onDismissWarning?: (id: string) => void;
}

const count = (list: ThreadComment[]) => list.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);

/**
 * Comment thread: the conversation under a record in the Manage tab's Side panel (the prototype's
 * `pjDiscussionHTML`). Comments oldest first, each with its avatar, name, time, a "New" mark until the team has seen
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
  className,
  style
}: CommentThreadProps) {
  const pane = (which: ThreadTab, list: ThreadComment[]) => (
    <ThreadPane key={which} tab={which} list={list} me={me} onPost={onPost} onDelete={onDelete}
      onDismissWarning={onDismissWarning} />
  );
  if (!internal) {
    return (
      <div className={clsx('gv-comment-thread', className)} style={style}>
        <h3 className="gv-comment-thread__title">Comments ({count(comments)})</h3>
        {pane('comments', comments)}
      </div>
    );
  }
  return (
    <Tabs className={clsx('react-aria-Tabs gv-comment-thread', className)} style={style} selectedKey={tab} defaultSelectedKey={defaultTab}
      onSelectionChange={k => onTabChange?.(k as ThreadTab)}>
      <TabList aria-label="Conversation" className="react-aria-TabList gv-comment-thread__tabs">
        <Tab id="comments">Comments ({count(comments)})</Tab>
        <Tab id="internal">Internal conversation ({count(internal)})</Tab>
      </TabList>
      <TabPanel id="comments" className="react-aria-TabPanel gv-comment-thread__panel">{pane('comments', comments)}</TabPanel>
      <TabPanel id="internal" className="react-aria-TabPanel gv-comment-thread__panel">{pane('internal', internal)}</TabPanel>
    </Tabs>
  );
}

interface PaneProps extends Pick<CommentThreadProps, 'me' | 'onPost' | 'onDelete' | 'onDismissWarning'> {
  tab: ThreadTab;
  list: ThreadComment[];
}

/** One tab's comments and its composer. Reply points the composer at a comment and moves focus there. */
function ThreadPane({tab, list, me, onPost, onDelete, onDismissWarning}: PaneProps) {
  const [replyTo, setReplyTo] = useState<{id: string; author: string} | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const reply = (id: string, author: string) => {
    setReplyTo({id, author});
    field.current?.focus();
  };
  const item = (c: ThreadComment, parent?: ThreadComment) => (
    <li key={c.id} className="gv-comment-thread__item">
      <CommentRow comment={c} isReply={!!parent}
        onReply={onPost && (() => reply(parent?.id ?? c.id, c.author))}
        onDelete={onDelete && (() => onDelete(c.id, tab))}
        onDismissWarning={onDismissWarning && (() => onDismissWarning(c.id))} />
      {!!c.replies?.length && (
        <ol className="gv-comment-thread__replies" aria-label={`Replies to ${c.author}`}>
          {c.replies.map(r => item(r, c))}
        </ol>
      )}
    </li>
  );
  return (
    <>
      {list.length === 0
        ? <p className="gv-comment-thread__empty">{tab === 'internal' ? 'No internal comments yet' : 'No comments yet'}</p>
        : <ol className="gv-comment-thread__list" aria-label={tab === 'internal' ? 'Internal comments' : 'Comments'}>
          {list.map(c => item(c))}
        </ol>}
      {onPost && (
        <CommentComposer me={me} fieldRef={field} isInternal={tab === 'internal'} replyTo={replyTo?.author}
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
}

/** One comment: avatar, then name · time · New, the warning line, the words, and its actions. */
function CommentRow({comment: c, isReply, onReply, onDelete, onDismissWarning}: CommentRowProps) {
  const head = useId();
  return (
    <article className="gv-comment-thread__comment" data-new={c.isNew || undefined} data-reply={isReply || undefined}
      aria-labelledby={head}>
      <span className="gv-comment-thread__avatar" aria-hidden><Avatar initials={c.initials ?? c.author.charAt(0)} /></span>
      <div className="gv-comment-thread__body">
        <div id={head} className="gv-comment-thread__head">
          <span className="gv-comment-thread__author">{c.author}</span>{' '}
          <span className="gv-comment-thread__time">{c.time}</span>{' '}
          {c.isNew && <span className="gv-comment-thread__new">New</span>}
        </div>
        {c.warning && (
          <p className="gv-comment-thread__warning">
            <TriangleAlert aria-hidden size={14} />
            <span>Content warning: {c.warning}. Detected automatically.</span>
          </p>
        )}
        <div className="gv-comment-thread__text">{c.text}</div>
        {(onReply || onDelete || (c.warning && onDismissWarning)) && (
          <div className="gv-comment-thread__actions">
            {onReply && <AriaButton className="gv-comment-thread__action" onPress={onReply}
              aria-label={`Reply to ${c.author}`}>Reply</AriaButton>}
            {c.warning && onDismissWarning && (
              <AriaButton className="gv-comment-thread__action" onPress={onDismissWarning}>Dismiss warning</AriaButton>
            )}
            {onDelete && <AriaButton className="gv-comment-thread__action" onPress={onDelete}
              aria-label={`Delete ${c.author}'s comment`}>Delete</AriaButton>}
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
  onCancelReply?: () => void;
  onPost: (text: string) => void;
  fieldRef?: Ref<HTMLTextAreaElement>;
}

/** The team's composer: their avatar, a field that grows with the words, and Post (on until there are words).
 * ⌘/Ctrl + Enter posts; Enter starts a new line. */
export function CommentComposer({me, isInternal, replyTo, onCancelReply, onPost, fieldRef, className, style}: CommentComposerProps) {
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
  const placeholder = isInternal ? 'This comment is not visible to regular users'
    : replyTo ? `Reply to ${replyTo}` : 'Reply as the project team';
  return (
    <div className={clsx('gv-comment-thread__composer', className)} style={style}>
      {replyTo && (
        <p className="gv-comment-thread__replying">
          Replying to {replyTo}
          <AriaButton className="gv-comment-thread__cancel" aria-label="Cancel reply" onPress={onCancelReply}>
            <X aria-hidden size={14} />
          </AriaButton>
        </p>
      )}
      <div className="gv-comment-thread__compose-row">
        <span className="gv-comment-thread__avatar" aria-hidden><Avatar initials={me} /></span>
        <AriaTextField className="react-aria-TextField gv-comment-thread__field" value={text} onChange={setText}
          aria-label={isInternal ? 'Internal comment' : replyTo ? `Reply to ${replyTo}` : 'Comment'}>
          <AriaTextArea ref={fieldRef} rows={1} placeholder={placeholder} onKeyDown={onKeyDown}
            className="react-aria-TextArea inset gv-comment-thread__input" />
        </AriaTextField>
        <Button variant="secondary" isDisabled={!text.trim()} onPress={post}>Post</Button>
      </div>
    </div>
  );
}
