# DeckEditor

A full slide deck editor built on `SlideCanvas`. It also owns the deck model: the types, themes, layouts, and `applyOp`, the one validated way to change a deck. Those live beside it in this folder and are exported from the package index.
- insert tools (text, shapes, lines and arrows, image, table, chart)
- a compact floating format bar for the selected element, with a **…** button that opens the settings panel
- a settings sidebar (element, motion, speaker notes, and slide settings), every section collapsible; the main ones (Slide, Element, and the element's own type) start open, the rest closed
- a reorderable slide rail with layouts and a context menu
- themes, including custom ones, and a fullscreen presenter

It holds no document state of its own. The host owns the deck and its undo history, so the same editor works for a deck saved to an API, a local draft, or a deck an AI is editing at the same time.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| deck | `Deck` | required | The deck being edited (controlled). |
| onChange | `(next: Deck, coalesceKey?: string) => void` | required | Every edit, as the whole next deck. Consecutive changes sharing a `coalesceKey` (a drag, typing) belong in one undo step. |
| history | `EditHistory` | None | `{ undo, redo, canUndo, canRedo }`: undo/redo from the toolbar and ⌘Z / ⇧⌘Z. Omit to hide the undo controls. |
| toolbarEnd | `ReactNode` | None | Host actions in the top-right cluster, before Present (a save status, a file menu). Use the exported `TOOLBAR_BUTTON` class so they match. |
| highlightIds | `string[]` | `[]` | Elements someone else is editing: each gets a pulsing outline and a tag, and their slides get a dot in the rail. |
| highlightLabel | `string` | `'AI'` | Text on the highlight tag. |
| activeSlideId | `string` | None | Controlled active slide, e.g. to follow another editor. Omit to manage it internally. |
| onActiveSlideChange | `(slideId: string) => void` | None | Called when the user picks a slide. |
| status | `string` | None | A host message for the polite status line. Shown instead of the editor's own messages while set. |
| onAsk | `(context: DeckAskContext) => void` | None | Shows an **Ask AI** button next to the floating toolbar of the selected element. See "Ask AI" below. |
| chartData | `ChartData` | None | `{ sheets, resolve }`: the spreadsheets (`{ id, title }[]`) a chart can take its data from, and a function that reads a sourced chart's rows (`{ seriesLabel?, data: { label, value }[] }`), returning `null` when the sheet or range can't be read. `resolve` runs on every render, so keep it cheap. Adds a **Data** menu (Typed in, or one of the sheets) to the chart settings. |
| className | `string` | `''` | Extra classes on the root. The editor fills its container, so give the container or this a height. |

Extends native `<div>` attributes (except `onChange`).

## Charts linked to a sheet

A chart element can carry `source: { sheetId, range }` (A1 notation) instead of typed-in rows. The editor stays free of any spreadsheet code: the host passes `chartData` (the sheet choices and a `resolve` function that reads the rows), and the chart settings gain a **Data** menu (Typed in, or a sheet by title); choosing a sheet adds a range field and hides the typed-in rows. The editor renders and exports the deck with each sourced chart's rows replaced by what `chartData.resolve` returns, so the viewer, Present and every export see live data. `data` stays on the element as the last snapshot and is what shows when the source returns `null`. A deck chart is one series; a host that reads a multi-column range uses the first value column. Agents set it through an ordinary `updateElement` patch (`source`), described in `DECK_REFERENCE`.

## Floating format bar

Selecting an element shows a small bar above it with only the quick, in-place controls. Everything else is in the settings panel, one **…** (More options) button away:

| Element | In the bar |
|---|---|
| Text | **Font · size** (opens a popover with text style, font, and size), text color, bold, italic, underline, link, a list menu (bulleted or numbered), an alignment button that opens a row of icons (left, center, right, then top, middle, bottom: horizontal alignment applies to the paragraphs, vertical to the whole box), the **Ask AI** lasso when `onAsk` is set, and **…** |
| Table | Add row, add column, **…** |
| Shape, icon, SVG | A color swatch (fill or color), **…** |
| Line | A color swatch, an arrowhead toggle, **…** |
| Chart, image | **…** only (chart type and image fit are in the panel) |

**…** opens the settings panel (a column beside the slide when the editor is wide, an overlay on its right edge when it's narrow) on the selected element. **While the panel is open the bar is not shown at all**: the panel already shows the selected element's controls and follows the selection, so picking another element switches the panel to it. For a text box those controls are text style, font, size, color, and vertical alignment. The panel lays settings out as rows, a muted label on the left and its control on the right (`Row`, `NumberInput` and `ColorField` in `fields.tsx`), with the element's name, position, and size as compact rows at the top. Bold, italic, underline, links, lists, and alignment apply to the text being edited and are only in the bar; strikethrough has no button (the editor's ⌘⇧S shortcut still works). Commands from the bar apply to the highlighted text while editing, or to all of the text when the box is only selected.

## Ask AI

Pass `onAsk` and a lasso button (**Ask AI**) appears in the floating format bar of whatever is selected, just before **…**. While the settings panel is open the bar is hidden, so the lasso then shows on its own above the element. Pressing it calls `onAsk` with a `DeckAskContext` (`askcontext.ts`, exported from the package index):

| Field | Meaning |
|---|---|
| `slideId`, `slideNumber`, `slideCount` | Which slide (the number is 1-based, as shown to the user). |
| `elementId`, `elementLabel`, `elementType` | The element, by the id an agent's `DeckOp`s use. |
| `text` | The text the user **highlighted** inside a text box being edited; otherwise the element's own readable content: a text box's plain text, a table's rows (`a \| b` per line), a chart's `label: value` pairs, an image's alt text. Empty for shapes, icons, lines and SVG. |
| `selectedText` | `true` when `text` is only the highlighted part. |

The button keeps the highlight when pressed (its mousedown default is prevented, like the toolbar's buttons), so it reads the live selection at click time. What the host does with the context is its own business: the AI chat block turns it into an attachment chip on its composer. It is a normal button in the bar's arrow-key group (or its own tab stop when shown alone), and it is not rendered at all when `onAsk` is omitted.

## Layout

The editor fills its container. It switches layout on **its own width**, not the window's: at 520px and wider, settings open in a 288px column beside the slide, which shrinks to make room (a side panel such as the AI chat's slides panel gets this at its default width; drag it wider for a bigger slide); below that, there is no room for a second column, so the same panel slides in over the editor's right edge (up to 288px, at most 85% of the editor's width). It's an overlay inside the editor, not a modal: no backdrop, no focus trap, nothing outside the editor is affected, and the part of the slide it doesn't cover stays interactive. Below 560px the insert tools and the actions (undo, download, present, theme, settings, zoom) stop being two floating bars and share one bordered bar instead. All the controls flow as one run of buttons: they stay on one row while they fit (about 520px) and, when they don't, wrap button by button onto the next row, in the same order, rather than a whole group dropping down at once. That's what lets it work in a narrow side panel on a wide screen. Fit-to-window zoom accounts for the floating toolbars' measured height, which grows when they wrap.

