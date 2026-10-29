'use client';
import {Toolbar as RACToolbar, type ToolbarProps} from 'react-aria-components/Toolbar';
import {SeparatorContext} from 'react-aria-components/Separator';
import {ToggleButtonGroupContext} from 'react-aria-components/ToggleButtonGroup';
import './Toolbar.css';
import {keepClass} from './className';

export function Toolbar(props: ToolbarProps) {
  let {orientation = 'horizontal'} = props;
  return (
    <ToggleButtonGroupContext.Provider value={{orientation}}>
      <SeparatorContext.Provider
        value={{orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal'}}>
        <RACToolbar {...props} className={keepClass(props.className)} />
      </SeparatorContext.Provider>
    </ToggleButtonGroupContext.Provider>
  );
}
export type {ToolbarProps};
