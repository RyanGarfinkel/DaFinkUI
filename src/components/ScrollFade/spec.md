# ScrollFade

A scroll container that overlays a soft gradient at whichever edge still has more content to reveal: a subtle affordance that there's more to scroll, without a hard-edged cutoff.

---

## Props

| Name             | Type                        | Default        | Description                                                             |
|------------------|-----------------------------|-----------------|--------------------------------------------------------------------------|
| direction        | `'vertical' \| 'horizontal'`| `'vertical'`    | Which axis scrolls. Vertical fades top/bottom; horizontal fades left/right. |
| fadeSize         | string                      | `"h-10"`/`"w-10"` | Tailwind size class for how deep the fade extends from the edge.       |
| fadeFrom         | string                      | `"from-surface"`| Tailwind gradient-from color class. Set this to match whatever background the scrolling content sits on (e.g. `"from-surface-active"` for a code block); otherwise the fade won't blend and will show a visible seam. |
| className        | string                      | `""`            | Additional CSS classes merged onto the scrollable element itself.       |
| wrapperClassName | string                      | `""`            | Additional CSS classes merged onto the outer positioning wrapper (the element that establishes the fade overlays' containing block). Use this when `ScrollFade` itself needs to be a sized flex item, e.g. `wrapperClassName="flex-1 min-h-0"` inside a `flex-col` parent, since `className` alone only reaches the inner scrollable element, which isn't itself a flex item of anything outside `ScrollFade`. |
| children         | ReactNode                   | required        | The scrollable content.                                                 |

`ScrollFade` forwards a ref to the scrollable element (not the outer positioning wrapper), and forwards any other native `div` props (including `onScroll`, which still fires normally: `ScrollFade` calls it after its own internal fade recalculation).

**Important:** when you use `wrapperClassName` to size the outer wrapper (e.g. `flex-1 min-h-0`), also add `h-full` to `className`. The inner scrollable element is a plain block child of the wrapper, not itself a flex item: without `h-full` it sizes to its own content height instead of filling the now-constrained wrapper, and nothing actually overflows or scrolls. `Sidebar`'s own scroll region does exactly this (`wrapperClassName="flex-1 min-h-0"` + `className="h-full ..."`); use it as the reference.

---

## Behavior

- On mount, and on every resize (via `ResizeObserver`) and scroll event, `ScrollFade` measures whether the scroll position is away from the start and/or away from the end of the content.
- The start fade shows once `scrollTop`/`scrollLeft` is greater than 0.
- The end fade shows while `scrollTop + clientHeight` (or the horizontal equivalent) is less than `scrollHeight`.
- If content doesn't overflow at all, neither fade ever shows.
- Fades cross-fade in/out via `motion-safe:transition-opacity`: no fade snaps in or out abruptly, and both respect `prefers-reduced-motion` through the global rule in `globals.css`.
- The fade overlays sit at `z-20`. If the scrolling content contains elements with their own `z-index` (e.g. a `SidebarLink`'s `z-10`, used to sit above a sliding active-indicator), keep them below `z-20` or the fade won't visually cover them as they scroll past the edge.

---

## Accessibility

- Both fade overlays have `aria-hidden="true"` and `pointer-events-none`: they carry no semantic meaning and never intercept clicks, taps, or scroll gestures.
- `ScrollFade` does not add or remove any ARIA roles, tabindex, or focus behavior on the scrollable region itself; if the content needs to be independently focusable when it overflows (e.g. for keyboard-driven scrolling), add that the same way `CodeBlock`/`ComponentPreview` do (conditional `tabIndex`/`role="region"`/`aria-label`, driven by their own overflow check).

---

## When to Use

Use `ScrollFade` for any scrollable region where content can be clipped at an edge and a hard cutoff would look unfinished: sidebars, code blocks, horizontally-scrolling previews, dropdown/menu lists, drawers. Skip it for very short lists that rarely overflow, where the fade would almost never appear and isn't worth the wrapper.

Always set `fadeFrom` to match the actual background color token behind the scrolling content: the default (`from-surface`) only blends correctly on a plain `bg-surface` container.

---

## Tokens Used

| Token                  | Usage                                    |
|------------------------|-------------------------------------------|
| `bg-surface` (default `fadeFrom`) | Gradient start color, must match the scrollable content's background |
| `--duration-fast`      | Fade cross-fade transition duration      |

---

## Installation

```bash
npx dafink-ui add scroll-fade
```

No additional npm dependencies. No registry dependencies.
