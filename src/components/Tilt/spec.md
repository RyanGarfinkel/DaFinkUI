# Tilt

A wrapper div that tracks mouse position and applies a CSS 3D perspective tilt transform to itself on hover, creating a depth effect with no external dependencies.

## Props

| Prop        | Type              | Default | Description                                           |
|-------------|-------------------|---------|-------------------------------------------------------|
| children    | `React.ReactNode` | —       | Content to render inside the tilt wrapper             |
| max         | `number`          | `15`    | Maximum tilt angle in degrees                         |
| scale       | `number`          | `1.05`  | Scale factor applied while hovering                   |
| perspective | `number`          | `1000`  | CSS perspective distance in pixels                    |
| className   | `string`          | `''`    | Additional classes merged onto the wrapper div        |

## When to Use

- Cards, image thumbnails, and hero elements that benefit from a sense of depth on hover
- Feature callouts or product showcases where 3D interaction draws attention
- Any contained block where a subtle parallax-style effect adds polish without distraction

Do not apply Tilt to elements that already have complex hover transforms, or to interactive controls (buttons, inputs) where the motion would conflict with focus or active states.

## Accessibility

Tilt's transform is driven by mouse position, which means it has no effect on keyboard or touch users — this is acceptable because the effect is purely cosmetic and does not convey information.

**`prefers-reduced-motion`:** The component does not internally suppress motion. Callers that want to respect the user's motion preference should either:
- Conditionally render the children without the `<Tilt>` wrapper when `prefers-reduced-motion` is active, or
- Pass `max={0}` to neutralize the tilt while preserving the DOM structure.

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<Tilt max={prefersReducedMotion ? 0 : 15}>
  <Card>...</Card>
</Tilt>
```

## Installation

```bash
npx dafink-ui add tilt
```

No npm dependencies. No registry dependencies.
