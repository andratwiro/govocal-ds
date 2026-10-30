import type {ReactNode} from 'react';
import {MissingPart, Text} from 'govocal-ds';

// A part of a page the system has no component or pattern for yet: the system's Missing part, a dashed frame named
// "Missing: <name>" around a plain stand-in, so the page says what the system still lacks. Inline gaps (inside a
// table cell, a toolbar) get only a dashed outline; their names go in the page's GapLegend.
export function Gap({name, inline, className, children}: {
  name: string; inline?: boolean; className?: string; children: ReactNode;
}) {
  return <MissingPart name={name} isInline={inline} className={className}>{children}</MissingPart>;
}

export function GapLegend({names}: {names: string[]}) {
  return <Text elementType="p" kind="small" color="meta">Dashed outline: the system has no component yet for {names.join(', ')}.</Text>;
}
