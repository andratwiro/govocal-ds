'use client';
import {useRef} from 'react';
import {Button as AriaButton} from 'react-aria-components/Button';
import {Dialog, DialogTrigger} from 'react-aria-components/Dialog';
import {Tag, TagGroup, TagList} from 'react-aria-components/TagGroup';
import {Plus, X} from 'lucide-react';
import {Button} from '../Button';
import {Popover} from '../Popover';
import {OptionList, type OptionListItem} from './OptionList';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './Badge.css';
import './TagPicker.css';

export interface TagPickerProps extends PlacementProps {
  /** Names the tags and the list that adds them, e.g. "Tags". The page shows its own label beside the picker. */
  'aria-label': string;
  /** Every tag that can be chosen. */
  options: OptionListItem[];
  /** The ids of the chosen tags, in the order they show. */
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  /** @default 'Add tag' */
  addLabel?: string;
  /** The search's placeholder in the list (shown past five tags). @default 'Search tags...' */
  placeholder?: string;
  /** Adds the list's footer: how many are chosen, in these words, and Done. */
  selectionLabel?: (n: number) => string;
  /** The tags show without their ×, and nothing can be added. */
  isDisabled?: boolean;
}

/**
 * The tags on an item, each removable, then "+ Add tag", which opens the Option list (several, searchable) in a
 * popover. ←→ move between the tags, Delete or Backspace removes the focused one, Tab goes on to Add tag. The tags
 * are React Aria's TagGroup drawn as the removable Badge. Not in Figma yet.
 */
export function TagPicker({'aria-label': label, options, selected, onChange, addLabel = 'Add tag',
  placeholder = 'Search tags...', selectionLabel, isDisabled, className, style}: TagPickerProps) {
  const chosen = selected.map(id => options.find(o => o.id === id)).filter((o): o is OptionListItem => !!o);
  const root = useRef<HTMLDivElement>(null);
  const remove = (keys: Set<unknown>) => {
    const at = Math.max(selected.findIndex(id => keys.has(id)), 0);
    onChange(selected.filter(id => !keys.has(id)));
    // Once React Aria has settled, focus goes to the tag that took the removed one's place (or the one before it), or
    // to Add tag when none are left; never to the page.
    requestAnimationFrame(() => {
      if (root.current?.contains(document.activeElement)) return;
      const rows = root.current?.querySelectorAll<HTMLElement>('[role="row"]') ?? [];
      const add = root.current?.querySelector<HTMLElement>(':scope > .react-aria-Button');
      (rows[Math.min(at, rows.length - 1)] ?? add)?.focus();
    });
  };
  return (
    <div className={clsx('gv-tag-picker', className)} style={style} ref={root}>
      {chosen.length > 0 && (
        <TagGroup aria-label={label} className="gv-tag-picker__group" onRemove={isDisabled ? undefined : remove}>
          <TagList items={chosen} className="gv-tag-picker__list">
            {o => (
              <Tag id={o.id} textValue={o.label} className="gv-pill gv-tag-picker__tag" data-variant="outlined"
                data-removable={isDisabled ? undefined : true}>
                {({allowsRemoving}) => (
                  <>
                    <span className="gv-pill__label">{o.label}</span>
                    {allowsRemoving && (
                      <AriaButton slot="remove" className="gv-pill__remove" aria-label={`Remove ${o.label}`}>
                        <X aria-hidden size={12} />
                      </AriaButton>
                    )}
                  </>
                )}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      )}
      <DialogTrigger>
        <Button variant="quiet" size={32} isDisabled={isDisabled}>
          <Plus aria-hidden />{addLabel}
        </Button>
        <Popover placement="bottom start" showArrow={false} className="gv-tag-picker__popover">
          <Dialog aria-label={label} className="gv-tag-picker__dialog">
            <OptionList aria-label={label} options={options} selected={selected} onChange={onChange}
              placeholder={placeholder} searchLabel={placeholder.replace(/(\.\.\.|…)$/, '')} selectionLabel={selectionLabel} />
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
