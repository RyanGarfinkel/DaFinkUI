'use client';;
const TRACK_BASE = [
	'relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full',
	'transition-colors duration-200 ease-out',
	'focus:outline-none',
	'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
	'disabled:pointer-events-none disabled:opacity-40',
].join(' ');

const THUMB_BASE = [
	'pointer-events-none inline-block h-4 w-4 rounded-full bg-brand-fg shadow-sm',
	'transition-transform duration-200 ease-out',
].join(' ');

export interface SwitchProps
{
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
	hint?: string;
	disabled?: boolean;
	id?: string;
	className?: string;
}

const Switch = (
    {
        checked,
        onCheckedChange,
        label,
        hint,
        disabled,
        id,
        className = '',
    }: SwitchProps
) => {
	const switchId = id ?? (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
	const hintId   = switchId ? `${switchId}-hint` : undefined;

	const trackColor  = checked ? 'bg-brand' : 'bg-input-border';
	const thumbOffset = checked ? 'translate-x-5' : 'translate-x-1';

	return (
		<div className={`flex items-center gap-3 ${className}`}>
			<button
				role='switch'
				id={switchId}
				aria-checked={checked}
				aria-describedby={hint && hintId ? hintId : undefined}
				disabled={disabled}
				onClick={() => onCheckedChange(!checked)}
				className={`${TRACK_BASE} ${trackColor}`}
			>
				<span className={`${THUMB_BASE} ${thumbOffset}`} />
			</button>

			{(label || hint) && (
				<div className='flex flex-col gap-0.5'>
					{label && (
						<label
							htmlFor={switchId}
							className='cursor-pointer select-none text-sm font-medium text-text'
						>
							{label}
						</label>
					)}
					{hint && (
						<p id={hintId} className='text-sm text-text-muted'>
							{hint}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default Switch;
