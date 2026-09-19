# Slider

A styled range input for selecting a numeric value within a defined range. Built on the native `<input type="range">` for full keyboard and accessibility support.

## Props

| Prop            | Type                         | Default | Description                                            |
|-----------------|------------------------------|---------|--------------------------------------------------------|
| value           | number                       | -       | Controlled current value.                              |
| onValueChange   | (value: number) => void      | -       | Called with the new numeric value on change.           |
| min             | number                       | 0       | Minimum value.                                         |
| max             | number                       | 100     | Maximum value.                                         |
| step            | number                       | 1       | Increment between selectable values.                   |
| disabled        | boolean                      | false   | Disables the slider.                                   |
| label           | string                       | -       | Visible label above the track; links to input via id.  |
| hint            | string                       | -       | Helper text below the track.                           |
| showValue       | boolean                      | false   | Shows the current numeric value next to the label.     |
| size            | 'default' \| 'sm'            | 'default' | 'sm' renders a shorter row (h-4) and thinner track (h-1) for dense layouts. |
| tone            | 'brand' \| 'current'         | 'brand' | 'current' derives the track/fill/thumb color from `currentColor` instead of the brand token; use when the slider sits on an arbitrary colored surface (e.g. inside a colored chat bubble) rather than the page background. |
| ariaLabel       | string                       | -       | Sets `aria-label` on the input directly; use when there is no visible `label` (e.g. an icon-only context). |
| ariaValueText   | string                       | -       | Sets `aria-valuetext`, overriding the spoken value with a custom string (e.g. a formatted timestamp). |
| className       | string                       | ""      | Additional classes merged onto the root wrapper.       |

## Interactive States

- **hover**: Native browser thumb hover.
- **focus**: `outline-none` (suppresses the browser default outline on the input).
- **focus-visible**: a ring hugging the thumb itself, not the full track — see "Thumb Focus Ring" below.
- **disabled**: `opacity-40 pointer-events-none cursor-not-allowed` (muted appearance, no interaction).

## Thumb Focus Ring

`focus-visible:ring-2` on the `<input>` used to ring the entire track rectangle, which read as a generic form-control outline rather than something anchored to the thumb. The thumb itself is a UA-shadow pseudo-element (`::-webkit-slider-thumb` / `::-moz-range-thumb`), which Tailwind utilities can't target directly, so this is a scoped `<style>` block (same pattern `OTPInput` uses for its blinking cursor) with plain CSS:

- `-webkit-appearance`/`appearance: none` is reset on the thumb itself first — WebKit/Blink otherwise ignore most cosmetic properties on `::-webkit-slider-thumb` while native rendering is still active. Resetting it means the thumb's whole look (16px circle, `background-color`) is now defined here instead of coming from the browser's native chrome. `transform: none` and dropping `accent-color` from the input entirely are both defensive belt-and-suspenders alongside that reset, not the fix for anything actually observed.
- On `:focus-visible`, the thumb gets `outline-color: var(--slider-ring)` and `outline-offset: 2px` (base state: `outline: 2px solid transparent; outline-offset: 0px`, so both transition smoothly over 150ms and are skipped under `prefers-reduced-motion`). No size/scale change on focus — the thumb's footprint is identical in both states.
- **`outline`/`outline-offset`, not `box-shadow`, and this choice matters.** A `box-shadow`-based ring-offset draws the "gap" as a second, opaque shadow layer painted on top of whatever's behind the thumb — including the fill bar exactly where it touches the thumb (see "Fill/Thumb Alignment") — so the fill visibly stops short of the ring the instant it's focused. `outline-offset` has no equivalent paint step: the offset gap is genuinely transparent, so the fill stays visible running straight through it, right up to the thumb, with the ring appearing to sit on top of/around that connection rather than severing it. This is why the same visual language as every other focus ring here (`ring-offset-2 ring-brand-ring`, e.g. `Button`'s primary variant) needed a different CSS mechanism for this one component.
- Color comes through the `--slider-ring` CSS custom property, set inline per instance from `TONE_CLASSES`: `var(--color-brand-ring)` for `tone="brand"` (safe to use directly here, unlike an earlier `box-shadow` attempt — see below), `currentColor` for `tone="current"`.
- `--color-brand-ring` is defined identically to `--color-brand` itself (both light and dark blocks in `globals.css`) — every *other* ring in this system relying on `ring-offset-2` for its actual visible contrast, the ring color barely mattering next to a same-color thumb. That's specifically why a same-color `box-shadow` ring with no offset first read as "the thumb enlarges with no visible ring": a real, correctly-sized, zero-contrast ring. `outline-offset` sidesteps the problem instead of needing a different-colored ring to compensate for it.

## Visual Structure

- **Track**: A relative container `h-1.5 rounded-full bg-surface-active` (`tone="current"`: `bg-current/20`). An absolutely-positioned inner `div` (`bg-brand`, or `bg-current` for `tone="current"`) expands from left to the current percentage to show the filled portion.
- **Thumb**: A native `::-webkit-slider-thumb`/`::-moz-range-thumb` reset to a plain 16px circle filled with `var(--color-brand)` (`currentColor` for `tone="current"`) — see "Thumb Focus Ring" for why `accent-color` is deliberately absent. The input sits full-width over the track for hit testing.
- **Label row**: Flexbox row with the label on the left and the current value (when `showValue` is true) on the right.
- **Hint**: `text-sm text-text-muted` below the track; associated to the input via `aria-describedby`.

## Tone

`tone="current"` swaps every brand-token color reference (track empty-state, fill, thumb accent, focus ring) for a `currentColor`-derived equivalent, so the slider inherits whatever text color its parent sets rather than always rendering brand blue. This mirrors `Button`'s `variant="on-color"` and exists for the same reason: a control that needs to sit legibly on top of an arbitrary colored surface (e.g. `AudioPlayer`'s compact seek bar inside a `Message` bubble) instead of the page background, where `tone="brand"` (the default) is the right, predictable choice.

