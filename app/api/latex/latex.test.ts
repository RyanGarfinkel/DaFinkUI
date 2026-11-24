import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractError } from './compile';
import { POST } from './route';

const { execFile } = vi.hoisted(() => ({ execFile: vi.fn() }));

vi.mock('node:child_process', () => ({ execFile, default: { execFile } }));

const post = (body: unknown) => POST(new Request('http://localhost/api/latex', { method: 'POST', body: JSON.stringify(body) }));

describe('extractError', () =>
{
	it('returns the first error and the lines after it', () =>
	{
		const log = 'This is pdfTeX\n! Undefined control sequence.\nl.4 \\foo\n\nmore';
		expect(extractError(log)).toBe('! Undefined control sequence.\nl.4 \\foo\nmore');
	});

	it('drops the engine chatter that follows the error', () =>
	{
		const log = '! Undefined control sequence.\nl.1 \\foo\nHere is how much of TeX\'s memory you used:\n417 strings';
		expect(extractError(log)).toBe('! Undefined control sequence.\nl.1 \\foo');
	});

	it('falls back when the log has no error', () =>
	{
		expect(extractError('all fine')).toBe('The document could not be compiled.');
	});
});

describe('POST /api/latex', () =>
{
	beforeEach(() =>
	{
		execFile.mockReset();
	});

	it('rejects a body without source', async () =>
	{
		expect((await post({})).status).toBe(400);
	});

	it('returns the compiled pdf', async () =>
	{
		const { writeFileSync } = await import('node:fs');
		const { join } = await import('node:path');
		execFile.mockImplementation((_cmd: string, _args: string[], options: { cwd: string }, done: (error: Error | null) => void) =>
		{
			writeFileSync(join(options.cwd, 'main.pdf'), '%PDF-1.4');
			done(null);
		});

		const response = await post({ source: '\\documentclass{article}' });

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(Buffer.from(body.pdf, 'base64').toString()).toBe('%PDF-1.4');
		expect(body.sync).toEqual([]);
		expect(execFile.mock.calls[0][1]).toContain('-no-shell-escape');
		expect(execFile.mock.calls[0][1]).toContain('-synctex=1');
	});

	it('returns the source positions the engine wrote', async () =>
	{
		const { writeFileSync } = await import('node:fs');
		const { gzipSync } = await import('node:zlib');
		const { join } = await import('node:path');
		const map = ['Input:1:/tmp/./main.tex', 'Magnification:1000', 'Unit:1', 'Content:', '{1', '(1,7:65536,131072:6553600,655360,0', 'g1,7:327680,131072', ')'].join('\n');
		execFile.mockImplementation((_cmd: string, _args: string[], options: { cwd: string }, done: (error: Error | null) => void) =>
		{
			writeFileSync(join(options.cwd, 'main.pdf'), '%PDF-1.4');
			writeFileSync(join(options.cwd, 'main.synctex.gz'), gzipSync(map));
			done(null);
		});

		const { sync } = await (await post({ source: 'x' })).json();

		expect(sync.length).toBeGreaterThan(0);
		expect(sync.every((point: number[]) => point[0] === 1 && point[4] === 7)).toBe(true);
	});

	it('reports the TeX error when compiling fails', async () =>
	{
		const { writeFileSync } = await import('node:fs');
		const { join } = await import('node:path');
		execFile.mockImplementation((_cmd: string, _args: string[], options: { cwd: string }, done: (error: Error) => void) =>
		{
			writeFileSync(join(options.cwd, 'main.log'), '! Missing $ inserted.\nl.3 x^2');
			done(new Error('exit 1'));
		});

		const response = await post({ source: 'x^2' });

		expect(response.status).toBe(422);
		expect((await response.json()).error).toContain('Missing $ inserted.');
	});

	it('answers 501 when the engine is not installed', async () =>
	{
		execFile.mockImplementation((_cmd: string, _args: string[], _options: unknown, done: (error: Error) => void) =>
			done(Object.assign(new Error('spawn pdflatex ENOENT'), { code: 'ENOENT' })));

		const response = await post({ source: 'x' });

		expect(response.status).toBe(501);
		expect((await response.json()).error).toContain('not installed');
	});
});
