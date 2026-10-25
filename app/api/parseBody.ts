import { NextResponse } from 'next/server';
import { z } from 'zod';

// Shared by the docs-site API routes: parses the JSON body once, validates it against the
// route's schema, and hands back either the typed data or a ready-made 400 response.

type ParsedBody<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

export const parseBody = async <S extends z.ZodType>(request: Request, schema: S): Promise<ParsedBody<z.infer<S>>> => {
	let json: unknown;

	try
	{
		json = await request.json();
	}
	catch
	{
		return { ok: false, response: NextResponse.json({ error: 'request body must be valid JSON' }, { status: 400 }) };
	}

	const result = schema.safeParse(json);
	if(!result.success)
	{
		const issues = result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
		return { ok: false, response: NextResponse.json({ error: 'invalid request body', issues }, { status: 400 }) };
	}

	return { ok: true, data: result.data };
};
