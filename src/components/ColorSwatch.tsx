'use client';
import {
  ColorSwatch as AriaColorSwatch,
  type ColorSwatchProps
} from 'react-aria-components/ColorSwatch';
import './ColorSwatch.css';
import {keepClass} from './className';

/** A small square showing one colour (React Aria's ColorSwatch): pair it with ColorField when a person picks a colour. */
export function ColorSwatch(props: ColorSwatchProps) {
  return (
    <AriaColorSwatch
      {...props}
      className={keepClass(props.className, 'gv-base-color-swatch')}
      style={({color}) => ({
        background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
      })}
    />
  );
}
export type {ColorSwatchProps};
