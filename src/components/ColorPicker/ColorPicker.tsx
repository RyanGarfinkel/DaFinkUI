'use client';

import { HTMLAttributes, KeyboardEvent, PointerEvent, useId, useRef, useState } from 'react';
import { clamp, hexToHsv, hsvToHex, normalizeHex } from './color';
import Input from '../Input/Input';
import type { Hsv } from './color';

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
	/** Hex color, `#rrggbb` or `#rgb`. */
	value:          string;
	onValueChange:  (hex: string) => void;
	swatches?:      string[];
	label?:         string;
	showInput?:     boolean;
	disabled?:      boolean;
}

const FALLBACK_HEX = '#000000';
const HUE_TRACK = 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';
const AREA_OVERLAY = 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)';
const THUMB_SIZE = 16;

const AREA_KEYS: Record<string, [number, number]> = {
	ArrowRight: [1, 0],
	ArrowLeft:  [-1, 0],
	ArrowUp:    [0, 1],
	ArrowDown:  [0, -1],
};

const HUE_KEYS: Record<string, number> = {
	ArrowRight: 1,
	ArrowUp:    1,
	ArrowLeft:  -1,
	ArrowDown:  -1,
};

const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring';

const THUMB = [
	'absolute pointer-events-none rounded-full border-2 border-surface',
	'-translate-x-1/2 -translate-y-1/2',
	'shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-text)_35%,transparent)]',
].join(' ');

