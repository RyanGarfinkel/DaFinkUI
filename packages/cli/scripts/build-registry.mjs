import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const srcRoot     = resolve(__dirname, '../../../src/components');
const registryRoot = resolve(__dirname, '../registry');
const blocksSrcRoot = resolve(__dirname, '../../../src/blocks');
const blocksRoot    = resolve(__dirname, '../blocks');

function copyDirs(root, destRoot, label)
{
	let count = 0;

	const dirs = readdirSync(root).filter(name =>
		statSync(resolve(root, name)).isDirectory()
	);

	for(const name of dirs)
	{
		const dir = resolve(root, name);
		const files = readdirSync(dir).filter(f =>
			extname(f) === '.tsx' && !f.endsWith('.test.tsx')
		);

		for(const file of files)
		{
			const src  = resolve(dir, file);
			const dest = resolve(destRoot, name, file);

			mkdirSync(dirname(dest), { recursive: true });
			copyFileSync(src, dest);
			console.log(`  copied: ${name}/${file}`);
			count++;
		}
	}

	console.log(`\n${label} built: ${count} file(s) copied.`);
	return count;
}

copyDirs(srcRoot, registryRoot, 'Component registry');
copyDirs(blocksSrcRoot, blocksRoot, 'Block registry');

const skillSrc  = resolve(__dirname, '../../../dafink-ui.skill');
const skillDest = resolve(__dirname, '../assets/dafink-ui.skill');

if(existsSync(skillSrc))
{
	mkdirSync(dirname(skillDest), { recursive: true });
	copyFileSync(skillSrc, skillDest);
	console.log('Skill file bundled: dafink-ui.skill');
}
