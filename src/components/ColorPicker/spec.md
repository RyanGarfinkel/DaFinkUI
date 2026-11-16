# ColorPicker

A saturation/brightness area, hue slider, hex input, and optional swatches for picking a color.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | None | Controlled hex color, `#rrggbb` or `#rgb`. Invalid values render as `#000000`. |
| onValueChange | `(hex: string) => void` | None | Called with the new color as lowercase `#rrggbb`. Not called when the color is unchanged. |
| swatches | `string[]` | None | Preset hex colors rendered as a radio group below the picker. |
| label | `string` | None | Visible label; names the picker group via `aria-labelledby`. |
| showInput | `boolean` | `true` | Shows the hex input and color preview chip. |
| disabled | `boolean` | `false` | Disables every part of the picker. |
| className | `string` | `''` | Additional classes on the root. Default width is `w-48` (192px). |

Extends native `<div>` HTML attributes (except `onChange` and `defaultValue`).

## Variants

None.

## Interactive States

- **Area / hue (hover)**: pointer cursor. Dragging updates live with no transition so the thumb tracks the pointer 1:1.
- **Area / hue (focus-visible)**: `ring-2 ring-offset-2 ring-brand-ring` around the area or bar.
- **Swatch (hover)**: scales to 110%.
- **Swatch (selected)**: `ring-2 ring-offset-2 ring-input-border-hover`.
- **Swatch (focus-visible, not selected)**: `ring-2 ring-brand-ring`, no offset. Focused and selected: brand ring with offset.
- **Disabled**: root `opacity-40`; sliders `pointer-events-none`, `tabIndex=-1`, `aria-disabled`; hex input and swatches are natively disabled.

## Behavior

- HSV is held in internal state and only re-derived from `value` when the incoming hex differs from the current HSV. This keeps the hue when the color passes through greys or black, where hex alone loses it.
- The hex input commits as soon as six digits are typed. Three-digit and unprefixed values commit on blur or Enter. Invalid text reverts to the current color on blur.
- Pointer drags use pointer capture, so dragging outside the area keeps updating. `touch-action: none` stops touch drags from scrolling the page, and focusing on pointer down uses `preventScroll`.

## Accessibility

- Root: `role="group"`, named by `label` (or `aria-label="Color picker"`).
- Saturation/brightness area: `role="slider"`, `aria-label="Saturation and brightness"`, `aria-valuenow` = saturation %, `aria-valuetext` = "Saturation N%, brightness N%". Left/Right change saturation, Up/Down change brightness, 1% per press, 10% with Shift.
- Hue bar: `role="slider"`, `aria-label="Hue"`, range 0–360, `aria-valuetext` = "N degrees". Arrows ±1° (Shift ±10°), Home/End jump to 0/360.
- Hex input: native text input with `aria-label="Hex color"`, `autocomplete="off"`.
- Swatches: `role="radiogroup"` with `role="radio"` buttons, `aria-checked`, `aria-label` = the hex. Roving tabindex: one Tab stop; arrows move focus with wrapping, Home/End jump to ends, Enter/Space/click selects. Arrow keys do not change selection.
- Selection is shown by an offset ring, not color alone. Swatches are 18×18px with a 6px gap, so their centers sit exactly 24px apart; that meets WCAG 2.5.8 through its spacing exception (24px circles centered on adjacent swatches touch but don't overlap, and none reaches another swatch).
- Not an overlay: no focus trap, no Escape handling. To use it in a popup, put it inside `Popover`.

## When to Use

Use ColorPicker when users choose an arbitrary color: theme accents, labels, drawing tools. When only a small fixed palette is allowed, use `ToggleGroup` or `Radio` instead. For a compact trigger, render ColorPicker inside a `Popover`.

## Tokens Used

- `border-surface`: thumb border
- `--color-text`: thumb outline (35% mix)
- `ring-brand-ring`: focus-visible ring
- `ring-input-border-hover`: selected swatch ring
- `border-input-border`: swatch and preview chip border
- `text-text`: label
- `--radius`, `--border-width`, `--duration-fast`

The area and hue gradients are fixed color math, not theme colors.

## Color helpers (`color.ts`)

Exported alongside the component: `normalizeHex`, `hexToHsv`, `hsvToHex`, and the WCAG helpers `relativeLuminance(hex)` and `contrastRatio(a, b)` (1–21, or `null` for non-hex input). The repo's `scripts/check-contrast.ts` and the slide editor's custom-theme warnings both use `contrastRatio`, so they always agree.

## Installation

```bash
npx dafink-ui add color-picker
```

npm dependencies: none
Registry dependencies: `input`
