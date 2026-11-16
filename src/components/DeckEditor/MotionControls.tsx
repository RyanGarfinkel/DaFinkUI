'use client';

import type { AmbientType, DeckElement, EffectType, Slide, TransitionType } from './deck';
import { AMBIENT_OPTIONS, EFFECT_OPTIONS, TRANSITION_OPTIONS } from './effects';
import { NumberField, Section } from './fields';
import Select from '../Select/Select';
import Button from '../Button/Button';
import { Glyph } from './icons';

const PreviewButton = ({ label, onPreview }: { label: string; onPreview: () => void }) => (
	<Button variant='outlined' size='sm' onClick={onPreview} aria-label={label}>
		<Glyph name='play' />
		Preview
	</Button>
);

interface SlideMotionProps {
	slide:     Slide;
	onSlide:   (patch: Partial<Slide>, coalesceKey?: string) => void;
	onPreview: () => void;
}

export const SlideMotion = ({ slide, onSlide, onPreview }: SlideMotionProps) => (
	<Section title='Motion'>
		<Select
			label='Transition'
			size='sm'
			options={TRANSITION_OPTIONS}
			value={slide.transition.type}
			onChange={type => onSlide({ transition: { ...slide.transition, type: type as TransitionType } })}
		/>
		{slide.transition.type !== 'none' && (
			<div className='flex items-end gap-2'>
				<div className='flex-1'>
					<NumberField
						label='Duration (ms)'
						value={slide.transition.duration}
						min={100}
						max={3000}
						onChange={duration => onSlide({ transition: { ...slide.transition, duration: Math.min(3000, Math.max(100, duration)) } }, 'transition-duration')}
					/>
				</div>
				<PreviewButton label='Preview transition' onPreview={onPreview} />
			</div>
		)}
		<Select
			label='Ambient background'
			hint='Plays behind the content of this slide.'
			size='sm'
			options={AMBIENT_OPTIONS}
			value={slide.ambient}
			onChange={ambient => onSlide({ ambient: ambient as AmbientType })}
		/>
	</Section>
);

interface ElementMotionProps {
	element:   DeckElement;
	onPatch:   (patch: Partial<DeckElement>, coalesceKey?: string) => void;
	onPreview: () => void;
}

export const ElementMotion = ({ element, onPatch, onPreview }: ElementMotionProps) => {
	const effect = element.effect ?? { type: 'none' as const, delay: 0 };
	const options = EFFECT_OPTIONS.filter(o => !o.textOnly || element.type === 'text');

	return (
		<Section title='Animation'>
			<Select
				label='Entrance'
				hint='Plays when the slide appears while presenting.'
				size='sm'
				options={options}
				value={effect.type}
				onChange={type => onPatch({ effect: { ...effect, type: type as EffectType } })}
			/>
			{effect.type !== 'none' && (
				<div className='flex items-end gap-2'>
					<div className='flex-1'>
						<NumberField
							label='Delay (ms)'
							value={effect.delay}
							min={0}
							max={10000}
							onChange={delay => onPatch({ effect: { ...effect, delay: Math.min(10000, Math.max(0, delay)) } }, 'effect-delay')}
						/>
					</div>
					<PreviewButton label='Preview entrance' onPreview={onPreview} />
				</div>
			)}
		</Section>
	);
};
