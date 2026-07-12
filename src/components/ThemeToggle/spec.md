# ThemeToggle

A button that switches the site between light and dark mode, persisting the choice to `localStorage` and a cookie.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | `string` | `''` | Additional classes on the root button. |
| ...props | `ButtonHTMLAttributes<HTMLButtonElement>` | - | Any native `<button>` attribute (`id`, `data-*`, `style`, ...) is forwarded to the root element. |

## Interactive States

- **hover**: `hover:bg-surface-hover hover:text-text` (background and icon color shift)
- **focus**: outline suppressed (`focus:outline-none`)
- **focus-visible**: 2px brand ring with 2px offset: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring`
- **active (light)**: shows a sun icon, `aria-label="Switch to dark mode"`
- **active (dark)**: shows a moon icon, `aria-label="Switch to light mode"`
- Icon swap and background/text color both transition with `duration-[var(--duration-fast)]`

## Visual Design

- 36×36px (`h-9 w-9`) on mobile, 32×32px (`h-8 w-8`) at `md:` and up
- `rounded-md`, `text-text-muted` at rest, `text-text` on hover
- Icon: 15×15px inline SVG, sun (light mode active) or moon (dark mode active), `aria-hidden="true"`

## Behavior

- On mount, reads `localStorage.getItem('theme')`; if unset, falls back to `window.matchMedia('(prefers-color-scheme: dark)')`
- Applies or removes the `dark` class on `document.documentElement` to match the resolved mode
- Mirrors the resolved mode to a `theme` cookie (`path=/; max-age=31536000; SameSite=Lax`) so the server can render the correct mode on first paint
- On click, toggles the `dark` class, updates `localStorage` and the cookie, and flips `aria-label`
- On click, also adds a `theme-transition` class to `document.documentElement` immediately before toggling `dark`, then removes it after 300ms (matching `--duration-slow` in `app/globals.css`); this cross-fades every themed color on the page instead of snapping instantly. See the `.theme-transition` rule in `app/globals.css`.

## Accessibility

- Rendered as a native `<button type="button">`: reachable and activatable by keyboard (Tab, Enter, Space) with no extra wiring
- `aria-label` always reflects the action the button performs next ("Switch to light mode" / "Switch to dark mode"), not the current state; screen reader users get an accurate description of what activating the control will do
- The sun/moon icon is `aria-hidden="true"`; the label alone carries the accessible name
- The cross-fade added on toggle uses `transition`/`transition-duration` exclusively (never `animation`), so it is fully zeroed out by this repo's global `prefers-reduced-motion` rule in `app/globals.css` with no extra work in the component

## When to Use

- Use ThemeToggle for a persistent, site-wide light/dark mode switch, typically placed in a top nav or settings panel.
- It manages its own state internally (reads system preference, persists the choice); it is not a controlled component and takes no `checked`/`value` props.
- For a generic on/off setting that isn't tied to color scheme, use Switch instead.

## Tokens Used

`--color-text-muted`, `--color-text`, `--color-surface-hover`, `--color-brand-ring`, `--duration-fast`, `--duration-slow`, `--ease-standard`, `--radius`

## Installation

```bash
npx dafink-ui add theme-toggle
```

npm dependencies: none
No registry dependencies.
