import type { GitStatus, ShellResult, TerminalFile, TerminalNode } from './types';

// Everything in this file talks to the docs-site API routes under app/api/terminal/. Point
// these at your own backend and the rest of the block keeps working unchanged, as long as
// each function keeps returning the same shape.

export const fetchTree = async (): Promise<TerminalNode[]> => {
	const res = await fetch('/api/terminal/files');
	if(!res.ok) throw new Error('Failed to fetch file tree');
	const { tree } = await res.json();
	return tree;
};

export const fetchFile = async (id: string): Promise<TerminalFile> => {
	const res = await fetch(`/api/terminal/files/${encodeURIComponent(id)}`);
	if(!res.ok) throw new Error('Failed to fetch file');
	const { file } = await res.json();
	return file;
};

export const fetchGitStatus = async (): Promise<GitStatus> => {
	const res = await fetch('/api/terminal/git');
	if(!res.ok) throw new Error('Failed to fetch git status');
	return res.json();
};

export const runCommand = async (command: string): Promise<ShellResult> => {
	const res = await fetch('/api/terminal/exec', {
		method:  'POST',
		headers: { 'Content-Type': 'application/json' },
		body:    JSON.stringify({ command }),
	});
	if(!res.ok) throw new Error('Failed to run command');
	return res.json();
};
