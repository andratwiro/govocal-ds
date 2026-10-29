'use client';
import {Children, isValidElement, type ReactNode} from 'react';
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps
} from 'react-aria-components/Button';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {ChevronDown} from 'lucide-react';
import {ProgressCircle} from './ProgressCircle';
import './Button.css';
import {keepClass} from './className';

/**
 * `className` and `style` place the button (grid area, margin, alignment); they never paint it. React Aria's
 * `react-aria-Button` class always stays.
 */
export interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'quiet';
  /**
   * The button's height, per the Figma Button spec.
   *
   * @default 36
   */
  size?: 32 | 36;
  /**
   * Danger: `tone="danger"` on the `primary` variant (a destructive confirm) or `quiet` (an inline
   * Delete). No outlined danger look (§C): the two cover every case.
   *
   * @default 'neutral'
   */
  tone?: 'neutral' | 'danger';
  /**
   * Appends a menu chevron, for buttons that open a menu.
   *
   * @default false
   */
  hasMenu?: boolean;
  /**
   * Forces the icon-only treatment (a square button, no visible
   * text). Leave unset to let the Button detect it itself: it looks only right
   * when a text node (or anything else that isn't a single element, such as an
   * icon + text pair) would make the CSS `:has(> svg:only-child)` rule used to
   * get this wrong, because CSS ignores text nodes — `<Button><Plus/> New
   * project</Button>` rendered as a circle. Auto-detection is structural, not
   * `aria-label`-based: several existing icon-only buttons (Calendar/
   * RangeCalendar's prev/next, NumberField's increment/decrement) get their
   * accessible name from React Aria's slot context, which this component never
   * sees as a prop, so checking for `aria-label` here would miss them.
   */
  isIconOnly?: boolean;
  /**
   * Fills the width of its container, its content centred: a form's submit, a card's call to action. Placement, like
   * `className`.
   *
   * @default false
   */
  isFullWidth?: boolean;
}

/** True when `children` is exactly one non-empty, non-text node (an icon). */
function isIconOnlyChildren(children: ButtonProps['children']): boolean {
  if (typeof children === 'function') return false;
  const visible = Children.toArray(children as ReactNode).filter(child => {
    if (child == null || typeof child === 'boolean') return false;
    if (typeof child === 'string' || typeof child === 'number') {
      return String(child).trim() !== '';
    }
    return true;
  });
  return visible.length === 1 && isValidElement(visible[0]);
}

export function Button(props: ButtonProps) {
  const {variant, size, hasMenu, isIconOnly, tone, isFullWidth, className, ...rest} = props;
  const resolvedIconOnly = isIconOnly ?? isIconOnlyChildren(props.children);
  return (
    <RACButton
      {...rest}
      className={keepClass(className)}
      data-full-width={isFullWidth || undefined}
      data-variant={variant || 'primary'}
      data-size={size || 36}
      data-tone={tone || 'neutral'}
      data-icon-only={resolvedIconOnly || undefined}>
      {composeRenderProps(props.children, (children, {isPending}) => (
        <>
          {!isPending && children}
          {!isPending && hasMenu && <ChevronDown aria-hidden size={16} className="react-aria-Button-chevron" />}
          {isPending && <ProgressCircle aria-label="Saving..." isIndeterminate />}
        </>
      ))}
    </RACButton>
  );
}
