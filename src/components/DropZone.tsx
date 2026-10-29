'use client';
import {type DropZoneProps, DropZone as RACDropZone} from 'react-aria-components/DropZone';
import './DropZone.css';
import {keepClass} from './className';

export function DropZone(props: DropZoneProps) {
  return <RACDropZone {...props} className={keepClass(props.className)} />;
}

