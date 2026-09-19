'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import { ToggleGroup, ToggleGroupItem } from '../../components/ToggleGroup/ToggleGroup';
import { RadioGroup, RadioItem } from '../../components/Radio/Radio';
import Message from '../../components/Message/Message';
import Textarea from '../../components/Textarea/Textarea';
import Progress from '../../components/Progress/Progress';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import { useState } from 'react';

const STEPS = [
	{
		id:       'helpfulness',
		question: 'Before I continue, how helpful was that last response?',
	},
	{
		id:       'rating',
		question: 'And how would you rate your overall experience so far?',
	},
	{
		id:       'feedback',
		question: 'Anything specific you’d like me to change? This part is optional.',
	},
] as const;

const HELPFULNESS_OPTIONS = [
	{ value: 'very',      label: 'Very helpful' },
	{ value: 'somewhat',  label: 'Somewhat helpful' },
	{ value: 'not',       label: 'Not helpful' },
];

const RATING_OPTIONS = ['1', '2', '3', '4', '5'];

interface Answers
{
	helpfulness: string;
	rating:      string;
	feedback:    string;
}

const INITIAL_ANSWERS: Answers = { helpfulness: '', rating: '', feedback: '' };

export const AiQuestionnaire = () => {
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
	const [submitted, setSubmitted] = useState(false);

	const currentStep = STEPS[step];
	const isLastStep  = step === STEPS.length - 1;
	const canAdvance  = currentStep.id === 'feedback'
		|| (currentStep.id === 'helpfulness' && !!answers.helpfulness)
		|| (currentStep.id === 'rating' && !!answers.rating);

	const handleNext = () => {
		if(isLastStep) setSubmitted(true);
		else setStep((s) => s + 1);
	};

	const handleBack = () => setStep((s) => Math.max(0, s - 1));

	const handleStartOver = () => {
		setStep(0);
		setAnswers(INITIAL_ANSWERS);
		setSubmitted(false);
	};

	return (
		<Card className='w-full max-w-md'>
			<CardHeader className='flex flex-col gap-4'>
				<div className='flex items-center justify-between'>
					<h3 className='text-base font-semibold text-text'>Quick feedback</h3>
					<Badge variant={submitted ? 'success' : 'default'}>
						{submitted ? 'Submitted' : 'Human input requested'}
					</Badge>
				</div>
				{!submitted && <Progress value={step + 1} max={STEPS.length} />}
			</CardHeader>
			<CardContent>
				{submitted ? (
					<Message variant='received' bubble={false}>
						Thanks, that’s really helpful. I’ll use this to improve my next response.
					</Message>
				) : (
					<div className='flex flex-col gap-4'>
						<Message variant='received' bubble={false}>{currentStep.question}</Message>

						{currentStep.id === 'helpfulness' && (
							<RadioGroup name='helpfulness' value={answers.helpfulness}
								onValueChange={(v) => setAnswers((a) => ({ ...a, helpfulness: v }))}>
								{HELPFULNESS_OPTIONS.map((option) => (
									<RadioItem key={option.value} value={option.value} label={option.label} />
								))}
							</RadioGroup>
						)}

						{currentStep.id === 'rating' && (
							<ToggleGroup type='single' value={answers.rating} size='md' aria-label='Experience rating'
								onValueChange={(v) => setAnswers((a) => ({ ...a, rating: v as string }))}>
								{RATING_OPTIONS.map((option) => (
									<ToggleGroupItem key={option} value={option}>{option}</ToggleGroupItem>
								))}
							</ToggleGroup>
						)}

						{currentStep.id === 'feedback' && (
							<Textarea
								value={answers.feedback}
								onChange={(e) => setAnswers((a) => ({ ...a, feedback: e.target.value }))}
								placeholder='Type your thoughts…'
								aria-label='Additional feedback'
								rows={3}
							/>
						)}
					</div>
				)}
			</CardContent>
			<CardFooter className='flex items-center justify-between'>
				{submitted ? (
					<Button variant='outlined' size='sm' onClick={handleStartOver} className='w-full'>
						Start over
					</Button>
				) : (
					<>
						<Button variant='ghost' size='sm' onClick={handleBack} disabled={step === 0}>
							Back
						</Button>
						<Button size='sm' onClick={handleNext} disabled={!canAdvance}>
							{isLastStep ? 'Submit' : 'Next'}
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	);
};

export default AiQuestionnaire;
