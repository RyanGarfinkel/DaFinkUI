import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const srcRoot     = resolve(__dirname, '../../../src/components');
const registryRoot = resolve(__dirname, '../registry');

let copied = 0;

const componentDirs = readdirSync(srcRoot).filter(name =>
	statSync(resolve(srcRoot, name)).isDirectory()
);

for(const componentName of componentDirs)
{
	const componentDir = resolve(srcRoot, componentName);
	const files = readdirSync(componentDir).filter(f =>
		extname(f) === '.tsx' && !f.endsWith('.test.tsx')
	);

	for(const file of files)
	{
		const src  = resolve(componentDir, file);
		const dest = resolve(registryRoot, componentName, file);

		mkdirSync(dirname(dest), { recursive: true });
		copyFileSync(src, dest);
		console.log(`  copied: ${componentName}/${file}`);
		copied++;
	}
}

console.log(`\nRegistry built: ${copied} file(s) copied.`);

const skillSrc  = resolve(__dirname, '../../../dafink-ui.skill');
const skillDest = resolve(__dirname, '../assets/dafink-ui.skill');

if(existsSync(skillSrc))
{
	mkdirSync(dirname(skillDest), { recursive: true });
	copyFileSync(skillSrc, skillDest);
	console.log('Skill file bundled: dafink-ui.skill');
}
