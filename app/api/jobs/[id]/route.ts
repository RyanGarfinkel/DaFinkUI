import type { JobApplication } from '@/src/blocks/JobApplicationTracker/ApplicationCard';
import { NextResponse } from 'next/server';
import { delay, getStore } from '../data';

// Docs-site-only infrastructure backing the /blocks/job-application-tracker live preview. Never
// listed in the block's registry `files`. PATCH merges a partial update into one application (a
// `null` value clears that field) and DELETE removes it; in a real app these are writes to your
// jobs store. The delay stands in for network latency.

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = async (request: Request, context: RouteContext) => {
	const { id } = await context.params;
	const patch = await request.json().catch(() => null) as Record<string, unknown> | null;
	if(!patch || typeof patch !== 'object') return NextResponse.json({ error: 'invalid body' }, { status: 400 });

	await delay();
	const store = getStore();
	const index = store.findIndex((a) => a.id === id);
	if(index === -1) return NextResponse.json({ error: 'application not found' }, { status: 404 });

	const merged: Record<string, unknown> = { ...store[index] };
	Object.entries(patch).forEach(([key, value]) =>
	{
		if(key === 'id') return;
		if(value === null) delete merged[key];
		else merged[key] = value;
	});

	store[index] = merged as unknown as JobApplication;
	return NextResponse.json({ application: store[index] });
};

export const DELETE = async (_request: Request, context: RouteContext) => {
	const { id } = await context.params;

	await delay();
	const store = getStore();
	const index = store.findIndex((a) => a.id === id);
	if(index === -1) return NextResponse.json({ error: 'application not found' }, { status: 404 });

	store.splice(index, 1);
	return new NextResponse(null, { status: 204 });
};
