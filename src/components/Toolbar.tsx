'use client';
import {Toolbar as RACToolbar, type ToolbarProps} from 'react-aria-components/Toolbar';
import {SeparatorContext} from 'react-aria-components/Separator';
import {ToggleButtonGroupContext} from 'react-aria-components/ToggleButtonGroup';
import './Toolbar.css';
import {keepClass} from './className';

/** A row of controls moved through with the arrow keys (React Aria's Toolbar): for text formatting, use Rich text toolbar. */
export function Toolbar(props: ToolbarProps) {
  let {orientation = 'horizontal'} = props;
  return (
    <ToggleButtonGroupContext.Provider value={{orientation}}>
      <SeparatorContext.Provider
        value={{orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal'}}>
        <RACToolbar {...props} className={keepClass(props.className, 'gv-base-toolbar')} />
      </SeparatorContext.Provider>
    </ToggleButtonGroupContext.Provider>
  );
}
export type {ToolbarProps};
