import { parseBody } from '../../parseBody';
import { NextResponse } from 'next/server';
import { mockCommand } from '../mock';
import { z } from 'zod';

// Docs-site-only infrastructure backing the /blocks/terminal live preview. Never listed in
// the terminal block's registry `files`. Answers with canned output and never executes
// anything. In a real app, run commands in a sandboxed container and stream the output back.

const LATENCY_MS = 250;

const bodySchema = z.object({
	command: z.string().trim().min(1, 'command required').max(1000),
});

export const POST = async (request: Request) => {
	const parsed = await parseBody(request, bodySchema);
	if(!parsed.ok) return parsed.response;

	await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
	return NextResponse.json(mockCommand(parsed.data.command));
};
