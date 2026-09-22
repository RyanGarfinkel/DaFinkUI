# Questionnaire

A structured question widget for chat-style flows: renders a single question (radio, slider, number, or calendar) or a sequence of several questions (`steps`) inside one card, with a "Question X of N" progress indicator advancing one question at a time. Once answered, the question section animates closed (height collapses to zero) and a compact one-line-per-answer recap remains, so the card shrinks vertically. While answering, the card's height follows the current question (measured with a `ResizeObserver`), so moving between a tall question and a short one animates instead of jumping.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `step` | `QuestionStep` | `undefined` | A single question and its input control to render. Mutually exclusive with `steps`. |
| `steps` | `QuestionStep[]` | `undefined` | A sequence of questions rendered one at a time inside the same card, with a "Question X of N" progress indicator. Mutually exclusive with `step`. |
| `answer` | `string` | `undefined` | When set, the card renders as a locked "You answered: {answer}" summary instead of the input control. Sized to fit its content (`w-fit`) rather than stretching to the width of its container, since a short answer doesn't need a full-width card. Only applies to a single `step`; a `steps` sequence shows its own completed recap once every question is answered. |
| `onAnswer` | `(value: string) => void` | — | Called with the submitted answer, formatted as a display string regardless of control type. For a `steps` sequence, called once at the end with every answer joined together (`; `-separated). |
| `className` | `string` | `''` | Additional classes on the root wrapper. |

### `QuestionStep`

A discriminated union on `type`:

| Type | Fields |
|------|--------|
| `radio` | `question: string`, `description?: string`, `options: QuestionOption[]`, `otherPlaceholder?: string` |
| `slider` | `question: string`, `description?: string`, `min: number`, `max: number`, `step: number` |
| `number` | `question: string`, `description?: string`, `placeholder?: string` |
| `calendar` | `question: string`, `description?: string` |

### `QuestionOption`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Stable identifier for the option. |
| `label` | `string` | Display label. |
| `description?` | `string` | Optional supporting text under the label. |

---

## Variants

Four question types share the same card shell and progress/advance mechanics: `radio` (a list of selectable option cards plus a free-text "other" field), `slider`, `number`, and `calendar`. Passing `steps` instead of a single `step` stacks any mix of these question types into a multi-question sequence within one card.

---

## Interactive States

| Element | State | Implementation |
|---|---|---|
| Radio option card | Default | `border-surface-border` |
| Radio option card | Hover | `hover:border-surface-border-hover` |
| Radio option card | Checked | `border-brand bg-surface-hover` |
| Radio option indicator | Focus-visible | `peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-brand-ring` |
| Next / Submit button | Disabled | Disabled until the current question has a value (`pendingValue !== null`) |

---

## Accessibility

- Radio options render as a native `<input type="radio">` per option, grouped under a shared `name` (the question text); the visual selection ring and checkmark are driven off that input via the `peer` pattern, so the control stays keyboard-reachable (Tab) and togglable (Space/Enter) like any native radio.
- The free-text "other" field and the slider both carry an explicit `aria-label` (`otherPlaceholder` / the question text), since neither has a visible `<label>` element.
- After completion the collapsed question section is `aria-hidden` and `inert`, so it can't be focused or read; only the recap is exposed.
- The completion checkmark shown for an answered or completed question is `aria-hidden`.
- The "Question X of N" progress indicator is plain text, not a live region; advancing moves focus naturally onto the newly rendered question's control.

---

## When to Use

- A structured follow-up question embedded inside a chat reply (its primary use case, via the `ai-chat` block)
- Any inline, form-like prompt that should collect one answer at a time and then collapse into a compact recap
- A short multi-question intake flow (feature request triage, bug report details, status check-ins) that shouldn't feel like a full form page

---

## Tokens Used

| Token | Purpose |
|-------|---------|
| `radius-lg` | Card and option corner radius |
| `border-width` | Card and option border thickness |
| `surface-border` / `surface-border-hover` | Option border color, default / hover |
| `surface-panel` | Card background |
| `surface-hover` / `surface-active` | Selected option background; progress track background |
| `brand` / `brand-ring` | Selected state color and focus ring |
| `text` / `text-muted` / `text-subtle` | Text hierarchy across question, description, and progress label |
| `success` | Completion checkmark color |
| `duration-fast` / `duration-normal` | Selection and progress-bar transition timing |

---

## Installation

```bash
npx dafink-ui add questionnaire
```

No npm dependencies. Registry dependencies: `date-picker`, `slider`, `button`, `input`.
