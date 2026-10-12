import type { ShellResult } from '@/src/blocks/Terminal/types';

// Docs-site-only mock backing the /blocks/terminal live preview. Never listed in the
// terminal block's registry `files`. Like the ai-chat demo, nothing real happens: each
// command is matched against a canned pattern and answered with plausible sample output.
// Nothing is executed and no file is read. In a real app, run commands in a sandboxed
// container and return their output.

interface MockReply {
	pattern: RegExp;
	output:  string | ((match: RegExpMatchArray) => string);
	error?:  boolean;
}

const HELP_TEXT = [
	'This terminal is a mock. Try:',
	'  npm run dev      Start a dev server',
	'  npm run build    Build for production',
	'  npm test         Run the test suite',
	'  npm install      Install dependencies',
	'  git status       Show changed files',
	'  git log          Show recent commits',
	'  ls               List files',
	'  node <file>      Run a script',
	'  clear            Clear the terminal',
].join('\n');

const REPLIES: MockReply[] = [
	{ pattern: /^help$/, output: HELP_TEXT },
	{ pattern: /^pwd$/, output: '/project' },
	{ pattern: /^whoami$/, output: 'dev' },
	{ pattern: /^date$/, output: 'Fri Oct 9 09:41:07 2026' },
	{ pattern: /^echo\s*(.*)$/, output: (match) => match[1] },
	{ pattern: /^ls(\s.*)?$/, output: 'src/  package.json  README.md' },
	{ pattern: /^cat\s+(.+)$/, output: (match) => `Open ${match[1]} in the editor to view its contents.` },
	{ pattern: /^node\s+(?:-v|--version)$/, output: 'v22.11.0' },
	{ pattern: /^node\s+(.+)$/, output: (match) => `Running ${match[1]}...\nHello, world\nProcess exited with code 0.` },
	{ pattern: /^npm\s+(?:i|install)\b.*$/, output: 'added 214 packages, and audited 215 packages in 4s\n\nfound 0 vulnerabilities' },
	{ pattern: /^npm\s+(?:run\s+)?dev$/, output: '> sample-app@0.1.0 dev\n> next dev\n\n  ▲ Next.js 16\n  - Local: http://localhost:3000\n\n ✓ Ready in 812ms' },
	{ pattern: /^npm\s+(?:run\s+)?build$/, output: '> sample-app@0.1.0 build\n> next build\n\n ✓ Compiled successfully\n ✓ Generated 4 static pages\n\nBuild completed in 6.4s' },
	{ pattern: /^npm\s+(?:run\s+)?start$/, output: '> sample-app@0.1.0 start\n> next start\n\n  - Local: http://localhost:3000\n ✓ Ready in 214ms' },
	{ pattern: /^npm\s+(?:t|test)$|^npm\s+run\s+test$/, output: ' ✓ src/components/Counter.test.tsx (3 tests)\n ✓ src/lib/format.test.ts (2 tests)\n\n Test Files  2 passed (2)\n      Tests  5 passed (5)' },
	{ pattern: /^npm\s+(?:run\s+)?lint$/, output: '> sample-app@0.1.0 lint\n> eslint .\n\nNo problems found.' },
	{ pattern: /^git\s+status$/, output: 'On branch main\nChanges:\n  modified: src/components/Counter.tsx\n  modified: src/lib/format.ts\n  added: src/components/Greeting.tsx\n  untracked: README.md' },
	{ pattern: /^git\s+branch$/, output: '* main' },
	{ pattern: /^git\s+log\b.*$/, output: 'a1b2c3d Add Greeting component\n9f8e7d6 Format currency and dates\n3c4d5e6 Initial commit' },
	{ pattern: /^git\s+add\b.*$/, output: '' },
	{ pattern: /^git\s+commit\b.*$/, output: '[main 7e8f9a0] Update sample app\n 4 files changed, 31 insertions(+), 6 deletions(-)' },
	{ pattern: /^git\s+push\b.*$/, output: 'Enumerating objects: 9, done.\nTo github.com:example/sample-app.git\n   a1b2c3d..7e8f9a0  main -> main' },
	{ pattern: /^git\s+pull\b.*$/, output: 'Already up to date.' },
];

export const mockCommand = (command: string): ShellResult => {
	for(const reply of REPLIES)
	{
		const match = command.match(reply.pattern);
		if(!match) continue;

		return { output: typeof reply.output === 'function' ? reply.output(match) : reply.output, error: reply.error };
	}

	const [name] = command.split(/\s+/);
	return { output: `${name}: command not found. Type "help" for a list of commands.`, error: true };
};
