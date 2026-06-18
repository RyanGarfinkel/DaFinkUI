import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const RULES_DIR = join(process.cwd(), 'rules');

export const listRules = () =>
	readdirSync(RULES_DIR)
		.filter(f => f.endsWith('.md'))
		.map(f => f.replace(/\.md$/, ''));

export const getRule = (name: string) =>
{
	const p = join(RULES_DIR, `${name}.md`);
	if(existsSync(p)) return readFileSync(p, 'utf-8');
	const available = listRules();
	throw new Error(`No rule found: ${name}. Available: ${available.join(', ')}`);
};
