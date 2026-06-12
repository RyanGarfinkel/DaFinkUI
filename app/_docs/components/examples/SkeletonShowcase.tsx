'use client';

import {
	Skeleton,
	SkeletonCard,
	SkeletonForm,
	SkeletonInput,
	SkeletonTableRow,
} from '@/src/components/Skeleton/Skeleton';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';

// ─── Individual examples ──────────────────────────────────────────────────────

const EXAMPLES: Array<{
	id:      string;
	title:   string;
	desc:    string;
	code:    string;
	preview: React.ReactNode;
}> = [
	{
		id:    'base',
		title: 'Skeleton',
		desc:  'The base block. Compose it freely with width, height, and className to match any shape.',
		code: `import { Skeleton } from '@/src/components/Skeleton/Skeleton';

export default function Example() {
  return (
    <div className="flex flex-col gap-3 w-64">
      {/* Heading line */}
      <Skeleton width="55%" height="1.25rem" />

      {/* Body lines */}
      <Skeleton height="0.875rem" />
      <Skeleton width="85%" height="0.875rem" />
      <Skeleton width="70%" height="0.875rem" />

      {/* Avatar */}
      <Skeleton width="2.5rem" height="2.5rem" className="rounded-full" />
    </div>
  );
}`,
		preview: (
			<div className='flex flex-col gap-3 w-64'>
				<Skeleton width='55%' height='1.25rem' />
				<Skeleton height='0.875rem' />
				<Skeleton width='85%' height='0.875rem' />
				<Skeleton width='70%' height='0.875rem' />
				<Skeleton width='2.5rem' height='2.5rem' className='rounded-full' />
			</div>
		),
	},
	{
		id:    'card',
		title: 'SkeletonCard',
		desc:  'Mimics a card with a title bar and a configurable number of body lines.',
		code: `import { SkeletonCard } from '@/src/components/Skeleton/Skeleton';

export default function Example() {
  return (
    <div className="flex flex-col gap-4 w-72">
      <SkeletonCard lines={3} />
      <SkeletonCard lines={2} />
    </div>
  );
}`,
		preview: (
			<div className='flex flex-col gap-4 w-72'>
				<SkeletonCard lines={3} />
				<SkeletonCard lines={2} />
			</div>
		),
	},
	{
		id:    'input',
		title: 'SkeletonInput',
		desc:  'Mimics a labelled form input. Pass label to include the label placeholder.',
		code: `import { SkeletonInput } from '@/src/components/Skeleton/Skeleton';

export default function Example() {
  return (
    <div className="flex flex-col gap-4 w-72">
      <SkeletonInput label />
      <SkeletonInput />
    </div>
  );
}`,
		preview: (
			<div className='flex flex-col gap-4 w-72'>
				<SkeletonInput label />
				<SkeletonInput />
			</div>
		),
	},
	{
		id:    'form',
		title: 'SkeletonForm',
		desc:  'Stacks multiple labelled SkeletonInput fields — useful while a form section loads.',
		code: `import { SkeletonForm } from '@/src/components/Skeleton/Skeleton';

export default function Example() {
  return <SkeletonForm fields={4} className="w-72" />;
}`,
		preview: <SkeletonForm fields={4} className='w-72' />,
	},
	{
		id:    'table-row',
		title: 'SkeletonTableRow',
		desc:  'A row of equal-width columns — stack several to simulate a full table body.',
		code: `import { SkeletonTableRow } from '@/src/components/Skeleton/Skeleton';

export default function Example() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-lg">
      {/* Header row slightly taller */}
      <SkeletonTableRow columns={4} className="[&>*]:h-4" />

      {/* Data rows */}
      <SkeletonTableRow columns={4} />
      <SkeletonTableRow columns={4} />
      <SkeletonTableRow columns={4} />
    </div>
  );
}`,
		preview: (
			<div className='flex flex-col gap-3 w-full max-w-lg'>
				<SkeletonTableRow columns={4} className='[&>*]:h-4' />
				<SkeletonTableRow columns={4} />
				<SkeletonTableRow columns={4} />
				<SkeletonTableRow columns={4} />
			</div>
		),
	},
];

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const SkeletonShowcase = () => {
	return (
		<div className='flex flex-col gap-10'>
			{EXAMPLES.map((ex) => (
				<section key={ex.id} className='flex flex-col gap-1'>
					<h3 className='text-sm font-semibold text-text font-mono'>{ex.title}</h3>
					<p className='text-sm text-text-muted mb-3'>{ex.desc}</p>
					<CodeBlock variant='example'label={ex.id} code={ex.code} minHeight='120px' align='start'>
						{ex.preview}
					</CodeBlock>
				</section>
			))}
		</div>
	);
};
