'use client';
import {
  OverlayArrow,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps
} from 'react-aria-components/Popover';
import './Popover.css';
import {keepClass} from './className';

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  children: React.ReactNode;
  hideArrow?: boolean;
}

export function Popover({children, hideArrow, ...props}: PopoverProps) {
  return (
    <AriaPopover {...props} className={keepClass(props.className)}>
      {({trigger}) => (
        <>
          {!hideArrow && trigger !== 'MenuTrigger' && trigger !== 'SubmenuTrigger' && (
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
          )}
          {children}
        </>
      )}
    </AriaPopover>
  );
}
