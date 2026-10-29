'use client';
import type {ReactNode} from 'react';
import {CircleHelp} from 'lucide-react';
import {Dialog, DialogTrigger, Heading} from '../Dialog';
import {Popover} from '../Popover';
import {Button} from '../Button';
import {IconButton} from './IconButton';
import './HelpPopover.css';

export interface HelpPopoverProps {
  /** The popover's heading, which also names its dialog ("Public API Access"). */
  title: string;
  /** The help itself: a sentence or two. */
  children: ReactNode;
  /** The icon trigger's accessible name. @default `Help: ${title}` */
  label?: string;
  /** Words for a text trigger ("Learn more") instead of the help icon. */
  triggerText?: string;
}

/**
 * A help icon (or a "Learn more" text button) that opens a short popover with a heading and a sentence or two.
 * The real admin's tooltip on tool cards; the press opens it, so it works by touch and keyboard. Not in Figma yet.
 */
export function HelpPopover({title, children, label, triggerText}: HelpPopoverProps) {
  return (
    <DialogTrigger>
      {triggerText
        ? <Button variant="quiet" size={32}>{triggerText}</Button>
        : <IconButton aria-label={label ?? `Help: ${title}`}><CircleHelp aria-hidden size={16} /></IconButton>}
      <Popover placement="bottom">
        <Dialog className="gv-help-popover">
          <Heading slot="title" className="gv-help-popover__title">{title}</Heading>
          <div className="gv-help-popover__body">{children}</div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
