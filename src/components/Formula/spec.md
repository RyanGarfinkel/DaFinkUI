# Formula

A display component that renders real LaTeX math notation, backed by [KaTeX](https://katex.org/). Supports the full range of standard LaTeX math syntax (fractions, roots, sums, integrals, matrices, Greek letters, etc.) rather than a hand-rolled subset.

## Installation

```bash
npx dafink-ui add formula
```

**Registry dependencies:** none
**npm dependencies:** `katex`

---

## Props

| Prop         | Type                    | Default    | Description                                                                 |
|--------------|-------------------------|------------|-------------------------------------------------------------------------------|
| `expression` | `string`                | None       | Required. A LaTeX math expression, e.g. `"x^2"`, `"\frac{a}{b}"`, `"\sum_{i=1}^{n} x_i"`. |
| `display`    | `'inline' \| 'block'`   | `'inline'` | `'inline'` flows with surrounding text (`<span>`); `'block'` centers on its own line (`<div>`, KaTeX's `displayMode`). |
| `size`       | `'sm' \| 'md' \| 'lg'`  | `'md'`     | Font size: `text-sm`, `text-base`, `text-lg`. KaTeX sizes everything else relative to this.  |
| `className`  | `string`                | `''`       | Additional Tailwind classes merged onto the root wrapper.                    |

All other native `span`/`div` attributes are forwarded to the root element. `children` and `dangerouslySetInnerHTML` are intentionally not accepted: the component owns its own rendered content.

---

## How it works

`Formula` calls `katex.renderToString(expression, options)` at render time and injects the resulting markup via `dangerouslySetInnerHTML`. This is pure, deterministic string generation with no DOM or browser APIs involved, so the component has no `'use client'` directive and can render on the server.

Options passed to KaTeX:

| Option         | Value                     | Why                                                                 |
|----------------|---------------------------|----------------------------------------------------------------------|
| `displayMode`  | `display === 'block'`     | Maps the component's `display` prop to KaTeX's own display/inline modes. |
| `throwOnError` | `false`                   | Malformed LaTeX renders as an inline, error-colored `.katex-error` span instead of throwing and taking down the page. |
| `errorColor`   | `var(--color-danger)`     | Uses the design system's danger token instead of KaTeX's default hardcoded red. |
| `output`       | `'htmlAndMathml'`         | Emits both the visual HTML layout and a parallel MathML tree for accessibility (see below). |

The required `katex/dist/katex.min.css` stylesheet (fonts + layout rules) is imported directly in `Formula.tsx`. Next.js's App Router supports importing package stylesheets from any component file, so no changes to `app/globals.css` are needed, and consumers installing via the CLI get working styles automatically once `katex` is installed.

---

## Interactive States

None. `Formula` is a static display component with no interactive elements.

---

## Accessibility

- KaTeX's `output: 'htmlAndMathml'` renders two parallel trees inside `.katex`: a `.katex-mathml` branch containing real `<math>` MathML (readable by MathML-aware assistive tech, with a full plain-TeX `<annotation>` fallback), and a `.katex-html` branch containing the visual layout, which KaTeX itself marks `aria-hidden="true"`. This is handled entirely by the library — no extra ARIA wiring is added on top of it.
- Do **not** wrap the root element in `role="img"` or set a custom `aria-label`: doing so would override the accessibility tree KaTeX already built and discard the MathML semantics in favor of a single flat string.
- Malformed LaTeX degrades to inline `.katex-error` text (colored via the `errorColor` design token) rather than throwing, so a bad expression never crashes the surrounding page.
- No focus management is required: the component renders no focusable elements.

---

## When to use

- Inline in docs, tooltips, or captions to show a formula alongside prose (`display="inline"`, the default).
- Centered above/below content — e.g. as the header of a `FunctionPlotter` equation, a math homework helper, or a stats/finance explainer — using `display="block"`.
- Anywhere real LaTeX math needs to render correctly, including notation this project doesn't otherwise implement (matrices, multi-line alignments, etc.) — KaTeX supports the vast majority of standard LaTeX math mode.

---

## Tokens used

| Token class    | Where                                          |
|-----------------|------------------------------------------------|
| `var(--color-danger)` | Passed as KaTeX's `errorColor`, used for malformed-LaTeX error text |
| `text-sm` / `text-base` / `text-lg` | `size` prop                        |

All other visual styling (fraction bars, radical signs, spacing, fonts) comes from `katex.min.css`, which is vendored by the `katex` package itself rather than the design system's token system.
