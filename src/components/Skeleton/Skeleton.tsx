import { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement>
{
	width?:     string;
	height?:    string;
	className?: string;
}

export interface SkeletonInputProps
{
	label?:     boolean;
	className?: string;
}

export interface SkeletonCardProps
{
	lines?:     number;
	className?: string;
}

export interface SkeletonTableRowProps
{
	columns?:   number;
	className?: string;
}

export interface SkeletonFormProps
{
	fields?:    number;
	className?: string;
}

export const Skeleton = ({ width, height, className = '', style, ...props }: SkeletonProps) => {
	return (
		<div
			className={`animate-pulse bg-surface-active rounded-[var(--radius-sm)] ${className}`}
			style={{ width, height, ...style }}
			aria-hidden='true'
			{...props}
		/>
	);
};

export const SkeletonInput = ({ label = false, className = '' }: SkeletonInputProps) => {
	return (
		<div className={`flex flex-col gap-1.5 ${className}`} aria-hidden='true'>
			{label && <Skeleton width='30%' height='0.875rem' />}
			<Skeleton height='2.25rem' />
		</div>
	);
};

export const SkeletonCard = ({ lines = 3, className = '' }: SkeletonCardProps) => {
	const lineWidths = ['100%', '85%', '70%', '90%', '60%', '75%', '80%'];

	return (
		<div className={`flex flex-col gap-3 ${className}`} aria-hidden='true'>
			<Skeleton width='55%' height='1.25rem' />
			<div className='flex flex-col gap-2 mt-1'>
				{Array.from({ length: lines }, (_, i) => (
					<Skeleton
						key={i}
						width={lineWidths[i % lineWidths.length]}
						height='0.875rem'
					/>
				))}
			</div>
		</div>
	);
};

export const SkeletonTableRow = ({ columns = 4, className = '' }: SkeletonTableRowProps) => {
	return (
		<div className={`flex gap-4 ${className}`} aria-hidden='true'>
			{Array.from({ length: columns }, (_, i) => (
				<Skeleton
					key={i}
					className='flex-1'
					height='1rem'
				/>
			))}
		</div>
	);
};

export const SkeletonForm = ({ fields = 3, className = '' }: SkeletonFormProps) => {
	return (
		<div className={`flex flex-col gap-4 ${className}`} aria-hidden='true'>
			{Array.from({ length: fields }, (_, i) => (
				<SkeletonInput key={i} label />
			))}
		</div>
	);
};

export interface SkeletonImageProps
{
	aspectRatio?: string;
	className?:   string;
}

export const SkeletonImage = ({ aspectRatio = '16/9', className = '' }: SkeletonImageProps) =>
{
	return (
		<div
			className={`animate-pulse bg-surface-active rounded-[var(--radius-sm)] flex items-center justify-center ${className}`}
			style={{ aspectRatio }}
			aria-hidden='true'
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='32'
				height='32'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
				className='text-text-muted opacity-40'
			>
				<rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
				<circle cx='8.5' cy='8.5' r='1.5' />
				<polyline points='21 15 16 10 5 21' />
			</svg>
		</div>
	);
};
