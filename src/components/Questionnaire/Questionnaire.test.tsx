import { render, screen, fireEvent, act } from '@testing-library/react';
import Questionnaire, { type QuestionStep } from './Questionnaire';
import { describe, it, expect, vi } from 'vitest';

const RADIO_STEP: QuestionStep = {
	type:        'radio',
	question:    'What kind of feature is this?',
	description: 'Pick the category that fits best.',
	options: [
		{ id: 'ui',          label: 'UI improvement', description: 'A visual or interaction change' },
		{ id: 'integration', label: 'Integration' },
	],
	otherPlaceholder: 'Describe another kind…',
};

const SLIDER_STEP: QuestionStep = {
	type:     'slider',
	question: 'How urgent is this?',
	min:      1,
	max:      5,
	step:     1,
};

const NUMBER_STEP: QuestionStep = {
	type:        'number',
	question:    'How many users are affected?',
	placeholder: 'e.g. 12',
};

const CALENDAR_STEP: QuestionStep = {
	type:     'calendar',
	question: 'When do you need this by?',
};

describe('Questionnaire', () =>
{
	it('renders without errors', () =>
	{
		render(<Questionnaire step={RADIO_STEP} onAnswer={() => {}} />);
		expect(screen.getByText('What kind of feature is this?')).toBeDefined();
	});

	it('renders a radio step with its options', () =>
	{
		render(<Questionnaire step={RADIO_STEP} onAnswer={() => {}} />);
		expect(screen.getByText('UI improvement')).toBeDefined();
		expect(screen.getByText('Integration')).toBeDefined();
	});

	it('renders a slider step', () =>
	{
		render(<Questionnaire step={SLIDER_STEP} onAnswer={() => {}} />);
		expect(screen.getByRole('slider')).toBeDefined();
	});

	it('renders a number step', () =>
	{
		render(<Questionnaire step={NUMBER_STEP} onAnswer={() => {}} />);
		expect(screen.getByPlaceholderText('e.g. 12')).toBeDefined();
	});

	it('renders a calendar step', () =>
	{
		render(<Questionnaire step={CALENDAR_STEP} onAnswer={() => {}} />);
		expect(screen.getByText('Pick a date')).toBeDefined();
	});

	it('disables the advance button until the question has a value', () =>
	{
		render(<Questionnaire step={RADIO_STEP} onAnswer={() => {}} />);
		expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
	});

	it('enables the advance button once an option is selected', () =>
	{
		render(<Questionnaire step={RADIO_STEP} onAnswer={() => {}} />);
		fireEvent.click(screen.getByText('UI improvement'));
		expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
	});

	it('calls onAnswer with the selected option label on submit', () =>
	{
		const handler = vi.fn();
		render(<Questionnaire step={RADIO_STEP} onAnswer={handler} />);
		fireEvent.click(screen.getByText('UI improvement'));
		fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
		expect(handler).toHaveBeenCalledWith('UI improvement');
	});

	it('shows a "Question X of N" progress indicator for a multi-step sequence', () =>
	{
		render(<Questionnaire steps={[RADIO_STEP, NUMBER_STEP]} onAnswer={() => {}} />);
		expect(screen.getByText('Question 1 of 2')).toBeDefined();
	});

	it('advances through a steps sequence and joins every answer on submit', () =>
	{
		const handler = vi.fn();
		render(<Questionnaire steps={[RADIO_STEP, NUMBER_STEP]} onAnswer={handler} />);

		fireEvent.click(screen.getByText('UI improvement'));
		fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		expect(screen.getByText('Question 2 of 2')).toBeDefined();

		fireEvent.change(screen.getByPlaceholderText('e.g. 12'), { target: { value: '5' } });
		fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
		expect(handler).toHaveBeenCalledWith('UI improvement; 5');
	});

	it('collapses the question section and shows a compact recap once every question is answered', () =>
	{
		const { container } = render(<Questionnaire steps={[RADIO_STEP, NUMBER_STEP]} onAnswer={() => {}} />);

		fireEvent.click(screen.getByText('UI improvement'));
		fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		fireEvent.change(screen.getByPlaceholderText('e.g. 12'), { target: { value: '5' } });

		const questionSection = container.querySelector('[aria-hidden="false"]') as HTMLElement;
		expect(questionSection.style.gridTemplateRows).toBe('1fr');

		fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

		const collapsed = container.querySelector('[aria-hidden="true"][inert]') as HTMLElement;
		expect(collapsed.style.gridTemplateRows).toBe('0fr');
		expect(screen.getByText('5', { selector: 'span' })).toBeDefined();
	});

	it('sizes the card to its current content height, and releases the height once completed', () =>
	{
		const original = global.ResizeObserver;
		let notify: (height: number) => void = () => {};

		global.ResizeObserver = class
		{
			constructor(callback: ResizeObserverCallback)
			{
				notify = (height) => callback([{ target: { getBoundingClientRect: () => ({ height }) } } as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
			}
			observe()   {}
			unobserve() {}
			disconnect() {}
		};

		const { container } = render(<Questionnaire step={NUMBER_STEP} onAnswer={() => {}} />);
		const sizer = container.querySelector('.overflow-hidden.motion-safe\\:transition-\\[height\\]') as HTMLElement;
		expect(sizer.style.height).toBe('auto');

		act(() => notify(180));
		expect(sizer.style.height).toBe('180px');

		fireEvent.change(screen.getByPlaceholderText('e.g. 12'), { target: { value: '5' } });
		fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
		expect(sizer.style.height).toBe('auto');

		global.ResizeObserver = original;
	});

	it('renders a locked summary when answer is provided', () =>
	{
		render(<Questionnaire step={RADIO_STEP} answer='UI improvement' onAnswer={() => {}} />);
		expect(screen.getByText('You answered:')).toBeDefined();
		expect(screen.getByText('UI improvement')).toBeDefined();
	});

	it('sizes the locked summary to its content instead of stretching full width', () =>
	{
		render(<Questionnaire step={RADIO_STEP} answer='UI improvement' onAnswer={() => {}} />);
		const summary = screen.getByText('You answered:').parentElement;
		expect(summary?.className).toContain('w-fit');
		expect(summary?.className).toContain('self-start');
	});

	it('exposes an accessible label on the free-text "other" field', () =>
	{
		render(<Questionnaire step={RADIO_STEP} onAnswer={() => {}} />);
		expect(screen.getByLabelText('Describe another kind…')).toBeDefined();
	});

	it('applies a focus-visible ring class to the radio option indicator', () =>
	{
		const { container } = render(<Questionnaire step={RADIO_STEP} onAnswer={() => {}} />);
		const indicator = container.querySelector('[class*="peer-focus-visible:ring-2"]');
		expect(indicator).not.toBeNull();
	});

	it('forwards className to the root wrapper', () =>
	{
		const { container } = render(<Questionnaire step={RADIO_STEP} onAnswer={() => {}} className='custom-class' />);
		expect((container.firstChild as HTMLElement).classList.contains('custom-class')).toBe(true);
	});
});
