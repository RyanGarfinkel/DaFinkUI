import { NextResponse } from 'next/server';
import { mockCommand } from '../mock';

// Docs-site-only infrastructure backing the /blocks/terminal live preview. Never listed in
// the terminal block's registry `files`. Answers with canned output and never executes
// anything. In a real app, run commands in a sandboxed container and stream the output back.

const LATENCY_MS = 250;

export const POST = async (request: Request) => {
	const { command } = await request.json();
	if(typeof command !== 'string' || !command.trim()) return NextResponse.json({ error: 'command required' }, { status: 400 });

	await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
	return NextResponse.json(mockCommand(command.trim()));
};
