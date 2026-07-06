'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import Checkbox from '../../components/Checkbox/Checkbox';
import Progress from '../../components/Progress/Progress';
import Button from '../../components/Button/Button';
import { useState } from 'react';

interface OnboardingTask
{
	id: string;
	label: string;
	done: boolean;
}

const INITIAL_TASKS: OnboardingTask[] = [
	{ id: 'create-project',  label: 'Create your first project',   done: false },
	{ id: 'invite-teammate', label: 'Invite a teammate',            done: false },
	{ id: 'connect-github',  label: 'Connect your GitHub repo',     done: false },
	{ id: 'customize-theme', label: 'Customize your theme',         done: false },
	{ id: 'install-cli',     label: 'Install the CLI',              done: false },
];

export const OnboardingChecklist = () => {
	const [tasks, setTasks] = useState<OnboardingTask[]>(INITIAL_TASKS);

	const completedCount = tasks.filter((task) => task.done).length;
	const allComplete = completedCount === tasks.length;

	const toggleTask = (id: string) => {
		setTasks((prev) => prev.map((task) => task.id === id ? { ...task, done: !task.done } : task));
	};

	return (
		<Card className='w-full max-w-md'>
			<CardHeader>
				<h3 className='text-xl font-semibold text-text'>Get started with DaFink UI</h3>
				<p className='text-sm text-text-muted'>Finish these steps to set up your workspace.</p>
				<Progress value={completedCount} max={tasks.length} className='mt-4' />
				<p className='mt-1.5 text-xs text-text-muted'>{completedCount} of {tasks.length} complete</p>
			</CardHeader>
			<CardContent className='flex flex-col gap-3'>
				{tasks.map((task) => (
					<div key={task.id} className='flex items-center gap-2.5'>
						<Checkbox id={task.id} checked={task.done} onChange={() => toggleTask(task.id)} />
						<label
							htmlFor={task.id}
							className={`text-sm cursor-pointer select-none ${task.done ? 'line-through text-text-muted' : 'text-text'}`}
						>
							{task.label}
						</label>
					</div>
				))}
			</CardContent>
			<CardFooter className='flex items-center justify-between'>
				<span className='text-xs text-text-muted'>{completedCount} of {tasks.length} complete</span>
				<Button disabled={!allComplete}>Continue</Button>
			</CardFooter>
		</Card>
	);
};

export default OnboardingChecklist;
