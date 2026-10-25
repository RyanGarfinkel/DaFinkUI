import type { JobApplication } from '@/src/blocks/JobApplicationTracker/ApplicationCard';
import { NextResponse } from 'next/server';
import { delay, getStore } from './data';

// Docs-site-only infrastructure backing the /blocks/job-application-tracker live preview. Never
// listed in the block's registry `files`. GET lists the signed-in user's applications and POST
// creates one; in a real app these are queries against your jobs store. The delay stands in for
// network latency.

const LIST_LATENCY_MS = 900;

export const GET = async () => {
	await new Promise((resolve) => setTimeout(resolve, LIST_LATENCY_MS));
	return NextResponse.json({ applications: getStore() });
};

export const POST = async (request: Request) => {
	const body = await request.json().catch(() => null) as Partial<JobApplication> | null;
	if(!body || typeof body.id !== 'string' || typeof body.role !== 'string' || typeof body.company !== 'string') return NextResponse.json({ error: 'id, role and company are required' }, { status: 400 });

	await delay();
	const store = getStore();
	if(store.some((a) => a.id === body.id)) return NextResponse.json({ error: 'application already exists' }, { status: 409 });

	const application = body as JobApplication;
	store.push(application);
	return NextResponse.json({ application }, { status: 201 });
};
