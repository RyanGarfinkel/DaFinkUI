import { AnchorHTMLAttributes, ButtonHTMLAttributes, Children, HTMLAttributes, ReactElement, ReactNode, cloneElement, isValidElement } from 'react';

// ─── Message ──────────────────────────────────────────────────────────────────

export type MessageVariant = 'sent' | 'received';

export interface MessageProps extends HTMLAttributes<HTMLDivElement>
{
	variant?: MessageVariant;
	avatar?:  ReactNode;
	/** Set false to render children without the bubble background/padding — for content that supplies its own chrome (an image, an AudioPlayer), so it isn't nested inside a second colored box. Alignment, max-width, and reaction placement are unaffected. */
	bubble?:  boolean;
	children: ReactNode;
}

export const Message = ({ variant = 'received', avatar, bubble = true, className = '', children, ...props }: MessageProps) => {
	const isSent = variant === 'sent';

	const childList      = Children.toArray(children);
	const reactionsChild = childList.find(child => isValidElement(child) && child.type === MessageReactions);
	const bodyChildren   = childList.filter(child => child !== reactionsChild);

	return (
		<div
			{...props}
			className={['flex items-end gap-2', isSent ? 'flex-row-reverse' : 'flex-row', className].join(' ')}
		>
			{avatar && <span className='shrink-0'>{avatar}</span>}

			<div className='relative max-w-[75%]'>
				<div
					className={
						bubble
							? [
								'break-words rounded-[var(--radius-lg)] px-3.5 py-2 text-sm leading-relaxed',
								isSent
									? 'rounded-br-[var(--radius-sm)] bg-brand text-brand-fg'
									: 'rounded-bl-[var(--radius-sm)] bg-surface-active text-text',
							].join(' ')
							: ''
					}
				>
					{bodyChildren}
				</div>

				{reactionsChild && (
					<div className={['absolute -bottom-3 z-10', isSent ? 'left-3' : 'right-3'].join(' ')}>
						{reactionsChild}
					</div>
				)}
			</div>
		</div>
	);
};

// ─── MessageReactions ─────────────────────────────────────────────────────────

export interface MessageReactionsProps extends HTMLAttributes<HTMLDivElement>
{
	/** Maximum number of reaction chips shown before the rest collapse into a "+N" indicator — overlapped into a stack like AvatarGroup, rather than wrapping onto more rows. */
	max?: number;
}

const OVERFLOW_BASE = 'relative inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-full border-[length:var(--border-width)] border-surface-border bg-surface-panel px-2 text-xs font-medium leading-none text-text-muted shadow-[var(--shadow-sm)] ring-2 ring-surface';

export const MessageReactions = ({ className = '', children, max, 'aria-label': ariaLabel = 'Reactions', ...props }: MessageReactionsProps) => {
	const items    = Children.toArray(children).filter(isValidElement);
	const grouped  = max !== undefined && max > 0 && items.length > max;
	const visible  = grouped ? items.slice(0, max) : items;
	const overflow = items.length - visible.length;

	return (
		<div
			{...props}
			role='group'
			aria-label={ariaLabel}
			className={['flex flex-wrap items-center', grouped ? '-space-x-2' : 'gap-2', className].join(' ')}
		>
			{visible.map((child, index) => {
				if(!grouped) return child;

				const element = child as ReactElement<MessageReactionProps>;
				return cloneElement(element, {
					key:       element.key ?? index,
					className: ['ring-2 ring-surface', element.props.className ?? ''].join(' ').trim(),
				});
			})}

			{overflow > 0 && (
				<span role='img' aria-label={`${overflow} more reaction${overflow === 1 ? '' : 's'}`} className={OVERFLOW_BASE}>
					<span aria-hidden='true' className='leading-none'>+{overflow}</span>
				</span>
			)}
		</div>
	);
};

// ─── MessageReaction ──────────────────────────────────────────────────────────

interface MessageReactionSharedProps
{
	/** Decorative glyph — emoji string or icon node. Always hidden from the accessibility tree. */
	icon?:      ReactNode;
	/** Visible text next to the icon — a count label, a footnote number, or a source name. */
	label?:     ReactNode;
	/** Aggregate count for a tapback-style reaction (e.g. 3 people reacted). Drives the auto aria-label. */
	count?:     number;
	/** Whether the current user is included in this reaction — shown via border/fill, not color alone. */
	active?:    boolean;
	className?: string;
}

export interface MessageReactionLinkProps extends MessageReactionSharedProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>
{
	href: string;
}

export interface MessageReactionButtonProps extends MessageReactionSharedProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>
{
	href?: undefined;
}

export type MessageReactionProps = MessageReactionLinkProps | MessageReactionButtonProps;

interface ReactionVisualProps
{
	icon?:   ReactNode;
	label?:  ReactNode;
	count?:  number;
	active:  boolean;
}

const REACTION_BASE = 'group relative inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-[length:var(--border-width)] px-2 text-xs font-medium leading-none shadow-[var(--shadow-sm)] motion-safe:transition-[background-color,border-color,color,transform] motion-safe:duration-[var(--duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40';

const reactionClassName = (active: boolean, className: string) => [
	REACTION_BASE,
	active
		? 'border-brand bg-brand text-brand-fg hover:bg-brand-hover'
		: 'border-surface-border bg-surface-panel text-text-muted hover:border-surface-border-hover hover:bg-surface-hover hover:text-text',
	className,
].join(' ');

const buildReactionAriaLabel = ({ icon, label, count, active }: ReactionVisualProps): string | undefined => {
	const glyph = typeof label === 'string' ? label : typeof icon === 'string' ? icon : '';

	if(count !== undefined)
	{
		return `${glyph} ${count} reaction${count === 1 ? '' : 's'}${active ? ', including yours' : ''}`.trim();
	}

	if(!label && !glyph)
	{
		return active ? 'Reaction, including yours' : undefined;
	}

	return undefined;
};

const CheckIcon = () => (
	<svg
		aria-hidden='true'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='3'
		strokeLinecap='round'
		strokeLinejoin='round'
		className='h-2.5 w-2.5 shrink-0'
	>
		<path d='M20 6 9 17l-5-5' />
	</svg>
);

const ReactionContent = ({ icon, label, count, active }: ReactionVisualProps) => {
	const hideText = Boolean(buildReactionAriaLabel({ icon, label, count, active })) && count !== undefined;

	return (
		<>
			{active && <CheckIcon />}
			{icon && <span aria-hidden='true' className='leading-none'>{icon}</span>}
			{(label !== undefined || count !== undefined) && (
				<span aria-hidden={hideText || undefined} className='leading-none'>{label ?? count}</span>
			)}
		</>
	);
};

export const MessageReaction = (props: MessageReactionProps) => {
	if(props.href !== undefined)
	{
		const { icon, label, count, active = false, className = '', href, 'aria-label': ariaLabelProp, ...rest } = props;

		return (
			<a
				{...rest}
				href={href}
				aria-label={ariaLabelProp ?? buildReactionAriaLabel({ icon, label, count, active })}
				className={reactionClassName(active, className)}
			>
				<ReactionContent icon={icon} label={label} count={count} active={active} />
			</a>
		);
	}

	const { icon, label, count, active = false, className = '', 'aria-label': ariaLabelProp, ...rest } = props;

	return (
		<button
			type='button'
			{...rest}
			aria-label={ariaLabelProp ?? buildReactionAriaLabel({ icon, label, count, active })}
			className={reactionClassName(active, className)}
		>
			<ReactionContent icon={icon} label={label} count={count} active={active} />
		</button>
	);
};

export default Message;
