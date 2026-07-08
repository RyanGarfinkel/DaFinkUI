'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import Typewriter from '../../components/Typewriter/Typewriter';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Message from '../../components/Message/Message';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Input from '../../components/Input/Input';

interface ChatMessage
{
	id:        number;
	sender:    'user' | 'ai';
	text:      string;
	animate?:  boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
	{ id: 1, sender: 'ai',   text: 'Hi! I’m the DaFink UI assistant — ask me anything about installing or using components.' },
	{ id: 2, sender: 'user', text: 'How do I install a component?' },
	{ id: 3, sender: 'ai',   text: 'Run npx dafink-ui add button in your project root — it copies the component source straight into your repo.' },
	{ id: 4, sender: 'user', text: 'Does it work with dark mode out of the box?' },
	{ id: 5, sender: 'ai',   text: 'Yes — every component is built on design tokens, so it adapts automatically to your theme’s light and dark palettes.' },
];

const CANNED_REPLIES = [
	'Good question — check the component’s spec.md for full prop details and accessibility notes.',
	'You can customize that with design tokens instead of hardcoded colors — see rules/tokens.md.',
	'That’s supported out of the box. Try it live in the playground on the component’s docs page.',
	'Most components ship with keyboard navigation and focus states built in, so you shouldn’t need extra work there.',
];

export const AiChat = () => {
	const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
	const [draft, setDraft] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const nextId = useRef(INITIAL_MESSAGES.length + 1);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => {
		const el = containerRef.current;
		if(!el) return;
		el.scrollTop = el.scrollHeight;
	}, [messages, isTyping]);

	useEffect(() => {
		return () => clearTimeout(timeoutRef.current);
	}, []);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const text = draft.trim();
		if(!text) return;

		setMessages((prev) => [...prev, { id: nextId.current++, sender: 'user', text }]);
		setDraft('');
		setIsTyping(true);

		timeoutRef.current = setTimeout(() => {
			const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
			setIsTyping(false);
			setMessages((prev) => [...prev, { id: nextId.current++, sender: 'ai', text: reply, animate: true }]);
		}, 600 + Math.random() * 300);
	};

	return (
		<Card className='w-full max-w-md'>
			<CardHeader className='flex items-center justify-between'>
				<h3 className='text-base font-semibold text-text'>Assistant</h3>
				<Badge variant='success'>Online</Badge>
			</CardHeader>
			<CardContent>
				<ScrollFade ref={containerRef} direction='vertical' className='max-h-96'>
					<div className='flex flex-col gap-3'>
						{messages.map((m) => (
							<Message
								key={m.id}
								variant={m.sender === 'user' ? 'sent' : 'received'}
								avatar={<Avatar name={m.sender === 'user' ? 'You' : 'AI'} size='sm' />}
							>
								{m.animate ? <Typewriter text={m.text} speed={18} /> : m.text}
							</Message>
						))}
						{isTyping && (
							<p className='text-xs text-text-muted pl-9'>Assistant is typing…</p>
						)}
					</div>
				</ScrollFade>
			</CardContent>
			<CardFooter>
				<form onSubmit={handleSubmit} className='flex w-full gap-2'>
					<Input
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						placeholder='Ask a question…'
						aria-label='Message'
						className='flex-1'
					/>
					<Button type='submit' disabled={!draft.trim()}>
						Send
					</Button>
				</form>
			</CardFooter>
		</Card>
	);
};

export default AiChat;
