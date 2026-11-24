# DocEditor

A word-processor style document editor: a formatting toolbar above a page-like writing area, with a download as a Word (`.docx`) file. Built on TipTap, so the document is plain HTML you can store.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | - | Required. The document as HTML (headings, paragraphs, lists, quotes). Pass the HTML from `onChange` back in to keep it controlled. |
| onChange | `(html: string) => void` | None | Called with the document HTML after every edit. |
| title | `string` | None | Document title: the default download name and the title inside the `.docx` file. |
| filename | `string` | `title` | Download name, without the `.docx` extension. Falls back to `title`, then `"document"`. |
| readOnly | `boolean` | `false` | Show the document without editing. The formatting controls are hidden. |
| downloadable | `boolean` | `true` | Show the **Download .docx** button. Turn it off when the host provides its own download. |
| height | `number \| string` | `'40rem'` | Height of the editor. The page scrolls inside it. |
| aria-label | `string` | `'Document'` | Accessible name of the editing area. |
| className | `string` | `''` | Additional classes on the root element. |

Also exports `exportDocx(html, title?)` (returns a `Blob`), `downloadDocx(html, name)` (saves the file) and `buildDocx(html, title?)` (returns the bytes) from `DocEditor/docx.ts`.

## Formatting

| Control | What it does |
|---|---|
| Undo, Redo | Step through the edit history |
| Text style | Paragraph, Heading 1, Heading 2, Heading 3 |
| Bold, Italic, Underline, Strikethrough | Inline styles; links typed as URLs are made clickable |
| Bulleted list, Numbered list | Lists, nestable with Tab |
| Quote | Block quote |
| Align left, center, right | Paragraph and heading alignment |

Standard shortcuts work in the writing area (Ctrl/Cmd+B, I, U, Z, Shift+Z, and the Markdown-style shortcuts such as `# ` for a heading and `- ` for a list).

## Word export

`.docx` is built in the browser with the already-installed `jszip`, no server needed. Headings map to Word's Heading 1-3 styles, lists to real Word numbering (each numbered list restarts at 1), links to external hyperlinks, and quotes to the Quote style. Bold, italic, underline, strikethrough, inline code, alignment and horizontal rules carry over. Pages are US Letter with 1-inch margins.

## Interactive States

- **toolbar buttons**: ghost icon buttons with the standard hover and `focus-visible:ring-2` ring; a button for an active style (bold at the cursor, an active list) uses the secondary variant and `aria-pressed="true"`
- **disabled**: Undo and Redo are disabled when there is nothing to undo or redo; everything is disabled until the editor has loaded
- **writing area**: no outline of its own; the caret shows focus
- **download**: shows a loading spinner while the file is built

## Accessibility

- The writing area is `role="textbox"` with `aria-multiline="true"` and an `aria-label` (default "Document")
- The toolbar is `role="toolbar"` named "Formatting". Tab reaches each control; Left and Right arrow move between them
- Toggle buttons expose their state with `aria-pressed`. Every button has an `aria-label`
- Toolbar buttons don't take focus from the text on mouse down, so the selection is kept while formatting
- Read-only mode sets `contenteditable="false"` and removes the editing controls

## When to Use

- A long-form document a person writes or edits and may need as a Word file: reports, letters, notes from an AI
- Use `Textarea` for plain text, `CodeEditor` for code, and a markdown view for read-only formatted text
- Not for tables, images or comments; the document model supports headings, text, lists, quotes and rules

## Tokens Used

`surface`, `surface-sunken`, `surface-hover`, `border`, `text`, `text-muted`, `radius`, `radius-lg`. The page itself uses `surface`, so it follows the dark and light themes.

## Installation

```bash
npx dafink-ui add doc-editor
```

npm dependencies: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-text-align`, `jszip`
Registry dependencies: `button`, `select`, `icons`
