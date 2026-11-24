import { render, screen, fireEvent, act } from '@testing-library/react';
import CodeEditor, { CodeEditorHandle } from './CodeEditor';
import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { latex } from './latex';

describe('CodeEditor', () => {
	it('renders without errors and shows the initial value', () => {
		const { container } = render(<CodeEditor value='<Button>Click</Button>' onChange={() => {}} />);
		expect(container.querySelector('.cm-content')?.textContent).toBe('<Button>Click</Button>');
	});

	it('blurs the editor when Escape is pressed', () => {
		const { container } = render(<CodeEditor value='<Button />' onChange={() => {}} />);

		const content = container.querySelector('.cm-content') as HTMLElement;
		content.focus();
		expect(document.activeElement).toBe(content);

		fireEvent.keyDown(content, { key: 'Escape' });
		expect(document.activeElement).not.toBe(content);
	});

	it('applies the provided aria-label to the editor region', () => {
		render(<CodeEditor value='' onChange={() => {}} aria-label='JSX code editor' />);
		expect(screen.getByLabelText('JSX code editor')).toBeInTheDocument();
	});

	it('highlights LaTeX commands, comments and math when given the latex language', () => {
		const { container } = render(<CodeEditor language={latex} value={'\\section{Intro} % note\n$x^2$'} onChange={() => {}} />);
		expect(container.querySelector('.cm-content')?.textContent).toContain('\\section{Intro}');
		expect(container.querySelectorAll('.cm-content span[class]').length).toBeGreaterThan(0);
	});

	it('selects and focuses a line through the ref', () => {
		const ref = createRef<CodeEditorHandle>();
		const { container } = render(<CodeEditor ref={ref} value={'one\ntwo\nthree'} onChange={() => {}} />);

		act(() => ref.current?.revealLine(2));

		expect(window.getSelection()?.toString()).toBe('two');
		expect(document.activeElement).toBe(container.querySelector('.cm-content'));
	});

	it('keeps the ref line inside the document', () => {
		const ref = createRef<CodeEditorHandle>();
		render(<CodeEditor ref={ref} value={'one\ntwo'} onChange={() => {}} />);

		expect(() => act(() => ref.current?.revealLine(99))).not.toThrow();
		expect(() => act(() => ref.current?.revealLine(0))).not.toThrow();
	});

	it('wraps long lines only when wrap is set', () => {
		const { container, rerender } = render(<CodeEditor value='x' onChange={() => {}} />);
		expect(container.querySelector('.cm-lineWrapping')).toBeNull();

		rerender(<CodeEditor value='x' onChange={() => {}} wrap />);
		expect(container.querySelector('.cm-lineWrapping')).not.toBeNull();
	});

	it('merges a custom className onto the root wrapper', () => {
		const { container } = render(<CodeEditor value='' onChange={() => {}} className='my-custom-class' />);
		expect(container.firstChild).toHaveClass('my-custom-class');
	});

	it('renders the light theme by default', () => {
		const { container } = render(<CodeEditor value='' onChange={() => {}} />);
		expect(container.querySelector('.cm-theme-light')).toBeInTheDocument();
	});

	it('switches to the dark theme when the document root has the dark class', () => {
		document.documentElement.classList.add('dark');
		const { container } = render(<CodeEditor value='' onChange={() => {}} />);
		expect(container.querySelector('.cm-theme-dark')).toBeInTheDocument();
		document.documentElement.classList.remove('dark');
	});
});