export const ColorPicker = ({
	value,
	onValueChange,
	swatches,
	label,
	showInput = true,
	disabled = false,
	className = '',
	...props
}: ColorPickerProps) => {
	const hex = normalizeHex(value) ?? FALLBACK_HEX;

	// HSV is kept as state rather than derived from `value` so hue survives
	// passing through greys/black, where the hex alone no longer encodes it.
	const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(hex) as Hsv);
	const [draft, setDraft] = useState(hex);
	const [syncedHex, setSyncedHex] = useState(hex);
	const [swatchFocus, setSwatchFocus] = useState(0);

	const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const labelId = `${useId()}-label`;

	if(hex !== syncedHex)
	{
		setSyncedHex(hex);
		if(normalizeHex(draft) !== hex) setDraft(hex);
		if(hsvToHex(hsv) !== hex) setHsv(hexToHsv(hex) as Hsv);
	}

	const commit = (next: Hsv) => {
		setHsv(next);
		const nextHex = hsvToHex(next);
		if(nextHex !== hex) onValueChange(nextHex);
	};

	const commitHex = (input: string) => {
		const normalized = normalizeHex(input);
		if(!normalized) return;
		setHsv(hexToHsv(normalized) as Hsv);
		if(normalized !== hex) onValueChange(normalized);
	};

	const startDrag = (e: PointerEvent<HTMLDivElement>, pick: (e: PointerEvent<HTMLDivElement>) => void) => {
		if(disabled || e.button !== 0) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		e.currentTarget.focus({ preventScroll: true });
		pick(e);
	};

	const pickArea = (e: PointerEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		commit({
			...hsv,
			s: clamp((e.clientX - rect.left) / rect.width),
			v: 1 - clamp((e.clientY - rect.top) / rect.height),
		});
	};

	const pickHue = (e: PointerEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const usable = rect.width - THUMB_SIZE;
		commit({ ...hsv, h: clamp((e.clientX - rect.left - THUMB_SIZE / 2) / usable) * 360 });
	};

	const handleAreaKey = (e: KeyboardEvent<HTMLDivElement>) => {
		const direction = AREA_KEYS[e.key];
		if(!direction) return;
		e.preventDefault();
		const step = e.shiftKey ? 0.1 : 0.01;
		commit({ ...hsv, s: clamp(hsv.s + direction[0] * step), v: clamp(hsv.v + direction[1] * step) });
	};

	const handleHueKey = (e: KeyboardEvent<HTMLDivElement>) => {
		let h: number | null = null;
		if(e.key in HUE_KEYS) h = clamp(hsv.h + HUE_KEYS[e.key] * (e.shiftKey ? 10 : 1), 0, 360);
		else if(e.key === 'Home') h = 0;
		else if(e.key === 'End') h = 360;
		if(h === null) return;
		e.preventDefault();
		commit({ ...hsv, h });
	};

	const handleSwatchKey = (e: KeyboardEvent<HTMLDivElement>) => {
		if(!swatches?.length) return;
		const last = swatches.length - 1;
		const targets: Record<string, number> = {
			ArrowRight: swatchFocus === last ? 0 : swatchFocus + 1,
			ArrowDown:  swatchFocus === last ? 0 : swatchFocus + 1,
			ArrowLeft:  swatchFocus === 0 ? last : swatchFocus - 1,
			ArrowUp:    swatchFocus === 0 ? last : swatchFocus - 1,
			Home:       0,
			End:        last,
		};
		if(!(e.key in targets)) return;
		e.preventDefault();
		setSwatchFocus(targets[e.key]);
		swatchRefs.current[targets[e.key]]?.focus();
	};

	const interactive = disabled ? 'pointer-events-none' : 'cursor-pointer';
	const percent = (n: number) => Math.round(n * 100);
	const selectedSwatch = swatches?.findIndex(s => normalizeHex(s) === hex) ?? -1;
	const tabbableSwatch = selectedSwatch >= 0 ? selectedSwatch : swatchFocus;

	return (
		<div
			role='group'
			aria-labelledby={label ? labelId : undefined}
			aria-label={label ? undefined : 'Color picker'}
			aria-disabled={disabled || undefined}
			{...props}
			className={`flex w-48 flex-col gap-2 ${disabled ? 'opacity-40' : ''} ${className}`}
		>
			{label && (
				<span id={labelId} className='text-sm font-medium text-text select-none'>
					{label}
				</span>
			)}

			<div
				role='slider'
				tabIndex={disabled ? -1 : 0}
				aria-label='Saturation and brightness'
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={percent(hsv.s)}
				aria-valuetext={`Saturation ${percent(hsv.s)}%, brightness ${percent(hsv.v)}%`}
				aria-disabled={disabled || undefined}
				onPointerDown={e => startDrag(e, pickArea)}
				onPointerMove={e => e.currentTarget.hasPointerCapture(e.pointerId) && pickArea(e)}
				onKeyDown={handleAreaKey}
				className={`relative h-24 w-full touch-none rounded-[var(--radius)] ${interactive} ${FOCUS_RING}`}
				style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)`, backgroundImage: AREA_OVERLAY }}
			>
				<span
					className={`${THUMB} h-4 w-4`}
					style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: hex }}
				/>
			</div>

			<div
				role='slider'
				tabIndex={disabled ? -1 : 0}
				aria-label='Hue'
				aria-valuemin={0}
				aria-valuemax={360}
				aria-valuenow={Math.round(hsv.h)}
				aria-valuetext={`${Math.round(hsv.h)} degrees`}
				aria-disabled={disabled || undefined}
				onPointerDown={e => startDrag(e, pickHue)}
				onPointerMove={e => e.currentTarget.hasPointerCapture(e.pointerId) && pickHue(e)}
				onKeyDown={handleHueKey}
				className={`relative h-3 w-full touch-none rounded-full ${interactive} ${FOCUS_RING}`}
				style={{ backgroundImage: HUE_TRACK }}
			>
				<span
					className={`${THUMB} top-1/2 h-4 w-4`}
					style={{
						left:            `calc(${THUMB_SIZE / 2}px + (100% - ${THUMB_SIZE}px) * ${hsv.h / 360})`,
						backgroundColor: `hsl(${hsv.h} 100% 50%)`,
					}}
				/>
			</div>

			{showInput && (
				<div className='flex items-center gap-1.5'>
					<span
						aria-hidden='true'
						className='h-7 w-7 shrink-0 rounded-[var(--radius)] border-[length:var(--border-width)] border-input-border'
						style={{ backgroundColor: hex }}
					/>
					{/* Input reserves a collapsed hint row; zeroing its gap keeps the field centered on the chip. */}
					<div className='flex-1 [&>div]:gap-0'>
						<Input
							aria-label='Hex color'
							value={draft}
							disabled={disabled}
							spellCheck={false}
							autoComplete='off'
							maxLength={7}
							onChange={e => {
								setDraft(e.target.value);
								if(e.target.value.replace('#', '').length === 6) commitHex(e.target.value);
							}}
							onBlur={() => {
								commitHex(draft);
								setDraft(normalizeHex(draft) ?? hex);
							}}
							onKeyDown={e => e.key === 'Enter' && commitHex(draft)}
							className='h-7 px-2 py-0 font-mono text-xs uppercase'
						/>
					</div>
				</div>
			)}

			{!!swatches?.length && (
				<div role='radiogroup' aria-label='Swatches' onKeyDown={handleSwatchKey} className='flex flex-wrap gap-1.5'>
					{swatches.map((swatch, i) => {
						const selected = i === selectedSwatch;
						return (
							<button
								key={swatch}
								ref={el => { swatchRefs.current[i] = el; }}
								type='button'
								role='radio'
								aria-checked={selected}
								aria-label={normalizeHex(swatch) ?? swatch}
								tabIndex={i === tabbableSwatch ? 0 : -1}
								disabled={disabled}
								onFocus={() => setSwatchFocus(i)}
								onClick={() => commitHex(swatch)}
								className={[
									// 18px swatches, 24px apart center to center: meets WCAG 2.5.8 via its spacing exception.
									'h-[18px] w-[18px] rounded-full border-[length:var(--border-width)] border-input-border',
									'motion-safe:transition-[box-shadow,transform] motion-safe:duration-[var(--duration-fast)]',
									'hover:scale-110',
									'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
									selected ? 'ring-2 ring-offset-2 ring-input-border-hover focus-visible:ring-offset-2' : '',
									'disabled:pointer-events-none',
								].join(' ')}
								style={{ backgroundColor: swatch }}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ColorPicker;
