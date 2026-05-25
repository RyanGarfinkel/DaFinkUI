# Rule: New Component

Apply this rule whenever creating a new UI component in `src/components/`.

## Required File Structure

Every component lives in its own folder under `src/components/`. The folder name is PascalCase and matches the component name exactly.

```
src/components/ComponentName/
├── ComponentName.tsx        # The component
├── ComponentName.test.tsx   # Vitest unit tests
└── spec.md                  # Machine-readable spec for MCP
```

No exceptions. All three files are required. After creating the files, add an entry for the component to `src/docs/registry/index.ts` — this is what populates the docs site. A component that exists in code but is not in the registry is invisible to users of the docs site.

**Note:** Storybook stories (`.stories.tsx`) are no longer part of the required structure. The docs site registry replaces them as the primary showcase.

## Interactive States

Every interactive element in the component must implement all three states. Reference: `src/patterns/interactive-states.mdx`.

| State         | Implementation                                                    |
|---------------|-------------------------------------------------------------------|
| hover         | Distinct background or border shift via `hover:` Tailwind prefix |
| focus         | `focus:outline-none` — suppresses browser default                 |
| focus-visible | `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-{color}` |

Rules:
- Hover, default, and focus-visible must each be visually distinct from one another
- Disabled elements must not show hover or focus-visible styles
- Ring color must match the component's semantic intent (primary → blue, destructive → red, neutral → zinc)

## ComponentName.tsx

- `'use client';` on line 1 if the component uses hooks or browser APIs
- Export the component as the default export
- Export the props interface as a named export
- Export any variant/size union types as named exports
- Extend the relevant native HTML element's attributes (`ButtonHTMLAttributes`, `InputHTMLAttributes`, etc.) so consumers can pass through native props
- Accept and spread a `className` prop to allow style extension

## Registry Entry (src/docs/registry/index.ts)

Every new component must have an entry in the registry. Categories follow the sidebar groupings:

| Category      | Components it contains                                            |
|---------------|-------------------------------------------------------------------|
| `Actions`     | Button and any other action-triggering components                 |
| `Inputs`      | Input, Textarea, Radio, Switch, ToggleGroup, CalendarInput        |
| `Display`     | Card, Table, Skeleton, Typography                                 |
| `Navigation`  | Tabs, Breadcrumb                                                  |
| `Forms`       | Form and form-layout primitives                                   |
| `Disclosure`  | Accordion and other show/hide components                          |
| `Overlay`     | Modal, Dialog, Drawer, Dropdown, Menu, Popover, Tooltip           |
| `Feedback`    | Toast, Alert, Badge, Progress                                     |

The `usage` field must be a complete, runnable code example — not a snippet. The `props` array drives the PropsTable on the detail page and must be kept in sync with the component's actual props interface.

### Declaring Dependencies

Every registry entry must explicitly declare its dependencies. Omitting them breaks the CLI installer for users.

**`dependencies`** — npm packages the component imports that are not already in the base install (`react`, `react-dom`, `next`, `tailwindcss`). Example: a CalendarInput that uses `date-fns` must list `["date-fns"]`.

**`registryDependencies`** — other components from this registry that must be present for this component to work. Use the slug (lowercase). Example: a Modal that renders a Button internally must list `["button"]`. The CLI resolves these transitively — declare only direct dependencies, not the full tree.

**`files`** — the source files to copy into the user's project, relative to `src/components/`. A single-file component is `["Button/Button.tsx"]`. A compound component with subcomponents may list multiple files.

```ts
// Example entry with all fields
{
  slug: 'modal',
  name: 'Modal',
  category: 'Overlay',
  description: 'A blocking overlay dialog with focus trap and Escape-to-close.',
  usage: `import { Modal, ModalTrigger, ModalContent } from '@/components/ui/Modal';\n\n...`,
  props: [...],
  dependencies: [],               // no extra npm deps
  registryDependencies: ['button'], // copies Button too
  files: ['Modal/Modal.tsx'],
}
```

If a component has zero npm dependencies and zero registry dependencies, still include the fields as empty arrays — this signals the entry is complete, not missing.

## ComponentName.test.tsx

Use Vitest and `@testing-library/react`. Tests must cover:

