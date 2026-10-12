'use client';

import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, CopyIcon, PencilIcon, ReplyIcon, RefreshIcon } from './icons';
import { Attachment, AttachmentGroup } from '../../components/Attachment/Attachment';
import type { ChatMessage, ChatTextMessage, MessageAttachment } from './types';
import Questionnaire from '../../components/Questionnaire/Questionnaire';
import ToolCallTrace from '../../components/ToolCallTrace/ToolCallTrace';
import { useEffect, useRef, useState, ReactNode } from 'react';
import Textarea from '../../components/Textarea/Textarea';
import Message from '../../components/Message/Message';
import Tooltip from '../../components/Tooltip/Tooltip';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';
import StreamingMessage from './StreamingMessage';
import Badge from '../../components/Badge/Badge';
import { TypingPhrase } from './Phrases';

export const Divider = ({ label }: { label: string }) => (
	<div className='flex items-center gap-3'>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
		<span className='shrink-0 text-xs font-medium text-text-muted'>{label}</span>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
	</div>
);

const HOVER_ACTION_BUTTON_CLASSES = 'flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] group-hover:opacity-100 focus-visible:opacity-100 hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring disabled:pointer-events-none disabled:opacity-40';

const VERSION_NAV_BUTTON_CLASSES = 'flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring disabled:pointer-events-none disabled:opacity-40';

// Hover/focus-revealed, same reveal behavior as the reply trigger next to it regardless of
// whether a thread exists yet — copying is a lightweight secondary action, not something
// that needs to stay pinned open like the reply-count badge does.
const CopyMessageButton = ({ text }: { text: string }) => {
	const [copied, setCopied] = useState(false);
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(copiedTimerRef.current), []);

	const handleCopy = async () => {
		try
		{
			await navigator.clipboard.writeText(text);
			setCopied(true);
			clearTimeout(copiedTimerRef.current);
			copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
		}
		catch
		{
			// clipboard unavailable, silently ignore
		}
	};

	return (
		<Tooltip content={copied ? 'Copied' : 'Copy'} side='bottom'>
			<button
				type='button'
				aria-label={copied ? 'Copied' : 'Copy message'}
				onClick={handleCopy}
				className={HOVER_ACTION_BUTTON_CLASSES}
			>
				{copied ? <CheckIcon /> : <CopyIcon />}
			</button>
		</Tooltip>
	);
};

export interface VersionNavInfo {
	index:  number;
	count:  number;
	onPrev: () => void;
	onNext: () => void;
}

const VersionNav = ({ index, count, onPrev, onNext }: VersionNavInfo) => (
	<div className='flex items-center gap-0.5 text-xs text-text-muted opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] group-hover:opacity-100 focus-within:opacity-100'>
		<button type='button' aria-label='Previous version' onClick={onPrev} disabled={index === 0} className={VERSION_NAV_BUTTON_CLASSES}>
			<ChevronLeftIcon />
		</button>
		<span className='tabular-nums'>{index + 1}/{count}</span>
		<button type='button' aria-label='Next version' onClick={onNext} disabled={index === count - 1} className={VERSION_NAV_BUTTON_CLASSES}>
			<ChevronRightIcon />
		</button>
	</div>
);

export const buildVersionNav = (m: ChatTextMessage, onChange: (index: number) => void): VersionNavInfo | undefined => {
	const versions = m.versions;
	if(!versions || versions.length <= 1 || m.animate) return undefined;
	const index = m.versionIndex ?? versions.length - 1;
	return {
		index,
		count:  versions.length,
		onPrev: () => onChange(Math.max(0, index - 1)),
		onNext: () => onChange(Math.min(versions.length - 1, index + 1)),
	};
};

export interface MessageActionsRowProps {
	align:            'start' | 'end';
	messageId:        number;
	text:             string;
	showReplyTrigger: boolean;
	onReply:          () => void;
	showEdit:         boolean;
	onEdit:           () => void;
	showRefresh:      boolean;
	regenerating:     boolean;
	onRefresh:        () => void;
	versionNav?:      VersionNavInfo;
	threadPill?:      { replyCount: number; loading: boolean };
}

export const MessageActionsRow = ({
	align, messageId, text, showReplyTrigger, onReply, showEdit, onEdit, showRefresh, regenerating, onRefresh, versionNav, threadPill,
}: MessageActionsRowProps) => (
	<div className={['flex w-full items-center gap-1', align === 'end' ? 'justify-end' : 'justify-start'].join(' ')}>
		<CopyMessageButton text={text} />

		{showEdit && (
			<Tooltip content='Edit' side='bottom'>
				<button type='button' aria-label='Edit message' onClick={onEdit} className={HOVER_ACTION_BUTTON_CLASSES}>
					<PencilIcon />
				</button>
			</Tooltip>
		)}

		{showRefresh && (
			<Tooltip content='Regenerate' side='bottom'>
				<button
					type='button'
					aria-label='Regenerate response'
					onClick={onRefresh}
					disabled={regenerating}
					className={HOVER_ACTION_BUTTON_CLASSES}
				>
					{regenerating ? <Spinner size='sm' /> : <RefreshIcon />}
				</button>
			</Tooltip>
		)}

		{versionNav && <VersionNav {...versionNav} />}

		{showReplyTrigger && (
			<button
				id={`thread-trigger-${messageId}`}
				type='button'
				aria-label='Reply in thread'
				onClick={onReply}
				className={HOVER_ACTION_BUTTON_CLASSES}
			>
				<ReplyIcon />
			</button>
		)}

		{threadPill && <ThreadReplyPill messageId={messageId} onReply={onReply} {...threadPill} />}
	</div>
);

