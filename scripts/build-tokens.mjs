import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const readJson = (relPath) =>
{
	return JSON.parse(readFileSync(join(ROOT, relPath), 'utf8'));
}

const camelToKebab = (str) =>
{
	return str.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
}

const tokenPathToCssVar = (segments) =>
{
	const processed = segments.map(camelToKebab);

	if(processed[0] === 'color')
	{
		const rest = processed.slice(1);
		const filtered = rest[rest.length - 1] === 'default' ? rest.slice(0, -1) : rest;
		return `--color-${filtered.join('-')}`;
	}

	if(processed[0] === 'motion')
	{
		const rest = processed.slice(1);
		const filtered = rest[rest.length - 1] === 'default' ? rest.slice(0, -1) : rest;
		return `--${filtered.join('-')}`;
	}

	return `--${processed.join('-')}`;
}

const flattenTokens = (obj, prefix = []) =>
{
	const result = [];

	for(const [key, val] of Object.entries(obj))
	{
		if(key === '$meta') continue;

		if(val && typeof val === 'object' && 'value' in val && 'type' in val)
		{
			result.push({ path: [...prefix, key], value: val.value });
		}
		else if(val && typeof val === 'object')
		{
			result.push(...flattenTokens(val, [...prefix, key]));
		}
	}

	return result;
}

const buildCssVarMap = (tokens) =>
{
	const map = {};
	for(const { path, value } of tokens)
	{
		map[tokenPathToCssVar(path)] = value;
	}
	return map;
}

const COLOR_GROUP_ORDER = ['brand', 'danger', 'success', 'warning', 'surface', 'text', 'input'];

const CSS_COMMENTS = {
	brand:   '/* Brand (primary action) */',
	danger:  '/* Danger (destructive action) */',
	success: '/* Success */',
	warning: '/* Warning */',
	surface: '/* Surface (secondary/ghost backgrounds + borders) */',
	text:    '/* Text */',
	input:   '/* Input */',
};

const buildThemeBlock = (lightTokens, motionTokens) =>
{
	const motionVars = buildCssVarMap(motionTokens);
	const colorVars  = buildCssVarMap(lightTokens);

	const motionLines = Object.entries(motionVars)
		.map(([k, v]) => `\t${(k + ':').padEnd(19)} ${v};`)
		.join('\n');

	const colorLines = COLOR_GROUP_ORDER.map(group =>
	{
		const entries = Object.entries(colorVars).filter(([k]) =>
		{
			const rest = k.slice('--color-'.length);
			if(group === 'brand')   return rest === 'brand' || rest.startsWith('brand-');
			if(group === 'danger')  return rest === 'danger' || rest.startsWith('danger-');
			if(group === 'success') return rest === 'success' || rest.startsWith('success-');
			if(group === 'warning') return rest === 'warning' || rest.startsWith('warning-');
			if(group === 'surface') return rest === 'surface' || rest.startsWith('surface-');
			if(group === 'text')    return rest === 'text' || rest.startsWith('text-');
			if(group === 'input')   return rest === 'input' || rest.startsWith('input-');
			return false;
		});

		if(entries.length === 0) return '';

		const maxLen = Math.max(...entries.map(([k]) => k.length));
		const lines  = entries.map(([k, v]) => `\t${(k + ':').padEnd(maxLen + 1)} ${v};`).join('\n');
		return `\t${CSS_COMMENTS[group]}\n${lines}`;
	}).filter(Boolean).join('\n\n');

	return `@theme {\n\t/* Motion */\n${motionLines}\n\n${colorLines}\n}`;
}

const buildDarkBlock = (darkTokens) =>
{
	const vars    = buildCssVarMap(darkTokens);
	const maxLen  = Math.max(...Object.keys(vars).map(k => k.length));
	const lines   = Object.entries(vars).map(([k, v]) => `\t${(k + ':').padEnd(maxLen + 1)} ${v};`).join('\n');
	return `.dark {\n${lines}\n}`;
}

const buildThemeTs = (name, varName, lightTokens, darkTokens, meta) =>
{
	const lightVars = buildCssVarMap(lightTokens);
	const darkVars  = buildCssVarMap(darkTokens);

	const lightMaxLen = Math.max(...Object.keys(lightVars).map(k => k.length));
	const darkMaxLen  = Math.max(...Object.keys(darkVars).map(k => k.length));

	const lightLines = Object.entries(lightVars)
		.map(([k, v]) => `\t\t'${k}':${' '.repeat(lightMaxLen - k.length + 1)} '${v}',`)
		.join('\n');

	const darkLines = Object.entries(darkVars)
		.map(([k, v]) => `\t\t'${k}':${' '.repeat(darkMaxLen - k.length + 1)} '${v}',`)
		.join('\n');

	const label  = meta?.label  ?? name.charAt(0).toUpperCase() + name.slice(1);
	const accent = meta?.accent ?? '#000000';

	return `// AUTO-GENERATED, edit tokens/${name}.{light,dark}.json then run \`npm run tokens\`
import type { Theme } from './types';

export const ${varName}: Theme =
{
\tname:   '${name}',
\tlabel:  '${label}',
\taccent: '${accent}',

\tlight:
\t{
${lightLines}
\t},

\tdark:
\t{
${darkLines}
\t},
};
`;
}

