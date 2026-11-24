'use client';

import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import PdfPage, { PagePoint, PageSize } from './PdfPage';
import { MinusIcon, PlusIcon } from '../Icons/Icons';
import { Select } from '../Select/Select';
import { createPortal } from 'react-dom';
import Spinner from '../Spinner/Spinner';
import Button from '../Button/Button';

export interface PdfViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onError' | 'onLoad'> {
	src:           string | Uint8Array;
	title?:        string;
	initialPage?:  number;
	height?:       number | string;
	/** Where the zoom and page controls render. Omit for the built-in toolbar row; pass an element to portal the controls into your own toolbar (the row then has no title or border of its own); pass `null` to hide them. */
	toolbarTarget?: HTMLElement | null;
	onLoad?:      (pageCount: number) => void;
	onError?:      (error: Error) => void;
	onPageChange?: (page: number) => void;
	/** Called on a double click, with the page number and the click position in PDF points from the page's top-left corner. */
	onPageDoubleClick?: (point: PagePoint) => void;
}

interface Loaded {
	source: PdfViewerProps['src'];
	doc?:   PDFDocumentProxy;
	base?:  PageSize;
	error?: Error;
}

const CSS_UNITS = 96 / 72;
const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const GUTTER = 24;
const FIT = 'fit';
const DEFAULT_TITLE = 'PDF document';
const PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

const ToolbarSlot = ({ target, children }: { target?: HTMLElement | null; children: ReactNode }) => {
	if(target === undefined) return children;

	return target ? createPortal(children, target) : null;
};

