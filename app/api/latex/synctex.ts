import type { SyncPoint } from '@/src/blocks/LatexEditor/sync';
import { gunzipSync } from 'node:zlib';

const RECORD = /^([(gkx$h])(\d+),(\d+)(?:,\d+)?:(-?\d+),(-?\d+)(?::(-?\d+),(-?\d+),(-?\d+))?/;
const POINTS_PER_INCH = 72;
const TEX_POINTS_PER_INCH = 72.27;
const SCALED_POINT = 65536;

const field = (lines: string[], name: string) => lines.find((line) => line.startsWith(`${name}:`))?.slice(name.length + 1);

const round = (value: number) => Math.round(value * 10) / 10;

// SyncTeX writes one record per box, glue, kern and math node, each tagged with its source line.
// Every stop keeps the vertical band of the line box it sits in, so a click anywhere on that
// text line finds the closest stop sideways.
export const parseSynctex = (gz: Uint8Array): SyncPoint[] => {
	const lines = gunzipSync(gz).toString('utf8').split('\n');
	const start = lines.indexOf('Content:');
	if(start === -1) return [];

	const head = lines.slice(0, start);
	const tag = Number(head.find((line) => /^Input:\d+:.*main\.tex$/.test(line))?.split(':')[1]);
	const unit = Number(field(head, 'Unit') ?? 1);
	const magnification = Number(field(head, 'Magnification') ?? 1000);
	const scale = (unit * magnification / 1000 / SCALED_POINT) * (POINTS_PER_INCH / TEX_POINTS_PER_INCH);

	const bands: [number, number][] = [];
	const seen = new Set<string>();
	const points: SyncPoint[] = [];
	let page = 0;

	const add = (x: number, band: [number, number], line: number) => {
		const point: SyncPoint = [page, round(x * scale), round(band[0]), round(band[1]), line];
		const key = point.join();
		if(seen.has(key)) return;

		seen.add(key);
		points.push(point);
	};

	for(const row of lines.slice(start + 1))
	{
		if(row[0] === '{') page = Number(row.slice(1));
		else if(row[0] === ')') bands.pop();
		else
		{
			const match = RECORD.exec(row);
			if(!match) continue;

			const [, kind, input, line, x, y, , height, depth] = match;
			if(kind === '(') bands.push([(Number(y) - Number(height)) * scale, (Number(y) + Number(depth)) * scale]);

			const band = bands.at(-1);
			if(Number(input) === tag && band) add(Number(x), band, Number(line));
		}
	}

	return points;
};
