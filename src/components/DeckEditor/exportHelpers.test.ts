import { describe, it, expect } from 'vitest';
import { chartParts } from './exportHelpers';

describe('chartParts', () =>
{
	it('picks the plot surface, not a legend marker that renders before it', () =>
	{
		const node = document.createElement('div');
		node.innerHTML = '<div class="recharts-wrapper">'
			+ '<div class="recharts-legend-wrapper"><ul>'
			+ '<li class="recharts-legend-item"><svg class="recharts-surface" width="8" height="8"></svg><span>Signups</span></li>'
			+ '</ul></div>'
			+ '<svg class="recharts-surface" width="640" height="448"></svg>'
			+ '</div>';

		const { surface, legend } = chartParts(node);
		expect(surface?.getAttribute('width')).toBe('640');
		expect(legend).toHaveLength(1);
	});
});