const clamp =(value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const PdfViewer = ({ src, title, initialPage = 1, height = '40rem', toolbarTarget, onLoad, onError, onPageChange, onPageDoubleClick, className = '', style, ...props }: PdfViewerProps) => {
	const scrollerRef = useRef<HTMLDivElement>(null);
	const callbacks = useRef({ onLoad, onError });
	const [loaded, setLoaded] = useState<Loaded | null>(null);
	const [zoom, setZoom] = useState<number | null>(null);
	const [width, setWidth] = useState(0);
	const [page, setPage] = useState(initialPage);
	const [draft, setDraft] = useState<string | null>(null);

	useEffect(() => {
		callbacks.current = { onLoad, onError };
	});

	useEffect(() => {
		let cancelled = false;
		let task: PDFDocumentLoadingTask | undefined;

		const open = async () => {
			const pdfjs = await import('pdfjs-dist');
			pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

			task = pdfjs.getDocument(typeof src === 'string' ? { url: src } : { data: src.slice() });
			const doc = await task.promise;
			if(cancelled) return;

			const first = (await doc.getPage(1)).getViewport({ scale: 1 });
			if(cancelled) return;

			setLoaded({ source: src, doc, base: { width: first.width, height: first.height } });
			callbacks.current.onLoad?.(doc.numPages);
		};

		open().catch((reason: unknown) => {
			if(cancelled) return;

			const error = reason instanceof Error ? reason : new Error('Could not load the PDF.');
			setLoaded({ source: src, error });
			callbacks.current.onError?.(error);
		});

		return () => {
			cancelled = true;
			task?.destroy();
		};
	}, [src]);

	useEffect(() => {
		const scroller = scrollerRef.current;
		if(!scroller) return;

		const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
		observer.observe(scroller);

		return () => observer.disconnect();
	}, [loaded]);

	const current = loaded?.source === src ? loaded : null;
	const { doc, base } = current ?? {};
	const count = doc?.numPages ?? 0;
	const fit = base && width ? clamp((width - GUTTER * 2) / (base.width * CSS_UNITS), ZOOM_MIN, ZOOM_MAX) : 1;
	const factor = zoom ?? fit;
	const scale = factor * CSS_UNITS;

	const percent = (value: number) => `${Math.round(value * 100)}%`;
	const zoomOptions = [
		{ value: FIT, label: `Fit · ${percent(fit)}` },
		...(zoom !== null && !PRESETS.includes(zoom) ? [{ value: String(zoom), label: percent(zoom) }] : []),
		...PRESETS.map((preset) => ({ value: String(preset), label: percent(preset) })),
	].sort((a, b) => (a.value === FIT ? -1 : b.value === FIT ? 1 : Number(a.value) - Number(b.value)));

	const goTo =(target: number, behavior: ScrollBehavior = 'smooth') => {
		const scroller = scrollerRef.current;
		const next = clamp(Math.round(target), 1, Math.max(count, 1));
		const element = scroller?.querySelector<HTMLElement>(`[data-page='${next}']`);

		setPage(next);
		onPageChange?.(next);
		if(!scroller || !element) return;

		const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		scroller.scrollTo?.({ top: element.offsetTop - GUTTER, behavior: reduced ? 'auto' : behavior });
	};

	useEffect(() => {
		if(!doc || initialPage <= 1) return;

		const scroller = scrollerRef.current;
		const element = scroller?.querySelector<HTMLElement>(`[data-page='${initialPage}']`);
		scroller?.scrollTo?.({ top: (element?.offsetTop ?? GUTTER) - GUTTER });
	}, [doc, initialPage]);

	const handleScroll = () => {
		const scroller = scrollerRef.current;
		if(!scroller) return;

		const line = scroller.scrollTop + scroller.clientHeight / 3;
		let next = 1;
		scroller.querySelectorAll<HTMLElement>('[data-page]').forEach((element) => {
			if(element.offsetTop <= line) next = Number(element.dataset.page);
		});

		if(next === page) return;
		setPage(next);
		onPageChange?.(next);
	};

	const commitDraft = () => {
		const target = Number(draft);
		setDraft(null);
		if(draft?.trim() && Number.isFinite(target)) goTo(target);
	};

	const zoomBy = (direction: 1 | -1) => setZoom(clamp(Math.round(factor / ZOOM_STEP) * ZOOM_STEP + direction * ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));

	const embedded = toolbarTarget !== undefined;
	const ready = Boolean(doc && base);
	const failed = loaded?.source === src ? loaded.error : undefined;

	return (
		<div
			{...props}
			className={`flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface-sunken ${className}`}
			style={{ height, ...style }}
		>
			<ToolbarSlot target={toolbarTarget}>
			<div role='toolbar' aria-label={`${title ?? DEFAULT_TITLE} controls`} className={embedded ? 'flex items-center gap-3' : 'flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2'}>
				{!embedded && <p className='min-w-0 flex-1 truncate text-sm font-medium text-text'>{title}</p>}
				<div className='flex items-center gap-1'>
					<Button variant='ghost' size='icon-sm' aria-label='Zoom out' disabled={!ready || factor <= ZOOM_MIN} onClick={() => zoomBy(-1)}>
						<MinusIcon />
					</Button>
					<Select
						size='sm'
						aria-label='Zoom level'
						disabled={!ready}
						options={zoomOptions}
						value={zoom === null ? FIT : String(zoom)}
						onChange={(value) => setZoom(value === FIT ? null : Number(value))}
						className='w-36 whitespace-nowrap'
					/>
					<Button variant='ghost' size='icon-sm' aria-label='Zoom in' disabled={!ready || factor >= ZOOM_MAX} onClick={() => zoomBy(1)}>
						<PlusIcon />
					</Button>
				</div>

				
				<div className='flex items-center gap-1'>
					<input
						value={draft ?? String(page)}
						inputMode='numeric'
						aria-label='Page number'
						disabled={!ready}
						onBlur={commitDraft}
						onFocus={(event) => event.currentTarget.select()}
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) => event.key === 'Enter' && commitDraft()}
						className='h-8 w-12 rounded-md border border-border bg-surface text-center text-sm text-text tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 disabled:opacity-40'
					/>
					<span className='px-1 text-sm text-text-muted tabular-nums'>of {count || '–'}</span>
				</div>
			</div>
			</ToolbarSlot>

			{failed && (
				<div role='alert' className='flex flex-1 items-center justify-center p-6 text-center text-sm text-text-muted'>
					This PDF could not be loaded.
				</div>
			)}

			{!failed && !ready && (
				<div className='flex flex-1 items-center justify-center'>
					<Spinner label='Loading PDF…' />
				</div>
			)}

			{!failed && doc && base && (
				<div
					ref={scrollerRef}
					tabIndex={0}
					role='region'
					aria-label={title ?? DEFAULT_TITLE}
					onScroll={handleScroll}
					className='relative flex flex-1 flex-col items-center gap-4 overflow-auto p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ring'
				>
					{Array.from({ length: count }, (_, index) => (
						<PdfPage key={index} doc={doc} number={index + 1} count={count} scale={scale} fallback={base} onDoubleClick={onPageDoubleClick} />
					))}
				</div>
			)}
		</div>
	);
};

export default PdfViewer;
export { PdfViewer };
export type { PagePoint };
