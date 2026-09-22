'use client';

import { LineChart, BarChart, AreaChart, DonutChart, RadarChart, type ChartSeries, type DonutSlice } from '../../components/Charts/Charts';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/Table/Table';
import FunctionPlotter from '../../components/FunctionPlotter/FunctionPlotter';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer';
import Typewriter from '../../components/Typewriter/Typewriter';
import ChatMarkdown from './ChatMarkdown';

export interface ChartSpec {
	xKey:   string;
	series: ChartSeries[];
	data:   Record<string, string | number>[];
}

export interface StackableChartSpec extends ChartSpec {
	stacked?: boolean;
}

export interface DonutSpec {
	data: DonutSlice[];
}

export interface MathSpec {
	equations: string[];
}

export interface ImageSpec {
	url: string;
	alt: string;
}

export interface AudioSpec {
	src:    string;
	title?: string;
}

export interface TableSpec {
	columns: { key: string; label: string }[];
	rows:    Record<string, string | number>[];
}

type MessageSegment =
	| { kind: 'text';       text: string }
	| { kind: 'table';      spec: TableSpec }
	| { kind: 'lineplot';   spec: ChartSpec }
	| { kind: 'barchart';   spec: StackableChartSpec }
	| { kind: 'areachart';  spec: StackableChartSpec }
	| { kind: 'radarchart'; spec: ChartSpec }
	| { kind: 'donutchart'; spec: DonutSpec }
	| { kind: 'math';       spec: MathSpec }
	| { kind: 'image';      spec: ImageSpec }
	| { kind: 'audio';      spec: AudioSpec };

const FENCE_PATTERN = /```(\w+)\n([\s\S]*?)```/g;

const FENCE_LANGS = new Set(['table', 'lineplot', 'barchart', 'areachart', 'radarchart', 'donutchart', 'math', 'image', 'audio']);

const parseMessageSegments = (text: string): MessageSegment[] => {
	const segments: MessageSegment[] = [];
	let lastIndex = 0;

	FENCE_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while((match = FENCE_PATTERN.exec(text)) !== null)
	{
		const [full, lang, body] = match;
		if(match.index > lastIndex) segments.push({ kind: 'text', text: text.slice(lastIndex, match.index) });

		if(FENCE_LANGS.has(lang))
		{
			try { segments.push({ kind: lang, spec: JSON.parse(body) } as MessageSegment); }
			catch { segments.push({ kind: 'text', text: full }); }
		}
		else segments.push({ kind: 'text', text: full });

		lastIndex = match.index + full.length;
	}

	if(lastIndex < text.length) segments.push({ kind: 'text', text: text.slice(lastIndex) });
	if(segments.length === 0) segments.push({ kind: 'text', text });

	return segments;
};

// A newly-appended row fades in on mount rather than popping in hard — a plain
// TableRow (not a wrapper div) so the table's row/column structure stays valid.
const RevealRow = ({ children }: { children: ReactNode }) => {
	const [shown, setShown] = useState(false);

	useEffect(() => {
		const id = requestAnimationFrame(() => setShown(true));
		return () => cancelAnimationFrame(id);
	}, []);

	return (
		<TableRow className={`motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] ${shown ? 'opacity-100' : 'opacity-0'}`}>
			{children}
		</TableRow>
	);
};

// Shared by both the fully-revealed (static) and progressively-revealed (streaming)
// render paths — `revealedRows` defaults to every row, so the static path just
// renders the whole table with no extra plumbing.
const SpecTable = ({ spec, revealedRows = spec.rows.length }: { spec: TableSpec; revealedRows?: number }) => (
	<Table>
		<TableHead>
			<TableRow header>
				{spec.columns.map((col) => <TableHeader key={col.key}>{col.label}</TableHeader>)}
			</TableRow>
		</TableHead>
		<TableBody>
			{spec.rows.slice(0, revealedRows).map((row, index) => (
				<RevealRow key={index}>
					{spec.columns.map((col) => <TableCell key={col.key}>{row[col.key]}</TableCell>)}
				</RevealRow>
			))}
		</TableBody>
	</Table>
);

const ROW_REVEAL_INTERVAL_MS = 220;

