'use client';
import type {ReactNode} from 'react';
import {CircleHelp} from 'lucide-react';
import {Heading} from 'react-aria-components/Heading';
import {Dialog, DialogTrigger} from 'react-aria-components/Dialog';
import {Popover} from '../Popover';
import {Button} from '../Button';
import {IconButton} from './IconButton';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './HelpPopover.css';

/** The words Help popover says itself (docs/API.md rule 11). Stat tile takes the same key and hands it on. */
export interface HelpPopoverLabels {
  /** The help icon's name, given the popover's title. */
  help: (title: string) => string;
}

/** Help popover's English words; a page passes its own over them with `labels`. */
export const helpPopoverLabels: HelpPopoverLabels = {help: title => `Help: ${title}`};

export interface HelpPopoverProps extends PlacementProps {
  /** The popover's heading, which also names its dialog ("Public API Access"). */
  title: string;
  /** The help itself: a sentence or two. */
  children: ReactNode;
  /** Words for a text trigger ("Learn more") instead of the help icon. */
  triggerText?: string;
  /** Its own words (the icon's name, "Help: <title>"), over `helpPopoverLabels`. */
  labels?: Partial<HelpPopoverLabels>;
}

/**
 * A help icon (or a "Learn more" text button) that opens a short popover with a heading and a sentence or two.
 * The real admin's tooltip on tool cards; the press opens it, so it works by touch and keyboard. Not in Figma yet.
 */
export function HelpPopover({title, children, triggerText, labels, className, style}: HelpPopoverProps) {
  return (
    <DialogTrigger>
      {triggerText
        ? <Button variant="quiet" size={32} className={className} style={style}>{triggerText}</Button>
        : <IconButton aria-label={mergeLabels(helpPopoverLabels, labels).help(title)} className={className} style={style}><CircleHelp aria-hidden size={16} /></IconButton>}
      <Popover placement="bottom">
        <Dialog className="gv-help-popover">
          <Heading slot="title" className="gv-help-popover__title">{title}</Heading>
          <div className="gv-help-popover__body">{children}</div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
