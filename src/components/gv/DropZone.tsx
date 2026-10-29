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
  children?: ReactNode;
}

/**
 * Drop zone (Figma node 5:490): a dashed-bordered area with an upload icon and a
 * "Drop a file here or browse" label, "browse" opening the OS file picker via FileTrigger.
 * The prototype's `.pj-sub__upload` agrees with Figma on padding/radius/colour but uses a
 * dashed border where Figma shows solid — followed the prototype here (dashed reads as "drop
 * target" at a glance; a solid card border would look like a static panel).
 */
export function DropZone({acceptedFileTypes, allowsMultiple, onSelect, children, ...props}: DropZoneProps) {
  return (
    <RACDropZone {...props} className="gv-drop-zone">
      <Upload size={20} aria-hidden="true" className="gv-drop-zone-icon" />
      <span className="gv-drop-zone-text">
        {children ?? (
          <>
            Drop a file here or{' '}
            <FileTrigger acceptedFileTypes={acceptedFileTypes} allowsMultiple={allowsMultiple} onSelect={onSelect}>
              <Button className="gv-drop-zone-browse">browse</Button>
            </FileTrigger>
          </>
        )}
      </span>
    </RACDropZone>
  );
}
