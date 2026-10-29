'use client';
import type {ReactNode} from 'react';
import {Button, Heading} from 'react-aria-components';
import {X} from 'lucide-react';
import {Dialog} from 'react-aria-components/Dialog';
import {Modal as StarterModal} from '../Modal';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './Modal.css';

/** The words Modal says itself (docs/API.md rule 11). */
export interface ModalLabels {
  /** The × button's name. */
  close: string;
}

/** Modal's English words; a page passes its own over them with `labels`. */
export const modalLabels: ModalLabels = {close: 'Close'};

/** `className` and `style` place the dialog box (a width, a margin); they never paint it. */
export interface ModalProps extends PlacementProps {
  /** The title in the head, e.g. "Attachments". */
  title: string;
  /** The body. */
  children: ReactNode;
  /** The footer's buttons, right-aligned (a `slot="close"` button closes the modal). No footer when absent. */
  footer?: ReactNode;
  /**
   * Width: Figma's 420, or the prototype's wide modal (Settings, Input manager).
   *
   * @default 'default'
   */
  width?: 'default' | 'wide';
  /**
   * `fixed` holds the dialog at 640 (capped by the viewport) so a tabbed body always fills it and
   * scrolls on its own, rather than the shell growing and shrinking with the active tab.
   *
   * @default 'auto'
   */
  height?: 'auto' | 'fixed';
  /**
   * No padding and no scrolling of its own around the body, for a body that lays out its own regions and scrolling
   * (the side-tabs dialog's own list + panel), rather than the default single padded, scrolling block.
   *
   * @default false
   */
  isFlush?: boolean;
  /** Controlled open state; inside a `DialogTrigger` the trigger handles it. */
  isOpen?: boolean;
  /** Whether the modal is open at first, when the page doesn't control `isOpen`. */
  defaultOpen?: boolean;
  /** Fires when the modal opens or closes (×, Esc, a click outside, a `slot="close"` button), with the new state. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Close on a click outside. @default true */
  isDismissable?: boolean;
  /** Its own words (the ×'s name), over `modalLabels`: `labels={{close: formatMessage(messages.close)}}`. */
  labels?: Partial<ModalLabels>;
}

/** Modal: head (title + ×), a body, and a footer of buttons on the toolbar grey. Wraps the starter Modal + Dialog.
 * Its one word, the ×'s name, is `labels.close`. */
export function Modal({
  title,
  children,
  footer,
  width = 'default',
  height = 'auto',
  isFlush = false,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true,
  labels,
  className,
  style
}: ModalProps) {
  return (
    <StarterModal isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} isDismissable={isDismissable}>
      <Dialog className={clsx('gv-modal', className)} style={style} data-width={width} data-height={height}>
        <div className="gv-modal__head">
          <Heading slot="title" className="gv-modal__title">
            {title}
          </Heading>
          <Button slot="close" className="gv-modal__close" aria-label={mergeLabels(modalLabels, labels).close}>
            <X aria-hidden size={20} strokeWidth={1.75} />
          </Button>
        </div>
        <div className="gv-modal__body" data-unpadded={isFlush || undefined}>{children}</div>
        {footer && <div className="gv-modal__footer">{footer}</div>}
      </Dialog>
    </StarterModal>
  );
}
