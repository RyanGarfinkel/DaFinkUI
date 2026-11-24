// One SyncTeX stop: [page, x, top, bottom, line], in PDF points from the page's top-left corner.
export type SyncPoint = [number, number, number, number, number];

const MAX_DISTANCE = 24;
const BAND_WEIGHT = 4;

export const lineAt = (points: SyncPoint[], page: number, x: number, y: number) => {
	let best: number | null = null;
	let bestCost = Infinity;

	for(const [pointPage, pointX, top, bottom, line] of points)
	{
		if(pointPage !== page) continue;

		const gap = y < top ? top - y : y > bottom ? y - bottom : 0;
		if(gap > MAX_DISTANCE) continue;

		const cost = gap * gap * BAND_WEIGHT + (pointX - x) ** 2;
		if(cost >= bestCost) continue;

		best = line;
		bestCost = cost;
	}

	return best;
};
