'use client';
import {
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  type ColorSwatchPickerItemProps,
  type ColorSwatchPickerProps
} from 'react-aria-components/ColorSwatchPicker';
import {ColorSwatch} from './ColorSwatch';
import './ColorSwatchPicker.css';
import {keepClass} from './className';

export function ColorSwatchPicker({children, ...props}: ColorSwatchPickerProps) {
  return <AriaColorSwatchPicker {...props} className={keepClass(props.className)}>{children}</AriaColorSwatchPicker>;
}

export function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps) {
  return (
    <AriaColorSwatchPickerItem {...props} className={keepClass(props.className)}>
      <ColorSwatch />
    </AriaColorSwatchPickerItem>
  );
}
export type {ColorSwatchPickerProps, ColorSwatchPickerItemProps};
