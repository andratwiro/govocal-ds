'use client';
import {
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
  type DialogProps as RACDialogProps,
  type DialogTriggerProps
} from 'react-aria-components/Dialog';
import clsx from 'clsx';
import './Dialog.css';

export interface DialogProps extends RACDialogProps {
  /**
   * No padding: for a dialog popover whose content brings its own edges (an Option list, a Menu). `className` and
   * `style` place the dialog; they never paint it.
   *
   * @default false
   */
  isFlush?: boolean;
}

/** The content of a pop-up dialog (title, body, close) (React Aria's Dialog): use Modal for a form, or Alert dialog to confirm a risky action. */
export function Dialog({isFlush, ...props}: DialogProps) {
  return <RACDialog {...props} className={clsx('react-aria-Dialog gv-base-dialog', props.className)} data-flush={isFlush || undefined} />;
}

/** Opens a Dialog (in a Popover or a Modal) from the button inside it. Renders no element of its own. */
export function DialogTrigger(props: DialogTriggerProps) {
  return <RACDialogTrigger {...props} />;
}

export type {DialogTriggerProps};