## Undo

The host keeps the history. The simplest host is a snapshot stack: push the previous deck on each `onChange` unless the `coalesceKey` matches the last one. See the docs demo.

When someone else (another person, an agent) also changes the deck, snapshot undo would also revert their work. Record each of your own edits as `diffDecks(after, before)` instead, and undo with `applyOpsLenient(current, inverse)`. Both come from `ops.ts`.

## Deck operations (`ops.ts`)

`DeckOp` describes every structural change as data: `addSlide`, `removeSlide`, `updateSlide`, `moveSlide`, `addElement`, `updateElement`, `removeElement`, `updateSlides`, `updateElements`, `addSlideFromLayout`, `setTheme`, `updateTheme`, `setTitle`. `applyOp(deck, op)` returns a new deck and never mutates its input. It fails fast with `DeckOpError` on unknown ids, duplicate ids, changing an element's `type`, or removing the last slide, so a script, an API, or an agent's tool call can't corrupt a deck. `applyOps` applies a list and reports which step failed. `opTargets(op)` returns the slide and element an op touches, for highlighting. `setTheme` sets `customTheme` whenever the op has that key (`undefined` clears it) and leaves it alone when the key is absent.

For shared editing, two more functions:
- `diffDecks(from, to)` returns the ops that turn `from` into `to`: title, theme, slides added/removed/moved/changed, and elements added/removed/changed/reordered. An element whose `type` changed under the same id is removed and re-added. Diffing an edit backwards (`diffDecks(after, before)`) gives its undo.
- `applyOpsLenient(deck, ops)` applies every op that still makes sense and returns `{ deck, skipped }` instead of throwing. Use it to apply one person's undo, or an agent's steps, on top of someone else's later edits: an op that targets something since deleted is skipped, not fatal. Non-`DeckOpError` exceptions still throw.

