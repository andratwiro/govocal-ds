'use client';
import {DropZone as RACDropZone, type DropZoneProps as RACDropZoneProps} from 'react-aria-components/DropZone';
import {FileTrigger} from 'react-aria-components/FileTrigger';
import {Button} from 'react-aria-components/Button';
import {Upload} from 'lucide-react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './DropZone.css';

export interface DropZoneProps extends Omit<RACDropZoneProps, 'className' | 'style'>, PlacementProps {
  /** Mime types FileTrigger accepts, e.g. ['image/*']. */
  acceptedFileTypes?: ReadonlyArray<string>;
  allowsMultiple?: boolean;
  onSelect?: (files: FileList | null) => void;
  /** The label, in place of "Drop a file here or browse". Plain text: the whole zone is the button. */
  children?: ReactNode;
  /** A line under the label, shown only at `density="compact"` (e.g. "PNG or JPG · max 5 MB"). */
  hint?: ReactNode;
  /**
   * `compact`: one left-aligned row, icon beside the text (the prototype's `.gv-dropzone`: Add a
   * cause, Add input, Event image). `default`: the large centred zone (Attachments).
   *
   * @default 'default'
   */
  density?: 'default' | 'compact';
}

/**
 * Drop zone (Figma node 5:490; the prototype's attachments zone `.attz` / compact `.gv-dropzone`):
 * an upload icon with "Drop a file here or browse". Drop a file on it, or press anywhere in it to
 * open the file picker (FileTrigger), as the prototype's zone is one button. The border is dashed,
 * as the prototype draws it (Figma shows it solid): dashed reads as "drop here" at a glance.
 */
export function DropZone({
  acceptedFileTypes,
  allowsMultiple,
  onSelect,
  children,
  hint,
  density = 'default',
  className,
  style,
  ...props
}: DropZoneProps) {
  return (
    <RACDropZone {...props} className={clsx('gv-drop-zone', className)} style={style} data-density={density}>
      <FileTrigger acceptedFileTypes={acceptedFileTypes} allowsMultiple={allowsMultiple} onSelect={onSelect}>
        <Button className="gv-drop-zone-trigger" isDisabled={props.isDisabled}>
          <Upload aria-hidden="true" className="gv-drop-zone-icon" />
          <span className="gv-drop-zone-text">
            <span className="gv-drop-zone-label">{children ?? 'Drop a file here or browse'}</span>
            {density === 'compact' && hint && <span className="gv-drop-zone-hint">{hint}</span>}
          </span>
        </Button>
      </FileTrigger>
    </RACDropZone>
  );
}
