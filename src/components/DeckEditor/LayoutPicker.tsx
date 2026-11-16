'use client';

import { LAYOUTS, createSlideFromLayout } from './layouts';
import { SlideCanvas } from '../SlideCanvas/SlideCanvas';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from './deck';
import { Popover } from '../Popover/Popover';
import { ElementView } from './ElementView';
import type { CSSProperties } from 'react';
import type { LayoutId } from './layouts';
import { Glyph } from './icons';

interface LayoutPickerProps {
	onPick:      (layout: LayoutId) => void;
	stageStyle?: CSSProperties;
	buttonClass: string;
}

// One sample slide per layout, built once: previews only need the shapes.
const PREVIEWS = LAYOUTS.map(layout => ({ ...layout, slide: createSlideFromLayout(layout.id) }));

const noop = () => {};

export const LayoutPicker = ({ onPick, stageStyle, buttonClass }: LayoutPickerProps) => (
	<Popover
		label='Slide layouts'
		side='top'
		align='start'
		unstyledTrigger
		triggerClassName={buttonClass}
		triggerProps={{ 'aria-label': 'Add slide with layout', title: 'Choose a layout' }}
		trigger={<Glyph name='chevronDown' size={12} />}
		className='w-[26rem] p-3'
	>
		{close => (
			<div className='flex flex-col gap-2'>
				<h3 className='text-xs font-semibold uppercase tracking-wide text-text-muted'>Layouts</h3>
				<div className='grid grid-cols-3 gap-2'>
					{PREVIEWS.map(({ id, label, slide }) => (
						<button
							key={id}
							type='button'
							onClick={() =>
							{
								onPick(id);
								close();
							}}
							className={[
								'flex flex-col gap-1 rounded-[var(--radius)] p-1 text-left',
								'ring-1 ring-surface-border hover:ring-input-border-hover motion-safe:transition-shadow motion-safe:duration-[var(--duration-fast)]',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
							].join(' ')}
						>
							<span aria-hidden='true' inert className='pointer-events-none block'>
								<SlideCanvas
									elements={slide.elements}
									onElementsChange={noop}
									renderElement={el => <ElementView element={el} editing={false} onChange={noop} showPlaceholders />}
									width={SLIDE_WIDTH}
									height={SLIDE_HEIGHT}
									stageStyle={stageStyle}
									readOnly
									className='shadow-none'
								/>
							</span>
							<span className='px-0.5 text-xs text-text'>{label}</span>
						</button>
					))}
				</div>
			</div>
		)}
	</Popover>
);
