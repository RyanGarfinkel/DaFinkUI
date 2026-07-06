#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, relative } from 'path';

const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git']);
const FILE_EXTENSIONS = ['.tsx', '.jsx'];

const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,8}\b/;
const RGB_COLOR_REGEX = /\brgba?\(/;
const TAILWIND_COLOR_REGEX = /\b(bg|text|border|ring|fill|stroke)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)\b/;
const ATTR_VALUE_REGEX = /(?:className|style)\s*=\s*(?:\{`([^`]*)`\}|\{"([^"]*)"\}|"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;

function resolveScanRoot(argv, cwd)
{
	const pathFlagIndex = argv.indexOf('--path');

	if(pathFlagIndex !== -1 && argv[pathFlagIndex + 1])
		return resolve(cwd, argv[pathFlagIndex + 1]);

	if(existsSync(join(cwd, 'src'))) return join(cwd, 'src');
	if(existsSync(join(cwd, 'app'))) return join(cwd, 'app');
	return cwd;
}

function walk(dir, files = [])
{
	if(!existsSync(dir)) return files;

	for(const entry of readdirSync(dir))
	{
		if(SKIP_DIRS.has(entry)) continue;

		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if(stat.isDirectory())
			walk(fullPath, files);
		else if(FILE_EXTENSIONS.some(ext => entry.endsWith(ext)))
			files.push(fullPath);
	}

	return files;
}

function lineNumberAt(text, index)
{
	return text.slice(0, index).split('\n').length;
}

function checkMissingAccessibleName(text)
{
	const violations = [];

	for(const match of text.matchAll(/<img\b[^>]*>/g))
	{
		if(!/\balt\s*=/.test(match[0]))
		{
			violations.push({
				line: lineNumberAt(text, match.index),
				message: '<img> is missing an alt attribute',
			});
		}
	}

	for(const match of text.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/g))
	{
		const [, tag, attrs, body] = match;

		if(!/<svg\b/.test(body)) continue;
		if(/\baria-label(ledby)?\s*=/.test(attrs)) continue;

		const textContent = body.replace(/<[^>]*>/g, '').trim();
		if(textContent.length > 0) continue;

		violations.push({
			line: lineNumberAt(text, match.index),
			message: `<${tag}> wraps an icon with no visible text and no aria-label/aria-labelledby`,
		});
	}

	return violations;
}

function checkUnreachableInteractive(text)
{
	const violations = [];

	for(const match of text.matchAll(/<(div|span)\b([^>]*)>/g))
	{
		const [, tag, attrs] = match;

		if(!/\bonClick\s*=/.test(attrs)) continue;
		if(/\brole\s*=/.test(attrs) && /\btabIndex\b/.test(attrs)) continue;

		violations.push({
			line: lineNumberAt(text, match.index),
			message: `<${tag}> has onClick but is missing role and/or tabIndex — not reachable by keyboard`,
		});
	}

	return violations;
}

function checkHardcodedColors(text)
{
	const violations = [];

	for(const match of text.matchAll(ATTR_VALUE_REGEX))
	{
		const value = match.slice(1).find(group => group !== undefined) ?? '';
		const line = lineNumberAt(text, match.index);

		const hexMatch = value.match(HEX_COLOR_REGEX);
		if(hexMatch)
			violations.push({ line, message: `Hardcoded hex color '${hexMatch[0]}' bypasses design tokens` });

		if(RGB_COLOR_REGEX.test(value))
			violations.push({ line, message: 'Hardcoded rgb()/rgba() color bypasses design tokens' });

		const tailwindMatch = value.match(TAILWIND_COLOR_REGEX);
		if(tailwindMatch)
			violations.push({ line, message: `Raw Tailwind color utility '${tailwindMatch[0]}' bypasses design tokens` });
	}

	return violations;
}

const CHECKS = [
	{ name: 'Missing accessible name', run: checkMissingAccessibleName },
	{ name: 'Unreachable interactive element', run: checkUnreachableInteractive },
	{ name: 'Hardcoded color bypassing design tokens', run: checkHardcodedColors },
];

function main()
{
	const cwd = process.cwd();
	const scanRoot = resolveScanRoot(process.argv.slice(2), cwd);
	const files = walk(scanRoot);

	let totalViolations = 0;

	for(const check of CHECKS)
	{
		const checkViolations = [];

		for(const file of files)
		{
			const text = readFileSync(file, 'utf8');
			const relPath = relative(cwd, file);

			for(const violation of check.run(text))
				checkViolations.push({ file: relPath, ...violation });
		}

		console.log(`\n${check.name}`);

		if(checkViolations.length === 0)
			console.log('  none');
		else
			for(const v of checkViolations)
				console.log(`  ${v.file}:${v.line}  ${v.message}`);

		totalViolations += checkViolations.length;
	}

	console.log(`\n${totalViolations > 0 ? `${totalViolations} violation(s) found` : 'No violations found'}`);

	process.exit(totalViolations > 0 ? 1 : 0);
}

main();
