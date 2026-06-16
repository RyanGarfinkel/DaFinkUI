# Typewriter

Reveals text character by character, like a terminal being typed in real time. A blinking cursor tracks the insertion point during typing and can optionally persist once typing is complete.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | `string` | — | Required. The full text to type out. |
| speed | `number` | `50` | Milliseconds between each character. |
| delay | `number` | `0` | Milliseconds to wait before typing begins. |
| cursor | `boolean` | `true` | Show a blinking `|` cursor while typing. |
| cursorPersist | `boolean` | `false` | Keep the cursor visible after typing completes. |
| onComplete | `() => void` | — | Called when all characters have been revealed. |
| className | `string` | `''` | Additional CSS classes on the root `<span>`. |

Extends all native `<span>` HTML attributes.

---

## Behavior

- Characters are revealed one at a time at the interval set by `speed`.
- Typing begins after `delay` ms. Use `delay` to stagger multiple instances or to let a page settle before the animation starts.
- When `text` changes the component restarts from zero automatically.
- `onComplete` fires exactly once per text value, when the last character is revealed.

---

## Cursor

The cursor is a 2px-wide block element with `background: currentColor`, so it inherits the text color of its context without any extra styling. It blinks via `dafink-cursor-blink` — a step-start CSS keyframe. The CSS is injected inline via a `<style>` block, matching the pattern used by `TextShimmer`.

Show cursor when: `cursor` is `true` AND (still typing OR `cursorPersist` is `true`).

---

## Accessibility

Screen readers receive the complete text immediately via `aria-label` on the root element. The animated character-by-character reveal is wrapped in `aria-hidden="true"`, so assistive technology never reads a partial string mid-animation.

```tsx
<span aria-label="The full text string">
  <span aria-hidden="true">
    {text.slice(0, displayedChars)}
    {showCursor && <span className="dafink-cursor" />}
  </span>
</span>
```

---

## Reduced Motion

On mount, `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is checked. If true, `displayedChars` is immediately set to `text.length` — the full text renders statically with no animation and no interval is started. The cursor CSS keyframe is also suppressed via `@media (prefers-reduced-motion: reduce)`.

---

## When to Use

- Hero sections where text "types in" to communicate a message dynamically.
- Terminal or code-editor aesthetic UIs.
- Step-by-step onboarding prompts revealed one at a time.
- AI "response streaming" simulations where the answer appears character by character.

Do not use for body copy that users need to read quickly — animated reveal adds latency. Use `cursorPersist` sparingly; a blinking cursor on static text draws persistent attention.

---

## Usage

```tsx
import Typewriter from '@/src/components/Typewriter/Typewriter';

// Basic
<h1 className="text-4xl font-bold text-text">
  <Typewriter text="Hello, world." />
</h1>

// With delay and persistent cursor
<Typewriter
  text="Ready when you are."
  delay={500}
  cursorPersist
  className="text-lg font-mono text-text"
/>

// Fire a callback on completion
<Typewriter
  text="Download complete."
  speed={40}
  onComplete={() => setShowActions(true)}
/>
```

---

## Tokens Used

None — the cursor inherits `currentColor`.

---

## Installation

```bash
npx @dafink/ui add typewriter
```

npm dependencies: none  
No registry dependencies.
