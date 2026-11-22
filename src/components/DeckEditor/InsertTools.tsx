'use client';

import { SHAPE_TOOLS, createChart, createDefault, createImage, createTable } from './elements';
import { ChangeEvent, useRef } from 'react';
import type { DrawTool } from './elements';
import type { DeckElement } from './deck';
import { Menu } from '../Menu/Menu';
import { Glyph } from './icons';

interface InsertToolsProps {
	tool:         DrawTool | null;
	onToolChange: (tool: DrawTool | null) => void;
	onInsert:     (element: DeckElement) => void;
	buttonClass:  string;
	onError:      (message: string) => void;
	/** Drops the toolbar's own box (border, background, layout) so its buttons flow in the bar that shares it. */
	bare?:        boolean;
}

const readImage = (file: File) => new Promise<{ src: string; width: number; height: number }>((resolve, reject) =>
{
	const reader = new FileReader();
	reader.onerror = () => reject(new Error(`Couldn't read ${file.name}`));
	reader.onload = () =>
	{
		const src = reader.result as string;
		const image = new Image();
		image.onload = () => resolve({ src, width: image.naturalWidth, height: image.naturalHeight });
		image.onerror = () => reject(new Error(`${file.name} isn't an image this browser can open`));
		image.src = src;
	};
	reader.readAsDataURL(file);
});

export const InsertTools = ({ tool, onToolChange, onInsert, buttonClass, onError, bare = false }: InsertToolsProps) => {
	const fileRef = useRef<HTMLInputElement>(null);
	// Drawing needs a pointer. When a tool is picked from the keyboard, insert a
	// default-size element instead, so every tool works without a mouse.
	const keyboardRef = useRef(false);

	const choose = (next: DrawTool) => {
		if(keyboardRef.current) onInsert(createDefault(next));
		else onToolChange(tool === next ? null : next);
	};

	const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if(!file) return;
		try
		{
			const { src, width, height } = await readImage(file);
			onInsert(createImage(src, file.name.replace(/\.[^.]+$/, ''), { width, height }));
		}
		catch(error)
		{
			onError(error instanceof Error ? error.message : 'Couldn\'t add that image.');
		}
	};

	const shapeActive = SHAPE_TOOLS.some(s => s.tool === tool);

	return (
		<div
			role='toolbar'
			aria-label='Insert'
			onPointerDownCapture={() => { keyboardRef.current = false; }}
			onKeyDownCapture={() => { keyboardRef.current = true; }}
			className={`flex items-center gap-0.5 ${bare ? 'contents' : 'rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface p-1'}`}
		>
			<button
				type='button'
				aria-label='Text box'
				title='Text box: drag on the slide'
				aria-pressed={tool === 'text'}
				onClick={() => choose('text')}
				className={`${buttonClass} ${tool === 'text' ? 'bg-surface-active' : ''}`}
			>
				<Glyph name='text' />
			</button>
			<button type='button' aria-label='Image' title='Image' onClick={() => fileRef.current?.click()} className={buttonClass}>
				<Glyph name='image' />
			</button>
			<input ref={fileRef} type='file' accept='image/*' tabIndex={-1} aria-hidden='true' onChange={handleFile} className='sr-only' />
			<button type='button' aria-label='Table' title='Table' onClick={() => onInsert(createTable())} className={buttonClass}>
				<Glyph name='table' />
			</button>
			<button type='button' aria-label='Chart' title='Chart' onClick={() => onInsert(createChart())} className={buttonClass}>
				<Glyph name='chart' />
			</button>
			<Menu
				unstyledTrigger
				triggerClassName={`${buttonClass} ${shapeActive ? 'bg-surface-active' : ''}`}
				triggerProps={{ 'aria-label': 'Shapes, lines, and arrows', title: 'Shapes' }}
				trigger={<><Glyph name='shapes' /><Glyph name='chevronDown' size={12} className='text-text-muted' /></>}
				items={SHAPE_TOOLS.flatMap(s => [
					...(s.tool === 'line' ? [{ separator: true as const }] : []),
					{ label: s.label, selected: tool === s.tool, onSelect: () => choose(s.tool) },
				])}
			/>
		</div>
	);
};
