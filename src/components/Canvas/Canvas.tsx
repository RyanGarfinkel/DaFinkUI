'use client';;
import { HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CanvasTool = 'pen' | 'eraser';

export interface CanvasProps extends HTMLAttributes<HTMLDivElement> {
  /** Width in px. Defaults to full container width. */
  width?: number;
  /** Height in px */
  height?: number;
  /** Initial stroke color */
  defaultColor?: string;
  /** Initial stroke width */
  defaultStrokeWidth?: number;
  /** Show the built-in toolbar */
  showToolbar?: boolean;
  className?: string;
}

// ─── Stroke ───────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }
interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: CanvasTool;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = [
  { label: 'Black',  value: '#18181b' },
  { label: 'White',  value: '#ffffff' },
  { label: 'Red',    value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green',  value: '#22c55e' },
  { label: 'Blue',   value: '#3b82f6' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Pink',   value: '#ec4899' },
];

const STROKE_WIDTHS = [2, 4, 8, 14];

// ─── Canvas component ─────────────────────────────────────────────────────────

export const Canvas = (
  {
    width,
    height = 400,
    defaultColor = '#18181b',
    defaultStrokeWidth = 4,
    showToolbar = true,
    className = '',
    ...props
  }: CanvasProps
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<CanvasTool>('pen');
  const [color, setColor] = useState(defaultColor);
  const [strokeWidth, setStrokeWidth] = useState(defaultStrokeWidth);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);

  // ── Canvas dimensions ──
  const [canvasWidth, setCanvasWidth] = useState(width ?? 600);

  useEffect(() => {
    if (width) return;
    const observer = new ResizeObserver(([entry]) => {
      setCanvasWidth(entry.contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [width]);

  // ── Redraw all strokes ──
  const redraw = useCallback((strokeList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokeList) {
      if (!stroke.points || stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation =
        stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = stroke.tool === 'eraser' ? 'rgba(0,0,0,1)' : stroke.color;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  useEffect(() => { redraw(strokes); }, [strokes, redraw, canvasWidth, height]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    setRedoStack([]);
    currentStroke.current = {
      points: [getPoint(e)],
      color,
      width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      tool,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    currentStroke.current.points.push(getPoint(e));

    // Draw live preview
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || currentStroke.current.points.length < 2) return;
    const pts = currentStroke.current.points;
    ctx.beginPath();
    ctx.lineWidth = currentStroke.current.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation =
      currentStroke.current.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle =
      currentStroke.current.tool === 'eraser' ? 'rgba(0,0,0,1)' : currentStroke.current.color;
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  const onPointerUp = () => {
    if(!isDrawing.current || !currentStroke.current) return;
    isDrawing.current = false;
    const stroke = currentStroke.current;
    currentStroke.current = null;
    if(stroke.points.length >= 2)
      setStrokes((s) => [...s, stroke]);
  };

  const undo = () => {
    setStrokes((s) => {
      const next = s.slice(0, -1);
      setRedoStack((r) => [...r, s[s.length - 1]]);
      return next;
    });
  };

  const redo = () => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const stroke = r[r.length - 1];
      setStrokes((s) => [...s, stroke]);
      return r.slice(0, -1);
    });
  };

  const clearCanvas = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={['flex flex-col gap-3 w-full', className].join(' ')}
      {...props}
    >
      {showToolbar && (
        <div className='flex flex-wrap items-center gap-3 rounded-lg border border-surface-border bg-surface px-3 py-2'>
          {/* Tool selector */}
          <div className='flex items-center gap-1' role='group' aria-label='Drawing tool'>
            <ToolButton
              active={tool === 'pen'}
              onClick={() => setTool('pen')}
              aria-label='Pen'
              title='Pen'
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
              </svg>
            </ToolButton>
            <ToolButton
              active={tool === 'eraser'}
              onClick={() => setTool('eraser')}
              aria-label='Eraser'
              title='Eraser'
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21' />
                <path d='M22 21H7' />
                <path d='m5 11 9 9' />
              </svg>
            </ToolButton>
          </div>

          <div className='w-px h-5 bg-surface-border' aria-hidden='true' />

          {/* Color palette */}
          <div className='flex items-center gap-1 flex-wrap' role='radiogroup' aria-label='Color'>
            {PALETTE.map((swatch) => (
              <button
                key={swatch.value}
                type='button'
                role='radio'
                aria-checked={color === swatch.value}
                aria-label={swatch.label}
                title={swatch.label}
                onClick={() => { setColor(swatch.value); setTool('pen'); }}
                style={{ backgroundColor: swatch.value }}
                className={[
                  'w-5 h-5 rounded-full border-2 transition-transform duration-[var(--duration-fast)]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
                  color === swatch.value
                    ? 'border-brand scale-125'
                    : 'border-surface-border hover:scale-110',
                ].join(' ')}
              />
            ))}
          </div>

          <div className='w-px h-5 bg-surface-border' aria-hidden='true' />

          {/* Stroke width */}
          <div className='flex items-center gap-1.5' role='group' aria-label='Stroke width'>
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w}
                type='button'
                aria-pressed={strokeWidth === w}
                aria-label={`Stroke width ${w}`}
                onClick={() => setStrokeWidth(w)}
                className={[
                  'flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-[var(--duration-fast)]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
                  strokeWidth === w
                    ? 'bg-surface-active text-text'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text',
                ].join(' ')}
              >
                <span
                  className='rounded-full bg-current'
                  style={{ width: w + 2, height: w + 2, maxWidth: 16, maxHeight: 16 }}
                  aria-hidden='true'
                />
              </button>
            ))}
          </div>

          <div className='w-px h-5 bg-surface-border' aria-hidden='true' />

          {/* Actions */}
          <div className='flex items-center gap-1 ml-auto'>
            <ToolButton onClick={undo} disabled={strokes.length === 0} title='Undo' aria-label='Undo'>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='M3 7v6h6' /><path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' />
              </svg>
            </ToolButton>
            <ToolButton onClick={redo} disabled={redoStack.length === 0} title='Redo' aria-label='Redo'>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='M21 7v6h-6' /><path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13' />
              </svg>
            </ToolButton>
            <ToolButton onClick={clearCanvas} title='Clear' aria-label='Clear canvas'>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6' />
              </svg>
            </ToolButton>
            <ToolButton onClick={downloadCanvas} title='Download' aria-label='Download canvas as PNG'>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' /><polyline points='7 10 12 15 17 10' /><line x1='12' x2='12' y1='15' y2='3' />
              </svg>
            </ToolButton>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: 'none', cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
        className='w-full rounded-lg border border-surface-border bg-white'
        aria-label='Drawing canvas'
        role='img'
      />
    </div>
  );
};

// ─── ToolButton ───────────────────────────────────────────────────────────────

interface ToolButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const ToolButton = ({ active = false, className = '', children, ...props }: ToolButtonProps) => {
  return (
    <button
      type='button'
      {...props}
      className={[
        'flex items-center justify-center w-7 h-7 rounded-md text-sm transition-colors duration-[var(--duration-fast)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
        'disabled:pointer-events-none disabled:opacity-40',
        active
          ? 'bg-surface-active text-text'
          : 'text-text-muted hover:bg-surface-hover hover:text-text',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
};

export default Canvas;
