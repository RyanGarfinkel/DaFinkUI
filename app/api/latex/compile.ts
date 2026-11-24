import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import type { SyncPoint } from '@/src/blocks/LatexEditor/sync';
import { execFile } from 'node:child_process';
import { parseSynctex } from './synctex';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Docs-site-only infrastructure backing the /blocks/latex-editor live preview. Never listed in
// the latex-editor block's registry `files`, so the CLI never ships this to consumers.

export type Engine = 'pdflatex' | 'tectonic';

export class CompileError extends Error
{
	public constructor(message: string, public readonly status: number)
	{
		super(message);
	}
}

const TIMEOUT_MS = 20_000;
const MAX_ERROR_LINES = 6;
const NOISE = /^(Here is how much|Type X to quit|Enter file name|or enter new name)/;

const ARGS: Record<Engine, string[]> = {
	pdflatex: ['-no-shell-escape', '-halt-on-error', '-interaction=nonstopmode', '-synctex=1', 'main.tex'],
	tectonic: ['-X', 'compile', '--untrusted', '--synctex', 'main.tex'],
};

export interface Compiled {
	pdf:  Uint8Array;
	sync: SyncPoint[];
}

const readSync = async (dir: string) => {
	try
	{
		return parseSynctex(await readFile(join(dir, 'main.synctex.gz')));
	}
	catch
	{
		return [];
	}
};

export const extractError = (log: string) => {
	const lines = log.split('\n');
	const start = lines.findIndex((line) => line.startsWith('!'));
	if(start === -1) return 'The document could not be compiled.';

	const tail = lines.slice(start, start + MAX_ERROR_LINES).map((line) => line.trim());
	const end = tail.findIndex((line, index) => index > 0 && NOISE.test(line));

	return (end === -1 ? tail : tail.slice(0, end)).filter(Boolean).join('\n');
};

const run = (engine: Engine, dir: string) => new Promise<void>((resolve, reject) => {
	const env: NodeJS.ProcessEnv = { NODE_ENV: process.env.NODE_ENV, PATH: process.env.PATH, HOME: dir, openin_any: 'p', openout_any: 'p' };

	execFile(engine, ARGS[engine], { cwd: dir, env, timeout: TIMEOUT_MS }, (error) => {
		if(!error) return resolve();

		reject(error);
	});
});

export const compile = async (source: string, engine: Engine): Promise<Compiled> => {
	const dir = await mkdtemp(join(tmpdir(), 'latex-'));

	try
	{
		await writeFile(join(dir, 'main.tex'), source);

		try
		{
			await run(engine, dir);
		}
		catch(reason)
		{
			const { code, killed } = reason as NodeJS.ErrnoException & { killed?: boolean };
			if(code === 'ENOENT') throw new CompileError(`The ${engine} engine is not installed on this server.`, 501);
			if(killed) throw new CompileError('Compiling took too long and was stopped.', 408);

			const log = await readFile(join(dir, 'main.log'), 'utf8').catch(() => '');
			throw new CompileError(extractError(log), 422);
		}

		return { pdf: new Uint8Array(await readFile(join(dir, 'main.pdf'))), sync: await readSync(dir) };
	}
	finally
	{
		await rm(dir, { recursive: true, force: true });
	}
};