// Sits at the far end of the actions row once a thread actually has replies (or is loading
// them), and unlike the hover-only buttons beside it stays visible so the reply count
// never needs a hover to be seen.
const ThreadReplyPill = ({ messageId, replyCount, loading, onReply }: { messageId: number; replyCount: number; loading: boolean; onReply: () => void }) => (
	<button
		id={`thread-trigger-${messageId}`}
		type='button'
		onClick={onReply}
		className='ml-auto inline-flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
	>
		<Badge variant='outline' className='gap-1 text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:border-surface-border-hover hover:text-text'>
			<ReplyIcon />
			{loading ? 'Loading…' : `${replyCount} message${replyCount === 1 ? '' : 's'}`}
		</Badge>
	</button>
);

export const MessageAttachments = ({ attachments }: { attachments?: MessageAttachment[] }) => {
	if(!attachments || attachments.length === 0) return null;

	return (
		<AttachmentGroup className='justify-end'>
			{attachments.map((attachment, index) => (
				<Attachment key={`${attachment.name}-${index}`} compact name={attachment.name} />
			))}
		</AttachmentGroup>
	);
};

export interface ChatMessageRowProps {
	message:               ChatMessage;
	onStreamComplete:      (messageId: number) => void;
	onQuestionnaireAnswer: (messageId: number, value: string) => void;
	renderTrailing?:       (m: ChatTextMessage) => ReactNode;
	/** Main-pane-only: replaces the bubble with an inline editor for the latest user message. */
	editing?:              boolean;
	editDraft?:            string;
	onEditDraftChange?:    (value: string) => void;
	onCancelEdit?:         () => void;
	onSubmitEdit?:         () => void;
}

const ChatMessageRowContent = ({
	message: m, onStreamComplete, onQuestionnaireAnswer, renderTrailing,
	editing = false, editDraft = '', onEditDraftChange, onCancelEdit, onSubmitEdit,
}: ChatMessageRowProps) => {
	if(m.kind === 'checkpoint') return <Divider label={m.label} />;

	if(m.sender === 'user') {
		if(editing) {
			return (
				<div className='flex w-full flex-col items-end gap-1.5'>
					<MessageAttachments attachments={m.attachments} />
					<div className='flex w-full max-w-[75%] flex-col items-end gap-1.5'>
						<Textarea
							autoFocus
							value={editDraft}
							onChange={(e) => onEditDraftChange?.(e.target.value)}
							onKeyDown={(e) => {
								if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmitEdit?.(); }
								if(e.key === 'Escape') { e.preventDefault(); onCancelEdit?.(); }
							}}
							className='min-h-[2.5rem] py-1.5'
							aria-label='Edit message'
						/>
						<div className='flex items-center gap-1.5'>
							<Button type='button' variant='ghost' size='sm' onClick={onCancelEdit}>Cancel</Button>
							<Button type='button' size='sm' onClick={onSubmitEdit} disabled={!editDraft.trim()}>Resend</Button>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className='group flex flex-col items-end gap-1.5'>
				<MessageAttachments attachments={m.attachments} />
				{m.text && <Message variant='sent'>{m.text}</Message>}
				{renderTrailing?.(m)}
			</div>
		);
	}

	return (
		<div className='group flex flex-col gap-1.5'>
			{m.animate && <TypingPhrase />}
			{m.toolCalls && <ToolCallTrace toolCalls={m.toolCalls} />}
			<Message variant='received' bubble={false}>
				<StreamingMessage
					key={m.versionIndex ?? 0}
					text={m.text}
					streaming={!!m.animate}
					onComplete={() => onStreamComplete(m.id)}
				/>
			</Message>
			{m.questionnaire && (
				<Questionnaire
					className='max-w-md'
					step={m.questionnaire}
					answer={m.questionnaireAnswer}
					onAnswer={(value) => onQuestionnaireAnswer(m.id, value)}
				/>
			)}
			{renderTrailing?.(m)}
		</div>
	);
};

// `data-message-id` is how search results find the message to scroll to.
export const ChatMessageRow = (props: ChatMessageRowProps) => (
	<div data-message-id={props.message.id} className='scroll-mt-4'>
		<ChatMessageRowContent {...props} />
	</div>
);