## Fill/Thumb Alignment

A range input positions its thumb inset by half the thumb's own width at each end of the track — its center travels from `THUMB_SIZE / 2` to `100% - THUMB_SIZE / 2`, never quite reaching the track's edges. The fill's width has to follow that same curve, not a plain `${pct}%`, or its edge drifts away from the thumb's actual center (most visible at the low end, where a naive percentage leaves a gap of roughly half the thumb's width): `width: calc(${THUMB_SIZE / 2}px + (100% - ${THUMB_SIZE}px) * ${pct / 100})`. `THUMB_SIZE` (16, in px) is a single constant shared with the thumb's CSS width/height in the scoped `<style>` block, so the two can't drift out of sync if the thumb size ever changes.

## Drag Behavior

The fill bar tracks the input's value 1:1 — no transition is applied — for the whole time the value could be changing directly by the user: during an active pointer drag (`onPointerDown` through `onPointerUp`/`onPointerCancel`), and for as long as the input is focused (covers arrow keys, Home/End, Page Up/Down, which move the native thumb instantly with no pointer events to bracket them). Without the focus-driven half of this, a keyboard step would move the thumb immediately but the fill would visibly animate to catch up over the next ~150ms, reading as the two being disconnected.

The `motion-safe:transition-all` classes are re-applied once the input blurs, so a value changed programmatically while the slider isn't focused (e.g. a parent's "reset" button) still animates smoothly.

## Accessibility

- Uses native `<input type="range">`, keyboard-navigable by default (arrow keys, Home/End, Page Up/Down).
- `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` are set explicitly.
- `label` and `input` are linked via `htmlFor`/`id`.
- `hint` is linked via `aria-describedby`.
- `ariaLabel` provides an accessible name when no visible `label` is rendered.
- `ariaValueText`, when provided, overrides the announced value with a custom string (e.g. `"1:32 of 6:12"` for a time-based slider).
- Focus-visible ring (on the thumb — see "Thumb Focus Ring") is always present for keyboard users.
- Animations respect `prefers-reduced-motion` via `motion-safe:` variant.

## When to Use

Use Slider when the user needs to select a value along a continuous or stepped range: volume, brightness, zoom level, price range. Prefer a numeric Input when the user needs to type an exact value.

## Tokens Used

- `bg-brand`: filled portion of the track
- `bg-surface-active`: empty track background
- `text-text`: label color
- `text-text-muted`: hint and value display color
- `--color-brand`: thumb fill color
- `--color-brand-ring`: thumb focus-visible ring color
- `--duration-fast`: filled track transition duration

## Installation

```
npx dafink-ui add slider
```

No npm dependencies. No registry dependencies.
