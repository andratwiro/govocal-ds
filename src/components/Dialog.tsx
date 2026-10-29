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

export function Dialog({isFlush, ...props}: DialogProps) {
  return <RACDialog {...props} className={clsx('react-aria-Dialog', props.className)} data-flush={isFlush || undefined} />;
}

/** Opens a Dialog (in a Popover or a Modal) from the button inside it. Renders no element of its own. */
export function DialogTrigger(props: DialogTriggerProps) {
  return <RACDialogTrigger {...props} />;
}

export {Heading} from './Content';