// The real <Table> shell renders immediately, with rows appended one at a time —
// never raw markdown text, so there's no text-then-table swap to flicker between.
const shouldSkipTableReveal = (spec: TableSpec) =>
	spec.rows.length === 0 || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const RevealingTable = ({ spec, onComplete }: { spec: TableSpec; onComplete: () => void }) => {
	const skip = shouldSkipTableReveal(spec);
	const [revealedRows, setRevealedRows] = useState(skip ? spec.rows.length : 0);
	const onCompleteRef = useRef(onComplete);
	useEffect(() => { onCompleteRef.current = onComplete; });

	useEffect(() => {
		if(skip)
		{
			onCompleteRef.current();
			return;
		}

		let current = 0;
		const intervalId = setInterval(() => {
			current += 1;
			setRevealedRows(current);
			if(current >= spec.rows.length)
			{
				clearInterval(intervalId);
				onCompleteRef.current();
			}
		}, ROW_REVEAL_INTERVAL_MS);

		return () => clearInterval(intervalId);
	}, [spec, skip]);

	return <SpecTable spec={spec} revealedRows={revealedRows} />;
};

const renderSegment = (seg: MessageSegment, index: number) => {
	switch(seg.kind)
	{
		case 'table':
			return <SpecTable key={index} spec={seg.spec} />;

		case 'lineplot':
			return <LineChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} height={180} />;

		case 'barchart':
			return <BarChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} stacked={seg.spec.stacked} height={180} />;

		case 'areachart':
			return <AreaChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} stacked={seg.spec.stacked} height={180} />;

		case 'radarchart':
			return <RadarChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} height={220} />;

		case 'donutchart':
			return <DonutChart key={index} data={seg.spec.data} height={200} />;

		case 'math':
			return <FunctionPlotter key={index} initialEquations={seg.spec.equations} readOnly layout='bottom' height={220} />;

		case 'image':
			return (
				// eslint-disable-next-line @next/next/no-img-element -- arbitrary generated-image URL, not a static asset
				<img key={index} src={seg.spec.url} alt={seg.spec.alt} className='w-full max-w-xs rounded-[var(--radius-lg)]' />
			);

		case 'audio':
			return <AudioPlayer key={index} size='compact' src={seg.spec.src} title={seg.spec.title} className='w-56' />;

		case 'text':
			return seg.text.trim() ? <ChatMarkdown key={index} text={seg.text.trim()} /> : null;
	}
};

const SEGMENT_PAUSE_MS = 160;

interface StreamingSegmentProps {
	segment: MessageSegment;
	onDone:  () => void;
}

// Renders exactly one segment while it's the active one in a streaming message.
// A text segment types itself out; a table reveals its own rows; everything else
// (charts, math, image, audio) can't be partially rendered — a truncated JSON blob
// or half-typed LaTeX expression is invalid — so it just pops in after a brief
// pause, keeping the pacing between segments even instead of flashing by instantly.
const StreamingSegment = ({ segment, onDone }: StreamingSegmentProps) => {
	const onDoneRef = useRef(onDone);
	useEffect(() => { onDoneRef.current = onDone; });

	const trimmedText   = segment.kind === 'text' ? segment.text.trim() : '';
	const selfCompletes = segment.kind === 'table' || (segment.kind === 'text' && trimmedText !== '');

	useEffect(() => {
		if(selfCompletes) return;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const id = setTimeout(() => onDoneRef.current(), reducedMotion ? 0 : SEGMENT_PAUSE_MS);
		return () => clearTimeout(id);
	 
	}, [selfCompletes]);

	if(segment.kind === 'table') return <RevealingTable spec={segment.spec} onComplete={onDone} />;
	if(segment.kind === 'text') return trimmedText ? (
		<Typewriter text={trimmedText} speed={18} onComplete={onDone} className='whitespace-pre-wrap text-sm leading-relaxed' />
	) : null;

	return renderSegment(segment, 0);
};

export interface StreamingMessageProps {
	/** The full message text (prose plus any ```table/```lineplot/etc. fenced segments). */
	text:        string;
	/** While true, segments reveal one at a time in order instead of all rendering immediately. */
	streaming:   boolean;
	/** Called once every segment has finished revealing. Ignored while `streaming` is false. */
	onComplete?: () => void;
}

export const StreamingMessage = ({ text, streaming, onComplete }: StreamingMessageProps) => {
	const segments = parseMessageSegments(text);
	const [activeIndex, setActiveIndex] = useState(0);
	const onCompleteRef = useRef(onComplete);
	useEffect(() => { onCompleteRef.current = onComplete; });

	const advance = () => {
		const next = activeIndex + 1;
		setActiveIndex(next);
		if(next >= segments.length) onCompleteRef.current?.();
	};

	if(!streaming)
	{
		return <div className='flex flex-col gap-3'>{segments.map((seg, i) => renderSegment(seg, i))}</div>;
	}

	return (
		<div className='flex flex-col gap-3'>
			{segments.slice(0, activeIndex).map((seg, i) => renderSegment(seg, i))}
			{activeIndex < segments.length && (
				<StreamingSegment key={activeIndex} segment={segments[activeIndex]} onDone={advance} />
			)}
		</div>
	);
};

export default StreamingMessage;
