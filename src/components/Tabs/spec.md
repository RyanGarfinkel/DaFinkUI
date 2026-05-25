# Tabs

A compound component for switching between related panels of content. Built with React context so subcomponents communicate implicitly — no prop drilling required.

## Subcomponents

### `Tabs`

The controlled root wrapper. Manages which tab is active and exposes that state to all descendants via context.

| Prop            | Type                      | Default | Description                                   |
|-----------------|---------------------------|---------|-----------------------------------------------|
| value           | string                    | —       | The currently active tab value (controlled)   |
| onValueChange   | (v: string) => void       | —       | Called when the user activates a different tab |
| children        | ReactNode                 | —       | Should contain `TabsList` and `TabsContent`   |
| className       | string                    | —       | Additional classes on the root wrapper `<div>` |

### `TabsList`

The horizontal container holding all `TabsTrigger` buttons. Renders with `role="tablist"`.

| Prop      | Type      | Default | Description                                |
|-----------|-----------|---------|--------------------------------------------|
| children  | ReactNode | —       | Should contain `TabsTrigger` components    |
| className | string    | —       | Additional classes on the list container   |

Accepts all native `<div>` HTML attributes.

### `TabsTrigger`

An individual tab button. Sets `aria-selected` and fires `onValueChange` on click.

| Prop      | Type      | Default | Description                                            |
|-----------|-----------|---------|--------------------------------------------------------|
| value     | string    | —       | Unique identifier matching a `TabsContent` value       |
| children  | ReactNode | —       | Label rendered inside the button                       |
| disabled  | boolean   | false   | Prevents activation and applies disabled styling       |
| className | string    | —       | Additional classes                                     |

Accepts all native `<button>` HTML attributes.

### `TabsContent`

The panel shown when its `value` matches the active tab. Hidden (unmounted) otherwise.

| Prop      | Type      | Default | Description                                        |
|-----------|-----------|---------|----------------------------------------------------|
| value     | string    | —       | Matches the `value` of the `TabsTrigger` to pair with |
| children  | ReactNode | —       | Content rendered inside the panel                  |
| className | string    | —       | Additional classes on the panel `<div>`            |

Accepts all native `<div>` HTML attributes.

## Behavior

- **Controlled only** — `Tabs` requires both `value` and `onValueChange`. The parent owns the active state.
- When a `TabsTrigger` is clicked, `onValueChange` is called with that trigger's `value`. The parent updates `value` and the active tab changes.
- Only the `TabsContent` whose `value` matches the active tab is rendered — inactive panels are unmounted, not hidden.
- Disabled triggers are not clickable and do not fire `onValueChange`.

## Interactive States

- **hover**: `hover:bg-surface-hover hover:text-text` — subtle background fill and text brightens
- **focus**: `focus:outline-none` — native outline suppressed
- **focus-visible**: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` — keyboard-only focus ring in the brand color
- **active (pressed)**: inherited from base button behavior
- **disabled**: `disabled:pointer-events-none disabled:opacity-40` — trigger is visible but non-interactive

## Sliding Indicator

The active tab is marked by an absolutely-positioned `h-0.5 bg-brand` bar rendered inside `TabsList`. Its `left` and `width` are measured from the active trigger via `useLayoutEffect` and updated on every value change. The bar transitions with `motion-safe:transition-[left,width] motion-safe:duration-200` — users who prefer reduced motion see an instant jump.

## Keyboard Navigation

Arrow key navigation between tabs is a progressive enhancement — not currently implemented. Tab key moves focus to the next focusable element in the document order. Each `TabsTrigger` is independently focusable and activatable with `Enter` or `Space`.

To add arrow key navigation, a `keyDown` handler on `TabsList` can intercept `ArrowLeft` and `ArrowRight`, focus the adjacent trigger, and optionally activate it.

## Accessibility

- `TabsList` carries `role="tablist"`
- Each `TabsTrigger` carries `role="tab"`, `aria-selected`, and `aria-controls` pointing to its panel
- Each `TabsContent` carries `role="tabpanel"` and `aria-labelledby` pointing back to its trigger
- All ARIA relationships are derived automatically from the shared `value` string — no manual wiring needed
- Focus-visible ring meets WCAG AA contrast requirements when using the `brand-ring` token

## Tokens Used

| Token              | Used on                            |
|--------------------|------------------------------------|
| `bg-surface`       | Active trigger background          |
| `bg-surface-hover` | Inactive trigger hover background  |
| `border-brand`     | Active trigger bottom border       |
| `border-surface-border` | TabsList bottom border        |
| `text-text`        | Active trigger text                |
| `text-text-muted`  | Inactive trigger text              |
| `focus-visible:ring-brand-ring` | Keyboard focus ring   |

## When to Use

- Use Tabs when content is parallel and mutually exclusive — the user should see one panel at a time.
- Use Tabs when there are 2–7 options. More than 7 tabs typically warrant a different navigation pattern (sidebar, dropdown).
- Do not use Tabs for sequential steps — use a stepper component instead.
- Do not use Tabs when the user needs to compare content across panels — consider showing both panels side by side.
