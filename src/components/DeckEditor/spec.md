# DeckEditor

A full slide deck editor built on `SlideCanvas`. It also owns the deck model: the types, themes, layouts, and `applyOp`, the one validated way to change a deck. Those live beside it in this folder and are exported from the package index.
- insert tools (text, shapes, lines and arrows, image, table, chart)
- a floating format toolbar for the selected element
- a settings sidebar (element, motion, and slide settings)
- a reorderable slide rail with layouts and a context menu
- themes, including custom ones, and a fullscreen presenter

It holds no document state of its own. The host owns the deck and its undo history, so the same editor works for a deck saved to an API, a local draft, or a deck an AI is editing at the same time.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| deck | `Deck` | required | The deck being edited (controlled). |
| onChange | `(next: Deck, coalesceKey?: string) => void` | required | Every edit, as the whole next deck. Consecutive changes sharing a `coalesceKey` (a drag, typing) belong in one undo step. |
| onUndo / onRedo | `() => void` | None | Undo/redo from the toolbar and ⌘Z / ⇧⌘Z. Omit both to hide the undo controls. |
| canUndo / canRedo | `boolean` | `false` | Enables the undo/redo buttons. |
| toolbarEnd | `ReactNode` | None | Host actions in the top-right cluster, before Present (a save status, a file menu). Use the exported `TOOLBAR_BUTTON` class so they match. |
| highlightIds | `string[]` | `[]` | Elements someone else is editing: each gets a pulsing outline and a tag, and their slides get a dot in the rail. |
| highlightLabel | `string` | `'AI'` | Text on the highlight tag. |
| activeSlideId | `string` | None | Controlled active slide, e.g. to follow another editor. Omit to manage it internally. |
| onActiveSlideChange | `(slideId: string) => void` | None | Called when the user picks a slide. |
| status | `string` | None | A host message for the polite status line. Shown instead of the editor's own messages while set. |
| className | `string` | `''` | Extra classes on the root. The editor fills its container, so give the container or this a height. |

Extends native `<div>` attributes (except `onChange`).

## Layout

The editor fills its container. It switches layout on **its own width**, not the window's: at 768px and wider, settings open in a sidebar column; below that, they open in a `Drawer`. That's what lets it work in a narrow side panel on a wide screen. Fit-to-window zoom accounts for the floating toolbars' measured height, which grows when they wrap.

## Undo

The host keeps the history. The simplest host is a snapshot stack: push the previous deck on each `onChange` unless the `coalesceKey` matches the last one. See the docs demo.

When someone else (another person, an agent) also changes the deck, snapshot undo would also revert their work. Record each of your own edits as `diffDecks(after, before)` instead, and undo with `applyOpsLenient(current, inverse)`. Both come from `ops.ts`.

## Deck operations (`ops.ts`)

`DeckOp` describes every structural change as data: `addSlide`, `removeSlide`, `updateSlide`, `moveSlide`, `addElement`, `updateElement`, `removeElement`, `setTheme`, `setTitle`. `applyOp(deck, op)` returns a new deck and never mutates its input. It fails fast with `DeckOpError` on unknown ids, duplicate ids, changing an element's `type`, or removing the last slide, so a script, an API, or an agent's tool call can't corrupt a deck. `applyOps` applies a list and reports which step failed. `opTargets(op)` returns the slide and element an op touches, for highlighting. `setTheme` sets `customTheme` whenever the op has that key (`undefined` clears it) and leaves it alone when the key is absent.

For shared editing, two more functions:
- `diffDecks(from, to)` returns the ops that turn `from` into `to`: title, theme, slides added/removed/moved/changed, and elements added/removed/changed/reordered. An element whose `type` changed under the same id is removed and re-added. Diffing an edit backwards (`diffDecks(after, before)`) gives its undo.
- `applyOpsLenient(deck, ops)` applies every op that still makes sense and returns `{ deck, skipped }` instead of throwing. Use it to apply one person's undo, or an agent's steps, on top of someone else's later edits: an op that targets something since deleted is skipped, not fatal. Non-`DeckOpError` exceptions still throw.

Also exported: `createSlide(elements?)`, `duplicateSlide(slide)` (fresh ids throughout), `newId()`, `SLIDE_WIDTH`/`SLIDE_HEIGHT` (1280×720), the deck types, `THEMES`/`FONTS`/`themeStageStyle`, and `ElementView` (the per-element renderer).

## Layouts (`layouts.ts`)

`createSlideFromLayout(id)` builds a slide from one of `LAYOUTS`: `title`, `titleContent`, `twoColumns`, `section`, `imageText`, `chart`, `comparison`, `blank`. Layout elements use theme defaults only (empty `color`/`fill`), so they follow any theme. Their text boxes start empty with a `placeholder` (e.g. "Click to add title"); titles set the text element's `bold` base weight.

