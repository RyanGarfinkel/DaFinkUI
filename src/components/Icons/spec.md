# Icons

The small set of stroke icons that components repeat: check, close, plus, search and chevrons. Each is a 24×24 SVG that inherits its color from `currentColor` and is hidden from assistive tech by default.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `number` | `16` | Width and height in pixels. |
| strokeWidth | `number` | `2` | Stroke width in the 24×24 viewBox. |

Extends all native `<svg>` attributes, so `className` colors, rotates or spaces an icon.

## Icons

`CheckIcon`, `CloseIcon`, `PlusIcon`, `SearchIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`.

## Interactive States

Non-interactive. An icon never takes focus; put it inside a button or link, and name that control.

## Accessibility

- Icons set `aria-hidden='true'`, so a button must have its own text or `aria-label`.
- To make an icon meaningful on its own, pass `role='img'`, an `aria-label` and `aria-hidden={undefined}`.
- Color comes from `currentColor`, so the surrounding text color decides contrast. Meet 3:1 for icons that carry meaning.

## When to Use

Reach for these before drawing a new SVG. If the shape you need is missing and two or more components would use it, add it here; a one-off icon stays in its component.

## Tokens Used

None. Color is inherited.

## Installation

```bash
npx dafink-ui add icons
```

npm dependencies: none
No registry dependencies.
