'use client';
import {Meter as AriaMeter, type MeterProps as AriaMeterProps} from 'react-aria-components/Meter';
import {Label} from './Form';
import './Meter.css';
import {keepClass} from './className';

export interface MeterProps extends AriaMeterProps {
  label?: string;
}

/** A bar showing a value within a known range, such as space used (React Aria's Meter): for votes against a threshold, use Vote progress. */
export function Meter({label, ...props}: MeterProps) {
  return (
    <AriaMeter {...props} className={keepClass(props.className, 'gv-base-meter')}>
      {({percentage, valueText}) => (
        <>
          <Label>{label}</Label>
          <span className="value">{valueText}</span>
          <div className="track inset">
            <div
              className="fill"
              style={
                {
                  width: percentage + '%',
                  '--fill-color':
                    percentage < 70
                      ? 'var(--gv-surface-accent-strong)'
                      : percentage < 90
                        ? 'var(--gv-icon-warning)'
                        : 'var(--gv-surface-danger-strong)'
                } as any
              }
            />
          </div>
        </>
      )}
    </AriaMeter>
  );
}
