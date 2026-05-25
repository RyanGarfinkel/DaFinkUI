# Rule: Design Guidelines

Before making any visual, layout, or motion decision, read the design guidelines:

**`src/patterns/design.md`**

That file is the canonical source — it is served via MCP and shown in the docs site. Do not duplicate its content here.

Before building any interactive component that involves overlays, focus management, or keyboard interaction, also read:

**`src/patterns/accessibility.md`**

## Quick Reference

- Never use hardcoded colors or Tailwind palette values — see `rules/tokens.md`
- Brand color is for primary actions only
- Default transition duration is `--duration-fast` (150ms) for components, `--duration-base` (200ms) for navigation and overlays
- Overlay enter animation: `opacity-0 scale-95` → `opacity-100 scale-100` at `--duration-base` with `--ease-enter`
- Overlay exit animation: `opacity-100 scale-100` → `opacity-0 scale-95` at `--duration-fast` with `--ease-exit`
- Page transitions are handled globally — do not add per-page entry animations
- All motion must respect `prefers-reduced-motion` — handled globally in `globals.css`
- Every interactive element needs hover, focus, and focus-visible states — see `src/patterns/interactive-states.mdx`
- Minimum contrast: 4.5:1 for body text, 3:1 for large text and UI components — tokens are pre-validated
- Every component must be keyboard-navigable — see `src/patterns/accessibility.md`
- Popups and overlays require focus trap (modals) or managed focus (menus), Escape to close, and focus return to trigger — see `src/patterns/accessibility.md`
