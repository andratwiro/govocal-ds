import {ColorThumb as AriaColorThumb, type ColorThumbProps} from 'react-aria-components/ColorThumb';
import './ColorThumb.css';
import {keepClass} from './className';

export function ColorThumb(props: ColorThumbProps) {
  return <AriaColorThumb {...props} className={keepClass(props.className)} />;
}
export type {ColorThumbProps};
