'use client';

import Collapsible, { CollapsibleTrigger, CollapsibleContent } from '../../components/Collapsible/Collapsible';
import { Timeline, TimelineItem } from '../../components/Timeline/Timeline';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import { useState } from 'react';

export interface ToolCallLink {
	title: string;
	url:   string;
}

export interface ToolCallEntry {
	id:      string;
	kind:    'tool' | 'search' | 'thought';
	title:   string;
	detail:  string;
	result?: string;
	links?:  ToolCallLink[];
}

export interface ToolCallTraceProps {
	toolCalls: ToolCallEntry[];
}

const ToolIcon = () => (
	<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' />
	</svg>
);

const SearchIcon = () => (
	<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<circle cx='11' cy='11' r='8' />
		<path d='m21 21-4.35-4.35' />
	</svg>
);

const ThoughtIcon = () => (
	<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M15 14c.2-1 .7-1.7 1.5-2.5a6 6 0 1 0-9 0c.8.8 1.3 1.5 1.5 2.5' />
		<path d='M9 18h6' />
		<path d='M10 22h4' />
	</svg>
);

const ExternalLinkIcon = () => (
	<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='shrink-0 text-text-muted' aria-hidden='true'>
		<path d='M15 3h6v6' />
		<path d='M10 14 21 3' />
		<path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
	</svg>
);

const FaviconIcon = ({ url }: { url: string }) => {
	const [errored, setErrored] = useState(false);

	let hostname: string | null = null;
	try { hostname = new URL(url).hostname; }
	catch { hostname = null; }

	if(errored || !hostname) return <ExternalLinkIcon />;

	return (
		// eslint-disable-next-line @next/next/no-img-element -- arbitrary external favicon URL, not a static asset
		<img
			src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
			alt=''
			width={13}
			height={13}
			className='shrink-0 rounded-[2px]'
			onError={() => setErrored(true)}
		/>
	);
};

const TOOL_CALL_ICON: Record<ToolCallEntry['kind'], React.ReactNode> = {
	tool:    <ToolIcon />,
	search:  <SearchIcon />,
	thought: <ThoughtIcon />,
};

const cleanUrl = (url: string) => {
	try
	{
		return new URL(url).hostname.replace(/^www\./, '');
	}
	catch
	{
		return url;
	}
};

const summarizeToolCalls = (entries: ToolCallEntry[]) => {
	const toolCount    = entries.filter((e) => e.kind === 'tool').length;
	const searchCount  = entries.filter((e) => e.kind === 'search').length;
	const thoughtCount = entries.filter((e) => e.kind === 'thought').length;

	const parts: string[] = [];
	if(thoughtCount > 0) parts.push('Thought');
	if(searchCount > 0) parts.push(searchCount === 1 ? 'searched the web' : `ran ${searchCount} web searches`);
	if(toolCount > 0) parts.push(`used ${toolCount} tool${toolCount === 1 ? '' : 's'}`);

	return parts.length > 0 ? parts.join(', ') : `${entries.length} step${entries.length === 1 ? '' : 's'}`;
};

export const ToolCallTrace = ({ toolCalls }: ToolCallTraceProps) => {
	if(toolCalls.length === 0) return null;

	return (
		<Collapsible>
			<CollapsibleTrigger>
				<span className='flex items-center gap-1.5'>
					<ThoughtIcon />
					{summarizeToolCalls(toolCalls)}
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Timeline variant='muted' animate='none' spacing='compact'>
					{toolCalls.map((call) => (
						<TimelineItem key={call.id} title={call.title} indicator={TOOL_CALL_ICON[call.kind]}>
							<p>{call.detail}</p>
							{call.links && call.links.length > 0 ? (
								<ScrollFade
									direction='vertical'
									className='max-h-28'
									wrapperClassName='mt-1.5 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border'
								>
									<div className='flex flex-col divide-y divide-surface-border'>
										{call.links.map((link) => (
											<a
												key={link.url}
												href={link.url}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center gap-2 px-2 py-1.5 motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ring'
											>
												<FaviconIcon url={link.url} />
												<span className='min-w-0 flex-1 truncate text-text'>{link.title}</span>
												<span className='max-w-28 shrink-0 truncate text-text-subtle'>{cleanUrl(link.url)}</span>
											</a>
										))}
									</div>
								</ScrollFade>
							) : (
								call.result && (
									<p className='mt-1 rounded-[var(--radius-sm)] bg-surface-active px-2 py-1 text-text'>{call.result}</p>
								)
							)}
						</TimelineItem>
					))}
				</Timeline>
			</CollapsibleContent>
		</Collapsible>
	);
};

export default ToolCallTrace;
