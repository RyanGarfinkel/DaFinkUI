'use client';

import type { AmbientType, DeckElement, EffectType, Slide, TransitionType } from './deck';
import { AMBIENT_OPTIONS, EFFECT_OPTIONS, TRANSITION_OPTIONS } from './effects';
import { NumberInput, Row, Section } from './fields';
import Select from '../Select/Select';
import Button from '../Button/Button';
import { Glyph } from './icons';

const DURATION_RANGE = { min: 100, max: 3000 };
const DELAY_RANGE = { min: 0, max: 10000 };

const clamp = (value: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, value));

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
	<Section title='Motion' collapsible>
		<Row label='Transition'>
			<Select
				aria-label='Transition'
				size='sm'
				options={TRANSITION_OPTIONS}
				value={slide.transition.type}
				onChange={type => onSlide({ transition: { ...slide.transition, type: type as TransitionType } })}
			/>
		</Row>
		{slide.transition.type !== 'none' && (
			<Row label='Duration' action={<PreviewButton label='Preview transition' onPreview={onPreview} />}>
				<NumberInput
					label='Transition duration'
					suffix='ms'
					value={slide.transition.duration}
					{...DURATION_RANGE}
					onChange={duration => onSlide({ transition: { ...slide.transition, duration: clamp(duration, DURATION_RANGE) } }, 'transition-duration')}
				/>
			</Row>
		)}
		<Row label='Ambient'>
			<Select
				aria-label='Ambient background'
				size='sm'
				options={AMBIENT_OPTIONS}
				value={slide.ambient}
				onChange={ambient => onSlide({ ambient: ambient as AmbientType })}
			/>
		</Row>
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
		<Section title='Animation' collapsible>
			<Row label='Entrance'>
				<Select
					aria-label='Entrance animation'
					size='sm'
					options={options}
					value={effect.type}
					onChange={type => onPatch({ effect: { ...effect, type: type as EffectType } })}
				/>
			</Row>
			{effect.type !== 'none' && (
				<Row label='Delay' action={<PreviewButton label='Preview entrance' onPreview={onPreview} />}>
					<NumberInput
						label='Entrance delay'
						suffix='ms'
						value={effect.delay}
						{...DELAY_RANGE}
						onChange={delay => onPatch({ effect: { ...effect, delay: clamp(delay, DELAY_RANGE) } }, 'effect-delay')}
					/>
				</Row>
			)}
		</Section>
	);
};
