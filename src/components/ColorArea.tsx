'use client';
import {ColorArea as AriaColorArea, type ColorAreaProps} from 'react-aria-components/ColorArea';
import {ColorThumb} from './ColorThumb';
import './ColorArea.css';
import {keepClass} from './className';

export function ColorArea(props: ColorAreaProps) {
  return (
    <AriaColorArea {...props} className={keepClass(props.className)}>
      <ColorThumb />
    </AriaColorArea>
  );
}
