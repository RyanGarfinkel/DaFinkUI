import type { Deck } from './deck';

export type ExportFormat = 'html' | 'pdf' | 'pptx' | 'json';

export const escapeHtml = (text: string) =>
	text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c] ?? c);

export const fileName = (deck: Deck, extension: string) =>
	`${deck.title.trim().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-').toLowerCase() || 'slides'}.${extension}`;

export const downloadBlob = (blob: Blob, name: string) => {
	const url = URL.createObjectURL(blob);
	const link = Object.assign(document.createElement('a'), { href: url, download: name });
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Every slide is already rendered as a slide-strip thumbnail, laid out at full
// slide size and only CSS-scaled, so its stage is the source of truth for exports.
export const findStage = (slideId: string) => {
	const stage = document.querySelector<HTMLElement>(`[data-slide-id="${CSS.escape(slideId)}"] [data-slide-stage]`);
	if(!stage) throw new Error(`Slide ${slideId} is not rendered; can't export it.`);
	return stage;
};

/** The deck as-is, re-importable through Import .json (the server validates it). */
export const exportJson = (deck: Deck) => {
	downloadBlob(new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' }), fileName(deck, 'json'));
};
