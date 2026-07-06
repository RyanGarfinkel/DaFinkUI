# Attachment

A compact chip representing a single linked or attached file — icon, filename, and optional size/type, with an automatic thumbnail for images (or an explicit one for anything else, like a PDF cover) — plus `AttachmentGroup` for laying several out together in a wrapped row.

---

## Props

### Attachment

| Name         | Type                                                                  | Default          | Description                                                                 |
|--------------|------------------------------------------------------------------------|------------------|-------------------------------------------------------------------------------|
| name         | `string`                                                                | —                | The filename shown in the chip. Also used to infer the file-type icon and as the fallback `title` (full name on hover/truncation) if `title` isn't set. |
| href         | `string`                                                                | —                | Link target for the file. When set, the primary control renders as a real `<a>`. When omitted, it renders as a `<button type="button">` instead, so the primary action stays keyboard-reachable even without a navigable URL. |
| size         | `string`                                                                | —                | Pre-formatted file size (e.g. `"2.4 MB"`), shown as secondary muted text.    |
| type         | `string`                                                                | —                | Pre-formatted file type label (e.g. `"PDF"`), shown alongside `size` as secondary muted text (`"PDF · 2.4 MB"`). |
| icon         | `'file' \| 'image' \| 'video' \| 'audio' \| 'archive' \| 'code'`        | inferred from `name` | Overrides the automatically inferred icon. Inference checks the file extension in `name` (e.g. `.png` → `image`, `.zip` → `archive`) and falls back to `file`. |
| thumbnail    | `string`                                                                | —                | An image URL rendered in place of the icon glyph. For an image-type attachment this defaults to `href` automatically — the image file is its own preview. For anything else (a PDF, say), there's no such shortcut: pass a pre-rendered cover/preview image explicitly, since a browser can't render a non-image file as an `<img>`. |
| onClick      | `(event: MouseEvent<HTMLAnchorElement \| HTMLButtonElement>) => void`  | —                | Fires when the primary control (link or button) is activated — the "open" action. Call `event.preventDefault()` here if you want to replace default link navigation with custom behavior (e.g. opening a preview in a new tab). |
| className    | `string`                                                                | `""`             | Additional classes merged onto the root chip wrapper.                       |

`Attachment` also extends `AnchorHTMLAttributes<HTMLAnchorElement>` (minus `href` and `onClick`, which are typed above), so native attributes like `target`, `rel`, `download`, and `aria-*`/`data-*` pass through onto the primary control. These only make sense when `href` is also set.

### AttachmentGroup

| Name      | Type        | Default | Description                                                    |
|-----------|-------------|---------|------------------------------------------------------------------|
| className | `string`    | `""`    | Additional classes merged onto the `<ul>` wrapper.                |
| children  | `ReactNode` | —       | One or more `Attachment` elements.                                |

`AttachmentGroup` extends `HTMLAttributes<HTMLUListElement>` — any other native `ul` prop passes through.

---

## Behavior

- `Attachment` renders one focusable primary control inside a bordered chip — a real `<a>` when `href` is given, a real `<button type="button">` otherwise.
- The filename truncates with an ellipsis once the chip hits its default `max-w-[240px]` (overridable via `className`). The full name is always available via the native `title` attribute (or your own override).
- The icon is inferred from the file extension in `name` unless `icon` is explicitly set — pass `icon` directly when you already know the category, or when the filename has no extension.
- When a real preview image is available (`thumbnail`, or an automatic fallback to `href` for image-type attachments), it replaces the icon glyph entirely — a 36×36px (`h-9 w-9`) rounded, cropped (`object-cover`) thumbnail instead.
- `AttachmentGroup` renders a semantic `<ul>`/`<li>` list with `flex flex-wrap gap-2` — a compact, chat-style "attached files" strip that wraps onto multiple lines rather than one long horizontally-scrolling row.

---

## Interactive States

| State         | Primary control (link/button)                                                    |
|---------------|-------------------------------------------------------------------------------------|
| default       | `text-text` name, `text-text-muted` icon/secondary text                            |
| hover         | `hover:bg-surface-hover`                                                             |
| focus-visible | `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring`     |
| chip (root)   | `hover:border-surface-border-hover`                                                  |

All color/background transitions use `transition-colors duration-[var(--duration-fast)]` and respect `prefers-reduced-motion` via the global rule.

---

## Accessibility

- The primary control is a real `<a href>` whenever `href` is provided — this preserves native link behavior (open in new tab, copy link address, middle-click). When no `href` is given, it renders as a real `<button type="button">` instead of a non-focusable element, so it's never unreachable by keyboard. To replace default navigation with custom behavior (e.g. opening a preview in a new tab), call `event.preventDefault()` inside `onClick`.
- The thumbnail `<img>` (when shown) has `alt=""` — its meaning is entirely redundant with the visible filename text right next to it, so it's treated as decorative to avoid double-announcing the same information to screen readers.
- The filename and secondary text (`type`/`size`) are plain text content, not conveyed through color alone.
- `AttachmentGroup` uses a native `<ul>`/`<li>` list structure, so assistive tech announces the number of attached files.

---

## When to Use

- Use `Attachment` for a single file reference attached to a message, comment, form submission, or record — anywhere a user needs to open or download a file.
- Use `AttachmentGroup` whenever more than one file is attached together, so they read as a single compact strip instead of a stack of unrelated rows.
- For a full file browser or table of files with sorting/columns, use `Table`/`DataTable` instead — `Attachment` is for a compact reference, not a management UI.

---

## Tokens Used

| Token                          | Usage                                |
|--------------------------------|------------------------------------------|
| `bg-surface-panel`             | Chip background                          |
| `border-surface-border`        | Chip border                              |
| `border-surface-border-hover`  | Chip border on hover                     |
| `bg-surface-hover`             | Primary control hover background         |
| `text-text`                    | Filename                                 |
| `text-text-muted`              | Icon, secondary size/type text           |
| `ring-brand-ring`              | Focus-visible ring                       |
| `--radius`, `--radius-sm`      | Chip and inner control corner radii      |
| `--border-width`               | Chip border thickness                    |
| `--duration-fast`              | Color transition duration                |

---

## Installation

```bash
npx @dafink/ui add attachment
```

No additional npm dependencies. No registry dependencies.
