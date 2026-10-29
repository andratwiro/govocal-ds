'use client';
import {Modal as RACModal, type ModalOverlayProps} from 'react-aria-components/Modal';
import './Modal.css';
import {keepClass} from './className';

/** The dimmed overlay and box that holds a Dialog; React Aria's Modal. For a titled box with footer buttons, use the Modal component. */
export function Modal(props: ModalOverlayProps) {
  return <RACModal {...props} className={keepClass(props.className, 'gv-base-modal')} />;
}
