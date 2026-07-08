# Slider

A styled range input for selecting a numeric value within a defined range. Built on the native `<input type="range">` for full keyboard and accessibility support.

## Props

| Prop            | Type                         | Default | Description                                            |
|-----------------|------------------------------|---------|--------------------------------------------------------|
| value           | number                       | —       | Controlled current value.                              |
| onValueChange   | (value: number) => void      | —       | Called with the new numeric value on change.           |
| min             | number                       | 0       | Minimum value.                                         |
| max             | number                       | 100     | Maximum value.                                         |
| step            | number                       | 1       | Increment between selectable values.                   |
| disabled        | boolean                      | false   | Disables the slider.                                   |
| label           | string                       | —       | Visible label above the track; links to input via id.  |
| hint            | string                       | —       | Helper text below the track.                           |
| showValue       | boolean                      | false   | Shows the current numeric value next to the label.     |
| size            | 'default' \| 'sm'            | 'default' | 'sm' renders a shorter row (h-4) and thinner track (h-1) for dense layouts. |
| tone            | 'brand' \| 'current'         | 'brand' | 'current' derives the track/fill/thumb color from `currentColor` instead of the brand token — use when the slider sits on an arbitrary colored surface (e.g. inside a colored chat bubble) rather than the page background. |
| ariaLabel       | string                       | —       | Sets `aria-label` on the input directly — use when there is no visible `label` (e.g. an icon-only context). |
| ariaValueText   | string                       | —       | Sets `aria-valuetext`, overriding the spoken value with a custom string (e.g. a formatted timestamp). |
| className       | string                       | ""      | Additional classes merged onto the root wrapper.       |

## Interactive States

- **hover**: Native browser thumb hover; `accent-color` token applied to match brand styling.
- **focus**: `outline-none` — suppresses the browser default outline on the input.
- **focus-visible**: `ring-2 ring-offset-2 ring-brand-ring` — visible keyboard focus ring on the input element.
- **disabled**: `opacity-40 pointer-events-none cursor-not-allowed` — muted appearance, no interaction.

## Visual Structure

- **Track**: A relative container `h-1.5 rounded-full bg-surface-active` (`tone="current"`: `bg-current/20`). An absolutely-positioned inner `div` (`bg-brand`, or `bg-current` for `tone="current"`) expands from left to the current percentage to show the filled portion.
- **Thumb**: Styled via `accent-color: var(--color-brand)` inline on the native input (`accent-color: currentColor` for `tone="current"`), so it picks up the right color in either mode. The input sits full-width over the track for hit testing.
- **Label row**: Flexbox row with the label on the left and the current value (when `showValue` is true) on the right.
- **Hint**: `text-sm text-text-muted` below the track; associated to the input via `aria-describedby`.

## Tone

`tone="current"` swaps every brand-token color reference (track empty-state, fill, thumb accent, focus ring) for a `currentColor`-derived equivalent, so the slider inherits whatever text color its parent sets rather than always rendering brand blue. This mirrors `Button`'s `variant="on-color"` and exists for the same reason: a control that needs to sit legibly on top of an arbitrary colored surface (e.g. `AudioPlayer`'s compact seek bar inside a `Message` bubble) instead of the page background, where `tone="brand"` (the default) is the right, predictable choice.

## Drag Behavior

The fill bar tracks the pointer 1:1 during an active drag — no transition is applied while `onPointerDown` through `onPointerUp`/`onPointerCancel` is in progress, so the fill snaps instantly to the input's live value instead of animating toward it. This prevents the fill from lagging behind a fast pointer move.

The `motion-safe:transition-all` classes are re-applied as soon as the drag ends, so value changes from keyboard input (arrow keys, Home/End, Page Up/Down) or from a parent component changing `value` programmatically still animate smoothly.

## Accessibility

- Uses native `<input type="range">` — keyboard-navigable by default (arrow keys, Home/End, Page Up/Down).
- `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` are set explicitly.
- `label` and `input` are linked via `htmlFor`/`id`.
- `hint` is linked via `aria-describedby`.
- `ariaLabel` provides an accessible name when no visible `label` is rendered.
- `ariaValueText`, when provided, overrides the announced value with a custom string (e.g. `"1:32 of 6:12"` for a time-based slider).
- Focus-visible ring is always present for keyboard users.
- Animations respect `prefers-reduced-motion` via `motion-safe:` variant.

## When to Use

Use Slider when the user needs to select a value along a continuous or stepped range — volume, brightness, zoom level, price range. Prefer a numeric Input when the user needs to type an exact value.

## Tokens Used

- `bg-brand` — filled portion of the track and thumb accent color
- `bg-surface-active` — empty track background
- `text-text` — label color
- `text-text-muted` — hint and value display color
- `ring-brand-ring` — focus-visible ring
- `--duration-fast` — filled track transition duration

## Installation

```
npx dafink-ui add slider
```

No npm dependencies. No registry dependencies.
