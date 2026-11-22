import axe, { type AxeResults } from 'axe-core';
import { expect } from 'vitest';

// jsdom has no layout or painting, so rules that need real rendering are off.
const JSDOM_RULES = { 'color-contrast': { enabled: false }, 'region': { enabled: false } };

const describeViolation = ({ id, help, nodes }: AxeResults['violations'][number]) =>
	`${id}: ${help}\n${nodes.map((node) => `  ${node.target.join(' ')}\n  ${node.html}`).join('\n')}`;

export const expectNoViolations = async (container: Element) => {
	const { violations } = await axe.run(container, { rules: JSDOM_RULES });

	expect(violations.map(describeViolation), violations.map(describeViolation).join('\n\n')).toEqual([]);
};
