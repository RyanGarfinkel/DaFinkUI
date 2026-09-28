import type { CommandOption } from '../../components/CommandInput/CommandInput';
import type { SelectOption } from '../../components/Select/Select';

export const COMMANDS: CommandOption[] = [
	{ name: 'compact', description: 'Summarize this conversation to save space' },
	{ name: 'new',     description: 'Start a new chat' },
	{ name: 'thread',  description: 'Open or start a thread on the latest message' },
	{ name: 'retry',   description: 'Regenerate the latest reply' },
	{ name: 'edit',    description: 'Edit your latest message' },
	{ name: 'copy',    description: 'Copy the latest reply' },
	{ name: 'rename',  description: 'Rename this chat' },
	{ name: 'delete',  description: 'Delete this chat' },
	{ name: 'clear',   description: 'Clear all messages in this chat' },
];

// The settings modal's one sample-only preference (autoTitleEnabled, in AiChat.tsx, is the
// one that actually feeds back into handleSubmit).
export const MODEL_OPTIONS: SelectOption[] = [
	{ value: 'fast',     label: 'Fast' },
	{ value: 'standard', label: 'Standard' },
	{ value: 'advanced', label: 'Advanced' },
];
