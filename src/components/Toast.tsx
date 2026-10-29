'use client';
import {
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastContent as ToastContent,
  type ToastProps,
  Text
} from 'react-aria-components/Toast';
import {Button as RACButton} from 'react-aria-components/Button';
import {Button} from './Button';
import {Check, X} from 'lucide-react';
import './Toast.css';
import {flushSync} from 'react-dom';
import {type CSSProperties, type ReactNode} from 'react';

/**
 * What a toast shows. The prototype's `pjShowToast({title, body, action: 'Undo', onAction})` maps one to one:
 * `queue.add({title, body, action: 'Undo', onAction})`.
 */
export interface MyToastContent {
  title: string;
  description?: string;
  /** The prototype's name for `description`; used when `description` is not given. */
  body?: string;
  /**
   * The leading icon. Left out: the success check in a green circle, as in the prototype. `null`: no icon.
   */
  icon?: ReactNode;
  /** A text action under the words, e.g. "Undo". Pressing it closes the toast, then calls `onAction`. */
  action?: string;
  onAction?: () => void;
}

// This is a global toast queue, to be imported and called where ever you want to queue a toast via queue.add().
export const queue = new ToastQueue<MyToastContent>({
  // Wrap state updates in a CSS view transition.
  wrapUpdate(fn) {
    if ('startViewTransition' in document) {
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

export function MyToastRegion() {
  return (
    // The ToastRegion should be rendered at the root of your app.
    <ToastRegion queue={queue}>
      {({toast}) => {
        const {title, description, body, icon, action, onAction} = toast.content;
        const words = description ?? body;
        return (
          <MyToast toast={toast} style={{viewTransitionName: toast.key} as CSSProperties}>
            {icon !== null && (
              <span className="toast-icon" aria-hidden="true">
                {icon ?? <Check strokeWidth={2.6} />}
              </span>
            )}
            <ToastContent>
              <Text slot="title">{title}</Text>
              {words && <Text slot="description">{words}</Text>}
              {action && (
                <RACButton
                  className="toast-action"
                  onPress={() => {
                    queue.close(toast.key);
                    onAction?.();
                  }}>
                  {action}
                </RACButton>
              )}
            </ToastContent>
            <Button slot="close" aria-label="Close" variant="quiet">
              <X size={16} />
            </Button>
          </MyToast>
        );
      }}
    </ToastRegion>
  );
}

export function MyToast(props: ToastProps<MyToastContent>) {
  return <Toast {...props} />;
}
