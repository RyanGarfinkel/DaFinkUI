import type { GitStatus, TerminalFile, TerminalNode } from '@/src/blocks/Terminal/types';

// Docs-site-only sample store backing the /blocks/terminal live preview. Never listed in the
// terminal block's registry `files`. In a real app this is your file storage: the tree route
// lists a project's structure and the file route loads one file's contents.

export const TREE: TerminalNode[] = [
	{
		id: 'src', name: 'src', type: 'folder', children: [
			{
				id: 'src/components', name: 'components', type: 'folder', children: [
					{ id: 'src/components/Counter.tsx', name: 'Counter.tsx', type: 'file' },
					{ id: 'src/components/Greeting.tsx', name: 'Greeting.tsx', type: 'file' },
				],
			},
			{
				id: 'src/lib', name: 'lib', type: 'folder', children: [
					{ id: 'src/lib/format.ts', name: 'format.ts', type: 'file' },
				],
			},
			{ id: 'src/App.tsx', name: 'App.tsx', type: 'file' },
		],
	},
	{ id: 'package.json', name: 'package.json', type: 'file' },
	{ id: 'README.md', name: 'README.md', type: 'file' },
];

export const FILES: Record<string, TerminalFile> = {
	'src/App.tsx': {
		id:       'src/App.tsx',
		path:     'src/App.tsx',
		language: 'tsx',
		content:  `import Counter from './components/Counter';
import Greeting from './components/Greeting';

export default function App()
{
	return (
		<main className='mx-auto max-w-md p-8'>
			<Greeting name='world' />
			<Counter initial={0} />
		</main>
	);
}
`,
	},
	'src/components/Counter.tsx': {
		id:       'src/components/Counter.tsx',
		path:     'src/components/Counter.tsx',
		language: 'tsx',
		content:  `'use client';

import { useState } from 'react';

interface CounterProps {
	initial?: number;
}

export default function Counter({ initial = 0 }: CounterProps)
{
	const [count, setCount] = useState(initial);

	return (
		<button onClick={() => setCount(count + 1)}>
			Clicked {count} times
		</button>
	);
}
`,
	},
	'src/components/Greeting.tsx': {
		id:       'src/components/Greeting.tsx',
		path:     'src/components/Greeting.tsx',
		language: 'tsx',
		content:  `interface GreetingProps {
	name: string;
}

export default function Greeting({ name }: GreetingProps)
{
	return <h1 className='text-2xl font-semibold'>Hello, {name}</h1>;
}
`,
	},
	'src/lib/format.ts': {
		id:       'src/lib/format.ts',
		path:     'src/lib/format.ts',
		language: 'ts',
		content:  `export const formatCurrency = (amount: number, currency = 'USD') =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const formatDate = (date: Date) =>
	new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
`,
	},
	'package.json': {
		id:       'package.json',
		path:     'package.json',
		language: 'json',
		content:  `{
	"name": "sample-app",
	"version": "0.1.0",
	"scripts": {
		"dev": "next dev",
		"build": "next build"
	},
	"dependencies": {
		"next": "^16.0.0",
		"react": "^19.0.0"
	}
}
`,
	},
	'README.md': {
		id:       'README.md',
		path:     'README.md',
		language: 'md',
		content:  `# Sample app

A small project loaded from an API.

## Getting started

Run \`npm run dev\` and open the app in your browser.
`,
	},
};

export const GIT_STATUS: GitStatus = {
	branch:  'main',
	changes: [
		{ path: 'src/components/Counter.tsx', status: 'M' },
		{ path: 'src/lib/format.ts', status: 'M' },
		{ path: 'src/components/Greeting.tsx', status: 'A' },
		{ path: 'README.md', status: 'U' },
	],
};

