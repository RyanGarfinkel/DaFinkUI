import type { ToolCallEntry } from '../../components/ToolCallTrace/ToolCallTrace';
import type { QuestionStep } from '../../components/Questionnaire/Questionnaire';

export interface MessageAttachment {
	name: string;
}

export interface ChatTextMessage {
	id:                 number;
	kind:               'message';
	sender:             'user' | 'ai';
	text:               string;
	animate?:           boolean;
	attachments?:       MessageAttachment[];
	toolCalls?:         ToolCallEntry[];
	questionnaire?:     QuestionStep;
	questionnaireAnswer?: string;
	/** Every prior value of `text` for this message id, oldest first, including the current one. Populated on the first edit/regenerate — absent otherwise. */
	versions?:          string[];
	/** Index into `versions` currently displayed. Only meaningful when `versions` is set. */
	versionIndex?:      number;
}

interface ChatCheckpoint {
	id:    number;
	kind:  'checkpoint';
	label: string;
}

export type ChatMessage = ChatTextMessage | ChatCheckpoint;

export interface ThreadRef {
	id:            string;
	rootMessageId: number;
	snippet:       string;
	createdAt:     string;
	replyCount:    number;
}

export interface ChatEntry {
	id:         string;
	title:      string;
	messages:   ChatMessage[];
	threadRefs: ThreadRef[];
}

export interface AiChatHistoryMessage {
	role: 'user' | 'assistant';
	text: string;
}

export interface AiChatReply {
	text:       string;
	toolCalls?: ToolCallEntry[];
}

export interface SearchCorpusEntry {
	chatId:         string;
	chatTitle:      string;
	threadId?:      string;
	rootMessageId?: number;
	messages:       { id: number; sender: 'user' | 'ai'; text: string }[];
}

export interface SearchHit {
	chatId:         string;
	chatTitle:      string;
	threadId?:      string;
	rootMessageId?: number;
	messageId:      number;
	sender:         'user' | 'ai';
	snippet:        string;
}
