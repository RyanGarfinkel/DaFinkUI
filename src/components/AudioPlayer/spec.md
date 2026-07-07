# AudioPlayer

An audio playback bar with controls for play/pause, seeking, skip, volume, and speed. Composed from `Button` (play/pause, skip, mute, speed) and `Slider` (seek, volume) rather than reimplementing their markup.

## Props

| Prop       | Type     | Default | Description                                      |
|------------|----------|---------|--------------------------------------------------|
| `src`      | `string` | —       | URL of the audio file to play. Required.         |
| `title`    | `string` | —       | Track title. Displayed above the controls in `'default'` size only — `'compact'` never renders it (still used in the region's `aria-label`). |
| `subtitle` | `string` | —       | Secondary line below the title — artist, episode, or any short descriptor. `'default'` size only, same as `title`. |
| `size`     | `'default' \| 'compact'` | `'default'` | `'default'` is a self-contained card with the full control set. `'compact'` strips it to exactly three elements in one row — play/pause, seek slider, elapsed time — with no card chrome (no border/shadow/background/padding) and no title/subtitle, for embedding inside another container that supplies its own background (e.g. a `Message` bubble). |
| `className`| `string` | `""`    | Additional classes applied to the container.     |

All other `HTMLDivElement` attributes (e.g. `data-*`, `id`) are forwarded to the container.

## Behavior

- Clicking the play button starts playback; clicking again pauses it.
- The progress bar scrubs to any position while playing or paused.
- Skip back / skip forward jump 10 seconds. Clamped to `[0, duration]`.
- Volume slider controls audio output level from 0 to 1.
- Clicking the speaker icon mutes or unmutes without changing the stored volume level.
- The speed button cycles through: 0.5×, 0.75×, 1×, 1.25×, 1.5×, 1.75×, 2×.
- When `src` changes, playback stops and state resets.
- `size="compact"` reduces the component to a single row: play/pause button (left) — seek slider (center) — elapsed time (right). Skip, volume, mute, speed, and title/subtitle are not available in this size; use `'default'` when those are needed. All interactive targets remain at least 24×24 CSS px.
- `size="compact"` renders no card chrome of its own (no border, shadow, background, or padding) — it's meant to sit inside a container that already supplies a background, most commonly a `Message` bubble (`<Message><AudioPlayer size="compact" .../></Message>`, keeping `Message`'s default `bubble={true}`). The play button (`variant="on-color"`) and seek slider (`tone="current"`) both derive their color from `currentColor` instead of the brand token, so they automatically pick up whatever text color the parent bubble sets (`text-brand-fg` for `sent`, `text-text` for `received`) and stay legible against either background without any extra wiring.

## Keyboard Interaction

| Key             | Element          | Action                               |
|-----------------|------------------|--------------------------------------|
| `Space`         | Play/Pause button | Toggle playback                      |
| `Enter`         | Play/Pause button | Toggle playback                      |
| `←` / `→`      | Seek slider      | Step backward / forward 0.1 seconds  |
| `Home` / `End`  | Seek slider      | Jump to start / end                  |
| `←` / `→`      | Volume slider    | Decrease / increase volume by 0.05   |
| `Space` / `Enter` | Mute button    | Toggle mute (`'default'` size only)  |
| `Space` / `Enter` | Speed button   | Cycle to next speed (`'default'` size only) |
| `Space` / `Enter` | Skip buttons   | Skip ±10 seconds (`'default'` size only) |

## Accessibility

- The container has `role="region"` with an `aria-label` that includes the track title when provided.
- The seek slider is a `Slider` with `ariaLabel="Seek"` and `ariaValueText` set to a human-readable timestamp (`"1:32 of 6:12"`).
- All buttons are `Button` instances with explicit `aria-label` attributes. The play/pause and mute button labels update to reflect current state.
- The `<audio>` element is hidden from assistive technology.

## Composition

- **Play/pause**: `Button` with `shape="circle"`. Default size: `variant="primary"` `size="icon"` (brand-filled, for a standalone card). Compact size: `variant="on-color"` `size="icon-sm"` (currentColor-derived, for embedding inside a colored bubble).
- **Skip back/forward, mute, speed**: `Button` with `variant="ghost"`, `size="md"` — default size only, omitted entirely in compact.
- **Seek**: `Slider`, `tone="brand"` `size="default"` in the default layout; `tone="current"` `size="sm"` in compact.
- **Volume**: `Slider`, `tone="brand"` `size="default"` — default size only, omitted in compact.

## Interactive States

Hover, active, focus-visible, and disabled states on every button and slider come from `Button` and `Slider` themselves — see their specs for the full state table. AudioPlayer only adds:

| State   | Appearance                                              |
|---------|---------------------------------------------------------|
| Default (`'default'` size) | Surface panel background, border, subtle shadow |
| Default (`'compact'` size) | No background/border/shadow of its own — transparent, inherits the parent's |
| Playing | Seek slider fill advances; play button shows pause icon |
| Muted   | Volume slider fill collapses to 0; mute icon switches to X |

## Tokens Used

| Token               | Applied to                                   |
|---------------------|----------------------------------------------|
| `bg-surface-panel`  | Container background (`'default'` size only) |
| `border-surface-border` | Container border (`'default'` size only) |
| `shadow-[var(--shadow-sm)]` | Container shadow (`'default'` size only) |
| `text-text`         | Primary text (title, `'default'` size only)  |
| `text-text-muted`   | Time display (`'default'` size), subtitle    |
| `text-current`      | Elapsed time display in `'compact'` size, at 70% opacity (`text-current/70`) |
| `--radius-lg`       | Container corner radius (`'default'` size only) |

`Button` and `Slider` own their own token usage (brand fill vs. `currentColor`, focus ring, track colors) — see their specs.

## When to Use

- Inline audio playback for podcasts, music, voice notes, or sound previews.
- Any context where you need a full-featured player but not a dedicated media page.

## Installation

```bash
npx @dafink/ui add audioplayer
```

Also installs: Button, Slider. No npm dependencies.
