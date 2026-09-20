'use client';

import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/Table/Table';
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { Element as HastElement, Text as HastText } from 'hast';
import { CodeBlock } from '../../components/CodeBlock/CodeBlock';
import ReactMarkdown, { type Components } from 'react-markdown';
import Formula from '../../components/Formula/Formula';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';

export interface ChatMarkdownProps {
	text: string;
}

const hastText = (node: HastElement | undefined): string => {
	if(!node) return '';
	return node.children.map((child) => {
		if(child.type === 'text') return (child as HastText).value;
		if(child.type === 'element') return hastText(child as HastElement);
		return '';
	}).join('');
};

const classNamesOf = (node: HastElement | undefined): string[] => {
	const raw = node?.properties?.className;
	return Array.isArray(raw) ? raw.map(String) : [];
};

const components: Components = {
	table: ({ children }) => <Table>{children}</Table>,
	thead: ({ children }) => (
		<TableHead>
			{Children.map(children, (child) => (
				isValidElement(child) ? cloneElement(child as ReactElement<{ header?: boolean }>, { header: true }) : child
			))}
		</TableHead>
	),
	tbody: ({ children }) => <TableBody>{children}</TableBody>,
	tr:     ({ children }) => <TableRow>{children}</TableRow>,
	th:     ({ children }) => <TableHeader>{children}</TableHeader>,
	td:     ({ children }) => <TableCell>{children}</TableCell>,

	a: ({ href, children }) => (
		<a
			href={href}
			target='_blank'
			rel='noopener noreferrer'
			className='text-brand underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring rounded-[var(--radius-sm)]'
		>
			{children}
		</a>
	),

	pre: ({ node }) => {
		const codeNode = node?.children.find((c): c is HastElement => c.type === 'element' && c.tagName === 'code');
		const classes  = classNamesOf(codeNode);
		const text     = hastText(codeNode);

		if(classes.includes('math-display')) return <Formula expression={text.trim()} display='block' />;

		return <CodeBlock variant='code' code={text.replace(/\n$/, '')} />;
	},
	code: ({ node, children }) => {
		const classes = classNamesOf(node);

		if(classes.includes('math-inline')) return <Formula expression={hastText(node).trim()} display='inline' size='sm' />;

		return <code className='rounded bg-surface-active px-1.5 py-0.5 font-mono text-xs'>{children}</code>;
	},

	ul: ({ children }) => <ul className='list-disc pl-5'>{children}</ul>,
	ol: ({ children }) => <ol className='list-decimal pl-5'>{children}</ol>,
	li: ({ children }) => <li>{children}</li>,
	blockquote: ({ children }) => (
		<blockquote className='border-l-2 border-surface-border pl-3 text-text-muted'>{children}</blockquote>
	),
};

export const ChatMarkdown = ({ text }: ChatMarkdownProps): ReactNode => (
	<div className='flex flex-col gap-2 text-sm [&_p]:leading-relaxed'>
		<ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} components={components}>
			{text}
		</ReactMarkdown>
	</div>
);

export default ChatMarkdown;
