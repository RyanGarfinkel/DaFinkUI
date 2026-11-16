# SlideEditor

A slide deck app: saving and a deck menu around the **DeckEditor component** (`components/DeckEditor/`: the whole editing workspace, including toolbars, the settings sidebar, the slide rail, themes, the presenter, and the HTML/PDF/PowerPoint downloads). The deck types, `applyOp`, renderers and themes live in the same folder. Read this before changing anything here. Paths are relative to wherever the block was installed.

## File map

| File | What's in it | Edit this when you're... |
|---|---|---|
| `SlideEditor.tsx` | Entry point (no props). Loads the deck via `useDeckDocument`, shows loading/error states, then renders `DeckEditor` keyed by deck id, with the undo history, save status, and deck menu wired in. | ...changing the loading or error screens, or what the toolbar's host actions do. |
| `useDeckDocument.ts` | The open deck: fetch, undo history, debounced autosave, save status, open/create/import. | ...changing how decks load or save. |
| `deckApi.ts` | Every request this block makes (`/api/slide-editor/...`). | ...pointing the editor at your backend. |
| `deck.ts` | Undo history reducer (`change`/`load`/`undo`/`redo`) and the sample deck. | ...changing undo behavior. |
| `templates.ts` | Starter decks offered under New deck. | ...adding a template. |
| `DeckMenu.tsx`, `SaveIndicator.tsx` | Deck menu (new, open, rename, import .json, export .json) and the save status, passed to `DeckEditor` as `toolbarEnd`. | ...changing deck-level actions. |

Changing an editing control (toolbars, sidebar, rail, themes, motion, insert tools) or a download format (`ExportMenu.tsx`, `htmlPresenter.ts`, `pdf.ts`, `pptx.ts`, `pptxMotion.ts`, `exporters.ts`, `exportHelpers.ts`, `richText.ts`) means editing `components/DeckEditor/`, which AI chat shares. See its `spec.md`. Only the JSON "deck file" export, which pairs with Import, lives here (it calls `exportJson` from the component).

## Gotchas

**Point `deckApi.ts` at your backend; nothing else talks to the network.** The server should validate decks before storing them (the docs site uses a zod schema in `app/api/slide-editor/schema.ts`; copy it). Import goes through `createDeck({ deck })`, so a malformed file is rejected server-side and its issues are shown to the user.

**Autosave sends the whole deck, debounced (`AUTOSAVE_MS`).** "Unsaved" is derived (`history.present !== savedDeck`), not stored, so it can't drift. Switching decks flushes a pending save first. A `beforeunload` warning covers unconfirmed edits.

**Pointer gestures read their live value from a ref, never from render state.** A fast drag can fire `pointerup` before the last `pointermove`'s render lands; reading state there loses the final position. This bit dragging, drawing, and the screen-reader announcement. jsdom tests flush renders between events, so they can't catch it; verify in a browser.

**Tiptap: `setEditable(x, false)`.** Without the `false`, toggling editability emits an update and pushes an empty undo step.

**The downloads read DeckEditor's slide-rail thumbnails** (`[data-slide-id] [data-slide-stage]`), which are always mounted, even when the rail is collapsed. That markup is a documented contract in DeckEditor's spec; keep both sides in step. The HTML export strips every `tabindex`, and icons need an `xmlns` before being rasterized for PowerPoint.

**Thumbnails are CSS-scaled, not laid out small.** When an exporter measures the DOM, divide `getBoundingClientRect()` values by the stage scale, but use computed lengths (`font-size`, padding) as-is. Dividing those too made PDF text about 9× too big.

**Charts contain more than one `svg.recharts-surface`.** Legend markers use the same class and can come first; use `chartParts()`.

**The PowerPoint export is checked structurally, not visually.** Tests assert the XML; open a real export in PowerPoint or Keynote after changing `pptxMotion.ts`.

**Blocks can't import blocks.** Anything another block (e.g. AiChat) needs for viewing or editing decks belongs in the DeckEditor component, not here. That's why the HTML/PDF/PowerPoint downloads (and their jspdf/pptxgenjs/jszip dependencies) live in DeckEditor. Only saving and the deck menu stay in this block.
