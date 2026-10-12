'use client';

import { useEffect, useRef, useState } from 'react';
import { runCommand } from './terminalApi';
import type { ShellEntry } from './types';

export const useShell = () => {
	const [entries, setEntries] = useState<ShellEntry[]>([]);
	const [running, setRunning] = useState(false);
	const nextId = useRef(0);
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const clear = () => setEntries([]);

	const run = async (command: string) => {
		const id = nextId.current++;
		setRunning(true);
		try
		{
			const { output, error } = await runCommand(command);
			if(mountedRef.current) setEntries((prev) => [...prev, { id, command, output, error: Boolean(error) }]);
		}
		catch
		{
			if(mountedRef.current) setEntries((prev) => [...prev, { id, command, output: 'Could not reach the command service.', error: true }]);
		}
		finally
		{
			if(mountedRef.current) setRunning(false);
		}
	};

	return { entries, running, run, clear };
};
