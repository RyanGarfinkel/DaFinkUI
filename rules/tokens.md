# Rule: Use Design Tokens

Apply this rule whenever writing or modifying any component, pattern, or style in this repo.

## The Rule

**Never use hardcoded Tailwind palette values in components.** Use token-derived utility classes instead.

| Wrong                        | Right                     |
|------------------------------|---------------------------|
| `bg-blue-600`                | `bg-brand`                |
| `hover:bg-blue-700`          | `hover:bg-brand-hover`    |
| `text-zinc-900`              | `text-text`               |
| `text-zinc-500`              | `text-text-muted`         |
| `border-zinc-300`            | `border-input-border`     |
| `bg-red-600`                 | `bg-danger`               |
| `dark:bg-zinc-800`           | _(not needed — see below)_ |

## How the Token System Works

Tokens are defined as CSS custom properties in `app/globals.css` under `@theme`:

```css
@theme {
  --color-brand: #2563eb;
  --color-brand-hover: #1d4ed8;
  /* ... */
}
```

Tailwind v4 generates utility classes directly from these variables (`bg-brand`, `text-text-muted`, etc.). The classes use `var(--color-brand)` under the hood.

Dark mode overrides are defined once in `.dark {}` in `globals.css`:

```css
.dark {
  --color-brand: #3b82f6;
}
```

Because the Tailwind class resolves through the CSS variable, `bg-brand` automatically renders the dark value when inside a `.dark` parent — **no `dark:` prefixes needed on components**.

Only reach for `dark:` prefixes when a component needs a dark style that has no corresponding token. In that case, add the token first.

## Adding a New Token

When you need a color that doesn't have a token:

1. Add it to `@theme` in `app/globals.css`
2. Add the `.dark {}` override in the same file
3. Mirror the value in `src/tokens/colors.ts` for MCP consumption
4. Use the generated utility class in the component

Never go the other direction — don't reach for a Tailwind palette class and skip the token.

## The TypeScript Tokens File

`src/tokens/colors.ts` mirrors the CSS values for the MCP server. It is **not** used for styling. Do not import it into components. Keep it in sync with `globals.css` whenever token values change.
