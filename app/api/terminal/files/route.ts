import { NextResponse } from 'next/server';
import { TREE } from '../data';

// Docs-site-only infrastructure backing the /blocks/terminal live preview. Never listed in
// the terminal block's registry `files`. Lists the project's file tree; in a real app this
// reads your file storage. The delay stands in for network latency.

const LATENCY_MS = 500;

export const GET = async () => {
	await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
	return NextResponse.json({ tree: TREE });
};
