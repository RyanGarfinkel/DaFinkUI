import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { REGISTRY } from './registry.js';
import { log } from '@clack/prompts';
import { resolve } from 'path';
import pc from 'picocolors';

interface ParsedExports
{
	defaultName: string | null;
	namedValues: string[];
	namedTypes: string[];
}

function parseExports(source: string): ParsedExports
{
	const defaultMatch =
		source.match(/^export default function\s+(\w+)/m) ??
		source.match(/^export default class\s+(\w+)/m) ??
		source.match(/^export default (\w+);/m);

	const namedValues = [
		...source.matchAll(/^export const (\w+)/gm),
		...source.matchAll(/^export function (\w+)/gm),
	].map(match => match[1]);

	const namedTypes = [
		...source.matchAll(/^export interface (\w+)/gm),
		...source.matchAll(/^export type (\w+)/gm),
	].map(match => match[1]);

	return { defaultName: defaultMatch ? defaultMatch[1] : null, namedValues, namedTypes };
}

const PRIMARY_COMPONENT_NAMES = new Set(REGISTRY.map(entry => entry.files[0].split('/')[0]));

function componentModulePath(componentsDir: string, name: string): string | null
{
	if(existsSync(resolve(componentsDir, `${name}.tsx`))) return `./${name}`;
	if(existsSync(resolve(componentsDir, name, `${name}.tsx`))) return `./${name}/${name}`;
	return null;
}

function scanComponent(componentsDir: string, modulePath: string): ParsedExports
{
	return parseExports(readFileSync(resolve(componentsDir, `${modulePath}.tsx`), 'utf8'));
}

function listComponentNames(componentsDir: string): string[]
{
	const names = new Set<string>();

	for(const entry of readdirSync(componentsDir))
	{
		if(statSync(resolve(componentsDir, entry)).isDirectory())
			names.add(entry);
		else if(entry.endsWith('.tsx') && PRIMARY_COMPONENT_NAMES.has(entry.slice(0, -4)))
			names.add(entry.slice(0, -4));
	}

	return [...names].sort();
}

function buildExportLines(componentsDir: string, folders: string[]): string[]
{
	const usedValueNames = new Set<string>();
	const usedTypeNames = new Set<string>();
	const lines: string[] = [];

	for(const folder of folders)
	{
		const modulePath = componentModulePath(componentsDir, folder);
		if(!modulePath) continue;

		const parsed = scanComponent(componentsDir, modulePath);
		const valueExports: string[] = [];

		if(parsed.defaultName)
		{
			if(usedValueNames.has(folder))
				log.warn(pc.yellow(`Barrel: skipping duplicate export "${folder}" from ${modulePath}`));
			else
			{
				usedValueNames.add(folder);
				valueExports.push(`default as ${folder}`);
			}
		}

		for(const name of parsed.namedValues)
		{
			if(usedValueNames.has(name))
			{
				log.warn(pc.yellow(`Barrel: skipping duplicate export "${name}" from ${modulePath}`));
				continue;
			}

			usedValueNames.add(name);
			valueExports.push(name);
		}

		if(valueExports.length > 0)
			lines.push(`export { ${valueExports.join(', ')} } from '${modulePath}';`);

		const typeExports: string[] = [];

		for(const name of parsed.namedTypes)
		{
			if(usedTypeNames.has(name))
			{
				log.warn(pc.yellow(`Barrel: skipping duplicate type export "${name}" from ${modulePath}`));
				continue;
			}

			usedTypeNames.add(name);
			typeExports.push(name);
		}

		if(typeExports.length > 0)
			lines.push(`export type { ${typeExports.join(', ')} } from '${modulePath}';`);
	}

	return lines;
}

export function generateBarrel(componentsDir: string): void
{
	if(!existsSync(componentsDir)) return;

	const folders = listComponentNames(componentsDir);
	const lines = buildExportLines(componentsDir, folders).sort((a, b) => b.length - a.length);
	const content = lines.length > 0 ? `${lines.join('\n')}\n` : '';

	writeFileSync(resolve(componentsDir, 'index.ts'), content, 'utf8');

	log.info(pc.dim(`index.ts regenerated with ${lines.length} export statement(s)`));
}
