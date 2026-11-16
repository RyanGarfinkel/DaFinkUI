import type { ToolCallEntry } from '../../components/ToolCallTrace/ToolCallTrace';
import type { QuestionStep } from '../../components/Questionnaire/Questionnaire';
import type { DeckOp } from '../../components/DeckEditor/ops';
import type { Deck } from '../../components/DeckEditor/deck';

export interface DeckEditStep {
	op:    DeckOp;
	/** Shown while the step plays, e.g. "Adding a chart to slide 2". */
	label: string;
}

/** Edits an agent made to a slide deck, replayed live in the chat. */
export interface DeckEdit {
	deckId: string;
	title:  string;
	/** The deck to start from. Omit to continue from this chat's latest edit of the same `deckId`. */
	base?:  Deck;
	steps:  DeckEditStep[];
}

/** A slide deck in this chat as the user has left it, sent with each request. Reply with a `DeckEdit` using the same `deckId` to edit it. */
export interface ChatDeck {
	deckId: string;
	deck:   Deck;
}

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
	deckEdit?:          DeckEdit;
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
	deckEdit?:  DeckEdit;
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
