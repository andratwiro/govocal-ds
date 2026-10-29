'use client';
import type {ReactNode} from 'react';
import {Button, Heading} from 'react-aria-components';
import {X} from 'lucide-react';
import {Dialog} from '../Dialog';
import {Modal as StarterModal} from '../Modal';
import './Modal.css';

export interface ModalProps {
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
  size?: 'default' | 'wide';
  /**
   * `fixed` holds the dialog at 640 (capped by the viewport) so a tabbed body always fills it and
   * scrolls on its own, rather than the shell growing and shrinking with the active tab.
   *
   * @default 'auto'
   */
  height?: 'auto' | 'fixed';
  /**
   * Off for a body that lays out its own regions and scrolling (the side-tabs dialog's own list +
   * panel), rather than the default single padded, scrolling block.
   *
   * @default true
   */
  padBody?: boolean;
  /** Controlled open state; inside a `DialogTrigger` the trigger handles it. */
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Close on a click outside. @default true */
  isDismissable?: boolean;
  /** The close button's accessible name. @default 'Close' */
  closeLabel?: string;
}

/** Modal: head (title + ×), a body, and a footer of buttons on the toolbar grey. Wraps the starter Modal + Dialog. */
export function Modal({
  title,
  children,
  footer,
  size = 'default',
  height = 'auto',
  padBody = true,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true,
  closeLabel = 'Close'
}: ModalProps) {
  return (
    <StarterModal isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} isDismissable={isDismissable}>
      <Dialog className="gv-modal" data-size={size} data-height={height}>
        <div className="gv-modal__head">
          <Heading slot="title" className="gv-modal__title">
            {title}
          </Heading>
          <Button slot="close" className="gv-modal__close" aria-label={closeLabel}>
            <X aria-hidden size={20} strokeWidth={1.75} />
          </Button>
        </div>
        <div className="gv-modal__body" data-unpadded={!padBody || undefined}>{children}</div>
        {footer && <div className="gv-modal__footer">{footer}</div>}
      </Dialog>
    </StarterModal>
  );
}
