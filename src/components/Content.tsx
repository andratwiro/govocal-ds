import clsx from 'clsx';
import {Heading as AriaHeading, type HeadingProps} from 'react-aria-components/Heading';
import {Text as AriaText, type TextProps} from 'react-aria-components/Text';
import {Header as AriaHeader, type HeaderProps} from 'react-aria-components/Header';
import {Keyboard as AriaKeyboard} from 'react-aria-components/Keyboard';
import type {ComponentProps} from 'react';
import './Content.css';

export type {HeadingProps, TextProps, HeaderProps};
export type KeyboardProps = ComponentProps<typeof AriaKeyboard>;

/** A heading a React Aria part reads by its slot (a Dialog's `slot="title"`). */
export function Heading(props: HeadingProps) {
  return <AriaHeading {...props} className={clsx('react-aria-Heading gv-base-heading', props.className)} />;
}

/** Text a React Aria part reads by its slot (an item's `slot="label"` and `slot="description"`). */
export function Text(props: TextProps) {
  return <AriaText {...props} className={clsx('react-aria-Text gv-base-text', props.className)} />;
}

/** A section's title inside a Menu or a ListBox section. */
export function Header(props: HeaderProps) {
  return <AriaHeader {...props} className={clsx('react-aria-Header gv-base-header', props.className)} />;
}

/** A keyboard shortcut at the end of a menu item. */
export function Keyboard(props: KeyboardProps) {
  return <AriaKeyboard {...props} className={clsx('react-aria-Keyboard', props.className)} />;
}
