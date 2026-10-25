import type { JobApplication } from './ApplicationCard';

// Every network call this block makes lives here. It talks to the docs-site routes under
// app/api/jobs/; point these at your own backend and the rest of the block keeps working as
// long as each function keeps returning the same shape.

export type ApplicationPatch = Partial<Omit<JobApplication, 'id'>>;

const json = { 'Content-Type': 'application/json' };

export const fetchApplications = async (): Promise<JobApplication[]> => {
	const res = await fetch('/api/jobs');
	if(!res.ok) throw new Error('Failed to fetch applications');
	const { applications } = await res.json();
	return applications;
};

export const createApplication = async (application: JobApplication): Promise<JobApplication> => {
	const res = await fetch('/api/jobs', { method: 'POST', headers: json, body: JSON.stringify(application) });
	if(!res.ok) throw new Error('Failed to create application');
	const { application: created } = await res.json();
	return created;
};

// JSON drops `undefined`, so a cleared field is sent as `null` to tell the server to remove it.
export const updateApplication = async (id: string, patch: ApplicationPatch): Promise<JobApplication> => {
	const body = Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, value === undefined ? null : value]));
	const res = await fetch(`/api/jobs/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify(body) });
	if(!res.ok) throw new Error('Failed to update application');
	const { application } = await res.json();
	return application;
};

export const deleteApplication = async (id: string): Promise<void> => {
	const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
	if(!res.ok && res.status !== 404) throw new Error('Failed to delete application');
};