1. **Renders** — component mounts without errors
2. **Variants** — each variant renders with the correct Tailwind classes
3. **Interactive states** — hover, focus-visible classes are present on the element
4. **Disabled** — disabled state removes pointer events and shows correct classes
5. **Accessibility** — any `aria-*` attributes set by the component are correct
6. **Forwarded props** — native HTML attributes (e.g. `onClick`, `type`) are passed through

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComponentName from './ComponentName';

describe('ComponentName', () =>
{
	it('renders without errors', () =>
	{
		render(<ComponentName />);
		// assertions
	});
});
```

## Popup and Overlay Components

Any component that opens a floating layer — Modal, Dialog, Drawer, Dropdown, Menu, Combobox, Popover, Tooltip — must satisfy all of the following before it is considered complete. Read `src/patterns/accessibility.md` for the full implementation guide.

### Required Behavior Checklist

- [ ] **Focus on open** — focus moves inside the overlay immediately when it opens
- [ ] **Focus trap** (modals, dialogs, drawers only) — Tab and Shift+Tab cycle within the overlay; focus cannot escape to the document behind it
- [ ] **Escape closes** — pressing Escape always closes the overlay
- [ ] **Focus return** — when the overlay closes, focus returns to the element that triggered it
- [ ] **Tab in menus/dropdowns** — Tab closes the menu and moves focus to the next page element (does not trap)
- [ ] **Arrow key navigation** (menus, listboxes, select) — ArrowDown/ArrowUp move between items; Home/End jump to first/last
- [ ] **Typeahead** (menus, listboxes) — typing a character moves focus to the next matching item
- [ ] **Enter/Space confirms** — activates the focused item and closes the overlay
- [ ] **Background scroll lock** (modals/dialogs/drawers) — `overflow: hidden` on `<body>` while overlay is open
- [ ] **Backdrop click** (modals/dialogs) — clicking the backdrop closes the overlay, same as Escape
- [ ] **ARIA roles** — correct `role`, `aria-modal`, `aria-expanded`, `aria-haspopup`, `aria-labelledby`, `aria-describedby` as applicable
- [ ] **Animation** — enters with `opacity-0 scale-95` → `opacity-100 scale-100`; exits in reverse; respects `prefers-reduced-motion`

### Animation Pattern

```tsx
// Use data attributes to drive enter/exit animation with Tailwind
<div
  data-state={isOpen ? 'open' : 'closed'}
  className="
    data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95
    data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95
    duration-[var(--duration-base)]
  "
>
```

Or use CSS classes toggled directly:

```tsx
<div className={cn(
  'transition-all duration-[var(--duration-base)]',
  isOpen
    ? 'opacity-100 scale-100 pointer-events-auto'
    : 'opacity-0 scale-95 pointer-events-none'
)}>
```

## spec.md

The spec is the source of truth for the MCP server. It must include:

- One-line description of what the component is
- Props table: name, type, default, description
- Variants table (if applicable)
- Interactive states section describing the visual behavior of each state
- Accessibility notes: ARIA roles, keyboard behavior, focus management (for overlay components: full popup checklist)
- "When to use" guidance
- Tokens used
- Installation: the `npx @obi/ui add {slug}` command, any npm dependencies, and any registry dependencies (other components installed alongside it)

For overlay components, the Accessibility section of `spec.md` must explicitly document: focus entry behavior, whether focus is trapped, Escape behavior, Tab behavior, arrow key navigation (if applicable), and ARIA roles used.

---

# Rule: Updating a Component

Apply this rule whenever modifying an existing component in `src/components/`.

## Always Update spec.md

`spec.md` is the source of truth for the MCP server. Any change to a component's external behavior must be reflected there before the PR is complete.

Changes that require a spec update:
- Adding, removing, or renaming a prop
- Changing a prop's type, default value, or accepted values
- Adding or removing a variant or size
- Changing interactive state behavior (hover, focus-visible, active, disabled)
- Changing accessibility attributes or keyboard behavior
- Changing visual design in a way that affects the "When to use" guidance

Changes that do not require a spec update:
- Internal refactors with no external behavior change
- Performance improvements
- File reorganization

## Update Tests When Behavior Changes

Update `ComponentName.test.tsx` whenever:
- A prop is added, removed, or renamed — add/remove/update the corresponding test
- A class name changes — update assertions that check for that class
- A new variant or size is added — add a test case for it
- Accessibility attributes change — update `aria-*` assertions

Do not delete tests unless the behavior they cover no longer exists. Do not leave tests asserting against stale class names or removed props.
