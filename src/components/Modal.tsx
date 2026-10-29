'use client';
import {Modal as RACModal, type ModalOverlayProps} from 'react-aria-components/Modal';
import './Modal.css';
import {keepClass} from './className';

export function Modal(props: ModalOverlayProps) {
  return <RACModal {...props} className={keepClass(props.className)} />;
}
