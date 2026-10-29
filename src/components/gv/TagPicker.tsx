'use client';
import {useRef} from 'react';
import {Button as AriaButton} from 'react-aria-components/Button';
import {Dialog, DialogTrigger} from 'react-aria-components/Dialog';
import {Tag, TagGroup, TagList} from 'react-aria-components/TagGroup';
import {Plus, X} from 'lucide-react';
import {Button} from '../Button';
import {Popover} from '../Popover';
import {OptionList, optionListLabels, type OptionListItem, type OptionListLabels} from './OptionList';
import {useControlledState} from '../useControlledState';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './Badge.css';
import './TagPicker.css';

/** The words Tag picker says itself (docs/API.md rule 11), with the Option list's, which it hands on. */
export interface TagPickerLabels extends OptionListLabels {
  /** The Add tag button's text. */
  add: string;
  /** A tag's × name, given the tag. */
  remove: (tag: string) => string;
}

/** Tag picker's English words; a page passes its own over them with `labels`. */
export const tagPickerLabels: TagPickerLabels = {
  ...optionListLabels,
  placeholder: 'Search tags...',
  search: list => `Search ${list.toLowerCase()}`,
  add: 'Add tag',
  remove: tag => `Remove ${tag}`
};

export interface TagPickerProps extends PlacementProps {
  /** Names the tags and the list that adds them, e.g. "Tags". The page shows its own label beside the picker. */
  'aria-label': string;
  /** Every tag that can be chosen. */
  items: OptionListItem[];
  /** The ids of the chosen tags, in the order they show (controlled). */
  value?: readonly string[];
  /** The tags chosen at first, when the picker keeps its own value. @default [] */
  defaultValue?: readonly string[];
  /** Fires when a tag is added or removed, with the ids of all the tags now chosen. */
  onChange?: (value: string[]) => void;
  /** The search's placeholder in the list (shown past five tags). @default `labels.placeholder` ("Search tags...") */
  placeholder?: string;
  /** Adds the list's footer: how many are chosen, in these words, and Done. */
  selectionLabel?: (n: number) => string;
  /** The tags show without their ×, and nothing can be added. */
  isDisabled?: boolean;
  /** Its own words (Add tag, each ×, the list's search, No results, Done), over `tagPickerLabels`. */
  labels?: Partial<TagPickerLabels>;
}

/**
 * The tags on an item, each removable, then "+ Add tag", which opens the Option list (several, searchable) in a
 * popover. ←→ move between the tags, Delete or Backspace removes the focused one, Tab goes on to Add tag. The tags
 * are React Aria's TagGroup drawn as the removable Badge. Not in Figma yet.
 */
export function TagPicker({'aria-label': label, items, value, defaultValue = [], onChange, placeholder, selectionLabel,
  isDisabled, labels, className, style}: TagPickerProps) {
  const l = mergeLabels(tagPickerLabels, labels);
  const [selected, setChosen] = useControlledState<readonly string[]>(value, defaultValue);
  const setSelected = (ids: string[]) => {
    setChosen(ids);
    onChange?.(ids);
  };
  const chosen = selected.map(id => items.find(o => o.id === id)).filter((o): o is OptionListItem => !!o);
  const root = useRef<HTMLDivElement>(null);
  const remove = (keys: Set<unknown>) => {
    const at = Math.max(selected.findIndex(id => keys.has(id)), 0);
    setSelected(selected.filter(id => !keys.has(id)));
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
                      <AriaButton slot="remove" className="gv-pill__remove" aria-label={l.remove(o.label)}>
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
          <Plus aria-hidden />{l.add}
        </Button>
        <Popover placement="bottom start" showArrow={false} className="gv-tag-picker__popover">
          <Dialog aria-label={label} className="gv-tag-picker__dialog">
            <OptionList aria-label={label} items={items} value={selected} onChange={setSelected}
              placeholder={placeholder} selectionLabel={selectionLabel} labels={l} />
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
