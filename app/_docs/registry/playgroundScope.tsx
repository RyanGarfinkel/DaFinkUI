import { useEffect, useRef, useState } from 'react';
import * as Components from '@/src';

/** Every component in the registry, bound as a free variable a hand-written JSX snippet can
 * reference directly; this is what the live preview evaluates arbitrary editor code against.
 * `Components` already exports each one under this exact name, so a spread covers all of them. */
export const PLAYGROUND_SCOPE: Record<string, unknown> = {
	...Components,
	useState,
	useEffect,
	useRef,
};

const HOOK_IMPORTS: Record<string, string> = {
	useState: 'useState',
	useEffect: 'useEffect',
	useRef: 'useRef',
};

/** Scans `code` for every registry component referenced as a JSX tag (or hook call), and
 * returns the import lines needed to make that code runnable, pulled straight out of each
 * matched component's own `usage` field so they never drift from the real install path. */
export const deriveImports = (
	code: string,
	registryEntries: { name: string; usage: string }[]
): string[] => {
	const importSet = new Set<string>();

	const hookNames = Object.keys(HOOK_IMPORTS).filter((hook) => new RegExp(`\\b${hook}\\s*\\(`).test(code));
	if (hookNames.length > 0) importSet.add(`import { ${hookNames.join(', ')} } from 'react';`);

	registryEntries.forEach((entry) => {
		const tagPattern = new RegExp(`<${entry.name}[\\s/>]`);
		if (!tagPattern.test(code)) return;

		const importLines = entry.usage.match(/^import .+;$/gm) ?? [];
		importLines.forEach((line) => importSet.add(line));
	});

	return [...importSet].sort((a, b) => b.length - a.length);
};
