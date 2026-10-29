// A visually hidden h2 naming a tab's content, so headings go h1 → h2 → h3 (card titles are h3).
export function SectionHeading({children}: {children: string}) {
  return <h2 className="bo-visually-hidden">{children}</h2>;
}
