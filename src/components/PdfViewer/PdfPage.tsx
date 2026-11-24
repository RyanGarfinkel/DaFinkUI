'use client';

import { CSSProperties, MouseEvent, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface PageSize {
	width:  number;
	height: number;
}

export interface PagePoint {
	page: number;
	x:    number;
	y:    number;
}

interface PdfPageProps {
	doc:           PDFDocumentProxy;
	number:        number;
	count:         number;
	scale:         number;
	fallback:      PageSize;
	onDoubleClick?: (point: PagePoint) => void;
}

const PRELOAD_MARGIN = '1000px 0px';

// The page canvas is always white, so the selection color is fixed instead of themed.
const TEXT_LAYER = [
	'.pdf-text-layer{position:absolute;inset:0;overflow:clip;line-height:1;transform-origin:0 0;',
	'--min-font-size:1;--text-scale-factor:calc(var(--total-scale-factor)*var(--min-font-size));',
	'--min-font-size-inv:calc(1/var(--min-font-size))}',
	'.pdf-text-layer .markedContent{display:contents}',
	'.pdf-text-layer span,.pdf-text-layer br{position:absolute;white-space:pre;color:transparent;cursor:text;',
	'user-select:text;transform-origin:0 0}',
	'.pdf-text-layer>:not(.markedContent),.pdf-text-layer .markedContent span:not(.markedContent){',
	'--font-height:0;--scale-x:1;--rotate:0deg;font-size:calc(var(--text-scale-factor)*var(--font-height));',
	'transform:rotate(var(--rotate)) scaleX(var(--scale-x)) scale(var(--min-font-size-inv))}',
	'.pdf-text-layer ::selection{background:rgb(59 130 246/.4);color:transparent}',
].join('');

const PdfPage = ({ doc, number, count, scale, fallback, onDoubleClick }: PdfPageProps) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const [natural, setNatural] = useState<PageSize | null>(null);
	const [failed, setFailed] = useState(false);
	const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');

	useEffect(() => {
		const root = rootRef.current;
		if(!root || typeof IntersectionObserver === 'undefined') return;

		const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: PRELOAD_MARGIN });
		observer.observe(root);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const text = textRef.current;
		if(!canvas || !text) return;

		if(!near)
		{
			canvas.width = 0;
			canvas.height = 0;
			return;
		}

		let cancelled = false;
		let cancelRender = () => {};

		const draw = async () => {
			const [page, { TextLayer }] = await Promise.all([doc.getPage(number), import('pdfjs-dist')]);
			if(cancelled) return;

			const ratio = window.devicePixelRatio || 1;
			const viewport = page.getViewport({ scale });
			const sharp = page.getViewport({ scale: scale * ratio });
			const { width, height } = page.getViewport({ scale: 1 });
			setNatural({ width, height });

			canvas.width = sharp.width;
			canvas.height = sharp.height;

			const task = page.render({ canvas, viewport: sharp });
			const textLayer = new TextLayer({ textContentSource: page.streamTextContent(), container: text, viewport });
			cancelRender = () => {
				task.cancel();
				textLayer.cancel();
				text.replaceChildren();
			};

			await Promise.all([task.promise, textLayer.render()]);
			setFailed(false);
		};

		draw().catch(() => {
			if(!cancelled) setFailed(true);
		});

		return () => {
			cancelled = true;
			cancelRender();
		};
	}, [near, doc, number, scale]);

	const size = natural ?? fallback;

	const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
		const { left, top } = event.currentTarget.getBoundingClientRect();
		onDoubleClick?.({ page: number, x: (event.clientX - left) / scale, y: (event.clientY - top) / scale });
	};

	return (
		<div
			ref={rootRef}
			onDoubleClick={handleDoubleClick}
			role='img'
			aria-label={`Page ${number} of ${count}`}
			data-page={number}
			className='relative shrink-0 bg-surface shadow-sm ring-1 ring-border'
			style={{ width: size.width * scale, height: size.height * scale, '--total-scale-factor': scale, '--scale-round-x': '1px', '--scale-round-y': '1px' } as CSSProperties}
		>
			<canvas ref={canvasRef} className='absolute inset-0 h-full w-full' aria-hidden='true' />
			<style href='pdf-text-layer' precedence='default'>{TEXT_LAYER}</style>
			<div ref={textRef} className='pdf-text-layer' />
			{failed && (
				<p role='alert' className='absolute inset-0 flex items-center justify-center text-sm text-text-muted'>
					This page could not be displayed.
				</p>
			)}
		</div>
	);
};

export default PdfPage;
