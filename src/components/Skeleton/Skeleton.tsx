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
			className={`animate-pulse bg-surface-active rounded ${className}`}
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
