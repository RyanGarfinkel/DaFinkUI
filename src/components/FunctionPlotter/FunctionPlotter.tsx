'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { create, all } from 'mathjs';

export interface FunctionPlotterProps {
	initialEquations?: string[];
	height?:           number;
	className?:        string;
	readOnly?:         boolean;
	tooltip?:          boolean;
	layout?:           'bottom' | 'side';
}

interface Viewport {
	cx:    number;
	cy:    number;
	scale: number;
}

interface Equation {
	id:    string;
	expr:  string;
	color: string;
	error: boolean;
}

interface HoverPoint {
	sx:    number;
	sy:    number;
	x:     number;
	y:     number;
	color: string;
}

interface MarkerPoint {
	eqIds: string[];
	sx:    number;
	sy:    number;
	x:     number;
	y:     number;
	kind:  'min' | 'max' | 'intersection';
	label: string;
	color: string;
}

const COLORS         = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
const GRID_STEPS     = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100];
const DEFAULT_VP: Viewport = { cx: 0, cy: 0, scale: 60 };
const MAX_EQ            = 6;
const HOVER_THRESHOLD   = 16;
const CLICK_THRESHOLD   = 4;
const DOT_HIT_RADIUS    = 9;
const EXTREMUM_RADIUS   = 4;
const MAX_EXTREMA       = 12;
const MAX_INTERSECTIONS = 16;
const ZERO_EPSILON      = 1e-6;

// Numeric root-finding (ternarySearch, bisectRoot) essentially never lands on
// exactly 0, even when that's the true answer (e.g. the vertex of x^2) — it
// converges to something like 1e-9, which `toString()` renders in exponential
// notation. That's well below anything distinguishable at 4 significant
// figures even at max zoom, so treat it as display noise and snap to 0.
const formatCoord = (n: number) => Math.abs(n) < ZERO_EPSILON ? '0' : parseFloat(n.toPrecision(4)).toString();

let _idCounter = 0;
const nextId = () => `eq-${++_idCounter}`;

//
// Equations come from free-text user input, so they're parsed and evaluated by
// mathjs' expression parser rather than `new Function`/`eval` — mathjs never
// hands the string to the JS engine, and its AccessorNode blocks property
// access like `.constructor`, so a math-only grammar is all that's reachable.
// mathjs' own docs flag `import`/`createUnit`/`simplify`/`derivative`/`resolve`/
// `evaluate`/`parse`/`parser`/`compile`/`help`/`reviver` as unsafe to expose to
// untrusted expressions — they can rebind functions, mutate global unit state,
// or blow up on crafted input — so those are disabled below; everything else
// mathjs offers (trig, log, hyperbolic, stats, ...) stays available.

const mathInstance = create(all, { predictable: true });

const rawParse = mathInstance.parse;

const disableFn = (name: string) => () => { throw new Error(`Function ${name} is disabled`); };

mathInstance.import({
	import:     disableFn('import'),
	createUnit: disableFn('createUnit'),
	simplify:   disableFn('simplify'),
	derivative: disableFn('derivative'),
	resolve:    disableFn('resolve'),
	evaluate:   disableFn('evaluate'),
	parse:      disableFn('parse'),
	parser:     disableFn('parser'),
	compile:    disableFn('compile'),
	help:       disableFn('help'),
	reviver:    disableFn('reviver'),
}, { override: true });

const compileExpr = (expr: string): ((x: number) => number) | null => {
	if(expr.trim() === '') return null;

	try
	{
		const code       = rawParse(expr).compile();
		const evaluateAt = (x: number) => code.evaluate({ x });

		// mathjs happily parses things like `f(x) = x^2` (a function assignment)
		// or `x > 1` (a comparison) without throwing, but the result isn't a
		// plottable number — reject those at x=0 instead of silently drawing nothing.
		if(typeof evaluateAt(0) !== 'number') return null;

		return (x: number) =>
		{
			const result = evaluateAt(x);
			return typeof result === 'number' ? result : NaN;
		};
	}
	catch { return null; }
}

