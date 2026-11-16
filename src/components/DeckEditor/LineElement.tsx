'use client';

import type { DeckElement } from './deck';
import { useId } from 'react';

type LineData = Extract<DeckElement, { type: 'line' }>;

export const LineElement = ({ element }: { element: LineData }) => {
	const markerId = `arrow-${useId().replace(/:/g, '')}`;
	const color = element.stroke || 'var(--color-text)';

	return (
		<svg width='100%' height='100%' overflow='visible' aria-hidden='true'>
			{element.arrow && (
				<defs>
					<marker id={markerId} viewBox='0 0 10 10' refX='8' refY='5' markerWidth='4' markerHeight='4' orient='auto-start-reverse'>
						<path d='M0 0 10 5 0 10z' fill={color} />
					</marker>
				</defs>
			)}
			<line
				x1={`${element.x1 * 100}%`}
				y1={`${element.y1 * 100}%`}
				x2={`${element.x2 * 100}%`}
				y2={`${element.y2 * 100}%`}
				stroke={color}
				strokeWidth={element.strokeWidth}
				strokeLinecap='round'
				markerEnd={element.arrow ? `url(#${markerId})` : undefined}
			/>
		</svg>
	);
};
