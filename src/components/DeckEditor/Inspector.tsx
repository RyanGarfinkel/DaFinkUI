'use client';

import type { ChartSource, DeckElement, ResolvedChart, SheetChoice, Slide } from './deck';
import { ColorField, NumberInput, Row, Section } from './fields';
import { ElementMotion, SlideMotion } from './MotionControls';
import { ElementControls } from './ElementControls';
import Textarea from '../Textarea/Textarea';
import Input from '../Input/Input';

interface InspectorProps {
	slide:       Slide;
	themeRadius: number;
	element:     DeckElement | null;
	onPatch:     (patch: Partial<DeckElement>, coalesceKey?: string) => void;
	onSlide:     (patch: Partial<Slide>, coalesceKey?: string) => void;
	onPreviewTransition: () => void;
	onPreviewEntrance:   () => void;
	sheets?:             SheetChoice[];
	resolveChartSource?: (source: ChartSource) => ResolvedChart | null;
}

const SpeakerNotes = ({ slide, onSlide }: Pick<InspectorProps, 'slide' | 'onSlide'>) => (
	<Section title='Speaker notes' collapsible>
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

export const Inspector = ({ slide, themeRadius, element, onPatch, onSlide, onPreviewTransition, onPreviewEntrance, sheets, resolveChartSource }: InspectorProps) => {
	if(!element)
	{
		return (
			<div>
				<Section title='Slide' collapsible defaultOpen>
					<ColorField label='Background' value={slide.background} emptyText='Theme' onChange={background => onSlide({ background }, 'background')} onReset={() => onSlide({ background: '' })} />
				</Section>
				<SlideMotion slide={slide} onSlide={onSlide} onPreview={onPreviewTransition} />
				<SpeakerNotes slide={slide} onSlide={onSlide} />
			</div>
		);
	}

	return (
		<div>
			<Section title='Element' collapsible defaultOpen>
				<Row label='Name'>
					<div className='[&>div]:gap-0'>
						<Input aria-label='Name' value={element.label} onChange={e => onPatch({ label: e.target.value }, 'label')} className='h-8 px-2 py-0' />
					</div>
				</Row>
				<Row label='Position'>
					<div className='grid grid-cols-2 gap-2'>
						<NumberInput label='X' prefix='X' value={element.x} onChange={x => onPatch({ x }, 'x')} />
						<NumberInput label='Y' prefix='Y' value={element.y} onChange={y => onPatch({ y }, 'y')} />
					</div>
				</Row>
				<Row label='Size'>
					<div className='grid grid-cols-2 gap-2'>
						<NumberInput label='Width' prefix='W' value={element.width} min={16} onChange={width => onPatch({ width }, 'width')} />
						<NumberInput label='Height' prefix='H' value={element.height} min={16} onChange={height => onPatch({ height }, 'height')} />
					</div>
				</Row>
			</Section>
			<ElementControls element={element} onPatch={onPatch} themeRadius={themeRadius} sheets={sheets} resolveChartSource={resolveChartSource} />
			<ElementMotion element={element} onPatch={onPatch} onPreview={onPreviewEntrance} />
			<SpeakerNotes slide={slide} onSlide={onSlide} />
		</div>
	);
};
