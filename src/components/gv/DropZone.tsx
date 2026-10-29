'use client';
import {DropZone as RACDropZone, type DropZoneProps as RACDropZoneProps} from 'react-aria-components/DropZone';
import {FileTrigger} from 'react-aria-components/FileTrigger';
import {Button} from 'react-aria-components/Button';
import {Upload} from 'lucide-react';
import type {ReactNode} from 'react';
import './DropZone.css';

export interface DropZoneProps extends RACDropZoneProps {
  /** Mime types FileTrigger accepts, e.g. ['image/*']. */
  acceptedFileTypes?: ReadonlyArray<string>;
  allowsMultiple?: boolean;
  onSelect?: (files: FileList | null) => void;
  /** The label, in place of "Drop a file here or browse". Plain text: the whole zone is the button. */
  children?: ReactNode;
}

/**
 * Drop zone (Figma node 5:490; the prototype's attachments zone `.attz`): an upload icon over
 * "Drop a file here or browse". Drop a file on it, or press anywhere in it to open the file picker
 * (FileTrigger), as the prototype's zone is one button. The border is dashed, as the prototype draws
 * it (Figma shows it solid): dashed reads as "drop here" at a glance.
 */
export function DropZone({acceptedFileTypes, allowsMultiple, onSelect, children, ...props}: DropZoneProps) {
  return (
    <RACDropZone {...props} className="gv-drop-zone">
      <FileTrigger acceptedFileTypes={acceptedFileTypes} allowsMultiple={allowsMultiple} onSelect={onSelect}>
        <Button className="gv-drop-zone-trigger" isDisabled={props.isDisabled}>
          <Upload aria-hidden="true" className="gv-drop-zone-icon" />
          <span className="gv-drop-zone-text">{children ?? 'Drop a file here or browse'}</span>
        </Button>
      </FileTrigger>
    </RACDropZone>
  );
}
