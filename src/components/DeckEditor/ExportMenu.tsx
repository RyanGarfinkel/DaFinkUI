'use client';

import { exportHtml } from './htmlPresenter';
import { Menu } from '../Menu/Menu';
import type { Deck } from './deck';
import { Glyph } from './icons';

interface ExportMenuProps {
	deck:        Deck;
	onStatus:    (message: string) => void;
	buttonClass: string;
}

const FORMATS = ['html', 'pdf', 'pptx'] as const;

type Format = typeof FORMATS[number];

const LABELS: Record<Format, string> = { html: 'HTML', pdf: 'PDF', pptx: 'PowerPoint' };

const STATUS_MS = 4000;

/** Downloads the deck as a presentable HTML page, a PDF, or a PowerPoint file. */
export const ExportMenu = ({ deck, onStatus, buttonClass }: ExportMenuProps) => {
	const run = async (format: Format) => {
		onStatus(`Preparing ${LABELS[format]}…`);
		try
		{
			// PDF and PowerPoint load their libraries only when used.
			if(format === 'html') exportHtml(deck);
			else if(format === 'pdf') await (await import('./pdf')).exportPdf(deck);
			else await (await import('./pptx')).exportPptx(deck);
			onStatus(`${LABELS[format]} downloaded.`);
		}
		catch(error)
		{
			onStatus(`Export failed: ${error instanceof Error ? error.message : 'unknown error'}`);
		}
		setTimeout(() => onStatus(''), STATUS_MS);
	};

	return (
		<Menu
			align='end'
			unstyledTrigger
			triggerClassName={buttonClass}
			triggerProps={{ 'aria-label': 'Download', title: 'Download' }}
			trigger={<Glyph name='download' />}
			items={FORMATS.map(format => ({
				label:    LABELS[format],
				detail:   `.${format}`,
				onSelect: () => run(format),
			}))}
		/>
	);
};

export default ExportMenu;
