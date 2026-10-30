'use client';
import {
  DisclosureGroup as RACDisclosureGroup,
  type DisclosureGroupProps
} from 'react-aria-components/DisclosureGroup';
import './DisclosureGroup.css';
import {keepClass} from './className';

/** A stack of Disclosures where one or several are open (React Aria's DisclosureGroup): use it for a short run of show/hide panels. */
export function DisclosureGroup(props: DisclosureGroupProps) {
  return <RACDisclosureGroup {...props} className={keepClass(props.className, 'gv-base-disclosure-group')} />;
}
export type {DisclosureGroupProps};
