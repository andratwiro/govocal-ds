'use client';
import {
  ColorWheel as AriaColorWheel,
  type ColorWheelProps as AriaColorWheelProps,
  ColorWheelTrack
} from 'react-aria-components/ColorWheel';
import {ColorThumb} from './ColorThumb';
import './ColorWheel.css';
import {keepClass} from './className';
export interface ColorWheelProps extends Omit<AriaColorWheelProps, 'outerRadius' | 'innerRadius'> {}

export function ColorWheel(props: ColorWheelProps) {
  return (
    <AriaColorWheel {...props} className={keepClass(props.className)} outerRadius={100} innerRadius={74}>
      <ColorWheelTrack />
      <ColorThumb />
    </AriaColorWheel>
  );
}
