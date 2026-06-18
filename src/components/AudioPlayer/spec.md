# AudioPlayer

A self-contained audio playback bar with controls for play/pause, seeking, skip, volume, and speed.

## Props

| Prop       | Type     | Default | Description                                      |
|------------|----------|---------|--------------------------------------------------|
| `src`      | `string` | —       | URL of the audio file to play. Required.         |
| `title`    | `string` | —       | Track title displayed above the controls.        |
| `subtitle` | `string` | —       | Secondary line below the title — artist, episode, or any short descriptor. |
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

## Keyboard Interaction

| Key             | Element          | Action                               |
|-----------------|------------------|--------------------------------------|
| `Space`         | Play/Pause button | Toggle playback                      |
| `Enter`         | Play/Pause button | Toggle playback                      |
| `←` / `→`      | Seek slider      | Step backward / forward 0.1 seconds  |
| `Home` / `End`  | Seek slider      | Jump to start / end                  |
| `←` / `→`      | Volume slider    | Decrease / increase volume by 0.05   |
| `Space` / `Enter` | Mute button    | Toggle mute                          |
| `Space` / `Enter` | Speed button   | Cycle to next speed                  |
| `Space` / `Enter` | Skip buttons   | Skip ±10 seconds                     |

## Accessibility

- The container has `role="region"` with an `aria-label` that includes the track title when provided.
- The seek slider exposes `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with human-readable timestamps.
- All buttons have explicit `aria-label` attributes. The play/pause and mute button labels update to reflect current state.
- The `<audio>` element is hidden from assistive technology.

## Interactive States

| State   | Appearance                                              |
|---------|---------------------------------------------------------|
| Default | Surface panel background, border, subtle shadow         |
| Hover   | Skip/mute/speed buttons: `bg-surface-hover`             |
| Active  | Skip/mute/speed buttons: `bg-surface-active`            |
| Focus   | All buttons: `ring-2 ring-offset-2 ring-brand-ring`     |
| Playing | Progress bar fill advances; play button shows pause icon |
| Muted   | Volume fill collapses to 0; mute icon switches to X     |

## Tokens Used

| Token               | Applied to                                   |
|---------------------|----------------------------------------------|
| `bg-surface-panel`  | Container background                         |
| `border-surface-border` | Container border                         |
| `shadow-[var(--shadow-sm)]` | Container shadow                     |
| `bg-brand`          | Play button fill; progress/volume track fill |
| `text-brand-fg`     | Play button icon color                       |
| `bg-brand-hover`    | Play button hover state                      |
| `bg-brand-active`   | Play button active state                     |
| `bg-surface-hover`  | Ghost button hover                           |
| `bg-surface-active` | Ghost button active; track background        |
| `text-text`         | Primary text, button icons                   |
| `text-text-muted`   | Time display, artist name                    |
| `ring-brand-ring`   | Focus ring color                             |
| `--radius-lg`       | Container corner radius                      |
| `--radius`          | Button corner radius                         |
| `--duration-fast`   | Track fill transition duration               |

## When to Use

- Inline audio playback for podcasts, music, voice notes, or sound previews.
- Any context where you need a full-featured player but not a dedicated media page.

## Installation

```bash
npx @dafink/ui add audioplayer
```
