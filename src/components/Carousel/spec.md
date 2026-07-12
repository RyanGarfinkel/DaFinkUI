# Carousel

A compound component for cycling through a series of slides with keyboard navigation, dot indicators, and optional auto-play.

---

## Installation

```bash
npx dafink-ui add carousel
```

No npm dependencies. No registry dependencies.

---

## Usage

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from '@/src/components/Carousel/Carousel';

export default function Example() {
  return (
    <Carousel aria-label="Product images">
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="mt-3" />
    </Carousel>
  );
}
```

---

## Props

### Carousel

| Prop        | Type      | Default | Description                                               |
|-------------|-----------|---------|-----------------------------------------------------------|
| `loop`      | `boolean` | `false` | When true, wraps from the last slide back to the first.   |
| `autoPlay`  | `boolean` | `false` | Automatically advances slides at the specified interval.  |
| `interval`  | `number`  | `4000`  | Milliseconds between auto-advances when `autoPlay` is on. |
| `aria-label`| `string`  | `"Carousel"` | Accessible name for the carousel region landmark.    |
| `className` | `string`  | `""`    | Additional classes on the root element.                   |

Extends `HTMLAttributes<HTMLDivElement>`.

### CarouselContent

| Prop        | Type              | Default | Description                              |
|-------------|-------------------|---------|------------------------------------------|
| `children`  | `React.ReactNode` | None    | `CarouselItem` elements.                 |
| `className` | `string`          | `""`    | Additional classes on the overflow wrapper. |

### CarouselItem

| Prop        | Type              | Default | Description                              |
|-------------|-------------------|---------|------------------------------------------|
| `children`  | `React.ReactNode` | None    | Slide content.                           |
| `className` | `string`          | `""`    | Additional classes on the slide element. |

Extends `HTMLAttributes<HTMLDivElement>`.

### CarouselPrevious / CarouselNext

| Prop        | Type     | Default | Description                                      |
|-------------|----------|---------|--------------------------------------------------|
| `className` | `string` | `""`    | Additional classes merged onto the button.       |

Extends `ButtonHTMLAttributes<HTMLButtonElement>`. Automatically disabled when there is no previous/next slide (unless `loop` is enabled).

### CarouselDots

| Prop        | Type     | Default | Description                               |
|-------------|----------|---------|-------------------------------------------|
| `className` | `string` | `""`    | Additional classes on the dot container.  |

Renders nothing when there is only one slide. Each dot is a `role="tab"` button; the active dot expands to a pill shape.

---

## Interactive States

| State         | Behavior                                                                |
|---------------|-------------------------------------------------------------------------|
| hover         | Previous/Next buttons: `bg-surface-hover`, dot indicators darken border |
| focus-visible | `ring-2 ring-offset-2 ring-brand-ring` on Previous/Next and dots        |
| disabled      | Previous at index 0 (no loop), Next at last index: opacity 40%, no pointer events |
| active dot    | Expands from `w-1.5` to `w-4` with `bg-brand`; inactive dots use `bg-surface-border` |

---

## Accessibility

- Root has `role="region"` and `aria-roledescription="carousel"`. Provide a meaningful `aria-label` to make it a named landmark.
- Each `CarouselItem` has `role="group"` and `aria-roledescription="slide"`.
- A visually hidden `role="status"` live region announces "Slide N of M" on every transition.
- `CarouselPrevious` and `CarouselNext` have `aria-label` values ("Previous slide" / "Next slide") and are disabled at boundaries.
- `CarouselDots` renders a `role="tablist"` with each dot as `role="tab"` and `aria-selected`.

### Keyboard

| Key         | Behavior                                     |
|-------------|----------------------------------------------|
| ArrowRight  | Advance to next slide                        |
| ArrowLeft   | Go to previous slide                         |
| Tab         | Moves focus between Previous, Next, and dots |
| Enter/Space | Activates focused Previous, Next, or dot     |

### Drag / Swipe

`CarouselContent`'s track supports pointer-based drag-to-navigate as an enhancement on top of the button and keyboard controls; it does not replace either.

- Implemented with native Pointer Events (`onPointerDown` / `onPointerMove` / `onPointerUp` / `onPointerCancel`) so mouse, touch, and pen input are handled uniformly.
- A gesture is only treated as a drag once the pointer moves more than 5px from its start position. Below that threshold, clicks on interactive content inside a `CarouselItem` (e.g. a button) fire normally.
- While dragging past the activation threshold, the track follows the pointer 1:1 via `transform: translateX(...)` with no transition, then calls `setPointerCapture` so the drag continues even if the pointer leaves the track.
- On release, if the drag distance exceeds 20% of the track's width (falls back to a fixed 50px when the track has no measured width, e.g. in a non-layout environment), the carousel advances to the next slide (dragged left) or previous slide (dragged right) via the same `scrollNext`/`scrollPrev` logic the buttons use, so `loop` and boundary clamping behave identically. Below the threshold, the track snaps back to the current slide.
- The snap/settle animation reuses the existing `motion-safe:transition-transform motion-safe:duration-300` class (removed only while actively dragging), so it automatically respects `prefers-reduced-motion` the same way index-driven transitions already do.
- `CarouselDots` reads the same `currentIndex` from context, so dragging to a new slide keeps the active dot in sync automatically.
- The track uses `touch-action: pan-y` (`touch-pan-y`) so vertical page scrolling on touch devices is unaffected; only horizontal panning is captured for the swipe gesture.

---

## Tokens used

- `bg-surface`, `bg-surface-hover`, `bg-surface-active`, `border-surface-border`, `border-surface-border-hover`
- `text-text`
- `bg-brand` (active dot)
- `ring-brand-ring` (focus ring on nav buttons and dots)

---

## When to use

- Image galleries, product photo viewers, feature highlights, testimonials.
- Prefer a scrollable list for more than ~8 items: carousels hide content and should be used sparingly.
- Always provide meaningful slide content and ensure the carousel label describes what is being cycled through.
