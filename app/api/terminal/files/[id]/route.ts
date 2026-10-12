import { NextResponse } from 'next/server';
import { FILES } from '../../data';

// Docs-site-only infrastructure backing the /blocks/terminal live preview. Never listed in
// the terminal block's registry `files`. Loads one file's contents on demand; the id is the
// URL-encoded file path. The delay stands in for network latency.

const LATENCY_MS = 400;

export const GET = async (_request: Request, context: { params: Promise<{ id: string }> }) => {
	const { id } = await context.params;
	const file = FILES[decodeURIComponent(id)];
	if(!file) return NextResponse.json({ error: 'file not found' }, { status: 404 });

	await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
	return NextResponse.json({ file });
};