Also exported: `createSlide(elements?)`, `duplicateSlide(slide)` (fresh ids throughout), `newId()`, `SLIDE_WIDTH`/`SLIDE_HEIGHT` (1280×720), the deck types, `THEMES`/`FONTS`/`themeStageStyle`, and `ElementView` (the per-element renderer).

### Editing settings as an agent

Every setting is reachable through a `DeckOp`, and invalid values throw a `DeckOpError` that lists the valid choices, so an agent can correct itself. `DECK_REFERENCE` (`reference.ts`) is a ready-to-paste prompt section generated from the editor's own option lists (themes, fonts, transitions, effects, ambients, layouts), so it never drifts.

- **Merged patches.** `updateSlide`/`updateSlides` merge `transition` (`{ transition: { type: 'fade' } }` keeps the duration). `updateElement`/`updateElements` merge `effect` the same way.
- **Bulk.** `updateSlides { slideIds?, patch }` and `updateElements { slideIds?, elementType?, patch }` apply one patch to many targets; omit the filters for everything. One op sets a transition for the whole deck or an entrance for every title.
- **Text styles.** A text element's `style` is a preset: `title`, `heading`, `subheading`, `body`, `caption`, `header`, or `footer` (`TEXT_STYLES`). Setting one fills the box's `fontSize`, `bold`, and `color` (all still editable afterwards), and heading styles use the theme's heading font. In `addElement` an element's own values beat the style's; in `updateElement` a patch that sets `style` applies the preset first, then the patch's explicit fields. `header` and `footer` are small muted styles with no special placement: they're ordinary text boxes you put at a slide's top or bottom edge.

## SVG elements (`svg.ts`)

`{ type: 'svg', svg, color }` draws free-form SVG (icons, logos, diagrams). `svg` is one `<svg viewBox="…">…</svg>`; it scales to the element's box, and `currentColor` inside it takes `color` (empty follows the theme's text color). Everything is validated by `checkSvg`, which returns the reason markup is unusable or `null`. It is strict by design and rejects instead of rewriting, so what an agent wrote is what renders:

- Only drawing tags (`SVG_TAGS`): no `script`, `style`, `filter`, `image`, or `foreignObject`.
- No `on*` attributes, no `javascript:`/`data:` values, no `style` with `url()`, and `href` only to an id in the same SVG (`#id`).
- No comments or CDATA, no `<` inside attribute values, at most 100,000 characters.

`checkSvg` is pure string checking, so it runs on a server too. It guards every route in: `addElement`, `addSlide`, and `updateElement(s)` throw a `DeckOpError` with the reason, the upload schema refuses it, and the renderer shows "Invalid SVG" instead of injecting markup that fails the check. PDF and PowerPoint draw it from the rendered slide (PowerPoint as an image).

## Layouts (`layouts.ts`)

