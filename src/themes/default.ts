import type { Theme } from './types';

// Zinc — clean, minimal, timeless.
// Pure white in light mode, near-black in dark. Brand is jet-black / near-white
// so it reads as a neutral premium look that works in any context.
export const defaultTheme: Theme = {
  name: 'default',
  label: 'Zinc',
  accent: '#18181b',

  light: {
    '--color-brand':        '#18181b',
    '--color-brand-hover':  '#27272a',
    '--color-brand-active': '#3f3f46',
    '--color-brand-ring':   '#18181b',
    '--color-brand-fg':     '#ffffff',

    '--color-danger':        '#dc2626',
    '--color-danger-hover':  '#b91c1c',
    '--color-danger-active': '#991b1b',
    '--color-danger-ring':   '#dc2626',

    '--color-surface':              '#ffffff',
    '--color-surface-hover':        '#f9fafb',
    '--color-surface-active':       '#f4f4f5',
    '--color-surface-border':       '#e4e4e7',
    '--color-surface-border-hover': '#d4d4d8',

    '--color-text':          '#18181b',
    '--color-text-muted':    '#52525b',
    '--color-text-subtle':   '#a1a1aa',
    '--color-text-inverted': '#ffffff',

    '--color-input-border':        '#d4d4d8',
    '--color-input-border-hover':  '#a1a1aa',
    '--color-input-ring':          '#18181b',
    '--color-input-placeholder':   '#a1a1aa',
    '--color-input-disabled-bg':   '#f4f4f5',
    '--color-input-disabled-text': '#a1a1aa',
    '--color-input-error':         '#dc2626',
    '--color-input-error-ring':    '#dc2626',
  },

  // Charcoal zinc — not pure black. Clear elevation steps, visible borders,
  // off-white text so nothing feels harsh.
  //
  // Surface hierarchy (light → dark):
  //   active #26262a → border #2e2e32 → hover #1c1c1f → base #111113
  // Text hierarchy:
  //   text #e8e8ea → muted #8e8e9a → subtle #54545e
  dark: {
    '--color-brand':        '#e8e8ea',
    '--color-brand-hover':  '#d0d0d4',
    '--color-brand-active': '#b4b4b9',
    '--color-brand-ring':   '#e8e8ea',
    '--color-brand-fg':     '#111113',

    '--color-danger':        '#f87171',
    '--color-danger-hover':  '#fca5a5',
    '--color-danger-active': '#fecaca',
    '--color-danger-ring':   '#f87171',

    '--color-surface':              '#111113',
    '--color-surface-hover':        '#1c1c1f',
    '--color-surface-active':       '#26262a',
    '--color-surface-border':       '#2e2e32',
    '--color-surface-border-hover': '#3e3e43',

    '--color-text':          '#e8e8ea',
    '--color-text-muted':    '#8e8e9a',
    '--color-text-subtle':   '#54545e',
    '--color-text-inverted': '#111113',

    '--color-input-border':        '#2e2e32',
    '--color-input-border-hover':  '#3e3e43',
    '--color-input-ring':          '#e8e8ea',
    '--color-input-placeholder':   '#54545e',
    '--color-input-disabled-bg':   '#1c1c1f',
    '--color-input-disabled-text': '#2e2e32',
    '--color-input-error':         '#f87171',
    '--color-input-error-ring':    '#f87171',
  },
};
