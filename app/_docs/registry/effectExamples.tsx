import type { ComponentExample } from './componentExamples';

export type { ComponentExample };

// Data-driven "Examples" sections for effect detail pages, keyed by effect
// slug. Mirrors app/_docs/registry/componentExamples.tsx exactly; see
// rules/docs-site.md -> "Examples Guidelines" for the authoring rules. No
// effect has extra named examples yet.
export const effectExamples: Record<string, ComponentExample[]> = {};
