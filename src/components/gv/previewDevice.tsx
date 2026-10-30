'use client';
import {useState} from 'react';
import {Monitor, Smartphone} from 'lucide-react';
import {SegmentedControl, SegmentedControlItem} from './SegmentedControl';

/*
 * The device a preview shows its content at, shared by Email preview and Site preview: one switch, one pair of widths
 * (`--preview-width` in each part's stylesheet). Internal: the parts export the type and take the switch's words.
 */

/** The width a preview shows: `desktop` (the page or email at full width) or `phone` (Phone preview's 343px). */
export type PreviewDevice = 'desktop' | 'phone';

/** The device, controlled or not. */
export function usePreviewDevice(device: PreviewDevice | undefined, defaultDevice: PreviewDevice,
  onChange?: (device: PreviewDevice) => void) {
  const [inner, setInner] = useState(defaultDevice);
  const current = device ?? inner;
  return [
    current,
    (next: PreviewDevice) => {
      setInner(next);
      onChange?.(next);
    }
  ] as const;
}

/** The two-segment switch: Desktop / Phone, each with its icon. A segment can't be unchosen. */
export function PreviewDeviceSwitch({device, onChange, label, desktop, phone}: {
  device: PreviewDevice; onChange: (device: PreviewDevice) => void; label: string; desktop: string; phone: string;
}) {
  return (
    <SegmentedControl aria-label={label} size={30} selectionMode="single" disallowEmptySelection selectedKeys={[device]}
      onSelectionChange={keys => {
        const next = [...keys][0];
        if (next) onChange(next as PreviewDevice);
      }}>
      <SegmentedControlItem id="desktop"><Monitor aria-hidden size={14} />{desktop}</SegmentedControlItem>
      <SegmentedControlItem id="phone"><Smartphone aria-hidden size={14} />{phone}</SegmentedControlItem>
    </SegmentedControl>
  );
}
