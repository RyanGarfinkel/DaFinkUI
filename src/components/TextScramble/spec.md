# TextScramble

Text that animates in by rapidly cycling through random-looking characters before resolving, left-to-right, into the real final text.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | `string` | - | Required. The final text to resolve to. |
| duration | `number` | `800` | Total ms for the full scramble-to-resolve animation. |
| characters | `string` | `'!<>-_\/[]{}—=+*^?#'` | Charset used for scrambling filler characters while a position hasn't resolved yet. |
| className | `string` | `''` | Additional CSS classes on the outer `<span>`. |

Extends all native `<span>` HTML attributes.

## Visual Design

- Runs a `requestAnimationFrame` loop tracking progress from `0` to `1` over `duration` ms. Characters at an index before the reveal point (`index < progress * text.length`) show their real, final character; characters at or beyond it show a random character from `characters`, re-randomized on most ticks so the unresolved portion visibly flickers rather than sitting static.
- The scrambled string is always the same length as `text`, so layout never shifts as the animation resolves.
- Space characters in `text` pass through unscrambled at their index for the entire animation — spaces are never replaced with visible junk.
- Once progress reaches `1`, the loop stops and the visible text is exactly `text`.
- The pending animation frame is cancelled on unmount, and a new scramble run kicks off whenever the `text` prop changes.

## Accessibility

While scrambling, the visible characters are meaningless filler, not real text — a screen reader must never be exposed to that noise. The structure is:

```tsx
<span aria-label={text}>
  <span aria-hidden='true'>{scrambledOrFinal}</span>
</span>
```

- The outer `<span>`'s `aria-label` is always the correct final `text`, from the very first render through the entire animation — assistive tech announces the right content regardless of animation progress.
- The inner `<span>` holding the animated glyphs is `aria-hidden='true'`, so screen readers skip it entirely; sighted users see the scramble animation.
- **`prefers-reduced-motion: reduce`**: checked via `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on mount (a CSS media query cannot intercept a JS-driven `requestAnimationFrame` loop). When true, the scramble loop never starts — `text` renders immediately and statically.

## When to Use

- Headings, hero text, or code-like/technical content where a "decrypt" or "matrix" reveal reinforces a digital, technical, or dramatic tone.
- Use sparingly, similar to `TextShimmer` and `Typewriter` — one emphasized element per view, not body copy.
- Do not use for content that must be scanned quickly; the scramble-to-resolve reveal adds latency before the text is legible.

## Tokens Used

None: purely a text-content animation with no color or motion-timing tokens.

## Installation

```bash
npx dafink-ui add text-scramble
```

npm dependencies: none
No registry dependencies.
