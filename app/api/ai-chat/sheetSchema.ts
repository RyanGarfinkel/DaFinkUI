import { MAX_COLS, MAX_ROWS } from '@/src/components/SheetEditor/sheet';
import { z } from 'zod';

// Docs-site-only: validates a sheet at the API boundary, like the deck schema, so a malformed
// request is rejected with a 400 instead of reaching the model. Run the same schema in your backend.

const cell = z.object({
	value:  z.string().max(5000),
	bold:   z.boolean().optional(),
	italic: z.boolean().optional(),
	align:  z.enum(['left', 'center', 'right']).optional(),
	valign: z.enum(['top', 'middle', 'bottom']).optional(),
	color:  z.string().max(64).optional(),
	fill:   z.string().max(64).optional(),
	format: z.string().max(100).optional(),
	borders: z.array(z.enum(['top', 'right', 'bottom', 'left'])).max(4).optional(),
});

const chart = z.object({
	id:    z.string().max(64),
	type:  z.enum(['line', 'bar', 'area']),
	range: z.string().max(32),
});

export const sheetSchema = z.object({
	title:     z.string().max(200),
	rows:      z.number().int().min(1).max(MAX_ROWS),
	cols:      z.number().int().min(1).max(MAX_COLS),
	cells:     z.record(z.string().regex(/^[A-Z]{1,3}\d{1,5}$/), cell),
	colWidths: z.record(z.string().regex(/^\d+$/), z.number().min(0).max(2000)),
	charts:    z.array(chart).max(50).optional(),
});
