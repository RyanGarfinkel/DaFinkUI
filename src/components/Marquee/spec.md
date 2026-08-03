# Marquee

An infinite horizontal scrolling strip of content, used as an ambient ticker or logo wall.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Required. The content to repeat and scroll. |
| direction | `'left' \| 'right'` | `'left'` | Scroll direction of the track. |
| duration | `number` | `20` | Seconds for one full loop of the track. |
| pauseOnHover | `boolean` | `true` | Pauses the scroll animation while the pointer hovers the marquee. |
| gap | `number` | `16` | Pixel gap between the two repeated copies of the content. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes.

## Visual Design

- The children are rendered twice inside a flex track, back to back. Because the track holds exactly two copies, animating its `transform` from `translateX(0)` to `translateX(-50%)` (or the mirror, for `direction='right'`) loops seamlessly — the second copy slides into exactly the position the first started in, with no visible seam or jump.
- The animation is `linear` and `infinite`, so the scroll speed never eases or pauses mid-loop; only `pauseOnHover` (via `animation-play-state: paused`) or a reduced-motion preference stop it.
- `duration` controls loop speed only, in seconds; it is piped through as the `--marquee-duration` CSS custom property, the same technique `TextShimmer` uses for its sweep duration.
- The outer container is `overflow: hidden` so only one row of content is ever visible; content outside the viewport is clipped, not scrollable by the user.

## Accessibility

- **`prefers-reduced-motion: reduce`**: the track's `animation` is set to `none` and it is pinned to `translateX(0)`. The second, duplicate copy is hidden entirely (`display: none`), so reduced-motion users see one static, non-repeated row of content rather than a frozen mid-scroll frame.
- The duplicate copy is always `aria-hidden='true'`, in every motion state, since it is a visual repeat of the same content and would otherwise cause screen readers to announce every item twice.
- `pauseOnHover` gives sighted mouse users a way to stop the motion and read ticker content at their own pace without needing reduced-motion turned on system-wide.

## When to Use

- Logo walls ("used by these companies"), scrolling testimonial strips, or ticker-style announcements where the content is decorative or supplementary, not the primary reading path.
- Do not put critical, time-sensitive, or the only copy of important information inside a Marquee — content scrolls out of view and there's no way to jump ahead or rewind for keyboard-only users.
- Keep the content list short and let the loop do the repeating; don't manually pad `children` with extra copies, the component already renders it twice.

## Tokens Used

None. `Marquee` is purely a layout/motion primitive; styling for its content (color, background, text tokens) is the responsibility of the `children` passed in.

## Installation

```bash
npx dafink-ui add marquee
```

npm dependencies: none
No registry dependencies.
