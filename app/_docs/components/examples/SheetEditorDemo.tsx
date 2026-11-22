'use client';

import { createSheet, type Cell, type Sheet } from '@/src/components/SheetEditor/sheet';
import { SheetEditor } from '@/src/components/SheetEditor/SheetEditor';
import { useState } from 'react';

const HEADER: Partial<Cell> = { bold: true, fill: '#f4f4f5' };

const cells: Sheet['cells'] = {
	A1: { value: 'Item', ...HEADER }, B1: { value: 'Q1', ...HEADER, align: 'right' }, C1: { value: 'Q2', ...HEADER, align: 'right' },
	D1: { value: 'Q3', ...HEADER, align: 'right' }, E1: { value: 'Total', ...HEADER, align: 'right' },
	A2: { value: 'Hosting' }, B2: { value: '1200', format: 'currency' }, C2: { value: '1350', format: 'currency' }, D2: { value: '1500', format: 'currency' },
	A3: { value: 'Salaries' }, B3: { value: '48000', format: 'currency' }, C3: { value: '48000', format: 'currency' }, D3: { value: '51000', format: 'currency' },
	A4: { value: 'Marketing' }, B4: { value: '6200', format: 'currency' }, C4: { value: '7800', format: 'currency' }, D4: { value: '9100', format: 'currency' },
	A5: { value: 'Software' }, B5: { value: '2400', format: 'currency' }, C5: { value: '2400', format: 'currency' }, D5: { value: '2650', format: 'currency' },
	E2: { value: '=SUM(B2:D2)', format: 'currency' }, E3: { value: '=SUM(B3:D3)', format: 'currency' },
	E4: { value: '=SUM(B4:D4)', format: 'currency' }, E5: { value: '=SUM(B5:D5)', format: 'currency' },
	A6: { value: 'Total', bold: true },
	B6: { value: '=SUM(B2:B5)', bold: true, format: 'currency' }, C6: { value: '=SUM(C2:C5)', bold: true, format: 'currency' },
	D6: { value: '=SUM(D2:D5)', bold: true, format: 'currency' }, E6: { value: '=SUM(E2:E5)', bold: true, format: 'currency' },
	A8: { value: 'Q3 vs Q1', italic: true }, B8: { value: '=D6/B6-1', italic: true, format: 'percent' },
	A9: { value: 'Over budget?', italic: true }, B9: { value: '=IF(E6>130000,"Yes","No")', italic: true, align: 'right' },
};

const START: Sheet = { ...createSheet(60, 12, 'Q3 budget'), cells, colWidths: { 0: 140 } };

interface History {
	past:     Sheet[];
	present:  Sheet;
	future:   Sheet[];
	lastKey?: string;
}

export const SheetEditorDemo = () => {
	const [history, setHistory] = useState<History>({ past: [], present: START, future: [] });

	// A run of edits sharing a key (a column drag) is one undo step.
	const change = (sheet: Sheet, key?: string) => setHistory(h => ({
		past:    key && key === h.lastKey ? h.past : [...h.past, h.present],
		present: sheet,
		future:  [],
		lastKey: key,
	}));

	const undo = () => setHistory(h => (h.past.length ? { past: h.past.slice(0, -1), present: h.past.at(-1)!, future: [h.present, ...h.future] } : h));
	const redo = () => setHistory(h => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));

	return (
		<div className='h-[480px] w-full'>
			<SheetEditor
				sheet={history.present}
				onChange={change}
				onUndo={undo}
				onRedo={redo}
				canUndo={history.past.length > 0}
				canRedo={history.future.length > 0}
			/>
		</div>
	);
};
