'use client';

import { THEMES, customFromTheme, resolveTheme, themeStageStyle } from './themes';
import type { CustomTheme, SlideTheme, ThemeId } from './themes';
import { CustomThemeEditor } from './CustomThemeEditor';
import { Popover } from '../Popover/Popover';
import { Glyph } from './icons';

interface ThemePickerProps {
	value:       ThemeId;
	customTheme: CustomTheme | undefined;
	onChange:    (theme: ThemeId, customTheme?: CustomTheme, coalesceKey?: string) => void;
	buttonClass: string;
}

const ThemeCard = ({ theme, selected, onSelect }: { theme: SlideTheme; selected: boolean; onSelect: () => void }) => (
	<button
		type='button'
		aria-pressed={selected}
		onClick={onSelect}
		className={[
			'flex flex-col gap-1.5 rounded-[var(--radius)] p-1.5 text-left',
			'motion-safe:transition-shadow motion-safe:duration-[var(--duration-fast)]',
			selected ? 'ring-2 ring-brand' : 'ring-1 ring-surface-border hover:ring-input-border-hover',
			'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
		].join(' ')}
	>
		{/* The preview is themed with the same stage variables the slides use. */}
		<span
			aria-hidden='true'
			className='flex aspect-video w-full flex-col justify-between rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border bg-surface p-2'
			style={themeStageStyle(theme)}
		>
			<span className='text-lg font-semibold leading-none text-text' style={{ fontFamily: 'var(--deck-heading-font, inherit)' }}>Aa</span>
			<span className='flex items-center gap-1'>
				<span className='h-1.5 w-8 rounded-full bg-text-muted' />
				<span className='h-3 w-5 bg-brand' style={{ borderRadius: 'min(var(--deck-radius), 6px)' }} />
			</span>
		</span>
		<span className='px-0.5 text-xs font-medium text-text'>{theme.label}</span>
	</button>
);

export const ThemePicker = ({ value, customTheme, onChange, buttonClass }: ThemePickerProps) => {
	const custom = customTheme ?? customFromTheme(resolveTheme(value));

	return (
		<Popover
			label='Theme'
			side='bottom'
			align='end'
			unstyledTrigger
			triggerClassName={buttonClass}
			triggerProps={{ 'aria-label': 'Theme', title: 'Theme' }}
			trigger={<Glyph name='palette' />}
			className='max-h-[min(80vh,40rem)] w-80 overflow-y-auto p-3'
		>
			<div className='flex flex-col gap-2'>
				<h3 className='text-xs font-semibold uppercase tracking-wide text-text-muted'>Theme</h3>
				<div className='grid grid-cols-2 gap-2'>
					{THEMES.map(theme => (
						<ThemeCard key={theme.id} theme={theme} selected={theme.id === value} onSelect={() => onChange(theme.id)} />
					))}
					<ThemeCard
						theme={resolveTheme('custom', custom)}
						selected={value === 'custom'}
						onSelect={() => onChange('custom', custom)}
					/>
				</div>

				{value === 'custom' && (
					<div className='mt-1 border-t border-surface-border pt-3'>
						<CustomThemeEditor value={custom} onChange={(next, key) => onChange('custom', next, key)} />
					</div>
				)}
			</div>
		</Popover>
	);
};
