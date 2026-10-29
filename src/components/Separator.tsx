'use client';
import {Separator as RACSeparator, type SeparatorProps} from 'react-aria-components/Separator';
import React from 'react';
import './Separator.css';
import clsx from 'clsx';

export function Separator(props: SeparatorProps) {
  return <RACSeparator {...props} className={clsx('react-aria-Separator', props.className)} />;
}
