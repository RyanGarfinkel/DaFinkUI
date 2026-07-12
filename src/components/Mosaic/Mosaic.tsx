'use client';

import {
	createContext, useCallback, useContext, useEffect, useId,
	useMemo, useRef, useState, Children, isValidElement,
	HTMLAttributes, ReactNode, ReactElement, CSSProperties,
} from 'react';
import {
	DndContext, DragMoveEvent, DragOverlay, DragStartEvent,
	KeyboardSensor, PointerSensor, useDraggable, useSensor, useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MosaicTileLayout
{
	id:      string;
	col:     number;
	row:     number;
	colSpan: number;
	rowSpan: number;
}

export interface MosaicTileSize
{
	colSpan: number;
	rowSpan: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// When no explicit `rows` prop is given, derive the grid height from the layout
// so dragging can never create new rows beyond what already exists.
const effectiveRowCount = (rows: number | undefined, layout: MosaicTileLayout[]): number =>
{
	if(rows !== undefined) return rows;
	return Math.max(1, ...layout.map(t => t.row + t.rowSpan - 1));
};

const snapToGrid = (
	x:         number,
	y:         number,
	colSpan:   number,
	rowSpan:   number,
	cols:      number,
	rows:      number,
	colWidth:  number,
	rowHeight: number,
	gap:       number,
): { col: number; row: number } =>
{
	const col = Math.max(1, Math.min(cols - colSpan + 1, Math.round(x / (colWidth + gap)) + 1));
	const row = Math.max(1, Math.min(rows - rowSpan + 1, Math.round(y / (rowHeight + gap)) + 1));
	return { col, row };
};

const findOverlapping = (
	tiles:   MosaicTileLayout[],
	col:     number,
	row:     number,
	colSpan: number,
	rowSpan: number,
	exclude: string,
): MosaicTileLayout[] =>
{
	return tiles.filter(t =>
	{
		if(t.id === exclude) return false;
		return !(col + colSpan <= t.col || t.col + t.colSpan <= col ||
		         row + rowSpan <= t.row || t.row + t.rowSpan <= row);
	});
};

const hasOverlaps = (layout: MosaicTileLayout[]): boolean =>
{
	for(let i = 0; i < layout.length; i++)
		for(let j = i + 1; j < layout.length; j++)
		{
			const a = layout[i];
			const b = layout[j];
			if(!(a.col + a.colSpan <= b.col || b.col + b.colSpan <= a.col ||
			     a.row + a.rowSpan <= b.row || b.row + b.rowSpan <= a.row))
				return true;
		}
	return false;
};

// Finds the nearest column (by minimum shift) where the displaced tile fits in its
// current row without touching the active tile's new footprint or any other tile.
const findDisplacementPos = (
	others:        MosaicTileLayout[],
	displaced:     MosaicTileLayout,
	targetCol:     number,
	targetRow:     number,
	activeColSpan: number,
	activeRowSpan: number,
	cols:          number,
): { col: number; row: number } | null =>
{
	const fits = (c: number): boolean =>
	{
		if(c < 1 || c + displaced.colSpan - 1 > cols) return false;
		const clearActive = c + displaced.colSpan <= targetCol ||
		                    targetCol + activeColSpan <= c ||
		                    displaced.row + displaced.rowSpan <= targetRow ||
		                    targetRow + activeRowSpan <= displaced.row;
		if(!clearActive) return false;
		return others.every(t =>
			c + displaced.colSpan <= t.col || t.col + t.colSpan <= c ||
			displaced.row + displaced.rowSpan <= t.row || t.row + t.rowSpan <= displaced.row
		);
	};

	let bestCol  = -1;
	let bestDist = Infinity;

	for(let c = 1; c <= cols - displaced.colSpan + 1; c++)
	{
		if(!fits(c)) continue;
		const dist = Math.abs(c - displaced.col);
		if(dist < bestDist) { bestDist = dist; bestCol = c; }
	}

	return bestCol === -1 ? null : { col: bestCol, row: displaced.row };
}

// Vertical counterpart to findDisplacementPos: finds the nearest row (keeping the
// displaced tile's column) that clears the active tile's new footprint and every
// other tile, so a tile dragged up/down onto occupied rows pushes them out of the way.
const findDisplacementPosVertical = (
	others:        MosaicTileLayout[],
	displaced:     MosaicTileLayout,
	targetCol:     number,
	targetRow:     number,
	activeColSpan: number,
	activeRowSpan: number,
	rows:          number,
): { col: number; row: number } | null =>
{
	const fits = (r: number): boolean =>
	{
		if(r < 1 || r + displaced.rowSpan - 1 > rows) return false;
		const clearActive = r + displaced.rowSpan <= targetRow ||
		                    targetRow + activeRowSpan <= r ||
		                    displaced.col + displaced.colSpan <= targetCol ||
		                    targetCol + activeColSpan <= displaced.col;
		if(!clearActive) return false;
		return others.every(t =>
			displaced.col + displaced.colSpan <= t.col || t.col + t.colSpan <= displaced.col ||
			r + displaced.rowSpan <= t.row || t.row + t.rowSpan <= r
		);
	};

	let bestRow  = -1;
	let bestDist = Infinity;

	for(let r = 1; r <= rows - displaced.rowSpan + 1; r++)
	{
		if(!fits(r)) continue;
		const dist = Math.abs(r - displaced.row);
		if(dist < bestDist) { bestDist = dist; bestRow = r; }
	}

	return bestRow === -1 ? null : { col: displaced.col, row: bestRow };
}

const computePreview = (
	layout:   MosaicTileLayout[],
	activeId: string,
	col:      number,
	row:      number,
	cols:     number,
	rows:     number,
): MosaicTileLayout[] | null =>
{
	const active = layout.find(t => t.id === activeId);
	if(!active) return null;
	if(active.col === col && active.row === row) return null;

	const overlapping = findOverlapping(layout, col, row, active.colSpan, active.rowSpan, activeId);

	const updates = new Map<string, { col: number; row: number }>();
	updates.set(activeId, { col, row });

	if(overlapping.length >= 1)
	{
		const others = layout.filter(t => t.id !== activeId && !overlapping.some(o => o.id === t.id));

		// Shift every displaced tile along whichever axis the active tile is actually
		// moving on first (a vertical drag should push tiles down/up, not sideways),
		// falling back to the other axis if that direction can't place them all.
		const movingVertically = row !== active.row;
		const primary    = movingVertically ? findDisplacementPosVertical : findDisplacementPos;
		const primaryArg = movingVertically ? rows : cols;
		const fallback    = movingVertically ? findDisplacementPos : findDisplacementPosVertical;
		const fallbackArg = movingVertically ? cols : rows;

		const place = (finder: typeof primary, arg: number): boolean =>
		{
			for(const d of overlapping)
			{
				const pos = finder(others, d, col, row, active.colSpan, active.rowSpan, arg);
				if(!pos) return false;
				updates.set(d.id, pos);
			}
			return true;
		};

		if(!place(primary, primaryArg))
		{
			updates.clear();
			updates.set(activeId, { col, row });
			if(!place(fallback, fallbackArg)) return null;
		}
	}

	const result = layout.map(t =>
	{
		const u = updates.get(t.id);
		return u ? { ...t, ...u } : t;
	});

	return hasOverlaps(result) ? null : result;
}

// Scans every grid cell for the closest one that yields a valid placement (empty,
// or a clean single-tile swap) and snaps to it, so the ghost never lingers over a
// dead zone (e.g. a spot overlapping two tiles) waiting for the pointer to leave it.
const findBestCell = (
	layout:    MosaicTileLayout[],
	activeId:  string,
	targetCol: number,
	targetRow: number,
	cols:      number,
	rows:      number,
	colWidth:  number,
	rowHeight: number,
	gap:       number,
): { col: number; row: number } =>
{
	const active = layout.find(t => t.id === activeId);
	if(!active) return { col: targetCol, row: targetRow };

	const distSq = (col: number, row: number): number =>
	{
		const dx = (col - targetCol) * (colWidth + gap);
		const dy = (row - targetRow) * (rowHeight + gap);
		return dx * dx + dy * dy;
	};

	let bestCol  = active.col;
	let bestRow  = active.row;
	let bestDist = distSq(active.col, active.row);

	for(let row = 1; row <= rows - active.rowSpan + 1; row++)
		for(let col = 1; col <= cols - active.colSpan + 1; col++)
		{
			if(col === active.col && row === active.row) continue;
			if(!computePreview(layout, activeId, col, row, cols, rows)) continue;

			const dist = distSq(col, row);
			if(dist < bestDist) { bestDist = dist; bestCol = col; bestRow = row; }
		}

	return { col: bestCol, row: bestRow };
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface GridCtx
{
	layout:        MosaicTileLayout[];
	previewLayout: MosaicTileLayout[] | null;
	cols:          number;
	rows:          number;
	rowHeight:     number;
	gap:           number;
	colWidth:      number;
	activeId:      string | null;
	minColSpan:    number;
	minRowSpan:    number;
	maxColSpan:    number;
	maxRowSpan:    number;
	onTileChange:  (id: string, col: number, row: number, colSpan: number, rowSpan: number) => void;
}

const GridContext = createContext<GridCtx | null>(null);

const useGrid = () =>
{
	const ctx = useContext(GridContext);
	if(!ctx) throw new Error('MosaicTile must be used inside Mosaic');
	return ctx;
};

// ─── SizePicker ───────────────────────────────────────────────────────────────

interface SizePickerProps
{
	pickerCols: number;
	pickerRows: number;
	minCol:     number;
	minRow:     number;
	currentCol: number;
	currentRow: number;
	onSelect:   (col: number, row: number) => void;
}

const SizePicker = (
	{ pickerCols, pickerRows, minCol, minRow, currentCol, currentRow, onSelect }: SizePickerProps
) =>
{
	const [hoverCol, setHoverCol] = useState(currentCol);
	const [hoverRow, setHoverRow] = useState(currentRow);

	return (
		<div className='flex flex-col gap-2.5 p-3'>
			<div
				className='grid gap-1'
				style={{ gridTemplateColumns: `repeat(${pickerCols}, 1.25rem)` }}
				onMouseLeave={() => { setHoverCol(currentCol); setHoverRow(currentRow); }}
			>
				{Array.from({ length: pickerRows * pickerCols }, (_, i) =>
				{
					const c         = (i % pickerCols) + 1;
					const r         = Math.floor(i / pickerCols) + 1;
					const isValid   = c >= minCol && r >= minRow;
					// Lit state mirrors the full hovered rectangle (1..hoverCol, 1..hoverRow), not
					// just the individually-selectable cells — otherwise columns/rows below the min
					// span never light up and the highlighted block looks smaller than the "W × H"
					// label below it (e.g. label reads "3 × 2" but only 2 columns glow).
					const isLit     = c <= hoverCol && r <= hoverRow;
					const isCurrent = c === currentCol && r === currentRow;

					return (
						<button
							key={`${c}-${r}`}
							type='button'
							disabled={!isValid}
							onMouseEnter={() => { if(isValid) { setHoverCol(c); setHoverRow(r); } }}
							onClick={() => isValid && onSelect(c, r)}
							aria-label={`${c}×${r}`}
							aria-pressed={isCurrent}
							className={[
								'w-5 h-5 rounded-[var(--radius-sm)] border-[length:var(--border-width)] motion-safe:transition-colors motion-safe:duration-75',
								isLit
									? 'bg-brand border-brand'
									: isCurrent
										? 'bg-surface-active border-brand/40'
										: isValid
											? 'bg-surface-active border-surface-border hover:border-surface-border-hover'
											: 'bg-surface border-surface-border opacity-30 cursor-not-allowed',
							].join(' ')}
						/>
					);
				})}
			</div>
			<p className='text-xs text-text-muted text-center tabular-nums'>
				{hoverCol} × {hoverRow}
			</p>
		</div>
	);
};

// ─── Mosaic ───────────────────────────────────────────────────────────────────

export interface MosaicProps extends HTMLAttributes<HTMLDivElement>
{
	layout:         MosaicTileLayout[];
	onLayoutChange: (layout: MosaicTileLayout[]) => void;
	cols?:          number;
	rows?:          number;
	rowHeight?:     number;
	gap?:           number;
	minColSpan?:    number;
	minRowSpan?:    number;
	maxColSpan?:    number;
	maxRowSpan?:    number;
	className?:     string;
	children:       ReactNode;
}

export const Mosaic = (
	{
		layout,
		onLayoutChange,
		cols       = 12,
		rows,
		rowHeight  = 160,
		gap        = 16,
		minColSpan = 1,
		minRowSpan = 1,
		maxColSpan,
		maxRowSpan = 4,
		className  = '',
		children,
		...props
	}: MosaicProps
) =>
{
	const dndId = useId();
	const gridRef = useRef<HTMLDivElement>(null);
	const [colWidth, setColWidth]     = useState(0);
	const [activeId, setActiveId]     = useState<string | null>(null);
	const [previewLayout, setPreviewLayoutState] = useState<MosaicTileLayout[] | null>(null);
	const maxCol = maxColSpan ?? cols;

	// Refs keep modifier and event handlers stable while always reading fresh values.
	const colWidthRef    = useRef(colWidth);
	const colsRef        = useRef(cols);
	const rowsRef        = useRef(rows);
	const rowHeightRef   = useRef(rowHeight);
	const gapRef         = useRef(gap);
	const layoutRef      = useRef(layout);
	const previewRef     = useRef<MosaicTileLayout[] | null>(null);
	const activeTileRef  = useRef<MosaicTileLayout | null>(null);
	const resolvedCellRef = useRef<{ col: number; row: number } | null>(null);

	useEffect(() => { colWidthRef.current  = colWidth;  }, [colWidth]);
	useEffect(() => { colsRef.current      = cols;      }, [cols]);
	useEffect(() => { rowsRef.current      = rows;      }, [rows]);
	useEffect(() => { rowHeightRef.current = rowHeight; }, [rowHeight]);
	useEffect(() => { gapRef.current       = gap;       }, [gap]);
	useEffect(() => { layoutRef.current    = layout;    }, [layout]);

	// Always defined: explicit prop or derived from current layout.
	const effectiveRows = effectiveRowCount(rows, layout);

	const setPreviewLayout = useCallback((next: MosaicTileLayout[] | null) =>
	{
		previewRef.current = next;
		setPreviewLayoutState(next);
	}, []);

	useEffect(() =>
	{
		if(!gridRef.current) return;
		const compute = () =>
		{
			if(!gridRef.current) return;
			const w = gridRef.current.offsetWidth;
			setColWidth((w - (colsRef.current - 1) * gapRef.current) / colsRef.current);
		};
		compute();
		const ro = new ResizeObserver(compute);
		ro.observe(gridRef.current);
		return () => ro.disconnect();
	}, []);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	// Positions the DragOverlay ghost at the resolved target cell (the nearest cell
	// that yields a valid placement) rather than directly under the pointer or the
	// raw nearest grid cell, so the ghost always sits somewhere a drop will land.
	const snapModifier = useCallback((args: {
		draggingNodeRect: { left: number; top: number } | null;
		transform:        { x: number; y: number; scaleX: number; scaleY: number };
		[key: string]:    unknown;
	}) =>
	{
		const { draggingNodeRect, transform } = args;
		const colW = colWidthRef.current;
		const rowH = rowHeightRef.current;
		const g    = gapRef.current;
		const grid = gridRef.current;
		const cell = resolvedCellRef.current;

		if(!draggingNodeRect || !grid || !cell || colW === 0) return transform;

		const gridRect = grid.getBoundingClientRect();

		return {
			x:      (cell.col - 1) * (colW + g) + gridRect.left - draggingNodeRect.left,
			y:      (cell.row - 1) * (rowH + g) + gridRect.top  - draggingNodeRect.top,
			scaleX: 1,
			scaleY: 1,
		};
	}, []);

	const onDragStart = useCallback(({ active }: DragStartEvent) =>
	{
		const tile = layoutRef.current.find(t => t.id === String(active.id)) ?? null;
		activeTileRef.current = tile;
		resolvedCellRef.current = tile ? { col: tile.col, row: tile.row } : null;
		setActiveId(String(active.id));
		setPreviewLayout(null);
	}, [setPreviewLayout]);

	const onDragMove = useCallback(({ active }: DragMoveEvent) =>
	{
		const colW = colWidthRef.current;
		const grid = gridRef.current;
		const tile = activeTileRef.current;
		if(!colW || !grid || !tile) return;

		const translated = active.rect.current.translated;
		if(!translated) return;

		const gridRect = grid.getBoundingClientRect();
		const relX     = translated.left - gridRect.left;
		const relY     = translated.top  - gridRect.top;
		const rowH     = rowHeightRef.current;
		const g        = gapRef.current;
		const c        = colsRef.current;
		const effRows  = effectiveRowCount(rowsRef.current, layoutRef.current);

		const { col, row } = snapToGrid(relX, relY, tile.colSpan, tile.rowSpan, c, effRows, colW, rowH, g);
		const best = findBestCell(layoutRef.current, String(active.id), col, row, c, effRows, colW, rowH, g);
		resolvedCellRef.current = best;

		if(best.col === tile.col && best.row === tile.row)
		{
			setPreviewLayout(null);
			return;
		}

		setPreviewLayout(computePreview(layoutRef.current, String(active.id), best.col, best.row, c, effRows));
	}, [setPreviewLayout]);

	const onDragEnd = useCallback(() =>
	{
		setActiveId(null);
		activeTileRef.current = null;
		resolvedCellRef.current = null;
		const preview = previewRef.current;
		setPreviewLayout(null);
		if(preview) onLayoutChange(preview);
	}, [onLayoutChange, setPreviewLayout]);

	const onDragCancel = useCallback(() =>
	{
		setActiveId(null);
		activeTileRef.current = null;
		resolvedCellRef.current = null;
		setPreviewLayout(null);
	}, [setPreviewLayout]);

	const activeTile = activeId ? layout.find(t => t.id === activeId) : null;
	const ghostW     = activeTile && colWidth
		? activeTile.colSpan * colWidth + (activeTile.colSpan - 1) * gap
		: 0;
	const ghostH     = activeTile
		? activeTile.rowSpan * rowHeight + (activeTile.rowSpan - 1) * gap
		: 0;

	// Renders the same content the tile shows in the grid, so the overlay
	// reads as the tile itself moving rather than a placeholder standing in for it.
	const activeContent = useMemo(() =>
	{
		if(!activeTile) return null;
		const match = Children.toArray(children).find(
			(child): child is ReactElement<MosaicTileProps> =>
				isValidElement<MosaicTileProps>(child) && child.props.id === activeId
		);
		if(!match) return null;
		const tileChildren = match.props.children;
		return typeof tileChildren === 'function'
			? tileChildren({ colSpan: activeTile.colSpan, rowSpan: activeTile.rowSpan })
			: tileChildren;
	}, [children, activeId, activeTile]);

	const handleTileChange = useCallback((id: string, col: number, row: number, colSpan: number, rowSpan: number) =>
		onLayoutChange(layout.map(t => t.id === id ? { ...t, col, row, colSpan, rowSpan } : t)),
	[layout, onLayoutChange]);

	return (
		<GridContext.Provider value={{
			layout, previewLayout, cols, rows: effectiveRows, rowHeight, gap, colWidth,
			activeId,
			minColSpan, minRowSpan,
			maxColSpan: maxCol, maxRowSpan,
			onTileChange: handleTileChange,
		}}>
			<DndContext
				id={dndId}
				sensors={sensors}
				onDragStart={onDragStart}
				onDragMove={onDragMove}
				onDragEnd={onDragEnd}
				onDragCancel={onDragCancel}
			>
				<div
					ref={gridRef}
					role='grid'
					aria-label='Mosaic'
					className={`grid ${className}`}
					style={{
						gridTemplateColumns: `repeat(${cols}, 1fr)`,
						gridTemplateRows:    `repeat(${effectiveRows}, ${rowHeight}px)`,
						gap:                 `${gap}px`,
					}}
					{...props}
				>
					{children}
				</div>

				<DragOverlay
					modifiers={[snapModifier as never]}
					dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}
				>
					{activeTile && ghostW > 0 && (
						<div
							style={{ width: ghostW, height: ghostH, cursor: 'grabbing' }}
							className='relative overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-brand/20 bg-surface shadow-2xl ring-1 ring-brand/10'
						>
							<div className='h-full w-full p-5'>
								{activeContent}
							</div>
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</GridContext.Provider>
	);
};

// ─── MosaicTile ───────────────────────────────────────────────────────────────

export interface MosaicTileProps
{
	id:           string;
	minColSpan?:  number;
	maxColSpan?:  number;
	minRowSpan?:  number;
	maxRowSpan?:  number;
	className?:   string;
	children:     ReactNode | ((size: MosaicTileSize) => ReactNode);
}

type ResizeMode = 'right' | 'bottom' | 'left' | 'top';

export const MosaicTile = (
	{
		id,
		minColSpan: tileMinCol,
		maxColSpan: tileMaxCol,
		minRowSpan: tileMinRow,
		maxRowSpan: tileMaxRow,
		className = '',
		children,
	}: MosaicTileProps
) =>
{
	const {
		layout, previewLayout, cols, rows, colWidth, rowHeight, gap,
		activeId,
		minColSpan: gridMinCol, minRowSpan: gridMinRow,
		maxColSpan: gridMaxCol, maxRowSpan: gridMaxRow,
		onTileChange,
	} = useGrid();

	const minCol = tileMinCol ?? gridMinCol;
	const maxCol = tileMaxCol ?? gridMaxCol;
	const minRow = tileMinRow ?? gridMinRow;
	const maxRow = tileMaxRow ?? gridMaxRow;

	const entry   = layout.find(t => t.id === id);
	const tileCol = entry?.col     ?? 1;
	const tileRow = entry?.row     ?? 1;
	const srcCol  = entry?.colSpan ?? minCol;
	const srcRow  = entry?.rowSpan ?? minRow;

	// localTileCol/Row track position during left/top resize; localCol/Row track span.
	const [localCol,     setLocalCol]     = useState(srcCol);
	const [localRow,     setLocalRow]     = useState(srcRow);
	const [localTileCol, setLocalTileCol] = useState(tileCol);
	const [localTileRow, setLocalTileRow] = useState(tileRow);
	const isResizing                      = useRef(false);

	useEffect(() =>
	{
		if(!isResizing.current)
		{
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setLocalCol(srcCol);
			setLocalRow(srcRow);
			setLocalTileCol(tileCol);
			setLocalTileRow(tileRow);
		}
	}, [srcCol, srcRow, tileCol, tileRow]);

	const [showPicker, setShowPicker] = useState(false);
	const pickerRef                   = useRef<HTMLDivElement>(null);

	useEffect(() =>
	{
		if(!showPicker) return;
		const close = (e: MouseEvent) =>
		{
			if(pickerRef.current && !pickerRef.current.contains(e.target as Node))
				setShowPicker(false);
		};
		document.addEventListener('mousedown', close);
		return () => document.removeEventListener('mousedown', close);
	}, [showPicker]);

	useEffect(() =>
	{
		if(!showPicker) return;
		const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') setShowPicker(false); };
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [showPicker]);

	// ── Resize drag ─────────────────────────────────────────────────────────────

	const resizeStart = useRef<{
		x:    number;
		y:    number;
		col:  number; // colSpan at start
		row:  number; // rowSpan at start
		tcol: number; // tile col (position) at start
		trow: number; // tile row (position) at start
		mode: ResizeMode;
	} | null>(null);

	const onResizeDown = (e: React.PointerEvent, mode: ResizeMode) =>
	{
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		isResizing.current  = true;
		resizeStart.current = {
			x: e.clientX, y: e.clientY,
			col: localCol,  row: localRow,
			tcol: localTileCol, trow: localTileRow,
			mode,
		};
	};

	const onResizeMove = (e: React.PointerEvent) =>
	{
		const start = resizeStart.current;
		if(!start) return;

		if(start.mode === 'right')
		{
			const step = colWidth + gap;
			const raw  = start.col + Math.round((e.clientX - start.x) / step);
			let limit  = Math.min(maxCol, cols - start.tcol + 1);
			for(const other of layout)
			{
				if(other.id === id || other.col <= start.tcol) continue;
				const overlap = !(start.trow + start.row <= other.row || other.row + other.rowSpan <= start.trow);
				if(overlap) limit = Math.min(limit, other.col - start.tcol);
			}
			setLocalCol(Math.max(minCol, Math.min(limit, raw)));
		}
		else if(start.mode === 'bottom')
		{
			const step = rowHeight + gap;
			const raw  = start.row + Math.round((e.clientY - start.y) / step);
			let limit  = Math.min(maxRow, rows - start.trow + 1);
			for(const other of layout)
			{
				if(other.id === id || other.row <= start.trow) continue;
				const overlap = !(start.tcol + start.col <= other.col || other.col + other.colSpan <= start.tcol);
				if(overlap) limit = Math.min(limit, other.row - start.trow);
			}
			setLocalRow(Math.max(minRow, Math.min(limit, raw)));
		}
		else if(start.mode === 'left')
		{
			const step  = colWidth + gap;
			const delta = Math.round((e.clientX - start.x) / step);
			// Left bound: right edge of any tile strictly left of our starting position that shares rows.
			let leftBound = 1;
			for(const other of layout)
			{
				if(other.id === id || other.col + other.colSpan > start.tcol) continue;
				const overlap = !(start.trow + start.row <= other.row || other.row + other.rowSpan <= start.trow);
				if(overlap) leftBound = Math.max(leftBound, other.col + other.colSpan);
			}
			const newCol     = Math.max(leftBound, Math.min(start.tcol + start.col - minCol, start.tcol + delta));
			setLocalTileCol(newCol);
			setLocalCol(start.tcol + start.col - newCol);
		}
		else
		{
			const step  = rowHeight + gap;
			const delta = Math.round((e.clientY - start.y) / step);
			// Top bound: bottom edge of any tile strictly above our starting position that shares columns.
			let topBound = 1;
			for(const other of layout)
			{
				if(other.id === id || other.row + other.rowSpan > start.trow) continue;
				const overlap = !(start.tcol + start.col <= other.col || other.col + other.colSpan <= start.tcol);
				if(overlap) topBound = Math.max(topBound, other.row + other.rowSpan);
			}
			const newRow = Math.max(topBound, Math.min(start.trow + start.row - minRow, start.trow + delta));
			setLocalTileRow(newRow);
			setLocalRow(start.trow + start.row - newRow);
		}
	};

	const onResizeUp = () =>
	{
		if(!resizeStart.current) return;
		isResizing.current  = false;
		resizeStart.current = null;
		onTileChange(id, localTileCol, localTileRow, localCol, localRow);
	};

	const handlePickerSelect = (col: number, row: number) =>
	{
		setShowPicker(false);
		setLocalCol(col);
		setLocalRow(row);
		onTileChange(id, localTileCol, localTileRow, col, row);
	};

	// ── useDraggable ─────────────────────────────────────────────────────────────

	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

	// ── Displacement from preview layout ─────────────────────────────────────────

	const isActiveDrag = activeId !== null;
	const isThisActive = activeId === id;

	const displacement = useMemo(() =>
	{
		if(!isActiveDrag || isThisActive || !previewLayout || !colWidth) return null;
		const preview = previewLayout.find(t => t.id === id);
		if(!preview || !entry) return null;
		const dx = (preview.col - entry.col) * (colWidth + gap);
		const dy = (preview.row - entry.row) * (rowHeight + gap);
		if(dx === 0 && dy === 0) return null;
		return { dx, dy };
	}, [isActiveDrag, isThisActive, previewLayout, colWidth, gap, rowHeight, entry, id]);

	const style: CSSProperties = {
		gridColumn: `${localTileCol} / span ${localCol}`,
		gridRow:    `${localTileRow} / span ${localRow}`,
		transform:  displacement ? `translate3d(${displacement.dx}px, ${displacement.dy}px, 0)` : undefined,
		transition: isActiveDrag && !isThisActive ? 'transform 200ms cubic-bezier(0.2, 0, 0, 1)' : undefined,
		opacity:    isDragging ? 0 : 1,
	};

	// ── Resize range bounds ───────────────────────────────────────────────────────

	let effectiveMaxCol = Math.min(maxCol, cols - tileCol + 1);
	for(const other of layout)
	{
		if(other.id === id || other.col <= tileCol) continue;
		const overlap = !(tileRow + localRow <= other.row || other.row + other.rowSpan <= tileRow);
		if(overlap) effectiveMaxCol = Math.min(effectiveMaxCol, other.col - tileCol);
	}

	let effectiveMaxRow = Math.min(maxRow, rows - tileRow + 1);
	for(const other of layout)
	{
		if(other.id === id || other.row <= tileRow) continue;
		const overlap = !(tileCol + localCol <= other.col || other.col + other.colSpan <= tileCol);
		if(overlap) effectiveMaxRow = Math.min(effectiveMaxRow, other.row - tileRow);
	}

	// Left/top handles: can move the edge if there's room or the tile can shrink.
	let leftBound = 1;
	for(const other of layout)
	{
		if(other.id === id || other.col + other.colSpan > tileCol) continue;
		const overlap = !(tileRow + localRow <= other.row || other.row + other.rowSpan <= tileRow);
		if(overlap) leftBound = Math.max(leftBound, other.col + other.colSpan);
	}

	let topBound = 1;
	for(const other of layout)
	{
		if(other.id === id || other.row + other.rowSpan > tileRow) continue;
		const overlap = !(tileCol + localCol <= other.col || other.col + other.colSpan <= tileCol);
		if(overlap) topBound = Math.max(topBound, other.row + other.rowSpan);
	}

	const canResizeLeft = localTileCol > leftBound || localCol > minCol;
	const canResizeTop  = localTileRow > topBound  || localRow > minRow;

	const pickerCols = Math.min(effectiveMaxCol, 6);
	const pickerRows = Math.min(effectiveMaxRow, 4);

	const HANDLE_H = 'absolute left-8 right-8 h-1.5 cursor-row-resize z-20 touch-none opacity-0 group-hover/tile:opacity-100 motion-safe:transition-opacity motion-safe:duration-150 rounded-full bg-surface-border hover:bg-brand/50 active:bg-brand';
	const HANDLE_V = 'absolute top-8 bottom-8 w-1.5 cursor-col-resize z-20 touch-none opacity-0 group-hover/tile:opacity-100 motion-safe:transition-opacity motion-safe:duration-150 rounded-full bg-surface-border hover:bg-brand/50 active:bg-brand';

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`relative group/tile bg-surface border-[length:var(--border-width)] border-surface-border rounded-[var(--radius-lg)] ${className}`}
		>
			{isDragging ? (
				<div className='absolute inset-0 rounded-[var(--radius-lg)] border-2 border-dashed border-surface-border bg-surface' />
			) : (
				<>
					<div
						{...listeners}
						{...attributes}
						className='absolute top-2 right-2 z-20 p-1.5 rounded-[var(--radius-sm)] opacity-0 group-hover/tile:opacity-100 cursor-grab active:cursor-grabbing touch-none motion-safe:transition-opacity motion-safe:duration-150 text-text-subtle hover:text-text-muted hover:bg-surface-hover'
						aria-label={`Drag to reposition ${id}`}
					>
						<svg width='10' height='14' viewBox='0 0 10 14' fill='currentColor' aria-hidden='true'>
							<circle cx='2.5' cy='2'  r='1.5' />
							<circle cx='7.5' cy='2'  r='1.5' />
							<circle cx='2.5' cy='7'  r='1.5' />
							<circle cx='7.5' cy='7'  r='1.5' />
							<circle cx='2.5' cy='12' r='1.5' />
							<circle cx='7.5' cy='12' r='1.5' />
						</svg>
					</div>

					{(pickerCols > 1 || pickerRows > 1) && (
						<div ref={pickerRef} className='absolute bottom-2 right-2 z-30'>
							<button
								type='button'
								onClick={() => setShowPicker(v => !v)}
								aria-label={`Resize ${id}`}
								aria-expanded={showPicker}
								className='p-1.5 rounded-[var(--radius-sm)] opacity-0 group-hover/tile:opacity-100 motion-safe:transition-opacity motion-safe:duration-150 text-text-subtle hover:text-text-muted hover:bg-surface-hover'
							>
								<svg width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' aria-hidden='true'>
									<path d='M1 8v3h3M11 4V1H8M8 11h3v-3M1 4V1h3' />
								</svg>
							</button>

							{showPicker && (
								<div className='absolute bottom-full right-0 mb-1.5 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]'>
									<SizePicker
										pickerCols={pickerCols}
										pickerRows={pickerRows}
										minCol={minCol}
										minRow={minRow}
										currentCol={localCol}
										currentRow={localRow}
										onSelect={handlePickerSelect}
									/>
								</div>
							)}
						</div>
					)}

					<div className='h-full w-full p-5'>
						{typeof children === 'function'
							? children({ colSpan: localCol, rowSpan: localRow })
							: children
						}
					</div>

					{canResizeTop && (
						<div
							onPointerDown={(e) => onResizeDown(e, 'top')}
							onPointerMove={onResizeMove}
							onPointerUp={onResizeUp}
							className={`${HANDLE_H} top-0`}
							aria-hidden='true'
						/>
					)}

					{effectiveMaxRow > minRow && (
						<div
							onPointerDown={(e) => onResizeDown(e, 'bottom')}
							onPointerMove={onResizeMove}
							onPointerUp={onResizeUp}
							className={`${HANDLE_H} bottom-0`}
							aria-hidden='true'
						/>
					)}

					{canResizeLeft && (
						<div
							onPointerDown={(e) => onResizeDown(e, 'left')}
							onPointerMove={onResizeMove}
							onPointerUp={onResizeUp}
							className={`${HANDLE_V} left-0`}
							aria-hidden='true'
						/>
					)}

					{effectiveMaxCol > minCol && (
						<div
							onPointerDown={(e) => onResizeDown(e, 'right')}
							onPointerMove={onResizeMove}
							onPointerUp={onResizeUp}
							className={`${HANDLE_V} right-0`}
							aria-hidden='true'
						/>
					)}
				</>
			)}
		</div>
	);
};

export default Mosaic;
