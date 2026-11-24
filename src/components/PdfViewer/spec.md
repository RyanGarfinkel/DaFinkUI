# PdfViewer

A clean PDF reader: a toolbar for page navigation and zoom above a continuously scrolling stack of pages with selectable text. Rendered with pdf.js.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string \| Uint8Array` | - | URL of the PDF, or its bytes. Required. Cross-origin URLs need CORS headers. |
| title | `string` | None | Optional heading shown on the left of the toolbar. Also names the scrolling region; falls back to "PDF document" when omitted. |
| initialPage | `number` | `1` | Page to scroll to once the document has loaded. |
| height | `number \| string` | `'40rem'` | Height of the viewer. Pages scroll inside it. |
| toolbarTarget | `HTMLElement \| null` | None | Where the zoom and page controls render. Omit for the built-in toolbar row; pass an element to portal the controls into your own toolbar (no title or border of their own); pass `null` to hide them. |
| onLoad | `(pageCount: number) => void` | None | Called once the document has loaded. |
| onError | `(error: Error) => void` | None | Called when the file cannot be loaded or parsed. |
| onPageChange | `(page: number) => void` | None | Called when the current page changes, by scrolling, the toolbar or the page field. |
| onPageDoubleClick | `(point: { page: number; x: number; y: number }) => void` | None | Called on a double click with the page number and the position in PDF points from the page's top-left corner. Use it for source jumps (SyncTeX) or annotations. |
| className | `string` | `''` | Additional classes on the root element. |

Extends native `<div>` attributes except `children`, `onLoad` and `onError`.

## Behavior

- Opens fit to the width of the viewer. Resizing the viewer re-fits until the user picks a zoom level
- The toolbar shows the title on the left, and on the right the zoom controls (out button, dropdown, in button) followed by the page field
- The zoom dropdown lists **Fit** (with its current percentage) and presets from 50% to 400%. The out and in buttons move in 25% steps between 25% and 400%
- Pages render lazily, about one screen ahead of the scroll position, and release their canvas memory once far away
- Pages are drawn at the device pixel ratio, so they stay sharp on high-density screens
- Changing `src` reloads. A `Uint8Array` is copied before loading, so the caller's buffer is never detached
- The worker is resolved with `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`, which Next.js and Vite bundle automatically

## Interactive States

- **toolbar buttons**: ghost buttons with the standard hover and `focus-visible:ring-2 ring-offset-2` ring; disabled before load, at the first or last page, and at the zoom limits
- **page field**: bordered input with a `focus-visible` brand ring; selects its text on focus; commits on Enter or blur
- **zoom dropdown**: the shared `Select` at the small size, named "Zoom level"
- **page area**: focusable scroll region with an inset focus ring
- **loading**: centered spinner with the label "Loading PDF…"
- **error**: centered message in a `role="alert"` region

## Accessibility

- The page area is `role="region"` with `tabIndex={0}` and `aria-label` set to `title`, so keyboard users can scroll it with the arrow, Page Up/Down and Home/End keys
- The toolbar is `role="toolbar"` and every control has an `aria-label`; the page field is the only way to jump to a page besides scrolling
- Each page is `role="img"` labelled "Page N of M". Real text is laid over the canvas, so it can be selected, copied and read by screen readers
- The zoom level is a listbox dropdown with the full `Select` keyboard model
- A failed load or page render is announced through `role="alert"`
- Page changes are not animated when `prefers-reduced-motion: reduce` is set

## When to Use

- Reading a PDF inline without leaving the page (contracts, invoices, reports, attachments)
- Use `AudioPlayer` for audio and a plain `<a href download>` when the file only needs downloading
- Not for editing, annotating or filling forms

## Tokens Used

`surface`, `surface-sunken`, `border`, `text`, `text-muted`, `brand`, `brand-ring`. The page paper itself is always white, as rendered by the PDF.

## Installation

```bash
npx dafink-ui add pdfviewer
```

npm dependencies: `pdfjs-dist`
Registry dependencies: `button`, `select`, `spinner`, `icons`
