'use client';
import {
  ColorSwatch as AriaColorSwatch,
  type ColorSwatchProps as AriaColorSwatchProps
} from 'react-aria-components/ColorSwatch';
import './ColorSwatch.css';
import {keepClass} from './className';

export interface ColorSwatchProps extends AriaColorSwatchProps {
  /**
   * Its height and width: 32 on its own (beside a colour field), 24 in a list, 16 inline in a table cell or beside a
   * name.
   *
   * @default 32
   */
  size?: 16 | 24 | 32;
}

/** A colour's dot, named by the colour (React Aria's ColorSwatch): a tag's colour in its row, a colour field's value. */
export function ColorSwatch({size = 32, ...props}: ColorSwatchProps) {
  return (
    <AriaColorSwatch
      {...props}
      data-size={size}
      className={keepClass(props.className, 'gv-base-color-swatch')}
      style={({color}) => ({
        background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
      })}
    />
  );
}
