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

export const EFFORT_OPTIONS: SelectOption[] = [
	{ value: 'low',    label: 'Low' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'high',   label: 'High' },
];

export interface Connector {
	id:          string;
	label:       string;
	description: string;
}

export const CONNECTORS: Connector[] = [
	{ id: 'drive',  label: 'Google Drive', description: 'Search and read your documents.' },
	{ id: 'github', label: 'GitHub',       description: 'Look up repositories, issues, and pull requests.' },
	{ id: 'notion', label: 'Notion',       description: 'Find pages and databases in your workspace.' },
	{ id: 'slack',  label: 'Slack',        description: 'Search channels and threads.' },
];
