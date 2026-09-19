'use client';

import ToolCallTrace, { type ToolCallEntry } from '@/src/blocks/AiChat/ToolCallTrace';
import Message from '@/src/components/Message/Message';

const SEARCH_LINKS = [
	{ title: 'Installation — DaFink UI Docs', url: 'https://ui.ryangarfinkel.dev/installation' },
	{ title: 'dafink-ui — npm',                url: 'https://www.npmjs.com/package/dafink-ui' },
	{ title: 'DaFink UI CLI source — GitHub',  url: 'https://github.com/RyanGarfinkel/DaFinkUI/tree/main/packages/cli' },
];

const TOOL_CALLS: ToolCallEntry[] = [
	{ id: 't1', kind: 'thought', title: 'Thinking',   detail: 'The user wants the install command — check the CLI docs for the exact syntax before answering.' },
	{ id: 't2', kind: 'search',  title: 'Web search', detail: '"dafink-ui cli install command"', links: SEARCH_LINKS },
	{ id: 't3', kind: 'tool',    title: 'Read file',  detail: 'packages/cli/src/commands/add.ts', result: 'Found the add command implementation' },
];

const REPLY_TEXT = 'Run npx dafink-ui add button in your project root; it copies the component source straight into your repo.';

export const ToolCallTraceDemo = () => (
	<div className='flex w-full max-w-md flex-col gap-1.5'>
		<ToolCallTrace toolCalls={TOOL_CALLS} />
		<Message variant='received' bubble={false}>{REPLY_TEXT}</Message>
	</div>
);
