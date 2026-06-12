import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const PATTERNS_DIR = join(process.cwd(), 'src/patterns');

export const listPatterns = () =>
	readdirSync(PATTERNS_DIR)
		.filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
		.map(f => f.replace(/\.mdx?$/, ''));

export const getPattern = (name: string) =>
{
	for(const ext of ['.mdx', '.md'])
	{
		const p = join(PATTERNS_DIR, `${name}${ext}`);
		if(existsSync(p)) return readFileSync(p, 'utf-8');
	}
	throw new Error(`No pattern found: ${name}`);
};
