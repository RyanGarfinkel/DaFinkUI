'use client';

import DatePicker from '../../components/DatePicker/DatePicker';
import Slider from '../../components/Slider/Slider';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { ChangeEvent, useState } from 'react';

export interface QuestionOption {
	id:           string;
	label:        string;
	description?: string;
}

export type QuestionStep =
	| { type: 'radio';    question: string; description?: string; options: QuestionOption[]; otherPlaceholder?: string }
	| { type: 'slider';   question: string; description?: string; min: number; max: number; step: number }
	| { type: 'number';   question: string; description?: string; placeholder?: string }
	| { type: 'calendar'; question: string; description?: string };

export interface QuestionCardProps {
	/** The question and its input control to render. */
	step:       QuestionStep;
	/** When set, the card renders as a locked "You answered: {answer}" summary instead of the input control. */
	answer?:    string;
	/** Called with the submitted answer, formatted as a display string regardless of control type. */
	onAnswer:   (value: string) => void;
	className?: string;
}

const optionLetter = (index: number) => String.fromCharCode(65 + index);

const CheckIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='shrink-0 text-success' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

interface RadioOptionCardProps {
	option:   QuestionOption;
	letter:   string;
	checked:  boolean;
	name:     string;
	onSelect: () => void;
}

const RadioOptionCard = ({ option, letter, checked, name, onSelect }: RadioOptionCardProps) => (
	<label
		className={[
			'group flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] p-3',
			'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
			checked ? 'border-brand bg-surface-hover' : 'border-surface-border hover:border-surface-border-hover',
		].join(' ')}
	>
		<input type='radio' name={name} checked={checked} onChange={onSelect} className='peer sr-only' />
		<div
			className={[
				'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
				'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
				'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-brand-ring',
				checked ? 'border-brand' : 'border-surface-border group-hover:border-brand',
			].join(' ')}
		>
			<div className={`h-2 w-2 rounded-full bg-brand motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] ${checked ? 'scale-100' : 'scale-0'}`} />
		</div>
		<div className='flex flex-1 flex-col gap-0.5'>
			<span className='text-sm font-medium text-text'>{option.label}</span>
			{option.description && <span className='text-xs text-text-muted'>{option.description}</span>}
		</div>
		<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-active text-xs font-medium text-text-muted'>
			{letter}
		</span>
	</label>
);

export const QuestionCard = ({ step, answer, onAnswer, className = '' }: QuestionCardProps) => {
	const [radioSelected, setRadioSelected] = useState('');
	const [radioOther, setRadioOther] = useState('');
	const [sliderValue, setSliderValue] = useState(step.type === 'slider' ? step.min : 0);
	const [numberValue, setNumberValue] = useState('');
	const [dateValue, setDateValue] = useState<Date | null>(null);

	const wrapperClass = [
		'rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel',
		className,
	].join(' ');

	if(answer)
	{
		return (
			<div className={`flex items-center gap-2 px-3 py-2 ${wrapperClass}`}>
				<CheckIcon />
				<span className='text-sm text-text-muted'>You answered:</span>
				<span className='text-sm font-medium text-text'>{answer}</span>
			</div>
		);
	}

	const handleOtherChange = (e: ChangeEvent<HTMLInputElement>) => {
		setRadioOther(e.target.value);
		setRadioSelected('');
	};

	const handleSubmitAnswer = () => {
		if(step.type === 'radio') onAnswer(radioSelected ? (step.options.find((o) => o.id === radioSelected)?.label ?? radioSelected) : radioOther.trim());
		else if(step.type === 'slider') onAnswer(String(sliderValue));
		else if(step.type === 'number') onAnswer(numberValue.trim());
		else onAnswer(dateValue ? dateValue.toLocaleDateString() : '');
	};

	const canSubmit = step.type === 'radio'
		? (!!radioSelected || radioOther.trim() !== '')
		: step.type === 'number'
			? numberValue.trim() !== ''
			: step.type === 'calendar'
				? dateValue !== null
				: true;

	return (
		<div className={`flex flex-col gap-3 p-4 ${wrapperClass}`}>
			<div className='flex flex-col gap-0.5'>
				<p className='text-sm font-semibold text-text'>{step.question}</p>
				{step.description && <p className='text-xs text-text-muted'>{step.description}</p>}
			</div>

			{step.type === 'radio' && (
				<div className='flex flex-col gap-2'>
					{step.options.map((option, index) => (
						<RadioOptionCard
							key={option.id}
							option={option}
							letter={optionLetter(index)}
							checked={radioSelected === option.id}
							name={step.question}
							onSelect={() => { setRadioSelected(option.id); setRadioOther(''); }}
						/>
					))}
					<Input
						value={radioOther}
						onChange={handleOtherChange}
						placeholder={step.otherPlaceholder ?? 'Describe another option…'}
						aria-label={step.otherPlaceholder ?? 'Describe another option'}
					/>
				</div>
			)}

			{step.type === 'slider' && (
				<Slider value={sliderValue} onValueChange={setSliderValue} min={step.min} max={step.max} step={step.step} showValue ariaLabel={step.question} />
			)}

			{step.type === 'number' && (
				<Input type='number' value={numberValue} onChange={(e) => setNumberValue(e.target.value)} placeholder={step.placeholder} aria-label={step.question} />
			)}

			{step.type === 'calendar' && (
				<DatePicker value={dateValue} onChange={setDateValue} placeholder='Pick a date' />
			)}

			<Button size='sm' className='self-start' onClick={handleSubmitAnswer} disabled={!canSubmit}>Submit</Button>
		</div>
	);
};

export default QuestionCard;
