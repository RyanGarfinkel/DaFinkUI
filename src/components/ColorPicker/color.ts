export interface Hsv {
	h: number;
	s: number;
	v: number;
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export const normalizeHex = (input: string): string | null => {
	const match = HEX_PATTERN.exec(input.trim());
	if(!match) return null;

	const digits = match[1].length === 3
		? match[1].split('').map(c => c + c).join('')
		: match[1];

	return `#${digits.toLowerCase()}`;
};

export const hexToHsv = (hex: string): Hsv | null => {
	const normalized = normalizeHex(hex);
	if(!normalized) return null;

	const r = parseInt(normalized.slice(1, 3), 16) / 255;
	const g = parseInt(normalized.slice(3, 5), 16) / 255;
	const b = parseInt(normalized.slice(5, 7), 16) / 255;

	const max = Math.max(r, g, b);
	const delta = max - Math.min(r, g, b);

	let h = 0;
	if(delta !== 0)
	{
		if(max === r) h = ((g - b) / delta) % 6;
		else if(max === g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
	}

	return {
		h: (h * 60 + 360) % 360,
		s: max === 0 ? 0 : delta / max,
		v: max,
	};
};

export const hsvToHex = ({ h, s, v }: Hsv): string => {
	const channel = (n: number) => {
		const k = (n + h / 60) % 6;
		const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
		return Math.round(value * 255).toString(16).padStart(2, '0');
	};

	return `#${channel(5)}${channel(3)}${channel(1)}`;
};

const channelToLinear = (v: number) => {
	const s = v / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance (0–1). Returns null for anything that isn't a hex color. */
export const relativeLuminance = (hex: string): number | null => {
	const normalized = normalizeHex(hex);
	if(!normalized) return null;
	const [r, g, b] = [1, 3, 5].map(i => channelToLinear(parseInt(normalized.slice(i, i + 2), 16)));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio between two hex colors (1–21), or null if either isn't a hex color. */
export const contrastRatio = (a: string, b: string): number | null => {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	if(la === null || lb === null) return null;
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

