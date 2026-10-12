import { NextResponse } from 'next/server';
import { GIT_STATUS } from '../data';

// Docs-site-only infrastructure backing the /blocks/terminal live preview. Never listed in
// the terminal block's registry `files`. Returns the working tree's branch and changed
// files; in a real app this shells out to git or calls your host's API.

const LATENCY_MS = 300;

export const GET = async () => {
	await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
	return NextResponse.json(GIT_STATUS);
};
