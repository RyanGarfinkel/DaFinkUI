'use client';

import QuestionCard, { type QuestionStep } from '@/src/blocks/AiChat/QuestionCard';
import { useState } from 'react';

const RADIO_STEP: QuestionStep = {
	type:        'radio',
	question:    'What should the assistant help with next?',
	description: 'Choose a direction or describe another task.',
	options: [
		{ id: 'bugs',    label: 'Bug triage',       description: 'Find and explain what broke.' },
		{ id: 'feature', label: 'Feature planning', description: 'Sketch the next set of changes.' },
		{ id: 'review',  label: 'Code review',      description: 'Review a PR before it merges.' },
	],
	otherPlaceholder: 'Describe another task…',
};

const SLIDER_STEP: QuestionStep = {
	type:        'slider',
	question:    'How urgent is this?',
	description: 'Drag to set a priority level from 1 (low) to 5 (high).',
	min:         1,
	max:         5,
	step:        1,
};

const CALENDAR_STEP: QuestionStep = {
	type:        'calendar',
	question:    'When do you need this by?',
	description: 'Pick a target date.',
};

const QuestionCardColumn = ({ step }: { step: QuestionStep }) => {
	const [answer, setAnswer] = useState<string | undefined>(undefined);
	return <QuestionCard step={step} answer={answer} onAnswer={setAnswer} className='w-full' />;
};

export const QuestionCardRowDemo = () => (
	<div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-3'>
		<QuestionCardColumn step={RADIO_STEP} />
		<QuestionCardColumn step={SLIDER_STEP} />
		<QuestionCardColumn step={CALENDAR_STEP} />
	</div>
);

export default QuestionCardRowDemo;
