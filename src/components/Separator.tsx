'use client';
import {Separator as RACSeparator, type SeparatorProps} from 'react-aria-components/Separator';
import React from 'react';
import './Separator.css';
import clsx from 'clsx';

/**
 * A line between a menu's, list box's or toolbar's groups of items (React Aria's Separator). Between blocks of a
 * page, the line is a Divider. className and style place it; they never paint it.
 */
export function Separator(props: SeparatorProps) {
  return <RACSeparator {...props} className={clsx('react-aria-Separator', props.className)} />;
}
export type {SeparatorProps};