`createSlideFromLayout(id, { margin?, slideId? })` builds a slide from one of `LAYOUTS`: `title`, `titleContent`, `twoColumns`, `section`, `imageText`, `chart`, `comparison`, `blank`. Layout elements use theme defaults only (empty `color`/`fill`, no shape `radius`), so they follow any theme. Pass the theme's `margin` to inset to it. Their text boxes start empty with a `placeholder` (e.g. "Click to add title"); text boxes get a `style` (`title`, `heading`, `subheading`, `body`). With `slideId`, the slide and its elements get predictable ids (`s2:title`, `s2:body`), which is what `addSlideFromLayout { layout, slideId, index? }` uses so an agent can fill the elements right after.

Text elements also accept `bold?: boolean` (base weight; bold marks still apply), `placeholder?: string`, and `valign?: 'top' | 'middle' | 'bottom'` (where the text sits in a box taller than it; omit for `top`). `valign` is honored on the slide, in the HTML presenter, in PDF, and in PowerPoint, and `applyOp` rejects any other value with the valid ones listed. `ElementView` shows placeholders only when given `showPlaceholders` (editors and layout previews), never when presenting or exporting.

## Themes (`themes.ts`)

`THEMES` are presets; `'custom'` resolves to the deck's own `customTheme` (`{ colors: { background, surface, border, text, muted, accent }, font?, headingFont?, radius?, margin? }`). Beyond colors:

- **`font` / `headingFont`:** body text uses `font`; text with a heading style (`title`, `heading`, `subheading`) uses `headingFont` (the body font when unset). An element's own `font` always wins.
- **`radius`** (px, default 12): corners of shapes that don't set their own `radius`, plus images, tables, and charts. A shape's `radius` is optional; omit it to follow the theme.
- **`margin`** (px, default 96): the inset layouts use.

`updateTheme { patch }` tweaks the current theme without restating it: it switches to `'custom'` seeded from the current theme and merges the patch (colors per slot). The stage exposes these as `--deck-radius`, `--deck-margin`, and `--deck-heading-font`. Always render through `resolveTheme(deck.theme, deck.customTheme)` + `themeStageStyle(...)`. Any slide color can also be a theme reference from `THEME_COLOR_REFS` (`var(--color-text)`, `var(--color-text-muted)`, `var(--color-brand)`), which follows the theme instead of fixing a hex value.

## Download

The toolbar has a built-in Download menu (before Present) that saves the deck as HTML (a self-contained presenter), PDF (vector), or PowerPoint (`.pptx`, with transitions and entrance timing). Progress and failures show on the status line and clear after a few seconds. PDF and PowerPoint load `jspdf`/`pptxgenjs` only when chosen. Nothing needs wiring; there's no prop to turn it off.

The exporters (`htmlPresenter.ts`, `pdf.ts`, `pptx.ts`, plus `exporters.ts`, `exportHelpers.ts`, `richText.ts`, `pptxMotion.ts`) are plain functions of a `Deck` and are not exported from the package index.

## Export contract

The rail thumbnails are full-size slide stages, CSS-scaled down, and always mounted, even when the rail is collapsed. They carry `[data-slide-id="…"] [data-slide-stage]`. The exporters read the rendered slides from there, so keep that markup stable.

## Interactive States

- **Elements:** a hover outline, then a brand outline with corner handles when selected. Focus-visible matches selection. While editing text or a table, the content is editable in place.
- **Present:** always starts on the first slide that isn't skipped, whichever slide is selected.
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
- The settings panel is a non-modal `complementary` region (`aside`): it doesn't trap focus, and it is `inert` while closed. The presenter is fullscreen and returns focus to Present when it closes.
- Highlighted elements also put "being edited" in their thumbnail's name, so the signal isn't only an outline or the pulse.
- All motion (transitions, entrances, the highlight pulse) respects `prefers-reduced-motion`.

| Key | Action |
|---|---|
| ⌘Z / ⇧⌘Z (Ctrl on Windows) | Undo / redo, when the host passes `history` |
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
Registry dependencies: button, charts, color-picker, context-menu, input, menu, meteors, particles, popover, reveal, select, slide-canvas, switch, table, text-scramble, textarea, toggle-group, typewriter
