'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FunctionPlotterProps
{
	initialEquations?: string[];
	height?:           number;
	className?:        string;
	readOnly?:         boolean;
}

interface Viewport
{
	cx:    number;
	cy:    number;
	scale: number;
}

interface Equation
{
	id:    string;
	expr:  string;
	color: string;
	error: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS     = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
const GRID_STEPS = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100];
const DEFAULT_VP: Viewport = { cx: 0, cy: 0, scale: 60 };
const MAX_EQ     = 6;

let _idCounter = 0;
const nextId = () => `eq-${++_idCounter}`;

// ─── Expression compiler ──────────────────────────────────────────────────────

const compileExpr = (expr: string): ((x: number) => number) | null =>
{
	try
	{
		const sanitized = expr
			.replace(/\^/g, '**')
			.replace(/(\d)(x)/gi, '$1*$2')
			.replace(/(x)(\d)/gi, '$1*$2');
		const fn = new Function('x', `'use strict'; return (${sanitized});`);
		fn(0);
		return fn as (x: number) => number;
	}
	catch { return null; }
}

// ─── FunctionPlotter ──────────────────────────────────────────────────────────

const FunctionPlotter = ({
	initialEquations = ['2*x + 1', 'x^2'],
	height = 400,
	className = '',
	readOnly = false,
}: FunctionPlotterProps) =>
{
	const canvasRef   = useRef<HTMLCanvasElement>(null);
	const wrapperRef  = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<Viewport>({ ...DEFAULT_VP });
	const isDragging  = useRef(false);
	const dragStart   = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

	const [equations, setEquations] = useState<Equation[]>(() =>
		initialEquations.slice(0, MAX_EQ).map((expr, i) => ({
			id:    nextId(),
			expr,
			color: COLORS[i % COLORS.length],
			error: false,
		}))
	);

	const [dragging, setDragging] = useState(false);

	// ── Draw ──────────────────────────────────────────────────────────────────

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

		// ── Grid lines ────────────────────────────────────────────────────────

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

		// ── Axes ──────────────────────────────────────────────────────────────

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

		// ── Tick labels ───────────────────────────────────────────────────────

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

		// ── Curves ────────────────────────────────────────────────────────────

		for(const eq of equations)
		{
			if(eq.error) continue;
			const fn = compileExpr(eq.expr);
			if(!fn) continue;

			ctx.beginPath();
			ctx.strokeStyle = eq.color;
			ctx.lineWidth   = 2;
			ctx.lineCap     = 'round';
			ctx.lineJoin    = 'round';

			let penDown = false;

			for(let sx = 0; sx <= w; sx++)
			{
				const wx = cx + (sx - w / 2) / scale;
				let   wy: number;

				try { wy = fn(wx); }
				catch { penDown = false; continue; }

				if(!isFinite(wy) || isNaN(wy))
				{
					penDown = false;
					continue;
				}

				const sy = toScreenY(wy);

				if(Math.abs(sy) > h * 10)
				{
					penDown = false;
					continue;
				}

				if(!penDown)
				{
					ctx.moveTo(sx, sy);
					penDown = true;
				}
				else
				{
					ctx.lineTo(sx, sy);
				}
			}

			ctx.stroke();
		}
	}, [equations]);

	// ── Canvas size / DPR ─────────────────────────────────────────────────────

	useEffect(() =>
	{
		const canvas  = canvasRef.current;
		const wrapper = wrapperRef.current;
		if(!canvas || !wrapper) return;

		const resize = () =>
		{
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

	// ── Pointer events (pan) ──────────────────────────────────────────────────

	const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) =>
	{
		e.currentTarget.setPointerCapture(e.pointerId);
		isDragging.current = true;
		setDragging(true);
		dragStart.current  = {
			x:  e.nativeEvent.offsetX,
			y:  e.nativeEvent.offsetY,
			cx: viewportRef.current.cx,
			cy: viewportRef.current.cy,
		};
	};

	const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) =>
	{
		if(!isDragging.current) return;
		const { scale } = viewportRef.current;
		const dx = (e.nativeEvent.offsetX - dragStart.current.x) / scale;
		const dy = (e.nativeEvent.offsetY - dragStart.current.y) / scale;
		viewportRef.current.cx = dragStart.current.cx - dx;
		viewportRef.current.cy = dragStart.current.cy + dy;
		draw();
	};

	const onPointerUp = () =>
	{
		isDragging.current = false;
		setDragging(false);
	};

	// ── Wheel (zoom) ──────────────────────────────────────────────────────────

	const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) =>
	{
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
		draw();
	};

	// ── Zoom buttons ──────────────────────────────────────────────────────────

	const zoomIn = () =>
	{
		viewportRef.current.scale = Math.min(5000, viewportRef.current.scale * 1.5);
		draw();
	};

	const zoomOut = () =>
	{
		viewportRef.current.scale = Math.max(5, viewportRef.current.scale / 1.5);
		draw();
	};

	const resetView = () =>
	{
		viewportRef.current = { ...DEFAULT_VP };
		draw();
	};

	// ── Equation editing ──────────────────────────────────────────────────────

	const updateExpr = (id: string, expr: string) =>
	{
		setEquations(prev => prev.map(eq =>
		{
			if(eq.id !== id) return eq;
			const fn    = compileExpr(expr);
			const error = expr.trim() !== '' && fn === null;
			return { ...eq, expr, error };
		}));
	};

	const addEquation = () =>
	{
		if(equations.length >= MAX_EQ) return;
		const color = COLORS[equations.length % COLORS.length];
		setEquations(prev => [...prev, { id: nextId(), expr: '', color, error: false }]);
	};

	const removeEquation = (id: string) =>
	{
		if(equations.length <= 1) return;
		setEquations(prev => prev.filter(eq => eq.id !== id));
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className={['flex flex-col gap-3 w-full', className].join(' ')}>
			<div ref={wrapperRef} className='relative w-full rounded-[var(--radius-lg)] overflow-hidden border-[length:var(--border-width)] border-surface-border'>
				<canvas
					ref={canvasRef}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerLeave={onPointerUp}
					onWheel={onWheel}
					style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
					className='block w-full'
					aria-label='Function plot'
					role='img'
				/>

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
			{!readOnly && <div className='flex flex-col gap-2'>
				{equations.map((eq, i) => (
					<div key={eq.id} className='flex items-center gap-2'>
						<span
							className='shrink-0 w-3 h-3 rounded-full'
							style={{ backgroundColor: eq.color }}
							aria-hidden='true'
						/>
						<input
							type='text'
							value={eq.expr}
							onChange={e => updateExpr(eq.id, e.target.value)}
							aria-label={`Equation ${i + 1}`}
							aria-invalid={eq.error ? 'true' : 'false'}
							placeholder='e.g. x^2 + 1'
							className={[
								'flex-1 rounded-[var(--radius)] border-[length:var(--border-width)] px-3 py-1.5 text-sm bg-surface text-text',
								'placeholder:text-text-subtle',
								'transition-colors duration-[var(--duration-fast)]',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
								eq.error
									? 'border-danger focus-visible:ring-danger-ring'
									: 'border-input-border hover:border-input-border-hover focus-visible:ring-brand-ring',
							].join(' ')}
						/>
						<button
							type='button'
							onClick={() => removeEquation(eq.id)}
							aria-label={`Remove equation ${i + 1}`}
							disabled={equations.length <= 1}
							className={[
								'flex items-center justify-center w-7 h-7 rounded-[var(--radius)] text-text-muted',
								'transition-colors duration-[var(--duration-fast)]',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
								'disabled:pointer-events-none disabled:opacity-40',
								'hover:bg-surface-hover hover:text-text',
							].join(' ')}
						>
							<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
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
			</div>}
		</div>
	);
};

// ─── ZoomButton ───────────────────────────────────────────────────────────────

interface ZoomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>
{
	children: React.ReactNode;
}

const ZoomButton = ({ children, ...props }: ZoomButtonProps) =>
{
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
