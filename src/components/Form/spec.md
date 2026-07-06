# Form

A set of composable layout primitives for building forms. This is a structural and visual system — it handles spacing, labeling, error display, and section grouping. It does not own form state or validation by default, but ships an optional `useZodForm` hook (react-hook-form + Zod) for consumers who want schema-based validation without wiring it up by hand.

---

## Subcomponents

### `Form` (default export)

Wraps a native `<form>` element. Provides consistent vertical spacing between fields.

| Prop        | Type                              | Default | Description                                       |
|-------------|-----------------------------------|---------|---------------------------------------------------|
| `className` | `string`                          | `''`    | Additional classes merged onto the form element   |
| `...props`  | `FormHTMLAttributes<HTMLFormElement>` | —   | All native form attributes (method, action, etc.) |

**Layout:** `space-y-6` between direct children.

---

### `FormSection`

An optional grouping wrapper rendered as a `<fieldset>`. Use to visually and semantically group related fields within a form.

| Prop          | Type        | Default | Description                                      |
|---------------|-------------|---------|--------------------------------------------------|
| `title`       | `string`    | —       | Rendered as a `<legend>` inside the fieldset     |
| `description` | `string`    | —       | Rendered below the title in muted text           |
| `className`   | `string`    | `''`    | Additional classes merged onto the fieldset      |
| `children`    | `ReactNode` | —       | Form fields or other content                     |

**Layout:** `space-y-4` between children. Title: `text-base font-semibold text-text`. Description: `text-sm text-text-muted`.

---

### `FormField`

Wraps a single field — label, control, description, and message — in a flex column with consistent gap.

| Prop        | Type        | Default | Description                                       |
|-------------|-------------|---------|---------------------------------------------------|
| `className` | `string`    | `''`    | Additional classes merged onto the wrapper div    |
| `children`  | `ReactNode` | —       | Typically `FormLabel`, `FormControl`, `FormDescription`, and/or `FormMessage` |

**Layout:** `flex flex-col gap-1.5`.

---

### `FormLabel`

A styled `<label>` element. Accepts all native label attributes.

| Prop        | Type        | Default | Description                                                        |
|-------------|-------------|---------|--------------------------------------------------------------------|
| `required`  | `boolean`   | `false` | When true, appends a ` *` indicator in `text-input-error` color    |
| `htmlFor`   | `string`    | —       | Native `for` attribute — links label to its input                  |
| `className` | `string`    | `''`    | Additional classes merged onto the label                           |
| `...props`  | `LabelHTMLAttributes<HTMLLabelElement>` | — | All native label attributes             |

**Styles:** `text-sm font-medium text-text`. The `*` indicator is `aria-hidden="true"` — required state must also be communicated via `aria-required` on the input itself.

---

### `FormControl`

A thin `<div>` wrapper around the actual input element. Exists for layout extension — use it to add relative positioning or group an input with an inline adornment.

| Prop        | Type        | Default | Description                                    |
|-------------|-------------|---------|------------------------------------------------|
| `className` | `string`    | `''`    | Additional classes merged onto the wrapper div |
| `children`  | `ReactNode` | —       | The input or control element                   |

---

### `FormDescription`

Hint or helper text displayed below a field. Renders always (unlike `FormMessage`).

| Prop        | Type        | Default | Description                              |
|-------------|-------------|---------|------------------------------------------|
| `className` | `string`    | `''`    | Additional classes merged onto the `<p>` |
| `children`  | `ReactNode` | —       | Hint text                                |

**Styles:** `text-sm text-text-muted`.

---

### `FormMessage`

Validation or error message. **Renders nothing when `children` is falsy** — use this as a safe slot that disappears when there is no error.

| Prop        | Type        | Default | Description                              |
|-------------|-------------|---------|------------------------------------------|
| `className` | `string`    | `''`    | Additional classes merged onto the `<p>` |
| `children`  | `ReactNode` | —       | Error or validation text                 |

**Styles:** `text-sm text-input-error`. Has `role="alert"` so screen readers announce it when it appears.

---

## `useZodForm` (optional)

A thin wrapper around react-hook-form's `useForm` that wires up `zodResolver` for you. Purely additive — the manual-composition API above works exactly as it always has if you don't use this hook.

```ts
function useZodForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>>
```

| Param      | Type                                              | Default | Description                                                                 |
|------------|----------------------------------------------------|---------|-------------------------------------------------------------------------------|
| `schema`   | `z.ZodType`                                        | —       | A Zod schema describing the form's shape. Validation errors surface via `form.formState.errors`, keyed by field name, with `.message` set to the schema's error string. |
| `options`  | `Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>` | `undefined` | Any react-hook-form `useForm` option (`defaultValues`, `mode`, etc.) except `resolver`, which `useZodForm` sets for you. |

