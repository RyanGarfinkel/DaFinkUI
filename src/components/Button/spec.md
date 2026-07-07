# Button

A clickable control that triggers an action.

## Variants

| Variant      | Use case                                                        |
|--------------|-----------------------------------------------------------------|
| primary      | The main call to action on a page or section                    |
| secondary    | Supporting actions alongside a primary                          |
| outlined     | Medium-emphasis; same weight as secondary but more visible      |
| ghost        | Low-emphasis actions, often in dense UIs                        |
| link         | Inline or contextual actions that should read as text           |
| destructive  | Irreversible or dangerous actions                               |
| arrowleft    | Previous-page navigation; prepends a ← arrow, slides on hover  |
| arrowright   | Next-page navigation; appends a → arrow, slides on hover       |
| on-color     | A control placed on top of an arbitrary colored surface (e.g. inside a colored chat bubble) rather than the page background. Uses `currentColor` for both fill and text instead of a fixed brand color, so it inherits whatever text color its parent sets and always contrasts against that parent's own background. |

## Sizes

| Size    | Height | Use case                          |
|---------|--------|------------------------------------|
| sm      | 32px   | Compact / inline use               |
| md      | 36px   | Default                            |
| lg      | 44px   | Prominent / hero use               |
| icon    | 36px   | Square icon button                 |
| icon-sm | 28px   | Square icon button for dense UI (toolbars, compact controls) |

## Props

| Prop      | Type                                                               | Default   |
|-----------|--------------------------------------------------------------------|-----------|
| variant   | primary \| secondary \| outlined \| ghost \| link \| destructive \| arrowleft \| arrowright \| on-color | primary   |
| size      | sm \| md \| lg \| icon \| icon-sm                                 | md        |
| shape     | default \| circle                                                  | default   |
| loading   | boolean                                                            | false     |
| disabled  | boolean                                                            | false     |
| href      | string                                                             | —         |
| className | string                                                             | —         |

Extends all native `<button>` HTML attributes. When `href` is provided the component renders as a Next.js `<Link>` instead of a `<button>` — all visual variants and sizes work identically; `loading` and `disabled` are ignored in this mode.

## On-Color Variant

`variant="on-color"` sets `background-color: rgb(currentColor / 0.15)` and `color: currentColor` (`bg-current/15 text-current`), instead of the fixed `bg-brand`/`text-text` values every other variant uses. Because `color` inherits from the nearest ancestor that sets it, this variant automatically matches whatever surface it's placed inside — e.g. a `Message` bubble that sets `text-brand-fg` (sent) or `text-text` (received) on itself. Hover/active states (`bg-current/25`, `bg-current/30`) and the focus ring (`ring-current`) follow the same mechanism, so no separate light/dark handling is needed. Use it for controls embedded inside colored content (a play button inside a chat bubble) rather than controls on the page background, where a named variant like `ghost` is more predictable.

## Icon Size

`size="icon"` renders the button as a 36×36px square, `size="icon-sm"` as a 28×28px square, both with no horizontal padding, centering the child. All variants work. **Requires `aria-label`** when there is no visible text label.

## Shape

`shape="circle"` renders `rounded-full` instead of the default `rounded-[var(--radius)]` corner treatment. Pair with `size="icon"` or `size="icon-sm"` (equal width/height) for a true circle — using `circle` with a non-square size produces a pill shape. Typical use: a primary circular play/pause button in a media player.

## Loading State

When `loading` is `true`: a spinner replaces children, the button is disabled, and `aria-busy="true"` is set so screen readers announce the state. The button remains in the DOM and preserves its size.

## Interactive States

- **hover**: background and border shift one step (e.g. blue-600 → blue-700; zinc-200 border → zinc-300)
- **active**: background darkens further; element scales down slightly (`scale-[0.98]`) to convey press
- **focus**: outline suppressed (`focus:outline-none`)
- **focus-visible**: 2px ring with 2px offset in the variant's ring color — keyboard navigation only
- **disabled**: 40% opacity, pointer events disabled — no hover, active, or focus states

## Visual Design

- `rounded-md` — subtle rounding, not pill
- `shadow-sm` on primary, secondary, destructive — lifts the element off the surface
- `tracking-tight` — tighter letter spacing for label legibility
- `transition-all duration-150` — smooth color and scale transitions
- ghost variant has no background or border by default; hover adds `bg-zinc-100`
- secondary variant has a `border-zinc-200` border at rest

## Tokens Used

- Colors: `colors.primary`, `colors.secondary`, `colors.ghost`, `colors.destructive`

## When to Use

- Use `primary` once per view — it anchors the main action
- Use `secondary` for secondary confirmations or alternative paths
- Use `ghost` when the button needs to recede visually (toolbars, table rows)
- Use `destructive` only when the action deletes or cannot be undone — pair with a confirmation step for critical actions
