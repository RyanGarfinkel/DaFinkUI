import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const COMPONENTS_DIR = join(process.cwd(), 'src/components');

export const listComponents = () =>
	readdirSync(COMPONENTS_DIR, { withFileTypes: true })
		.filter(d => d.isDirectory())
		.map(d => d.name);

export const getComponentSpec = (name: string) =>
{
	const specPath = join(COMPONENTS_DIR, name, 'spec.md');
	if(!existsSync(specPath))
		throw new Error(`No spec found for component: ${name}`);
	return readFileSync(specPath, 'utf-8');
};
