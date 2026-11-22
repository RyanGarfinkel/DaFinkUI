import type { ToolCallEntry } from '../../components/ToolCallTrace/ToolCallTrace';
import type { QuestionStep } from '../../components/Questionnaire/Questionnaire';
import type { SheetOp } from '../../components/SheetEditor/sheetops';
import type { Sheet } from '../../components/SheetEditor/sheet';
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

export interface SheetEditStep {
	op:    SheetOp;
	/** Shown while the step plays, e.g. "Totalling the Q3 column". */
	label: string;
}

/** Edits an agent made to a spreadsheet, replayed live in the chat. */
export interface SheetEdit {
	sheetId: string;
	title:   string;
	/** The sheet to start from. Omit to continue from this chat's latest edit of the same `sheetId`. */
	base?:   Sheet;
	steps:   SheetEditStep[];
}

/** A spreadsheet in this chat as the user has left it, sent with each request. Reply with a `SheetEdit` using the same `sheetId` to edit it. */
export interface ChatSheet {
	sheetId: string;
	sheet:   Sheet;
}

export type ArtifactKind = 'pdf' | 'markdown' | 'image' | 'code';

/** A document the AI made in a reply. It's kept in the chat's artifacts list and opens in the artifacts panel. */
export interface ChatArtifact {
	id:        string;
	kind:      ArtifactKind;
	title:     string;
	/** `markdown` and `code` carry the text itself. `pdf` and `image` carry a URL (a data URL works). */
	content:   string;
	/** Used for the download name and, for `code`, shown as the language. */
	filename?: string;
}

/** One row in a chat's artifacts list: a document, a slide deck (which opens the slides panel), or a sheet (the sheet panel). */
export interface ArtifactEntry {
	key:        string;
	kind:       ArtifactKind | 'slides' | 'sheet';
	title:      string;
	/** The reply that made it, for finding its card in the thread. */
	messageId:  number;
	artifact?:  ChatArtifact;
	deckId?:    string;
	sheetId?:   string;
}

export interface MessageAttachment {
	name:    string;
	/** Set on a reference (e.g. to a slide element) rather than a file: what it points at, written for the model. */
	detail?: string;
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
	sheetEdit?:         SheetEdit;
	artifacts?:         ChatArtifact[];
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
	sheetEdit?: SheetEdit;
	artifacts?: ChatArtifact[];
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
