'use client';
import {Button} from 'react-aria-components/Button';
import {
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps
} from 'react-aria-components/ColorPicker';
import {DialogTrigger} from './Dialog';
import {ColorSwatch} from './ColorSwatch';
import {ColorSlider} from './ColorSlider';
import {ColorArea} from './ColorArea';
import {ColorField} from './ColorField';
import {Popover} from './Popover';
import clsx from 'clsx';
import type {PlacementProps} from './className';
import './ColorPicker.css';

/** `className` and `style` place the picker's swatch button; they never paint it. */
export interface ColorPickerProps extends Omit<AriaColorPickerProps, 'children'>, PlacementProps {
  label?: string;
  children?: React.ReactNode;
}

export function ColorPicker({label, children, className, style, ...props}: ColorPickerProps) {
  return (
    <AriaColorPicker {...props}>
      <DialogTrigger>
        <Button className={clsx('color-picker', className)} style={style}>
          <ColorSwatch />
          <span>{label}</span>
        </Button>
        <Popover hideArrow placement="bottom start" className="color-picker-dialog">
          {children || (
            <>
              <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
              <ColorSlider colorSpace="hsb" channel="hue" />
              <ColorField label="Hex" />
            </>
          )}
        </Popover>
      </DialogTrigger>
    </AriaColorPicker>
  );
}
