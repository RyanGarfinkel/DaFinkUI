import path from 'path';
import fs from 'fs';

const COMPONENTS_DIR = path.resolve(__dirname, '../../src/components');

export const listComponents = () => {
	return fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
		.filter(d => d.isDirectory())
		.map(d => d.name);
};

export const getComponentSpec = (name: string) => {
	const specPath = path.join(COMPONENTS_DIR, name, 'spec.md');
	if(!fs.existsSync(specPath))
		throw new Error(`No spec found for component: ${name}`);
	return fs.readFileSync(specPath, 'utf-8');
};
