'use client';
import {
  ColorSwatch as AriaColorSwatch,
  type ColorSwatchProps
} from 'react-aria-components/ColorSwatch';
import './ColorSwatch.css';
import {keepClass} from './className';

export function ColorSwatch(props: ColorSwatchProps) {
  return (
    <AriaColorSwatch
      {...props}
      className={keepClass(props.className)}
      style={({color}) => ({
        background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
      })}
    />
  );
}
export type {ColorSwatchProps};