// Refines a rough local extremum into a precise one via ternary search — works
// for any unimodal (single min or max) window, which a narrow few-pixel range
// around a detected slope-sign change reliably is for a smooth plotted curve.
const ternarySearch = (fn: (x: number) => number, lo: number, hi: number, findMax: boolean): { x: number; y: number } => {
	let a = lo;
	let b = hi;

	for(let i = 0; i < 40; i++)
	{
		const m1     = a + (b - a) / 3;
		const m2     = b - (b - a) / 3;
		const better = findMax ? fn(m1) < fn(m2) : fn(m1) > fn(m2);
		if(better) a = m1; else b = m2;
	}

	const x = (a + b) / 2;
	return { x, y: fn(x) };
}

// Finds a root of `diffFn` (the difference between two curves, so a root is an
// intersection) within a window already known to bracket a sign change.
const bisectRoot = (diffFn: (x: number) => number, lo: number, hi: number): number => {
	let a  = lo;
	let b  = hi;
	let fa = diffFn(a);

	for(let i = 0; i < 40; i++)
	{
		const m  = (a + b) / 2;
		const fm = diffFn(m);
		if((fa > 0) === (fm > 0)) { a = m; fa = fm; } else { b = m; }
	}

	return (a + b) / 2;
}

const FunctionPlotter = ({
	initialEquations = ['2*x + 1', 'x^2'],
	height = 400,
	className = '',
	readOnly = false,
	tooltip = true,
	layout = 'bottom',
}: FunctionPlotterProps) => {
	const canvasRef   = useRef<HTMLCanvasElement>(null);
	const wrapperRef  = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<Viewport>({ ...DEFAULT_VP });
	const isDragging  = useRef(false);
	const hasMoved    = useRef(false);
	const dragStart   = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
	const markersRef  = useRef<MarkerPoint[]>([]);

	const [equations, setEquations] = useState<Equation[]>(() =>
		initialEquations.slice(0, MAX_EQ).map((expr, i) => ({
			id:    nextId(),
			expr,
			color: COLORS[i % COLORS.length],
			error: false,
		}))
	);

	const [dragging, setDragging] = useState(false);
	const [hover, setHover]       = useState<HoverPoint | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [popup, setPopup]       = useState<MarkerPoint | null>(null);

	const draw = useCallback(() =>
	{
		const canvas = canvasRef.current;
		if(!canvas) return;
		const ctx = canvas.getContext('2d');
		if(!ctx) return;

		const dpr    = window.devicePixelRatio || 1;
		const w      = canvas.width  / dpr;
		const h      = canvas.height / dpr;
		const { cx, cy, scale } = viewportRef.current;

		const surface = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-surface').trim() || '#ffffff';
		const borderColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-surface-border').trim() || '#e4e4e7';
		const axisColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-text-subtle').trim() || '#a1a1aa';
		const labelColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-text-muted').trim() || '#71717a';

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = surface;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const step = GRID_STEPS.find(s => s * scale >= 60) ?? 100;

		const xMin = cx - w / 2 / scale;
		const xMax = cx + w / 2 / scale;
		const yMin = cy - h / 2 / scale;
		const yMax = cy + h / 2 / scale;

		const toScreenX = (wx: number) => w / 2 + (wx - cx) * scale;
		const toScreenY = (wy: number) => h / 2 - (wy - cy) * scale;

		const originSX = toScreenX(0);
		const originSY = toScreenY(0);

		ctx.strokeStyle = borderColor;
		ctx.lineWidth   = 1;

		const xStart = Math.ceil(xMin / step) * step;
		for(let wx = xStart; wx <= xMax; wx += step)
		{
			const sx = toScreenX(wx);
			ctx.beginPath();
			ctx.moveTo(sx, 0);
			ctx.lineTo(sx, h);
			ctx.stroke();
		}

		const yStart = Math.ceil(yMin / step) * step;
		for(let wy = yStart; wy <= yMax; wy += step)
		{
			const sy = toScreenY(wy);
			ctx.beginPath();
			ctx.moveTo(0, sy);
			ctx.lineTo(w, sy);
			ctx.stroke();
		}

		ctx.strokeStyle = axisColor;
		ctx.lineWidth   = 1.5;

		ctx.beginPath();
		ctx.moveTo(originSX, 0);
		ctx.lineTo(originSX, h);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, originSY);
		ctx.lineTo(w, originSY);
		ctx.stroke();

		ctx.fillStyle = labelColor;
		ctx.font      = '10px system-ui, sans-serif';
		ctx.textAlign = 'center';

		for(let wx = xStart; wx <= xMax; wx += step)
		{
			const sx = toScreenX(wx);
			if(Math.abs(sx - originSX) < 20) continue;
			const label = parseFloat(wx.toPrecision(10)).toString();
			ctx.fillText(label, sx, Math.min(Math.max(originSY + 14, 14), h - 4));
		}

		ctx.textAlign    = 'right';
		ctx.textBaseline = 'middle';

		for(let wy = yStart; wy <= yMax; wy += step)
		{
			if(Math.abs(wy) < step * 0.01) continue;
			const sy = toScreenY(wy);
			if(Math.abs(sy - originSY) < 20) continue;
			const label = parseFloat(wy.toPrecision(10)).toString();
			ctx.fillText(label, Math.min(Math.max(originSX - 4, 4), w - 4), sy);
		}

		ctx.textBaseline = 'alphabetic';

		const markers: MarkerPoint[] = [];
		const compiledEqs: Array<{ eq: Equation; fn: (x: number) => number; samples: Float64Array }> = [];

		for(const eq of equations)
		{
			if(eq.error) continue;
			const fn = compileExpr(eq.expr);
			if(!fn) continue;

			const isActive = activeId !== null && eq.id === activeId;
			const samples  = new Float64Array(w + 1).fill(NaN);

			ctx.beginPath();
			ctx.strokeStyle = eq.color;
			ctx.lineWidth   = isActive ? 3 : 2;
			ctx.globalAlpha = activeId === null || isActive ? 1 : 0.35;
			ctx.lineCap     = 'round';
			ctx.lineJoin    = 'round';

			let penDown = false;
			let lastWy: number | null    = null;
			let lastSlope: number | null = null;

			for(let sx = 0; sx <= w; sx++)
			{
				const wx = cx + (sx - w / 2) / scale;
				let   wy: number;

				try { wy = fn(wx); }
				catch { penDown = false; lastWy = null; lastSlope = null; continue; }

				if(!isFinite(wy) || isNaN(wy))
				{
					penDown = false;
					lastWy = null;
					lastSlope = null;
					continue;
				}

				const sy = toScreenY(wy);

				if(Math.abs(sy) > h * 10)
				{
					penDown = false;
					lastWy = null;
					lastSlope = null;
					continue;
				}

				samples[sx] = wy;

				if(!penDown)
				{
					ctx.moveTo(sx, sy);
					penDown = true;
				}
				else
				{
					ctx.lineTo(sx, sy);
				}

				// Numeric, not symbolic: mathjs' `derivative` is disabled (see above),
				// so a sign change in the discrete slope between samples is refined
				// into a precise extremum via ternary search over that narrow window.
				// A zero-valued slope sample is skipped rather than recorded — for a
				// symmetric curve landing exactly on a pixel-aligned center (e.g. x^2
				// under the default viewport), the discrete slope passes through
				// exactly 0 right at the vertex, and overwriting `lastSlope` with 0
				// there erases the sign needed to detect the flip on the next sample.
				if(isActive && lastWy !== null && markers.length < MAX_EXTREMA)
				{
					const slope = wy - lastWy;

					if(slope !== 0)
					{
						if(lastSlope !== null)
						{
							const isMax = lastSlope > 0 && slope < 0;
							const isMin = lastSlope < 0 && slope > 0;

							if(isMax || isMin)
							{
								const lo = cx + (sx - 3 - w / 2) / scale;
								const hi = cx + (sx + 1 - w / 2) / scale;
								const { x: ex, y: ey } = ternarySearch(fn, lo, hi, isMax);

								if(isFinite(ex) && isFinite(ey))
								{
									markers.push({
										eqIds: [eq.id],
										x:     ex,
										y:     ey,
										kind:  isMax ? 'max' : 'min',
										label: isMax ? 'Max' : 'Min',
										color: eq.color,
										sx:    toScreenX(ex),
										sy:    toScreenY(ey),
									});
								}
							}
						}

						lastSlope = slope;
					}
				}
				else if(isActive)
				{
					lastSlope = null;
				}

				lastWy = wy;
			}

			ctx.stroke();
			compiledEqs.push({ eq, fn, samples });
		}

		ctx.globalAlpha = 1;

		// Only pairs that include the active equation are checked — nothing
		// shows until a curve is selected, same as extrema.
		// Same numeric approach as extrema, but on the difference of two curves:
		// a sign change in (a - b) between adjacent samples brackets a root,
		// refined via bisection. As with extrema, a zero-valued diff sample is
		// skipped rather than recorded, so it can't erase the sign needed to
		// detect the flip on the next sample.
		const intersectionColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-text').trim() || '#18181b';

		outer:
		for(let i = 0; i < compiledEqs.length; i++)
		{
			for(let j = i + 1; j < compiledEqs.length; j++)
			{
				const a = compiledEqs[i];
				const b = compiledEqs[j];

				if(activeId === null || (a.eq.id !== activeId && b.eq.id !== activeId)) continue;

				let lastDiff: number | null = null;

				for(let sx = 0; sx <= w; sx++)
				{
					const wyA = a.samples[sx];
					const wyB = b.samples[sx];

					if(isNaN(wyA) || isNaN(wyB))
					{
						lastDiff = null;
						continue;
					}

					const diff = wyA - wyB;

					if(diff !== 0)
					{
						if(lastDiff !== null && (lastDiff > 0) !== (diff > 0))
						{
							const lo = cx + (sx - 1 - w / 2) / scale;
							const hi = cx + (sx - w / 2) / scale;
							const ix = bisectRoot(x => a.fn(x) - b.fn(x), lo, hi);
							const iy = a.fn(ix);

							if(isFinite(ix) && isFinite(iy))
							{
								markers.push({
									eqIds: [a.eq.id, b.eq.id],
									x:     ix,
									y:     iy,
									kind:  'intersection',
									label: 'Intersection',
									color: intersectionColor,
									sx:    toScreenX(ix),
									sy:    toScreenY(iy),
								});

								if(markers.length >= MAX_EXTREMA + MAX_INTERSECTIONS) break outer;
							}
						}

						lastDiff = diff;
					}
				}
			}
		}

		for(const pt of markers)
		{
			ctx.beginPath();
			ctx.arc(pt.sx, pt.sy, EXTREMUM_RADIUS, 0, Math.PI * 2);
			ctx.fillStyle = pt.color;
			ctx.fill();
			ctx.lineWidth   = 1.5;
			ctx.strokeStyle = surface;
			ctx.stroke();
		}

		markersRef.current = markers;
	}, [equations, activeId]);

	useEffect(() =>
	{
		const canvas  = canvasRef.current;
		const wrapper = wrapperRef.current;
		if(!canvas || !wrapper) return;

		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const w   = wrapper.clientWidth;
			canvas.width         = w * dpr;
			canvas.height        = height * dpr;
			canvas.style.width   = `${w}px`;
			canvas.style.height  = `${height}px`;
			const ctx = canvas.getContext('2d');
			if(ctx) ctx.scale(dpr, dpr);
			draw();
		};

		const observer = new ResizeObserver(resize);
		observer.observe(wrapper);
		resize();

		return () => observer.disconnect();
	}, [height, draw]);

	useEffect(() =>
	{
		draw();
	}, [draw]);

	useEffect(() =>
	{
		if(!popup) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if(e.key === 'Escape') setPopup(null);
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [popup]);

	const findNearestCurve = (px: number, py: number, w: number, h: number) => {
		const { cx, cy, scale } = viewportRef.current;
		const worldX = cx + (px - w / 2) / scale;

		let nearest: { eq: Equation; worldX: number; worldY: number; sy: number } | null = null;
		let nearestDist = HOVER_THRESHOLD;

		for(const eq of equations)
		{
			if(eq.error) continue;
			const fn = compileExpr(eq.expr);
			if(!fn) continue;

			const worldY = fn(worldX);
			if(!isFinite(worldY)) continue;

			const sy   = h / 2 - (worldY - cy) * scale;
			const dist = Math.abs(sy - py);

			if(dist < nearestDist)
			{
				nearestDist = dist;
				nearest = { eq, worldX, worldY, sy };
			}
		}

		return nearest;
	};

	const handleCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if(!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const w   = canvas.width  / dpr;
		const h   = canvas.height / dpr;
		const px  = e.nativeEvent.offsetX;
		const py  = e.nativeEvent.offsetY;

		let nearestDot: MarkerPoint | null = null;
		let nearestDotDist = DOT_HIT_RADIUS;

		for(const pt of markersRef.current)
		{
			const dist = Math.hypot(pt.sx - px, pt.sy - py);
			if(dist < nearestDotDist)
			{
				nearestDotDist = dist;
				nearestDot = pt;
			}
		}

		if(nearestDot)
		{
			const dot = nearestDot;
			const isSameDot = (p: MarkerPoint) =>
				p.kind === dot.kind && p.x === dot.x && p.y === dot.y &&
				p.eqIds.length === dot.eqIds.length && p.eqIds.every((id, i) => id === dot.eqIds[i]);

			setPopup(prev => (prev && isSameDot(prev)) ? null : dot);
			return;
		}

		const hit = findNearestCurve(px, py, w, h);
		setPopup(null);
		setActiveId(hit ? hit.eq.id : null);
	};

	const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		e.currentTarget.setPointerCapture(e.pointerId);
		isDragging.current = true;
		hasMoved.current   = false;
		setDragging(true);
		setHover(null);
		dragStart.current  = {
			x:  e.nativeEvent.offsetX,
			y:  e.nativeEvent.offsetY,
			cx: viewportRef.current.cx,
			cy: viewportRef.current.cy,
		};
	};

	const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if(isDragging.current)
		{
			const dxPx = e.nativeEvent.offsetX - dragStart.current.x;
			const dyPx = e.nativeEvent.offsetY - dragStart.current.y;

			if(!hasMoved.current && (Math.abs(dxPx) > CLICK_THRESHOLD || Math.abs(dyPx) > CLICK_THRESHOLD))
			{
				hasMoved.current = true;
				setPopup(null);
			}

			const { scale } = viewportRef.current;
			viewportRef.current.cx = dragStart.current.cx - dxPx / scale;
			viewportRef.current.cy = dragStart.current.cy + dyPx / scale;
			draw();
			return;
		}

		if(!tooltip) return;

		const canvas = canvasRef.current;
		if(!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const w   = canvas.width  / dpr;
		const h   = canvas.height / dpr;
		const px  = e.nativeEvent.offsetX;
		const py  = e.nativeEvent.offsetY;
		const hit = findNearestCurve(px, py, w, h);

		setHover(hit ? { sx: px, sy: hit.sy, x: hit.worldX, y: hit.worldY, color: hit.eq.color } : null);
	};

	const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const wasClick = isDragging.current && !hasMoved.current;
		isDragging.current = false;
		setDragging(false);

		if(wasClick) handleCanvasClick(e);
	};

	const onPointerLeave = () => {
		isDragging.current = false;
		hasMoved.current   = false;
		setDragging(false);
		setHover(null);
	};

	const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
		e.preventDefault();
		const { cx, cy, scale } = viewportRef.current;
		const canvas = canvasRef.current;
		if(!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const w   = canvas.width  / dpr;
		const h   = canvas.height / dpr;

		const worldX   = cx + (e.nativeEvent.offsetX - w / 2) / scale;
		const worldY   = cy - (e.nativeEvent.offsetY - h / 2) / scale;
		const newScale = Math.min(5000, Math.max(5, scale * (1 - e.deltaY * 0.001)));

		viewportRef.current.scale = newScale;
		viewportRef.current.cx    = worldX - (e.nativeEvent.offsetX - w / 2) / newScale;
		viewportRef.current.cy    = worldY + (e.nativeEvent.offsetY - h / 2) / newScale;
		setPopup(null);
		draw();
	};

	const zoomIn = () => {
		viewportRef.current.scale = Math.min(5000, viewportRef.current.scale * 1.5);
		setPopup(null);
		draw();
	};

	const zoomOut = () => {
		viewportRef.current.scale = Math.max(5, viewportRef.current.scale / 1.5);
		setPopup(null);
		draw();
	};

	const resetView = () => {
		viewportRef.current = { ...DEFAULT_VP };
		setPopup(null);
		draw();
	};

	const updateExpr = (id: string, expr: string) => {
		setEquations(prev => prev.map(eq =>
		{
			if(eq.id !== id) return eq;
			const fn    = compileExpr(expr);
			const error = expr.trim() !== '' && fn === null;
			return { ...eq, expr, error };
		}));

		setPopup(prev => (prev && prev.eqIds.includes(id)) ? null : prev);
	};

	const activateEquation = (id: string) => {
		setActiveId(id);
		setPopup(null);
	};

	const addEquation = () => {
		if(equations.length >= MAX_EQ) return;
		const color = COLORS[equations.length % COLORS.length];
		setEquations(prev => [...prev, { id: nextId(), expr: '', color, error: false }]);
	};

	const removeEquation = (id: string) => {
		if(equations.length <= 1) return;
		setEquations(prev => prev.filter(eq => eq.id !== id));
		setActiveId(prev => (prev === id ? null : prev));
		setPopup(prev => (prev && prev.eqIds.includes(id)) ? null : prev);
	};

	const sideLayout = layout === 'side' && !readOnly;

	return (
		<div className={['@container flex flex-col gap-3 w-full', className].join(' ')}>
			<div className={['flex flex-col gap-4 w-full', sideLayout ? '@3xl:flex-row @3xl:items-start' : ''].filter(Boolean).join(' ')}>
				<div ref={wrapperRef} className={['relative w-full rounded-[var(--radius-lg)] overflow-hidden border-[length:var(--border-width)] border-surface-border', sideLayout ? '@3xl:flex-1 @3xl:min-w-0' : ''].filter(Boolean).join(' ')}>
					<canvas
						ref={canvasRef}
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
						onPointerLeave={onPointerLeave}
						onWheel={onWheel}
						style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
						className='block w-full'
						aria-label='Function plot'
						role='img'
					/>

					{/* Hover tooltip */}
					{tooltip && hover && (
						<div className='pointer-events-none absolute inset-0'>
							<span
								className='absolute w-2 h-2 -ml-1 -mt-1 rounded-full ring-2 ring-surface'
								style={{ left: hover.sx, top: hover.sy, backgroundColor: hover.color }}
								aria-hidden='true'
							/>
							<div
								className='absolute flex items-center gap-1.5 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface px-2.5 py-1.5 text-xs shadow-[0_4px_16px_rgba(0,0,0,0.12)] whitespace-nowrap'
								style={{ left: hover.sx, top: hover.sy, transform: 'translate(-50%, calc(-100% - 10px))' }}
							>
								<span className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: hover.color }} aria-hidden='true' />
								<span className='text-text font-medium tabular-nums'>
									({formatCoord(hover.x)}, {formatCoord(hover.y)})
								</span>
							</div>
						</div>
					)}

					{/* Marker popup (extremum or intersection) */}
					{popup && (
						<div className='pointer-events-none absolute inset-0'>
							<span
								className='absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full ring-2 ring-surface'
								style={{ left: popup.sx, top: popup.sy, backgroundColor: popup.color }}
								aria-hidden='true'
							/>
							<div
								role='dialog'
								aria-label={`${popup.label} point`}
								className='pointer-events-auto absolute flex items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface pl-2.5 pr-1.5 py-1.5 text-xs shadow-[0_4px_16px_rgba(0,0,0,0.12)] whitespace-nowrap'
								style={{ left: popup.sx, top: popup.sy, transform: 'translate(-50%, calc(-100% - 12px))' }}
							>
								<span className='w-2 h-2 rounded-full shrink-0' style={{ backgroundColor: popup.color }} aria-hidden='true' />
								<span className='text-text font-medium tabular-nums'>
									({formatCoord(popup.x)}, {formatCoord(popup.y)})
								</span>
								<button
									type='button'
									onClick={() => setPopup(null)}
									aria-label='Close'
									className='flex items-center justify-center w-5 h-5 rounded-[var(--radius)] text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
								>
									<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
										<line x1='18' y1='6' x2='6' y2='18' />
										<line x1='6' y1='6' x2='18' y2='18' />
									</svg>
								</button>
							</div>
						</div>
					)}

					{/* Zoom controls */}
					<div
						className='absolute top-2 right-2 flex flex-col gap-1 rounded-[var(--radius-lg)] overflow-hidden border-[length:var(--border-width)] border-surface-border bg-surface/80 backdrop-blur-[var(--backdrop-blur)]'
						aria-label='Zoom controls'
					>
						<ZoomButton onClick={zoomIn}    aria-label='Zoom in'>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
								<circle cx='11' cy='11' r='8' />
								<line x1='21' y1='21' x2='16.65' y2='16.65' />
								<line x1='11' y1='8' x2='11' y2='14' />
								<line x1='8' y1='11' x2='14' y2='11' />
							</svg>
						</ZoomButton>
						<ZoomButton onClick={zoomOut}   aria-label='Zoom out'>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
								<circle cx='11' cy='11' r='8' />
								<line x1='21' y1='21' x2='16.65' y2='16.65' />
								<line x1='8' y1='11' x2='14' y2='11' />
							</svg>
						</ZoomButton>
						<ZoomButton onClick={resetView} aria-label='Reset view'>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
								<path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
								<path d='M3 3v5h5' />
							</svg>
						</ZoomButton>
					</div>
				</div>

				{/* Equation list */}
				{!readOnly && (
					<div
						className={[
							'flex flex-col gap-2 w-full',
							sideLayout ? '@3xl:w-72 @3xl:shrink-0 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-3' : '',
						].filter(Boolean).join(' ')}
					>
						{equations.map((eq, i) => (
							<div
								key={eq.id}
								className={[
									'group flex items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] pl-3 pr-1.5 py-1.5',
									'transition-colors duration-[var(--duration-fast)]',
									'focus-within:ring-2 focus-within:ring-offset-2',
									eq.error
										? 'border-danger bg-danger/5 focus-within:ring-danger-ring'
										: eq.id === activeId
											? 'border-brand-ring/50 bg-surface-hover focus-within:ring-brand-ring'
											: 'border-input-border bg-surface hover:border-input-border-hover focus-within:ring-brand-ring',
								].join(' ')}
							>
								<span
									className='shrink-0 w-2.5 h-2.5 rounded-full'
									style={{ backgroundColor: eq.color }}
									aria-hidden='true'
								/>
								<input
									type='text'
									value={eq.expr}
									onChange={e => updateExpr(eq.id, e.target.value)}
									onFocus={() => activateEquation(eq.id)}
									aria-label={`Equation ${i + 1}`}
									aria-invalid={eq.error ? 'true' : 'false'}
									placeholder='e.g. x^2 + 1'
									className='flex-1 min-w-0 bg-transparent text-sm font-mono text-text placeholder:text-text-subtle focus:outline-none'
								/>
								<button
									type='button'
									onClick={() => removeEquation(eq.id)}
									aria-label={`Remove equation ${i + 1}`}
									disabled={equations.length <= 1}
									className={[
										'flex items-center justify-center w-6 h-6 rounded-[var(--radius-sm)] text-text-muted',
										'transition-colors duration-[var(--duration-fast)]',
										'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring',
										'disabled:pointer-events-none disabled:opacity-40',
										'hover:bg-surface-hover hover:text-text',
									].join(' ')}
								>
									<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
										<line x1='18' y1='6' x2='6' y2='18' />
										<line x1='6' y1='6' x2='18' y2='18' />
									</svg>
								</button>
							</div>
						))}

						<button
							type='button'
							onClick={addEquation}
							disabled={equations.length >= MAX_EQ}
							aria-label='Add equation'
							className={[
								'self-start flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-1.5 text-sm text-text-muted',
								'border-[length:var(--border-width)] border-dashed border-surface-border',
								'transition-colors duration-[var(--duration-fast)]',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
								'disabled:pointer-events-none disabled:opacity-40',
								'hover:border-surface-border-hover hover:text-text hover:bg-surface-hover',
							].join(' ')}
						>
							<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
								<line x1='12' y1='5' x2='12' y2='19' />
								<line x1='5' y1='12' x2='19' y2='12' />
							</svg>
							Add equation
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

interface ZoomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

const ZoomButton = ({ children, ...props }: ZoomButtonProps) => {
	return (
		<button
			type='button'
			{...props}
			className={[
				'flex items-center justify-center w-7 h-7 text-text-muted',
				'transition-colors duration-[var(--duration-fast)]',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				'hover:bg-surface-hover hover:text-text',
			].join(' ')}
		>
			{children}
		</button>
	);
};

export default FunctionPlotter;
