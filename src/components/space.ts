import type {CSSProperties} from 'react';

/**
 * A step on the spacing scale, by its token's name: `'16'` is `--gv-space-16`. The layout parts' `gap` and `padding`
 * take only these, so `gap="13px"` and `gap={13}` don't compile (`tests/types/layout.tsx`). A string, not a number:
 * it names a token, it is not a pixel count to vary.
 */
export type Space = '0' | '2' | '4' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '28' | '32' | '40' | '48' | '56' |
  '64' | '104';

/** The padding props every layout part takes: all sides, or the inline and block axes (logical, so RTL follows). */
export interface PaddingProps {
  /** Padding on every side, a spacing token. `paddingInline` and `paddingBlock` win over it on their axis. */
  padding?: Space;
  /** Padding at the start and end of the line (left and right in English), a spacing token. */
  paddingInline?: Space;
  /** Padding above and below, a spacing token. */
  paddingBlock?: Space;
}

/** The token a step names, as a CSS value: `'16'` → `var(--gv-space-16)`. */
export const spaceVar = (step: Space | undefined) => (step === undefined ? undefined : `var(--gv-space-${step})`);

/** Custom properties for a layout part's stylesheet: only the ones set, so the stylesheet's defaults hold otherwise. */
export const layoutVars = (vars: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(vars).filter(([, v]) => v !== undefined)) as CSSProperties;
