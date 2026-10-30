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
  /**
   * The arrow pointing at the trigger. Menus never draw it.
   *
   * @default true
   */
  showArrow?: boolean;
}

/** A floating panel anchored to a button (React Aria's Popover): for help text use Help popover, for options use Select or Option list. */
export function Popover({children, showArrow = true, ...props}: PopoverProps) {
  return (
    <AriaPopover {...props} className={keepClass(props.className, 'gv-base-popover')}>
      {({trigger}) => (
        <>
          {showArrow && trigger !== 'MenuTrigger' && trigger !== 'SubmenuTrigger' && (
            <OverlayArrow className="react-aria-OverlayArrow gv-base-overlay-arrow">
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
