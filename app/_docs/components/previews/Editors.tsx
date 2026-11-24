'use client';

import { SlideCanvas, type SlideElement } from '@/src/components/SlideCanvas/SlideCanvas';
import { DocEditor } from '@/src/components/DocEditor/DocEditor';
import CodeEditor from '@/src/components/CodeEditor/CodeEditor';
import { Badge } from '@/src/components/Badge/Badge';
import { useState } from 'react';

interface DemoSlideElement extends SlideElement {
	kind:  'badge' | 'title' | 'subtitle' | 'block';
	text?: string;
}

const INITIAL_SLIDE_ELEMENTS: DemoSlideElement[] = [
	{ id: 'badge', label: 'Status badge', kind: 'badge', text: 'Q3 2026', x: 96, y: 130, width: 120, height: 40 },
	{ id: 'title', label: 'Title', kind: 'title', text: 'Quarterly review', x: 96, y: 200, width: 760, height: 120 },
	{ id: 'subtitle', label: 'Subtitle', kind: 'subtitle', text: 'Growth, retention, and what is next', x: 96, y: 330, width: 640, height: 60 },
	{ id: 'shape', label: 'Accent block', kind: 'block', x: 920, y: 160, width: 260, height: 400 },
];

const renderDemoSlideElement = (el: DemoSlideElement) => {
	switch(el.kind)
	{
	case 'badge':    return <Badge variant='success' className='text-lg'>{el.text}</Badge>;
	case 'title':    return <h2 className='text-6xl font-semibold text-text'>{el.text}</h2>;
	case 'subtitle': return <p className='text-3xl text-text-muted'>{el.text}</p>;
	case 'block':    return <div className='h-full w-full rounded-[var(--radius-lg)] bg-surface-active' />;
	}
};

export const SlideCanvasPreview = () => {
	const [elements, setElements] = useState(INITIAL_SLIDE_ELEMENTS);

	return (
		<div className='w-full max-w-3xl'>
			<SlideCanvas
				elements={elements}
				onElementsChange={setElements}
				renderElement={renderDemoSlideElement}
				gridSize={8}
			/>
		</div>
	);
};

const INITIAL_DOCUMENT = '<h1>Q3 review</h1><p>Signups grew <strong>18%</strong> month over month, led by the new onboarding flow.</p><ul><li><p>Retention held at 42%</p></li><li><p>Support tickets fell again</p></li></ul>';

export const DocEditorPreview = () => {
	const [html, setHtml] = useState(INITIAL_DOCUMENT);

	return (
		<div className='w-full max-w-3xl'>
			<DocEditor value={html} onChange={setHtml} title='Q3 review' height='28rem' />
		</div>
	);
};

export const CodeEditorPreview = () => {
	const [code, setCode] = useState('<Button>Click me</Button>');

	return (
		<div className='w-full max-w-2xl'>
			<CodeEditor value={code} onChange={setCode} aria-label='JSX code editor' minHeight='160px' />
		</div>
	);
};