Returns the same `UseFormReturn<z.infer<TSchema>>` object `useForm` would — `register`, `handleSubmit`, `formState`, `watch`, `reset`, etc. — typed against the schema's inferred output.

**When to use:** reach for `useZodForm` when a form has real validation rules (required fields, email/format checks, min/max length, cross-field rules) and you want the schema to be the single source of truth for both the TypeScript type and the runtime validation. Wire each input with `form.register('fieldName')` and render its error with `<FormMessage>{form.formState.errors.fieldName?.message}</FormMessage>`.

**When to use plain manual state instead:** a one-off field with no real validation (e.g. a search box), or a form whose fields aren't known statically. In those cases, `useState` plus conditionally rendering `<FormMessage>` is simpler and doesn't require a schema.

```tsx
import { Form, FormField, FormLabel, FormControl, FormMessage, useZodForm } from '@/src/components/Form/Form';
import Input from '@/src/components/Input/Input';
import Button from '@/src/components/Button/Button';
import { z } from 'zod';

const schema = z.object({
  email: z.email('Enter a valid email address.'),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const form = useZodForm(schema);

  const onSubmit = (values: FormValues) => {
    // values is fully typed from the schema
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField>
        <FormLabel htmlFor="email" required>Email</FormLabel>
        <FormControl>
          <Input id="email" type="email" aria-required="true" {...form.register('email')} />
        </FormControl>
        <FormMessage>{form.formState.errors.email?.message}</FormMessage>
      </FormField>
      <Button type="submit">Continue</Button>
    </Form>
  );
}
```

npm dependencies: `zod`, `react-hook-form`, `@hookform/resolvers`.

---

## When to use

Use `Form` layout primitives when you need:

- Consistent spacing and structure across form fields
- Semantic fieldset grouping for related fields (e.g., "Billing address")
- A uniform way to attach labels, hints, and errors to any input type

**vs. using Input directly:** The `Input` component is self-contained — it has its own label, hint, and error built in. Use `Form` primitives when you need to compose with non-Input controls (e.g., `Select`, `Checkbox`, `Switch`, `Textarea`, custom pickers), or when you want explicit control over the label-input-message layout without coupling it to one component.

---

## Composition patterns

**Basic field:**
```tsx
<FormField>
  <FormLabel htmlFor="email" required>Email</FormLabel>
  <FormControl>
    <Input id="email" type="email" aria-required="true" />
  </FormControl>
  <FormDescription>We'll never share your email.</FormDescription>
  <FormMessage>{errors.email}</FormMessage>
</FormField>
```

**Grouped fields:**
```tsx
<Form>
  <FormSection title="Personal info" description="Update your details.">
    <FormField>...</FormField>
    <FormField>...</FormField>
  </FormSection>
  <FormSection title="Account">
    <FormField>...</FormField>
  </FormSection>
</Form>
```

**Without FormSection (flat):**
```tsx
<Form>
  <FormField>...</FormField>
  <FormField>...</FormField>
  <Button type="submit">Submit</Button>
</Form>
```

---

## Accessibility

- `FormSection` renders a `<fieldset>` with a `<legend>` — this is the correct semantic pattern for grouping related controls. Screen readers announce the legend text when entering the group.
- `FormLabel` renders a `<label>` — always provide `htmlFor` matching the input's `id` to ensure programmatic association.
- `FormLabel required` appends a visual `*` that is `aria-hidden="true"`. To communicate required state to assistive technology, add `aria-required="true"` (or `required`) directly on the input.
- `FormMessage` uses `role="alert"`, which causes screen readers to announce the message when it mounts. Only render `FormMessage` when there is an actual error — conditional rendering via falsy children handles this automatically.
- `FormDescription` should be linked to its input via `aria-describedby` for assistive technology to surface the hint: `<Input aria-describedby="username-hint" />` with `<FormDescription id="username-hint">...</FormDescription>`.

---

## Tokens used

| Token              | Where used                                      |
|--------------------|-------------------------------------------------|
| `text-text`        | `FormLabel`, `FormSection` title                |
| `text-text-muted`  | `FormDescription`, `FormSection` description    |
| `text-input-error` | `FormMessage`, `FormLabel` required indicator   |

---

## Installation

```bash
npx @dafink/ui add form
```

npm dependencies: none for the layout primitives (`Form`, `FormSection`, `FormField`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`). Using `useZodForm` requires `zod`, `react-hook-form`, and `@hookform/resolvers` — installed automatically by the CLI, or via `npm install zod react-hook-form @hookform/resolvers` if adding validation to a project that already has the layout primitives.
No registry dependencies.
