'use client';

import { runCommand } from './terminalApi';
import type { ShellEntry } from './types';
import { useRef, useState } from 'react';

export const useShell = () => {
	const [entries, setEntries] = useState<ShellEntry[]>([]);
	const [running, setRunning] = useState(false);
	const nextId = useRef(0);

	const clear = () => setEntries([]);

	const run = async (command: string) => {
		const id = nextId.current++;
		setRunning(true);
		try
		{
			const { output, error } = await runCommand(command);
			setEntries((prev) => [...prev, { id, command, output, error: Boolean(error) }]);
		}
		catch
		{
			setEntries((prev) => [...prev, { id, command, output: 'Could not reach the command service.', error: true }]);
		}
		finally
		{
			setRunning(false);
		}
	};

	return { entries, running, run, clear };
};
