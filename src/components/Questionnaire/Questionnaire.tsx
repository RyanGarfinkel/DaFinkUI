'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import DatePicker from '../../components/DatePicker/DatePicker';
import Slider from '../../components/Slider/Slider';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';

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

export interface QuestionnaireProps {
	/** A single question and its input control to render. Mutually exclusive with `steps`. */
	step?:      QuestionStep;
	/** A sequence of questions to render one at a time inside the same card, with a "Question X of N" progress indicator. Mutually exclusive with `step`. */
	steps?:     QuestionStep[];
	/** When set, the card renders as a locked "You answered: {answer}" summary instead of the input control. Only applies to a single `step`; a `steps` sequence shows its own completed recap once every question is answered. */
	answer?:    string;
	/** Called with the submitted answer, formatted as a display string regardless of control type. For a `steps` sequence, called once at the end with every answer joined together. */
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

interface QuestionInputProps {
	step:     QuestionStep;
	onChange: (display: string | null) => void;
}

// Owns the type-specific control state for exactly one question. Remounted
// (via a `key`) whenever Questionnaire advances to the next step, so it never
// needs to reconcile state across question types.
const QuestionInput = ({ step, onChange }: QuestionInputProps) => {
	const [radioSelected, setRadioSelected] = useState('');
	const [radioOther, setRadioOther] = useState('');
	const [sliderValue, setSliderValue] = useState(step.type === 'slider' ? step.min : 0);
	const [numberValue, setNumberValue] = useState('');
	const [dateValue, setDateValue] = useState<Date | null>(null);

	// A slider always has a value, even untouched, so it's submittable from the start.
	useEffect(() => {
		if(step.type === 'slider') onChange(String(sliderValue));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const selectOption = (id: string) => {
		setRadioSelected(id);
		setRadioOther('');
		onChange(step.type === 'radio' ? (step.options.find((o) => o.id === id)?.label ?? id) : id);
	};

	const handleOtherChange = (e: ChangeEvent<HTMLInputElement>) => {
		setRadioOther(e.target.value);
		setRadioSelected('');
		onChange(e.target.value.trim() || null);
	};

	const handleSliderChange = (value: number) => {
		setSliderValue(value);
		onChange(String(value));
	};

	const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
		setNumberValue(e.target.value);
		onChange(e.target.value.trim() || null);
	};

	const handleDateChange = (date: Date) => {
		setDateValue(date);
		onChange(date.toLocaleDateString());
	};

	if(step.type === 'radio') return (
		<div className='flex flex-col gap-2'>
			{step.options.map((option, index) => (
				<RadioOptionCard
					key={option.id}
					option={option}
					letter={optionLetter(index)}
					checked={radioSelected === option.id}
					name={step.question}
					onSelect={() => selectOption(option.id)}
				/>
			))}
			<Input
				value={radioOther}
				onChange={handleOtherChange}
				placeholder={step.otherPlaceholder ?? 'Describe another option…'}
				aria-label={step.otherPlaceholder ?? 'Describe another option'}
			/>
		</div>
	);

	if(step.type === 'slider') return (
		<Slider value={sliderValue} onValueChange={handleSliderChange} min={step.min} max={step.max} step={step.step} showValue ariaLabel={step.question} />
	);

	if(step.type === 'number') return (
		<Input type='number' value={numberValue} onChange={handleNumberChange} placeholder={step.placeholder} aria-label={step.question} />
	);

	return (
		<DatePicker value={dateValue} onChange={handleDateChange} placeholder='Pick a date' panelSide='top' />
	);
};

export const Questionnaire = ({ step, steps, answer, onAnswer, className = '' }: QuestionnaireProps) => {
	const stepList = steps && steps.length > 0 ? steps : step ? [step] : [];
	const isSequence = stepList.length > 1;

	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<string[]>([]);
	const [pendingValue, setPendingValue] = useState<string | null>(null);
	const [completed, setCompleted] = useState(false);
	const [contentHeight, setContentHeight] = useState<number>();
	const contentRef = useRef<HTMLDivElement>(null);
	const hasCard = !answer && stepList.length > 0;

	useEffect(() => {
		const node = contentRef.current;
		if(!hasCard || !node) return;

		const observer = new ResizeObserver(([entry]) => setContentHeight(entry.target.getBoundingClientRect().height));
		observer.observe(node);
		return () => observer.disconnect();
	}, [hasCard]);

	const wrapperClass = [
		'rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel',
		className,
	].join(' ');

	if(answer)
	{
		return (
			<div className={`flex w-fit max-w-full items-center gap-2 self-start px-3 py-2 ${wrapperClass}`}>
				<CheckIcon />
				<span className='text-sm text-text-muted'>You answered:</span>
				<span className='text-sm font-medium text-text'>{answer}</span>
			</div>
		);
	}

	if(stepList.length === 0) return null;

	const currentStep = stepList[currentIndex];
	const isLast = currentIndex === stepList.length - 1;

	const handleAdvance = () => {
		if(pendingValue === null) return;

		const nextAnswers = [...answers];
		nextAnswers[currentIndex] = pendingValue;
		setAnswers(nextAnswers);
		setPendingValue(null);

		if(isLast)
		{
			setCompleted(true);
			onAnswer(nextAnswers.join('; '));
		}
		else
		{
			setCurrentIndex((i) => i + 1);
		}
	};

	const collapseClass = 'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-[var(--duration-slow)]';

	return (
		<div className={wrapperClass}>
			<div
				className='overflow-hidden motion-safe:transition-[height] motion-safe:duration-[var(--duration-slow)]'
				style={{ height: completed || contentHeight === undefined ? 'auto' : contentHeight }}
			>
				<div ref={contentRef}>
					<div className={collapseClass} style={{ gridTemplateRows: completed ? '0fr' : '1fr' }} aria-hidden={completed} inert={completed}>
						<div className='overflow-hidden'>
							<div className='flex flex-col gap-3 p-4'>
								{isSequence && (
									<div className='flex flex-col gap-1.5'>
										<span className='text-xs font-medium text-text-subtle'>Question {currentIndex + 1} of {stepList.length}</span>
										<div className='h-1 w-full overflow-hidden rounded-full bg-surface-active'>
											<div
												className='h-full rounded-full bg-brand motion-safe:transition-[width] motion-safe:duration-[var(--duration-base)]'
												style={{ width: `${((currentIndex + 1) / stepList.length) * 100}%` }}
											/>
										</div>
									</div>
								)}

								<div className='flex flex-col gap-0.5'>
									<p className='text-sm font-semibold text-text'>{currentStep.question}</p>
									{currentStep.description && <p className='text-xs text-text-muted'>{currentStep.description}</p>}
								</div>

								<QuestionInput key={currentIndex} step={currentStep} onChange={setPendingValue} />

								<Button size='sm' className='self-start' onClick={handleAdvance} disabled={pendingValue === null}>
									{isLast ? 'Submit' : 'Next'}
								</Button>
							</div>
						</div>
					</div>

					<div className={collapseClass} style={{ gridTemplateRows: completed ? '1fr' : '0fr' }}>
						<div className='overflow-hidden'>
							{completed && (
								<div className='flex flex-col gap-1 px-3 py-2'>
									{stepList.map((s, index) => (
										<div key={s.question} className='flex items-baseline gap-2'>
											<CheckIcon />
											<span className='text-xs text-text-muted'>{s.question}</span>
											<span className='text-sm font-medium text-text'>{answers[index]}</span>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Questionnaire;
