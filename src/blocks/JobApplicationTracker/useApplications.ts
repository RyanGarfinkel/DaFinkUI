import { type ApplicationPatch, createApplication, deleteApplication, fetchApplications, updateApplication } from './jobsApi';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { JobApplication } from './ApplicationCard';

export type LoadStatus = 'loading' | 'ready' | 'error';

const PATCH_DEBOUNCE_MS = 400;

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Owns the applications list and keeps it in sync with the API. Every mutation updates local
// state first (so the UI never waits) and then syncs in the background. `synced` holds each
// application as the server last confirmed it: a failed write rolls the UI back to that, and
// every PATCH is just the diff against it. Calls for the same id run one at a time through
// `queues`, so an edit made while a create is still in flight can't reach the server first.
export const useApplications = () => {
	const [applications, setApplications] = useState<JobApplication[]>([]);
	const [status, setStatus]             = useState<LoadStatus>('loading');
	const [attempt, setAttempt]           = useState(0);
	const [syncError, setSyncError]       = useState<string | null>(null);

	const latest  = useRef(applications);
	// A ref, not state: the modal calls save and then close in the same tick, and close must
	// already see the draft as saved or it would discard it.
	const draftId = useRef<string | null>(null);
	const synced  = useRef(new Map<string, JobApplication>());
	const pending = useRef(new Map<string, ApplicationPatch>());
	const timers  = useRef(new Map<string, ReturnType<typeof setTimeout>>());
	const queues  = useRef(new Map<string, Promise<void>>());

	useEffect(() => {
		latest.current = applications;
	});

	useEffect(() => {
		let cancelled = false;

		fetchApplications()
			.then((loaded) => {
				if(cancelled) return;
				synced.current = new Map(loaded.map((a) => [a.id, a]));
				setApplications(loaded);
				setStatus('ready');
			})
			.catch(() => {
				if(!cancelled) setStatus('error');
			});

		return () => {
			cancelled = true;
		};
	}, [attempt]);

	const retry = () => {
		setStatus('loading');
		setAttempt((n) => n + 1);
	};

	const enqueue = useCallback((id: string, task: () => Promise<void>) => {
		const next = (queues.current.get(id) ?? Promise.resolve()).then(task).catch(() => undefined);
		queues.current.set(id, next);
	}, []);

	const revertFields = useCallback((id: string, keys: string[]) => {
		const base = synced.current.get(id) as unknown as Record<string, unknown> | undefined;
		if(!base) return;
		setApplications((prev) => prev.map((a) => a.id === id ? { ...a, ...Object.fromEntries(keys.map((key) => [key, base[key]])) } : a));
	}, []);

	const syncPatch = useCallback((id: string) => {
		const timer = timers.current.get(id);
		if(timer) clearTimeout(timer);
		timers.current.delete(id);

		enqueue(id, async () => {
			const patch = pending.current.get(id);
			pending.current.delete(id);
			const base = synced.current.get(id);
			if(!patch || !base) return;

			const changed = Object.fromEntries(Object.entries(patch).filter(([key, value]) => !sameValue((base as unknown as Record<string, unknown>)[key], value))) as ApplicationPatch;
			if(Object.keys(changed).length === 0) return;

			try
			{
				synced.current.set(id, await updateApplication(id, changed));
			}
			catch
			{
				revertFields(id, Object.keys(changed));
				setSyncError('Some changes could not be saved and were reverted.');
			}
		});
	}, [enqueue, revertFields]);

	useEffect(() => {
		const pendingIds = pending.current;
		const timerIds   = timers.current;

		return () => {
			pendingIds.forEach((_patch, id) => syncPatch(id));
			timerIds.clear();
		};
	}, [syncPatch]);

	const update = (id: string, patch: ApplicationPatch, immediate = false) => {
		setApplications((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
		pending.current.set(id, { ...pending.current.get(id), ...patch });

		const timer = timers.current.get(id);
		if(timer) clearTimeout(timer);
		if(immediate) syncPatch(id);
		else timers.current.set(id, setTimeout(() => syncPatch(id), PATCH_DEBOUNCE_MS));
	};

	const addDraft = () => {
		const id = `job-${crypto.randomUUID()}`;
		setApplications((prev) => [...prev, { id, role: '', company: '', status: 'wishlist', workType: 'Remote' }]);
		draftId.current = id;
		return id;
	};

	const discardDraft = () => {
		const id = draftId.current;
		if(!id) return;
		draftId.current = null;
		setApplications((prev) => prev.filter((a) => a.id !== id));
	};

	const create = (application: JobApplication) => {
		setApplications((prev) => prev.map((a) => a.id === application.id ? application : a));
		draftId.current = null;

		enqueue(application.id, async () => {
			try
			{
				synced.current.set(application.id, await createApplication(application));
			}
			catch
			{
				setApplications((prev) => prev.filter((a) => a.id !== application.id));
				setSyncError('The new application could not be saved.');
			}
		});
	};

	const save = (updated: JobApplication) => {
		if(updated.id === draftId.current) return create(updated);

		const base = synced.current.get(updated.id);
		if(!base) return;

		const keys  = new Set([...Object.keys(base), ...Object.keys(updated)]);
		keys.delete('id');
		const patch = Object.fromEntries([...keys].map((key) => [key, (updated as unknown as Record<string, unknown>)[key]])) as ApplicationPatch;
		update(updated.id, patch, true);
	};

	const remove = (id: string) => {
		if(id === draftId.current) return discardDraft();

		const index   = latest.current.findIndex((a) => a.id === id);
		const removed = latest.current[index];
		if(!removed) return;

		const timer = timers.current.get(id);
		if(timer) clearTimeout(timer);
		timers.current.delete(id);
		pending.current.delete(id);
		setApplications((prev) => prev.filter((a) => a.id !== id));

		enqueue(id, async () => {
			try
			{
				await deleteApplication(id);
				synced.current.delete(id);
			}
			catch
			{
				setApplications((prev) => [...prev.slice(0, index), removed, ...prev.slice(index)]);
				setSyncError('The application could not be deleted and was restored.');
			}
		});
	};

	return {
		applications,
		status,
		retry,
		syncError,
		dismissSyncError: () => setSyncError(null),
		addDraft,
		discardDraft,
		save,
		update,
		remove,
		setLocalApplications: setApplications,
	};
};
