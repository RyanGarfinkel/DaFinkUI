'use client';

import { useRef, type MouseEvent, type ReactNode } from 'react';

export interface TiltProps
{
	children: ReactNode;
	max?: number;
	scale?: number;
	perspective?: number;
	className?: string;
}

const Tilt = ({
	children,
	max = 15,
	scale = 1.05,
	perspective = 1000,
	className = '',
}: TiltProps) =>
{
	const ref = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) =>
	{
		const el = ref.current;
		if(!el) return;

		const rect = el.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;

		const rotateX = -y * max * 2;
		const rotateY = x * max * 2;

		el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
		el.style.transition = 'transform 0.1s ease-out';
	};

	const handleMouseLeave = () =>
	{
		const el = ref.current;
		if(!el) return;

		el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
		el.style.transition = 'transform 0.5s ease-out';
	};

	return (
		<div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className={`will-change-transform transform-gpu ${className}`}
		>
			{children}
		</div>
	);
};

export default Tilt;
