import {VisuallyHidden} from 'govocal-ds';

// A visually hidden h2 naming a tab's content, so headings go h1 → h2 → h3 (card titles are h3).
export function SectionHeading({children}: {children: string}) {
  return <VisuallyHidden elementType="h2">{children}</VisuallyHidden>;
}
