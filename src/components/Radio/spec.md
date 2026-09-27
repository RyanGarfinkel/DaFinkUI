# Radio

A controlled radio group with accessible markup, custom visual styling, and support for hints and disabled states.

## Components

### RadioGroup

Controlled wrapper that provides context to all child `RadioItem` components.

| Prop            | Type                     | Default | Description                                          |
|-----------------|--------------------------|---------|------------------------------------------------------|
| name            | string                   | required | Shared `name` attribute applied to all radio inputs |
| value           | string                   | required | Currently selected value                            |
| onValueChange   | (v: string) => void      | required | Callback fired when the user selects a new item     |
| className       | string                   | n/a     | Additional classes on the wrapper element             |
| children        | React.ReactNode          | required | One or more `RadioItem` components                  |

### RadioItem

Individual selectable option. Must be rendered inside a `RadioGroup`.

| Prop      | Type    | Default | Description                                          |
|-----------|---------|---------|------------------------------------------------------|
| value     | string  | required | Value emitted to `onValueChange` when selected      |
| label     | string  | required | Visible label text                                  |
| hint      | string  | n/a     | Optional helper text rendered below the label         |
| disabled  | boolean | false   | Prevents interaction and dims the item               |
| className | string  | n/a     | Additional classes on the label wrapper               |

## Interactive States

- **hover**: the visual circle border shifts from `border-surface-border` to `border-brand` via `group-hover`
- **focus-visible**: a 2px ring with 2px offset in `ring-brand-ring` appears around the visual circle, driven by `peer-focus-visible` from the hidden native input
- **selected**: border becomes `border-brand` and an inner filled `bg-brand` dot (w-2 h-2) is rendered
- **disabled**: the entire item is rendered at `opacity-40` with `pointer-events-none`; the native input carries `disabled`

All transitions on the visual circle use `duration-150` for snappiness. No layout properties are animated.

## Accessibility

- The container renders as `role="radiogroup"`.
- Each option renders a native `<input type="radio">` hidden with `sr-only`; screen readers still discover and announce it.
- The native input is associated with its label via `id` / `htmlFor` on the wrapping `<label>`, so clicking either the label or circle activates the input.
- `aria-checked` is set explicitly on each input to mirror the controlled `checked` state.
- All inputs within a group share the same `name` attribute, so the browser treats the group as a single Tab stop: Tab moves focus to the currently selected item (or the first enabled item if none is selected), never stepping through every item individually.
- Arrow keys (`ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`) are handled in JS, not left to native browser behavior: they move focus to the next or previous enabled item, wrapping at the ends, but do **not** select it. This differs from an uncontrolled native radio group, where an arrow key both moves focus and immediately selects the newly focused item.
- `Enter` or `Space` on the focused item calls `onValueChange`, selecting it. Combined with the point above: after arrow-key navigation, the focused item must still be confirmed with `Enter`/`Space` (or a click) to actually become selected.
- Focus ring uses `:focus-visible` semantics via Tailwind's `peer-focus-visible`: the ring appears only during keyboard navigation, not on mouse click.
- Disabled items set `disabled` on the native input and suppress pointer interaction on the wrapper.

## Tokens Used

| Token                  | Usage                             |
|------------------------|-----------------------------------|
| `bg-surface`           | Visual circle background          |
| `bg-brand`             | Inner dot when selected           |
| `border-surface-border`| Circle border in unselected state |
| `border-brand`         | Circle border in selected state   |
| `text-text`            | Label text                        |
| `text-text-muted`      | Hint text                         |
| `ring-brand-ring`      | Focus-visible ring color          |

## When to Use

Use `RadioGroup` + `RadioItem` when the user must choose **exactly one option** from a small, visible set (typically 2–6 items). The entire set should be readable at a glance; if you have many options or need search/filter, use a `Select` instead.

**Good fits:** shipping method, plan tier, contact preference, difficulty level.

**Not a good fit:** toggling a single boolean (use a `Checkbox` or `Switch`), selecting multiple items (use `Checkbox` group), or picking from a long list (use `Select`).
