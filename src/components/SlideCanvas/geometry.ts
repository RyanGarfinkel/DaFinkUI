export interface Rect {
	x:      number;
	y:      number;
	width:  number;
	height: number;
}

export interface Bounds {
	width:  number;
	height: number;
}

export type Corner = 'nw' | 'ne' | 'sw' | 'se';

export const MIN_ELEMENT_SIZE = 16;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const snap = (n: number, grid?: number) => (grid ? Math.round(n / grid) * grid : n);

export const moveRect = (rect: Rect, dx: number, dy: number, bounds: Bounds, grid?: number): Rect => ({
	...rect,
	x: clamp(snap(rect.x + dx, grid), 0, bounds.width - rect.width),
	y: clamp(snap(rect.y + dy, grid), 0, bounds.height - rect.height),
});

// The corner being dragged moves; the opposite corner stays pinned, so each
// edge is computed independently and clamped to the slide and the minimum size.
export const resizeRect = (rect: Rect, corner: Corner, dx: number, dy: number, bounds: Bounds, grid?: number): Rect => {
	const right = rect.x + rect.width;
	const bottom = rect.y + rect.height;

	const left = corner.includes('w') ? clamp(snap(rect.x + dx, grid), 0, right - MIN_ELEMENT_SIZE) : rect.x;
	const top = corner.includes('n') ? clamp(snap(rect.y + dy, grid), 0, bottom - MIN_ELEMENT_SIZE) : rect.y;
	const newRight = corner.includes('e') ? clamp(snap(right + dx, grid), left + MIN_ELEMENT_SIZE, bounds.width) : right;
	const newBottom = corner.includes('s') ? clamp(snap(bottom + dy, grid), top + MIN_ELEMENT_SIZE, bounds.height) : bottom;

	return { x: left, y: top, width: newRight - left, height: newBottom - top };
};

export interface Guides {
	x: number[];
	y: number[];
}

interface AxisSnap {
	delta:  number;
	target: number;
}

const snapAxis = (edges: number[], targets: number[], threshold: number) => {
	let best: AxisSnap | null = null;
	for(const edge of edges)
	{
		for(const target of targets)
		{
			const delta = target - edge;
			if(Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, target };
		}
	}
	return best;
};

// Snaps a moved or resized rect to the edges and centers of the slide and the
// other elements. Moves snap any of the rect's three lines on each axis;
// resizes only snap the edges being dragged, so the pinned corner never moves.
export const snapToGuides = (rect: Rect, mode: 'move' | Corner, others: Rect[], bounds: Bounds, threshold: number): { rect: Rect; guides: Guides } => {
	const xTargets = [0, bounds.width / 2, bounds.width, ...others.flatMap(o => [o.x, o.x + o.width / 2, o.x + o.width])];
	const yTargets = [0, bounds.height / 2, bounds.height, ...others.flatMap(o => [o.y, o.y + o.height / 2, o.y + o.height])];

	if(mode === 'move')
	{
		const sx = snapAxis([rect.x, rect.x + rect.width / 2, rect.x + rect.width], xTargets, threshold);
		const sy = snapAxis([rect.y, rect.y + rect.height / 2, rect.y + rect.height], yTargets, threshold);
		return {
			rect:   { ...rect, x: rect.x + (sx?.delta ?? 0), y: rect.y + (sy?.delta ?? 0) },
			guides: { x: sx ? [sx.target] : [], y: sy ? [sy.target] : [] },
		};
	}

	let { x, y, width, height } = rect;
	const guides: Guides = { x: [], y: [] };

	const west = mode.includes('w');
	const sx = snapAxis([west ? x : x + width], xTargets, threshold);
	const snappedWidth = sx && (west ? width - sx.delta : width + sx.delta);
	if(sx && snappedWidth && snappedWidth >= MIN_ELEMENT_SIZE)
	{
		if(west) x += sx.delta;
		width = snappedWidth;
		guides.x.push(sx.target);
	}

	const north = mode.includes('n');
	const sy = snapAxis([north ? y : y + height], yTargets, threshold);
	const snappedHeight = sy && (north ? height - sy.delta : height + sy.delta);
	if(sy && snappedHeight && snappedHeight >= MIN_ELEMENT_SIZE)
	{
		if(north) y += sy.delta;
		height = snappedHeight;
		guides.y.push(sy.target);
	}

	return { rect: { x, y, width, height }, guides };
};
