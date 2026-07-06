'use client';

import { Children, HTMLAttributes, MouseEvent, ReactNode, isValidElement } from 'react';

// ─── Icon Inference ───────────────────────────────────────────────────────────

export type AttachmentIcon = 'file' | 'image' | 'video' | 'audio' | 'archive' | 'code';

const EXTENSION_ICONS: Record<string, AttachmentIcon> = {
	png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', svg: 'image', webp: 'image', avif: 'image', heic: 'image',
	mp4: 'video', mov: 'video', webm: 'video', mkv: 'video', avi: 'video',
	mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', m4a: 'audio',
	zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
	js: 'code', jsx: 'code', ts: 'code', tsx: 'code', py: 'code', rb: 'code', go: 'code', json: 'code', html: 'code', css: 'code',
};

const inferIcon = (name: string): AttachmentIcon => {
	const extension = name.split('.').pop()?.toLowerCase() ?? '';
	return EXTENSION_ICONS[extension] ?? 'file';
};

// ─── Glyphs ───────────────────────────────────────────────────────────────────

const FileGlyph = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' />
		<path d='M14 2v4a2 2 0 0 0 2 2h4' />
	</svg>
);

const ImageGlyph = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
		<circle cx='9' cy='9' r='2' />
		<path d='m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21' />
	</svg>
);

const VideoGlyph = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect width='18' height='14' x='3' y='5' rx='2' ry='2' />
		<path d='m10 9 5 3-5 3Z' />
	</svg>
);

const AudioGlyph = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M9 18V5l12-2v13' />
		<circle cx='6' cy='18' r='3' />
		<circle cx='18' cy='16' r='3' />
	</svg>
);

const ArchiveGlyph = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect width='20' height='5' x='2' y='3' rx='1' />
		<path d='M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' />
		<path d='M10 12h4' />
	</svg>
);

const CodeGlyph = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='16 18 22 12 16 6' />
		<polyline points='8 6 2 12 8 18' />
	</svg>
);

const ICON_GLYPHS: Record<AttachmentIcon, () => ReactNode> = {
	file:    FileGlyph,
	image:   ImageGlyph,
	video:   VideoGlyph,
	audio:   AudioGlyph,
	archive: ArchiveGlyph,
	code:    CodeGlyph,
};

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface AttachmentProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'>
{
	name:          string;
	href?:         string;
	target?:       string;
	rel?:          string;
	download?:     string | boolean;
	size?:         string;
	type?:         string;
	icon?:         AttachmentIcon;
	thumbnail?:    string;
	onClick?:      (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
	className?:    string;
}

export const Attachment = (
    {
        name, href, target, rel, download, size, type, icon, thumbnail,
        onClick, title, className = '', ...rest
    }: AttachmentProps
) => {
	const resolvedIcon = icon ?? inferIcon(name);
	const Glyph         = ICON_GLYPHS[resolvedIcon];
	const meta          = [type, size].filter(Boolean).join(' · ');

	// Images can preview themselves — their own href IS a valid <img> source.
	// Anything else (a PDF, say) has no such shortcut: browsers can't render a
	// PDF file as an <img>, so a real preview there requires an explicit
	// `thumbnail` (e.g. a pre-rendered cover image of the first page).
	const previewSrc = thumbnail ?? (resolvedIcon === 'image' ? href : undefined);

	const content = (
		<>
			{previewSrc ? (
				<span aria-hidden='true' className='h-9 w-9 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-hover'>
					{/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external/user file URLs, not a static asset next/image can optimize */}
					<img src={previewSrc} alt='' className='h-full w-full object-cover' />
				</span>
			) : (
				<span aria-hidden='true' className='shrink-0 text-text-muted'>
					<Glyph />
				</span>
			)}
			<span className='flex min-w-0 flex-1 flex-col items-start'>
				<span className='block w-full truncate text-sm text-text'>{name}</span>
				{meta && <span className='block w-full truncate text-xs text-text-muted'>{meta}</span>}
			</span>
		</>
	);

	const primaryClasses = [
		'flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] py-1.5 pl-2.5 pr-1.5',
		'transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover',
		'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
	].join(' ');

	return (
		<div
			className={[
				'group inline-flex max-w-[240px] items-center rounded-[var(--radius)]',
				'border-[length:var(--border-width)] border-surface-border bg-surface-panel',
				'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:border-surface-border-hover',
				className,
			].join(' ')}
		>
			{href ? (
				<a href={href} target={target} rel={rel} download={download} title={title ?? name} onClick={onClick} className={primaryClasses} {...rest}>
					{content}
				</a>
			) : (
				// No href means there is nothing to navigate to — render a real <button>
				// instead of a non-focusable <a> so the primary action stays keyboard
				// reachable regardless.
				<button type='button' title={title ?? name} onClick={onClick} className={primaryClasses} {...rest}>
					{content}
				</button>
			)}
		</div>
	);
};

export default Attachment;

// ─── AttachmentGroup ──────────────────────────────────────────────────────────

export type AttachmentGroupProps = HTMLAttributes<HTMLUListElement>;

export const AttachmentGroup = ({ className = '', children, ...props }: AttachmentGroupProps) => {
	const items = Children.toArray(children);

	return (
		<ul {...props} className={['m-0 flex list-none flex-wrap gap-2 p-0', className].join(' ')}>
			{items.map((child, index) => (
				<li key={isValidElement(child) && child.key !== null ? child.key : index}>
					{child}
				</li>
			))}
		</ul>
	);
};
