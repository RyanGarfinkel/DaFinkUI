import type { SyncPoint } from './sync';

export interface Compiled {
	pdf:  Uint8Array;
	sync: SyncPoint[];
}

// POSTs the source to your compiler endpoint. The endpoint should answer 200 with JSON like
// { "pdf": "<base64>", "sync": [[page, x, top, bottom, line], ...] }, or a non-2xx status with
// { "error": "message" }. "sync" is optional: without it, double-clicking the PDF does nothing.
const COMPILE_URL = '/api/latex';

export const compileLatex = async (source: string): Promise<Compiled> => {
	const response = await fetch(COMPILE_URL, {
		method:  'POST',
		headers: { 'Content-Type': 'application/json' },
		body:    JSON.stringify({ source }),
	});

	if(!response.ok)
	{
		const { error } = await response.json().catch(() => ({ error: '' }));
		throw new Error(error || 'The compiler is unavailable.');
	}

	const { pdf, sync = [] } = await response.json();

	return { pdf: Uint8Array.from(atob(pdf), (char) => char.charCodeAt(0)), sync };
};
