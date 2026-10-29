'use client';
import {
  DisclosureGroup as RACDisclosureGroup,
  type DisclosureGroupProps
} from 'react-aria-components/DisclosureGroup';
import './DisclosureGroup.css';
import {keepClass} from './className';

export function DisclosureGroup(props: DisclosureGroupProps) {
  return <RACDisclosureGroup {...props} className={keepClass(props.className)} />;
}
