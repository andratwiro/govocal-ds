'use client';
import {Button} from 'react-aria-components/Button';
import {
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  type DisclosureProps,
  type DisclosurePanelProps,
  type HeadingProps
} from 'react-aria-components/Disclosure';
import {Heading} from './Content';
import {ChevronRight} from 'lucide-react';
import './Disclosure.css';
import {keepClass} from './className';
import clsx from 'clsx';

export function Disclosure(props: DisclosureProps) {
  return <AriaDisclosure {...props} className={keepClass(props.className, 'gv-base-disclosure')} />;
}

export function DisclosureHeader({children, ...props}: HeadingProps) {
  return (
    <Heading {...props} className={clsx('react-aria-Heading gv-base-heading', props.className)}>
      <Button slot="trigger" className="disclosure-button">
        <ChevronRight size={16} />
        <span>{children}</span>
      </Button>
    </Heading>
  );
}

export function DisclosurePanel(props: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel {...props} className={keepClass(props.className, 'gv-base-disclosure-panel')}>
      <div>{props.children}</div>
    </AriaDisclosurePanel>
  );
}
export type {DisclosureProps, DisclosurePanelProps};
