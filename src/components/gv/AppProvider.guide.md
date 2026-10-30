# App provider

## When to use

- Once, at the root of every app that uses the system, around everything else: the back office, a prototype, a host
  app's admin.
- To set the app's `locale` ("en-GB", "nl-BE", "ar-SA"): numbers, dates, lists and the direction parts lay out in
  follow it.
- To hand the app's router to every system link, menu item and tab with an `href` (`navigate`, `useHref`), so they
  move without a page load.
- So pages can call `toast()` and mount nothing: it draws the one toast region.

## When not to use

- Inside a page or a part: wrap the app once, never twice. To show a message, call `toast()` and let **Toast** draw it.
- To lay out a page: use **Stack**, **Inline** or **Grid**; it draws nothing on screen.
- To translate the words parts say: pass each part's `labels` (a **Toast**'s, a **Button**'s); `locale` changes
  numbers, dates and direction, never words.

## Anatomy

It draws no element of its own and takes no `className`. Inside it:

1. **Locale**: React Aria's I18nProvider with `locale`.
2. **Router** (optional): React Aria's RouterProvider with `navigate` and `useHref`.
3. **Icon stroke**: Lucide icons draw at the system's 1.75 stroke (an icon's own `strokeWidth` still wins).
4. **Toast region**: the one region `toast()` shows in, at the window's bottom end.

## Behaviour

Not interactive itself: it takes no focus or keys. The toasts it draws are Toast's (their keys are on Toast's page);
`e2e/app-provider.spec.ts` checks that `toast()` shows one toast, even beside a page's own region, and that icons draw
at 1.75.

## Content

- It says nothing of its own except the toast's × ("Close"), through `labels`.
- Set `lang` and `dir` on `<html>` to match `locale`; the provider doesn't.
- Toast words come with each `toast(title, description, {action})` call, in the page's language.

## Accessibility

**The provider gives you:** one live region for every toast (so a page's second region never doubles the
announcement), parts laid out in the locale's direction, and dates and numbers in the reader's form.

**You still own:**
- `lang` and `dir` on `<html>`, matching `locale`.
- Every word, through each part's `labels`.
- A router that moves focus to the new page's heading when it changes route.

## Related

- **Toast**: what `toast()` shows.
- **Link**: follows the router `navigate` hands it.
- **Tabs**: tabs with an `href` use the same router.

## Provenance

- **Built by:** agents, from the system's own needs (one toast region, the 1.75 stroke every app had to remember).
  Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** the back office's root doesn't use it yet (it sets the 1.75 stroke itself and its pages mount their
  own toast regions); one locale for the whole app.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: added: the one `ToastRegion`, Lucide at 1.75, the locale and an optional router; `toast()` shows a toast
  for 5 s unless told (docs/DECISIONS.md, "Composition contracts in code").
