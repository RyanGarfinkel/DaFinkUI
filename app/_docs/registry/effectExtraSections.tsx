import type { ExtraSection } from './extraSections';

export type { ExtraSection };

// Data-driven variant/interactive sections for effect detail pages, keyed by
// effect slug. Mirrors app/_docs/registry/extraSections.tsx exactly; see
// rules/docs-site.md -> "Extra Section Guidelines" for the authoring rules.
// No effect has an extra section yet.
export const effectExtraSections: Record<string, ExtraSection[]> = {};
