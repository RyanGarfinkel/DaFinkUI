import { compile, CompileError, type Engine } from './compile';
import { NextResponse } from 'next/server';
import { parseBody } from '../parseBody';
import { z } from 'zod';

export const runtime = 'nodejs';

const MAX_SOURCE_CHARS = 200_000;
const MAX_CONCURRENT = 2;

const schema = z.object({ source: z.string().max(MAX_SOURCE_CHARS) });

let running = 0;

export const POST = async (request: Request) => {
	const parsed = await parseBody(request, schema);
	if(!parsed.ok) return parsed.response;

	if(running >= MAX_CONCURRENT) return NextResponse.json({ error: 'The compiler is busy. Try again in a moment.' }, { status: 429 });

	const engine: Engine = process.env.LATEX_ENGINE === 'tectonic' ? 'tectonic' : 'pdflatex';
	running += 1;

	try
	{
		const { pdf, sync } = await compile(parsed.data.source, engine);
		return NextResponse.json({ pdf: Buffer.from(pdf).toString('base64'), sync }, { headers: { 'Cache-Control': 'no-store' } });
	}
	catch(reason)
	{
		if(reason instanceof CompileError) return NextResponse.json({ error: reason.message }, { status: reason.status });

		return NextResponse.json({ error: 'The document could not be compiled.' }, { status: 500 });
	}
	finally
	{
		running -= 1;
	}
};