const buildColorsTs = (lightTokens, darkTokens) =>
{
	const light = lightTokens.filter(t => t.path[0] === 'color');
	const dark  = darkTokens.filter(t => t.path[0] === 'color');

	const groups = {};
	for(const { path, value } of light)
	{
		const group = path[1];
		const key   = path.slice(2).join('.');
		if(!groups[group]) groups[group] = { light: {}, dark: {} };
		groups[group].light[key] = value;
	}
	for(const { path, value } of dark)
	{
		const group = path[1];
		const key   = path.slice(2).join('.');
		if(!groups[group]) groups[group] = { light: {}, dark: {} };
		groups[group].dark[key] = value;
	}

	const groupBlocks = COLOR_GROUP_ORDER.map(group =>
	{
		const g = groups[group];
		if(!g) return '';

		const lightEntries = Object.entries(g.light);
		const darkEntries  = Object.entries(g.dark);

		const allKeys  = lightEntries.map(([k]) => k);
		const maxLen   = Math.max(...allKeys.map(k => k.length), ...darkEntries.map(([k]) => k.length));

		const lightLines = lightEntries
			.map(([k, v]) => `\t\t${(k + ':').padEnd(maxLen + 1)} '${v}',`)
			.join('\n');

		const darkLines = darkEntries
			.map(([k, v]) => `\t\t\t${(k + ':').padEnd(maxLen + 1)} '${v}',`)
			.join('\n');

		return `\t${group}:\n\t{\n${lightLines}\n\t\tdark:\n\t\t{\n${darkLines}\n\t\t},\n\t},`;
	}).filter(Boolean);

	return `// AUTO-GENERATED, edit tokens/zinc.{light,dark}.json then run \`npm run tokens\`
export const colors =
{
${groupBlocks.join('\n')}
} as const;
`;
}

const updateGlobalsCss = (themeBlock, darkBlock) =>
{
	const cssPath = join(ROOT, 'app/globals.css');
	let   css     = readFileSync(cssPath, 'utf8');

	css = css.replace(/@theme\s*\{[\s\S]*?\}/, themeBlock);
	css = css.replace(/\.dark\s*\{[\s\S]*?\}/, darkBlock);

	writeFileSync(cssPath, css, 'utf8');
}

const THEMES = [
	{ name: 'zinc',   varName: 'defaultTheme' },
	{ name: 'ocean',  varName: 'oceanTheme'   },
	{ name: 'ember',  varName: 'emberTheme'   },
	{ name: 'forest', varName: 'forestTheme'  },
	{ name: 'noir',   varName: 'noirTheme'    },
	{ name: 'plum',   varName: 'plumTheme'    },
];

const tsName = name => name === 'zinc' ? 'default' : name;

for(const { name, varName } of THEMES)
{
	const lightJson = readJson(`tokens/${name}.light.json`);
	const darkJson  = readJson(`tokens/${name}.dark.json`);
	const meta      = lightJson.$meta ?? null;

	const lightTokens = flattenTokens(lightJson);
	const darkTokens  = flattenTokens(darkJson);

	const outName = tsName(name);
	const ts      = buildThemeTs(outName, varName, lightTokens, darkTokens, meta);

	writeFileSync(join(ROOT, `src/themes/${outName}.ts`), ts, 'utf8');
	console.log(`wrote src/themes/${outName}.ts`);
}

const zincLight  = flattenTokens(readJson('tokens/zinc.light.json'));
const zincDark   = flattenTokens(readJson('tokens/zinc.dark.json'));
const motionData = flattenTokens(readJson('tokens/motion.json'));

const themeBlock = buildThemeBlock(zincLight, motionData);
const darkBlock  = buildDarkBlock(zincDark);

updateGlobalsCss(themeBlock, darkBlock);
console.log('updated app/globals.css');

const colorsSrc = buildColorsTs(zincLight, zincDark);
writeFileSync(join(ROOT, 'src/tokens/colors.ts'), colorsSrc, 'utf8');
console.log('wrote src/tokens/colors.ts');
