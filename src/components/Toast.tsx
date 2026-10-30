'use client';
import {
  UNSTABLE_ToastRegion as RACToastRegion,
  UNSTABLE_Toast as RACToast,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastContent as RACToastContent,
  type ToastProps,
  Text
} from 'react-aria-components/Toast';
import {Button as RACButton} from 'react-aria-components/Button';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Button} from './Button';
import {Check, X} from 'lucide-react';
import {clsx} from 'clsx';
import './Toast.css';
import {flushSync} from 'react-dom';
import {createContext, useContext, type CSSProperties, type ReactNode} from 'react';
import {mergeLabels} from './labels';

/**
 * What a toast shows. The prototype's `pjShowToast({title, body, action: 'Undo', onAction})` maps to
 * `toast(title, body, {action: 'Undo', onAction})`.
 */
export interface ToastMessage {
  /** The toast's main line, e.g. "Idea archived". */
  title: string;
  /** A line under the title, e.g. what moved where. */
  description?: string;
  /**
   * The leading icon. Left out: the success check in a green circle, as in the prototype. `null`: no icon.
   */
  icon?: ReactNode;
  /** A text action under the words, e.g. "Undo". Pressing it closes the toast, then calls `onAction`. */
  action?: string;
  /** Called after `action` is pressed and the toast has closed. */
  onAction?: () => void;
}

/** The app's one toast queue, which the one `ToastRegion` draws. Pages call `toast()`; `queue` is for what `toast()`
 * doesn't cover (closing a toast early: `queue.close(key)`, clearing: `queue.clear()`). */
/**
 * True while the person presses a toast's own Undo or ×. While a view transition runs, the browser sends every click
 * on the page to the transition's snapshot, so for the slide's ~200 ms after Undo a press on the page went nowhere.
 * The updates a toast's own buttons make skip the slide: the toast just goes, and the next one just comes.
 */
let pressingToast = false;
const toastPress = {
  onPressStart: () => { pressingToast = true; },
  onPressEnd: () => { setTimeout(() => { pressingToast = false; }); }
};

export const queue = new ToastQueue<ToastMessage>({
  // Wrap state updates in a CSS view transition, but not those a toast's own Undo or × make.
  wrapUpdate(fn) {
    if (!pressingToast && typeof document !== 'undefined' && 'startViewTransition' in document) {
      const transition = document.startViewTransition(() => {
        flushSync(fn);
      });
      // Two updates in one frame (Undo: close, then onAction adds a toast) skip the first transition; its
      // update still runs, but `ready` rejects with an AbortError nobody needs to hear about.
      transition.ready.catch(() => {});
    } else {
      fn();
    }
  }
});

export interface ToastOptions {
  /** The leading icon. Left out: the success check. `null`: no icon. */
  icon?: ReactNode;
  /** A text action under the words, e.g. "Undo". Pressing it closes the toast, then calls `onAction`. */
  action?: string;
  /** Called after `action` is pressed and the toast has closed. */
  onAction?: () => void;
  /** How long the toast stays, in milliseconds; `0` keeps it until it is closed. @default 5000 */
  timeout?: number;
}

/**
 * Shows a toast: `toast('Idea archived', 'Moved to the archive.', {action: 'Undo', onAction: restore})`. It stays 5
 * seconds unless `timeout` says otherwise, and returns its key (`queue.close(key)` takes it away early). The app
 * renders the region once, with `AppProvider`.
 */
export function toast(title: string, description?: string, {timeout = 5000, ...options}: ToastOptions = {}): string {
  return queue.add({title, description, ...options}, timeout ? {timeout} : undefined);
}

/** True inside an app that already renders the `ToastRegion` (`AppProvider` does): a `ToastRegion` there draws
 * nothing, so a page's own region and the app's never show a toast twice. */
export const ToastRegionContext = createContext(false);

/** The words the toasts say themselves (docs/API.md rule 11). */
export interface ToastRegionLabels {
  /** Each toast's × button. */
  close: string;
}

/** The toasts' English words; `AppProvider labels` (or a `ToastRegion`'s own) puts the page's over them. */
export const toastRegionLabels: ToastRegionLabels = {close: 'Close'};

export interface ToastRegionProps {
  /** Places the region (it sits fixed at the window's bottom end); never paints it. */
  className?: string;
  /** Places the region; layout only. */
  style?: CSSProperties;
  /** The toasts' own words, over `toastRegionLabels`. */
  labels?: Partial<ToastRegionLabels>;
}

/**
 * Where toasts appear: fixed at the window's bottom end, newest on top. Render it once, at the app's root:
 * `AppProvider` does. A `ToastRegion` inside `AppProvider` draws nothing (see `ToastRegionContext`).
 */
export function ToastRegion({className, style, labels}: ToastRegionProps = {}) {
  if (useContext(ToastRegionContext)) return null;
  const l = mergeLabels(toastRegionLabels, labels);
  return (
    <RACToastRegion queue={queue} className={clsx('react-aria-ToastRegion gv-base-toast-region', className)} style={style}>
      {({toast}) => {
        const {title, description, icon, action, onAction} = toast.content;
        return (
          <Toast toast={toast} style={{viewTransitionName: toast.key} as CSSProperties}>
            {icon !== null && (
              <span className="toast-icon" aria-hidden="true">
                {icon ?? <Check strokeWidth={2.6} />}
              </span>
            )}
            <RACToastContent className="react-aria-ToastContent gv-base-toast-content">
              <Text className="react-aria-Text gv-base-text" slot="title">{title}</Text>
              {description && <Text className="react-aria-Text gv-base-text" slot="description">{description}</Text>}
              {action && (
                <RACButton
                  className="toast-action"
                  {...toastPress}
                  onPress={() => {
                    queue.close(toast.key);
                    onAction?.();
                  }}>
                  {action}
                </RACButton>
              )}
            </RACToastContent>
            <Button slot="close" aria-label={l.close} variant="quiet" {...toastPress}>
              <X size={16} />
            </Button>
          </Toast>
        );
      }}
    </RACToastRegion>
  );
}

/** One toast, as `ToastRegion` draws it. Pages don't render it: they call `toast()`. */
export function Toast({className, ...props}: ToastProps<ToastMessage>) {
  return <RACToast {...props} className={composeRenderProps(className, c => clsx('react-aria-Toast gv-base-toast', c))} />;
}
