import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CodeEditor from './CodeEditor';

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
