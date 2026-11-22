'use client';

import Questionnaire, { type QuestionStep } from '@/src/components/Questionnaire/Questionnaire';

const FEATURE_STEPS: QuestionStep[] = [
	{
		type: 'radio',
		question: 'What kind of feature is this?',
		description: 'Pick the category that fits best.',
		options: [
			{ id: 'ui', label: 'UI improvement', description: 'A visual or interaction change' },
			{ id: 'integration', label: 'Integration', description: 'Connects to another tool or API' },
			{ id: 'automation', label: 'Automation', description: 'Removes a manual step' },
		],
		otherPlaceholder: 'Describe another kind…',
	},
	{
		type: 'slider',
		question: 'How urgent is this?',
		description: 'Drag to set a priority level from 1 (low) to 5 (high).',
		min: 1,
		max: 5,
		step: 1,
	},
	{
		type: 'calendar',
		question: 'When do you need this by?',
		description: 'Pick a target date.',
	},
];

const BUG_STEPS: QuestionStep[] = [
	{
		type: 'radio',
		question: 'How severe is this bug?',
		description: 'Choose the closest match.',
		options: [
			{ id: 'blocker', label: 'Blocker', description: 'Nothing works until this is fixed' },
			{ id: 'major', label: 'Major', description: 'A core flow is broken' },
			{ id: 'minor', label: 'Minor', description: 'An edge case or cosmetic issue' },
		],
		otherPlaceholder: 'Describe the impact…',
	},
	{
		type: 'number',
		question: 'How many users are affected?',
		description: 'A rough estimate is fine.',
		placeholder: 'e.g. 12',
	},
	{
		type: 'calendar',
		question: 'When did you first notice it?',
		description: 'Pick the date it started.',
	},
];

const ONBOARDING_STEPS: QuestionStep[] = [
	{
		type: 'radio',
		question: "How's the rollout going?",
		description: 'Pick the closest status.',
		options: [
			{ id: 'on-track', label: 'On track', description: 'No blockers so far' },
			{ id: 'needs-help', label: 'Needs help', description: 'Making progress, but stuck somewhere' },
			{ id: 'blocked', label: 'Blocked', description: 'Can’t move forward right now' },
		],
		otherPlaceholder: 'Describe the status…',
	},
	{
		type: 'slider',
		question: 'How confident are you in the plan?',
		description: 'Drag to set a confidence level from 1 (low) to 5 (high).',
		min: 1,
		max: 5,
		step: 1,
	},
	{
		type: 'number',
		question: 'How many team members have you onboarded so far?',
		placeholder: 'e.g. 4',
	},
];

export const QuestionnairePreview = () => (
	<div className='grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-3'>
		<Questionnaire steps={FEATURE_STEPS} onAnswer={(value) => console.log(value)} className='w-full' />
		<Questionnaire steps={BUG_STEPS} onAnswer={(value) => console.log(value)} className='w-full' />
		<Questionnaire steps={ONBOARDING_STEPS} onAnswer={(value) => console.log(value)} className='w-full' />
	</div>
);
