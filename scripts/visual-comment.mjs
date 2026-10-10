import { readFileSync, writeFileSync } from 'node:fs';

const [resultsPath, outPath] = process.argv.slice(2);
const runUrl = process.env.RUN_URL ?? '';
const MARKER = '<!-- visual-regression -->';

const rows = new Map();

const collect = (suite, mode) => {
	const nextMode = ['light', 'dark'].includes(suite.title) ? suite.title : mode;

	for(const spec of suite.specs ?? [])
	{
		const slug = spec.title.replace(' preview', '');
		const row = rows.get(slug) ?? {};

		const kinds = spec.tests.flatMap((t) => t.annotations).filter((a) => a.type === 'visual').map((a) => a.description);

		row[nextMode] = !spec.ok ? 'error' : kinds[0] ?? 'same';
		rows.set(slug, row);
	}

	for(const child of suite.suites ?? []) collect(child, nextMode);
};

const report = JSON.parse(readFileSync(resultsPath, 'utf8'));

for(const suite of report.suites) collect(suite, null);

const ICONS = { same: '✅', changed: '⚠️ changed', new: '🆕 new', error: '❌ error' };
const icon = (status) => ICONS[status] ?? '–';
const statuses = [...rows.values()].flatMap((row) => Object.values(row));
const count = (status) => statuses.filter((s) => s === status).length;
const changed = count('changed');
const added = count('new');
const errored = count('error');

const summary = [
	errored && `${errored} test${errored === 1 ? '' : 's'} errored`,
	changed && `${changed} screenshot${changed === 1 ? '' : 's'} changed`,
	added && `${added} without a baseline`,
].filter(Boolean).join(', ');

const lines = [
	MARKER,
	'### Visual regression',
	'',
	summary ? `**${summary}.**` : 'No visual changes detected.',
	'',
	'| Component | Light | Dark |',
	'|---|:-:|:-:|',
	...[...rows].map(([slug, row]) => `| \`${slug}\` | ${icon(row.light)} | ${icon(row.dark)} |`),
];

if(summary)
{
	lines.push(
		'',
		`Download the \`playwright-report\` artifact from the [workflow run](${runUrl}) to see expected, actual, and diff images.`,
		'Visual changes do not fail this check. To accept them, regenerate baselines with the Visual workflow (`update: true`) and commit them.',
	);
}

writeFileSync(outPath, lines.join('\n') + '\n');