Text elements also accept `bold?: boolean` (base weight; bold marks still apply) and `placeholder?: string`. `ElementView` shows placeholders only when given `showPlaceholders` (editors and layout previews), never when presenting or exporting.

## Themes (`themes.ts`)

`THEMES` are presets; `'custom'` resolves to the deck's own `customTheme` (`{ colors: { background, surface, border, text, muted, accent }, font? }`). Always render through `resolveTheme(deck.theme, deck.customTheme)` + `themeStageStyle(...)`. Any slide color can also be a theme reference from `THEME_COLOR_REFS` (`var(--color-text)`, `var(--color-text-muted)`, `var(--color-brand)`), which follows the theme instead of fixing a hex value.

## Download

The toolbar has a built-in Download menu (before Present) that saves the deck as HTML (a self-contained presenter), PDF (vector), or PowerPoint (`.pptx`, with transitions and entrance timing). Progress and failures show on the status line and clear after a few seconds. PDF and PowerPoint load `jspdf`/`pptxgenjs` only when chosen. Nothing needs wiring; there's no prop to turn it off.

The exporters (`htmlPresenter.ts`, `pdf.ts`, `pptx.ts`, plus `exporters.ts`, `exportHelpers.ts`, `richText.ts`, `pptxMotion.ts`) are plain functions of a `Deck` and are not exported from the package index.

## Export contract

The rail thumbnails are full-size slide stages, CSS-scaled down, and always mounted, even when the rail is collapsed. They carry `[data-slide-id="…"] [data-slide-stage]`. The exporters read the rendered slides from there, so keep that markup stable.

## Interactive States

- **Elements:** a hover outline, then a brand outline with corner handles when selected. Focus-visible matches selection. While editing text or a table, the content is editable in place.
- **Toolbar buttons:** a hover background, a focus-visible ring, and 40% opacity when disabled (e.g. undo with no history, Present when every slide is skipped).
- **Thumbnails:** a hover ring and a brand ring on the active slide; skipped slides are dimmed with an eye-off icon.

## Accessibility

- The root is a `role="region"` named "{title} editor".
- Each element is a focusable button; focusing selects it. The selected element's format toolbar is a `role="toolbar"` (Alt+F10 enters it, Escape returns to the element).
- The slide rail is a `nav` with one Tab stop (roving tabindex).
  - Arrows move between slides; Alt+arrows reorder.
  - Each thumbnail opens a `ContextMenu` (Shift+F10, the Menu key, or a long-press on touch).
  - Reorders are announced.
- Moves, resizes, drawing hints, and host status are announced through polite status regions.
- The settings `Drawer` traps focus and returns it to the Settings button. The presenter is fullscreen and returns focus to Present when it closes.
- Highlighted elements also put "being edited" in their thumbnail's name, so the signal isn't only an outline or the pulse.
- All motion (transitions, entrances, the highlight pulse) respects `prefers-reduced-motion`.

| Key | Action |
|---|---|
| ⌘Z / ⇧⌘Z (Ctrl on Windows) | Undo / redo, when the host passes `onUndo`/`onRedo` |
| ⌘D | Duplicate the selected element |
| Arrows (Shift for larger steps) | Move the selected element |
| Enter / Escape | Start / stop editing text or a table; Escape also cancels a drawing tool |
| Delete | Delete the selected element |
| Alt+F10 | Focus the format toolbar |
| Alt+arrows, Shift+F10 (rail) | Reorder a slide; open its actions menu |

## When to Use

- Use `DeckEditor` when people should edit a deck.
- Use `SlideCanvas` directly for a different kind of freeform canvas, such as a whiteboard or a diagram.
- For a complete app with saving, a deck menu, and exports, install the `slide-editor` block, which wraps this component (downloads are already built into the editor itself).

## Tokens Used

`--color-surface-panel`, `--color-surface`, `--color-surface-active`, `--color-surface-hover`, `--color-surface-border`, `--color-text`, `--color-text-muted`, `--color-brand`, `--color-brand-fg`, `--color-brand-ring`, `--color-input-border-hover`, `--radius-sm`, `--radius`, `--radius-lg`, `--border-width`, `--shadow-sm`, `--backdrop-blur`, `--duration-fast`, `--duration-base`, `--ease-standard`.

## Installation

```bash
npx dafink-ui add deck-editor
```

npm dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-text-align`, `@tiptap/extension-text-style`, `jspdf`, `jszip`, `pptxgenjs`, `svg2pdf.js`
Registry dependencies: button, charts, color-picker, context-menu, drawer, input, menu, meteors, particles, popover, reveal, select, slide-canvas, switch, table, text-scramble, textarea, toggle-group, typewriter
