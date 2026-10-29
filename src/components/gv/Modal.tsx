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
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true,
  closeLabel = 'Close'
}: ModalProps) {
  return (
    <StarterModal isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} isDismissable={isDismissable}>
      <Dialog className="gv-modal" data-size={size}>
        <div className="gv-modal__head">
          <Heading slot="title" className="gv-modal__title">
            {title}
          </Heading>
          <Button slot="close" className="gv-modal__close" aria-label={closeLabel}>
            <X aria-hidden size={20} strokeWidth={1.75} />
          </Button>
        </div>
        <div className="gv-modal__body">{children}</div>
        {footer && <div className="gv-modal__footer">{footer}</div>}
      </Dialog>
    </StarterModal>
  );
}
