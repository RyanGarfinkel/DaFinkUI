'use client';

import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import Button from '@/src/components/Button/Button';
import { useState, useEffect } from 'react';

const STEPS = [
	{ title: 'Clone repository',       body: 'main @ a1b2c3d · 0.4s'          },
	{ title: 'Install dependencies',   body: '847 packages installed · 4.2s'  },
	{ title: 'Run test suite',         body: '47 tests passed · 1.1s'          },
	{ title: 'Build for production',   body: 'Bundle 142 kb gzipped · 8.3s'   },
	{ title: 'Deploy to edge network', body: 'Live at myapp.vercel.app · 2.0s' },
];

export const TimelineDeployDemo = () => {
    const [count,    setCount]    = useState(1);
    const [newIndex, setNewIndex] = useState<number | null>(null);

    const runNextStep = () => {
		if (count >= STEPS.length) return;
		setNewIndex(count);
		setCount((c) => c + 1);
	};

    useEffect(() => {
		if (newIndex === null) return;
		const id = setTimeout(() => setNewIndex(null), 500);
		return () => clearTimeout(id);
	}, [newIndex]);

    const done = count >= STEPS.length;

    return (
		<>
			<style>{`
				@keyframes stepIn {
					from { opacity: 0; transform: translateY(8px); }
					to   { opacity: 1; transform: translateY(0);   }
				}
				.step-enter { animation: stepIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }

				@keyframes dotPop {
					0%   { transform: scale(1);    }
					40%  { transform: scale(1.35); }
					100% { transform: scale(1);    }
				}
				.dot-pop > div:first-child > div:first-child { animation: dotPop 0.4s ease-out; }
			`}</style>

			<div className='flex flex-col gap-6 w-full max-w-sm'>
				<div className='flex items-center justify-between'>
					<p className='text-sm font-medium text-text'>
						{done ? 'Deployment complete ✓' : `Step ${count} of ${STEPS.length}`}
					</p>
					{done ? (
						<Button
							size='sm'
							variant='outlined'
							onClick={() => { setCount(1); setNewIndex(null); }}
						>
							Reset
						</Button>
					) : (
						<Button size='sm' onClick={runNextStep}>
							Run next step
						</Button>
					)}
				</div>

				<Timeline animate='none'>
					{STEPS.slice(0, count).map((step, i) => (
						<TimelineItem
							key={step.title}
							title={step.title}
							className={i === newIndex ? 'step-enter dot-pop' : ''}
						>
							<span className='text-xs text-text-muted'>{step.body}</span>
						</TimelineItem>
					))}
				</Timeline>
			</div>
		</>
	);
};
