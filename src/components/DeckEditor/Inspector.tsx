'use client';

import { ElementMotion, SlideMotion } from './MotionControls';
import { ColorField, NumberField, Section } from './fields';
import { ElementControls } from './ElementControls';
import type { DeckElement, Slide } from './deck';
import Textarea from '../Textarea/Textarea';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { Glyph } from './icons';

interface InspectorProps {
	slide:       Slide;
	element:     DeckElement | null;
	onPatch:     (patch: Partial<DeckElement>, coalesceKey?: string) => void;
	onSlide:     (patch: Partial<Slide>, coalesceKey?: string) => void;
	onArrange:   (action: 'forward' | 'backward' | 'duplicate' | 'delete') => void;
	onPreviewTransition: () => void;
	onPreviewEntrance:   () => void;
}

const ARRANGE = [
	{ action: 'forward',   label: 'Bring forward', glyph: 'forward' },
	{ action: 'backward',  label: 'Send backward', glyph: 'backward' },
	{ action: 'duplicate', label: 'Duplicate',     glyph: 'copy' },
	{ action: 'delete',    label: 'Delete',        glyph: 'trash' },
] as const;

const SpeakerNotes = ({ slide, onSlide }: Pick<InspectorProps, 'slide' | 'onSlide'>) => (
	<Section title='Speaker notes'>
		<Textarea
			aria-label='Speaker notes'
			value={slide.notes}
			placeholder='Notes for this slide…'
			rows={5}
			onChange={e => onSlide({ notes: e.target.value }, 'notes')}
			className='resize-y'
		/>
	</Section>
);

export const Inspector = ({ slide, element, onPatch, onSlide, onArrange, onPreviewTransition, onPreviewEntrance }: InspectorProps) => {
	if(!element)
	{
		return (
			<div>
				<Section title='Slide'>
					<ColorField label='Background' value={slide.background} emptyText='Theme' onChange={background => onSlide({ background }, 'background')} onReset={() => onSlide({ background: '' })} />
				</Section>
				<SlideMotion slide={slide} onSlide={onSlide} onPreview={onPreviewTransition} />
				<SpeakerNotes slide={slide} onSlide={onSlide} />
				<p className='p-4 text-sm text-text-muted'>Select an element to edit it, or insert one from the toolbar.</p>
			</div>
		);
	}

	return (
		<div>
			<Section title='Element'>
				<Input label='Name' value={element.label} onChange={e => onPatch({ label: e.target.value }, 'label')} className='px-2 py-1.5' />
				<div className='grid grid-cols-2 gap-2'>
					<NumberField label='X' value={element.x} onChange={x => onPatch({ x }, 'x')} />
					<NumberField label='Y' value={element.y} onChange={y => onPatch({ y }, 'y')} />
					<NumberField label='Width' value={element.width} min={16} onChange={width => onPatch({ width }, 'width')} />
					<NumberField label='Height' value={element.height} min={16} onChange={height => onPatch({ height }, 'height')} />
				</div>
				<div className='flex gap-1'>
					{ARRANGE.map(item => (
						<Button
							key={item.action}
							variant={item.action === 'delete' ? 'destructive' : 'ghost'}
							size='icon-sm'
							aria-label={item.label}
							title={item.label}
							onClick={() => onArrange(item.action)}
						>
							<Glyph name={item.glyph} />
						</Button>
					))}
				</div>
			</Section>
			<ElementControls element={element} onPatch={onPatch} />
			<ElementMotion element={element} onPatch={onPatch} onPreview={onPreviewEntrance} />
			<SpeakerNotes slide={slide} onSlide={onSlide} />
		</div>
	);
};
