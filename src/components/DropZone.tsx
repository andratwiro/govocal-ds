'use client';
import {type DropZoneProps, DropZone as RACDropZone} from 'react-aria-components/DropZone';
import {Text} from './Content';
import './DropZone.css';

export function DropZone(props: DropZoneProps) {
  return <RACDropZone {...props} />;
}

export {Text};
