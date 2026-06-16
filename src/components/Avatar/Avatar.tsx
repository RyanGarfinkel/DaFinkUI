'use client';

import { Children, isValidElement, cloneElement, useState, HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvatarSize  = 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'square';

interface AvatarBaseProps extends HTMLAttributes<HTMLSpanElement> {
	/** Full name used to derive initials for the fallback (e.g. "Ada Lovelace" → "AL"). */
	name?:      string;
	/** Explicit fallback text — overrides initials derived from `name`. */
	fallback?:  string;
	size?:      AvatarSize;
	shape?:     AvatarShape;
	className?: string;
}

interface AvatarWithImageProps extends AvatarBaseProps {
	src: string;
	/** Required whenever `src` is set — describes the person, not the picture. */
	alt: string;
}

interface AvatarWithoutImageProps extends AvatarBaseProps {
	src?: undefined;
	alt?: string;
}

export type AvatarProps = AvatarWithImageProps | AvatarWithoutImageProps;

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
	/** Maximum number of avatars shown before collapsing into a "+N" indicator. */
	max?:       number;
	size?:      AvatarSize;
	shape?:     AvatarShape;
	children:   React.ReactNode;
	className?: string;
}

// ─── Internals ────────────────────────────────────────────────────────────────

const SIZE_CLASSES: Record<AvatarSize, string> = {
	sm: 'h-7 w-7 text-[10px]',
	md: 'h-9 w-9 text-xs',
	lg: 'h-12 w-12 text-sm',
};

const SHAPE_CLASSES: Record<AvatarShape, string> = {
	circle: 'rounded-full',
	square: 'rounded-[var(--radius)]',
};

export const getInitials = (name: string): string => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const PersonGlyph = ({ className = '' }: { className?: string }) => (
	<svg
		aria-hidden='true'
		viewBox='0 0 24 24'
		fill='currentColor'
		className={['h-[55%] w-[55%]', className].join(' ')}
	>
		<path d='M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2.25c-3.9 0-7.5 2.1-7.5 5.05 0 1.05.85 1.7 1.9 1.7h11.2c1.05 0 1.9-.65 1.9-1.7 0-2.95-3.6-5.05-7.5-5.05Z' />
	</svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

export const Avatar = (
	{
		src,
		alt,
		name,
		fallback,
		size      = 'md',
		shape     = 'circle',
		className = '',
		...props
	}: AvatarProps
) => {
	const [errored, setErrored] = useState(false);
	const [prevSrc, setPrevSrc] = useState(src);

	// Reset error state if the image source changes (state-during-render reset pattern).
	if(prevSrc !== src)
	{
		setPrevSrc(src);
		setErrored(false);
	}

	const showImage    = Boolean(src) && !errored;
	const fallbackText = fallback ?? (name ? getInitials(name) : '');
	const label        = alt ?? name;

	const rootClasses = [
		'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden',
		'border-[length:var(--border-width)] border-surface-border bg-surface-active text-text-muted font-medium',
		SIZE_CLASSES[size],
		SHAPE_CLASSES[shape],
		className,
	].join(' ');

	if (showImage) {
		return (
			<span {...props} className={rootClasses}>
				{/* Native img is intentional — copy-paste library components must not depend on next/image. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={src}
					alt={alt}
					onError={() => setErrored(true)}
					className='h-full w-full object-cover'
				/>
			</span>
		);
	}

	// Fallback: initials (or glyph) are decorative — the accessible name lives
	// on the root via role="img" + aria-label. With no name at all, the avatar
	// is purely decorative and hidden from assistive tech.
	return (
		<span
			{...props}
			{...(label
				? { role: 'img', 'aria-label': label }
				: { 'aria-hidden': true })}
			className={rootClasses}
		>
			{fallbackText
				? <span aria-hidden='true' className='leading-none uppercase'>{fallbackText}</span>
				: <PersonGlyph />}
		</span>
	);
};

// ─── AvatarGroup ──────────────────────────────────────────────────────────────

export const AvatarGroup = (
	{
		max,
		size      = 'md',
		shape     = 'circle',
		children,
		className = '',
		...props
	}: AvatarGroupProps
) => {
	const items    = Children.toArray(children).filter(isValidElement);
	const limit    = max !== undefined && max > 0 ? max : items.length;
	const visible  = items.slice(0, limit);
	const overflow = items.length - visible.length;

	const ringClasses = 'ring-2 ring-surface';

	return (
		<div
			{...props}
			className={['flex items-center -space-x-2', className].join(' ')}
		>
			{visible.map((child, index) => {
				const element = child as React.ReactElement<AvatarProps>;
				return cloneElement(element, {
					key:       element.key ?? index,
					size:      element.props.size  ?? size,
					shape:     element.props.shape ?? shape,
					className: [ringClasses, element.props.className ?? ''].join(' ').trim(),
				});
			})}
			{overflow > 0 && (
				<span
					role='img'
					aria-label={`${overflow} more`}
					className={[
						'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden',
						'border-[length:var(--border-width)] border-surface-border bg-surface-active text-text-muted font-medium',
						SIZE_CLASSES[size],
						SHAPE_CLASSES[shape],
						ringClasses,
					].join(' ')}
				>
					<span aria-hidden='true' className='leading-none'>+{overflow}</span>
				</span>
			)}
		</div>
	);
};

export default Avatar;
